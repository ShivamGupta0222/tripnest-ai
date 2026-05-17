/** Draft shape for pricing (avoids circular imports with the results modal). */
export type DraftForPricing = {
  highlights: { text: string }[];
  days: { places: { text: string }[] }[];
};

/** Heuristic: premium-cost signals in place / highlight text */
const PREMIUM_RE =
  /\b(luxury|five\s*star|5\s*-?\s*star|four\s*star|4\s*-?\s*star|spa\b|helicopter|yacht|fine\s*dining|vip\b|charter|private\s*pool|suite\b|concierge|premium\s*lounge|champagne|golf\s*resort)\b/gi;

/** Heuristic: budget-friendly signals */
const BUDGET_RE =
  /\b(free\b|self[-\s]?guided|temple|walking\s*tour|trek|viewpoint|street\s*food|local\s*bus|metro|hostel|dorm|public\s*transport|picnic|beach\s*stroll|sunset\s*point|park\b|museum\s*\(free\))\b/gi;

export type TripPricingContext = {
  budget: number;
  travelers: number;
  days: number;
};

export type PricingBaseline = {
  low: number;
  high: number;
  activityCount: number;
};

/**
 * Extract rupee amounts from a human-readable range string (Indian grouping).
 */
export function parseRupeeRange(input: string): { low: number; high: number } | null {
  const raw = input.match(/\d[\d,]*/g);
  if (!raw?.length) return null;
  const values = raw
    .map((chunk) => parseInt(chunk.replace(/,/g, ''), 10))
    .filter((n) => !Number.isNaN(n) && n >= 800);
  if (!values.length) return null;
  if (values.length === 1) {
    const mid = values[0];
    return { low: Math.round(mid * 0.88), high: Math.round(mid * 1.12) };
  }
  const low = Math.min(...values);
  const high = Math.max(...values);
  if (high < low * 1.02) return { low: Math.round(low * 0.95), high: Math.round(high * 1.05) };
  return { low, high };
}

/**
 * When AI text has no parseable numbers, anchor estimates to total group budget by plan tier.
 * planTierIndex: 0 = saver, 1 = comfort, 2 = premium (still realistic vs full group budget).
 */
export function inferDefaultGroupRange(
  groupBudget: number,
  planTierIndex: number,
  days: number,
  travelers: number,
): { low: number; high: number } {
  const tierCenter = [0.58, 0.92, 1.12][planTierIndex] ?? 0.85;
  const dayStretch = Math.min(0.14, 0.018 * Math.max(days, 1));
  const groupStretch = Math.min(0.06, 0.012 * Math.max(travelers - 1, 0));
  const spread = 0.055 + dayStretch + groupStretch;
  const mid = Math.max(5000, groupBudget * tierCenter);
  return {
    low: Math.round(mid * (1 - spread)),
    high: Math.round(mid * (1 + spread)),
  };
}

function splitLineIntoActivities(line: string): string[] {
  const trimmed = line.trim();
  const m = trimmed.match(/^(Day\s*\d+[^:]*)\s*:\s*(.*)$/i);
  const body = m ? (m[2] ?? '').trim() || trimmed : trimmed;
  const bySplit = body.split(/\s*(?:\||;|•)\s*/).map((s) => s.trim()).filter(Boolean);
  if (bySplit.length > 1) return bySplit;
  const byComma = body.split(/,\s+/).map((s) => s.trim()).filter(Boolean);
  return byComma.length ? byComma : [body || trimmed];
}

export function countActivitiesFromPlan(dailyPlan: string[], highlights: string[]): number {
  let n = highlights.length;
  for (const line of dailyPlan) {
    const parts = splitLineIntoActivities(line);
    n += Math.max(1, parts.length);
  }
  return Math.max(1, n);
}

export function countDraftActivities(draft: DraftForPricing): number {
  let n = draft.highlights.length;
  for (const day of draft.days) {
    n += Math.max(1, day.places.length);
  }
  return Math.max(1, n);
}

export function scoreItineraryCostBias(texts: string[]): { premiumHits: number; budgetHits: number } {
  let premiumHits = 0;
  let budgetHits = 0;
  for (const t of texts) {
    const pm = t.match(new RegExp(PREMIUM_RE.source, 'gi'));
    if (pm) premiumHits += pm.length;
    const bm = t.match(new RegExp(BUDGET_RE.source, 'gi'));
    if (bm) budgetHits += bm.length;
  }
  return {
    premiumHits: Math.min(premiumHits, 10),
    budgetHits: Math.min(budgetHits, 10),
  };
}

function formatGroupTripRange(low: number, high: number, travelers: number, days: number): string {
  const f = (n: number) =>
    `₹${Math.round(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const tlabel = travelers === 1 ? 'traveler' : 'travelers';
  return `${f(low)}–${f(high)} total for the group · ${travelers} ${tlabel} · ${days} days`;
}

/**
 * Adds Gemini-reported incremental **group total** cost (min/max INR) onto the current range label.
 */
export function mergeAdditiveGroupCostIntoRange(
  rangeLabel: string,
  impact: { min: number; max: number },
  ctx: TripPricingContext,
): string {
  const parsed = parseRupeeRange(rangeLabel);
  const addLow = Math.max(0, Math.round(impact.min));
  const addHigh = Math.max(addLow, Math.round(impact.max));
  const baseLow = parsed?.low ?? Math.round(ctx.budget * 0.38);
  const baseHigh = parsed?.high ?? Math.round(ctx.budget * 0.58);
  let low = baseLow + addLow;
  let high = baseHigh + addHigh;
  const floorMin = Math.max(2000, ctx.budget * 0.08);
  const ceilMax = Math.max(floorMin * 2, ctx.budget * 1.52);
  low = Math.round(Math.max(floorMin, Math.min(low, ceilMax * 0.92)));
  high = Math.round(Math.max(low + Math.max(1500, ctx.budget * 0.03), Math.min(high, ceilMax)));
  if (high <= low) high = low + Math.max(2000, ctx.budget * 0.05);
  return formatGroupTripRange(low, high, ctx.travelers, ctx.days);
}

/**
 * Adjust stored estimated range when user edits places / highlights (local heuristic, no DB).
 */
export function adjustGroupRangeForItineraryChange(
  baseline: PricingBaseline,
  draft: DraftForPricing,
  ctx: TripPricingContext | null,
): string {
  const current = countDraftActivities(draft);
  const base = Math.max(1, baseline.activityCount);
  const ratio = current / base;
  const ratioFactor = 1 + (ratio - 1) * 0.52;

  const texts = [
    ...draft.highlights.map((h) => h.text),
    ...draft.days.flatMap((d) => d.places.map((p) => p.text)),
  ];
  const { premiumHits, budgetHits } = scoreItineraryCostBias(texts);
  const keywordFactor = (1 + premiumHits * 0.038) * (1 - budgetHits * 0.026);

  let low = baseline.low * ratioFactor * keywordFactor;
  let high = baseline.high * ratioFactor * keywordFactor;

  const mid = (low + high) / 2;
  let half = (high - low) / 2;
  if (!Number.isFinite(half) || half < mid * 0.04) half = mid * 0.06;
  low = mid - half;
  high = mid + half;

  const groupBudget = ctx?.budget ?? (baseline.low + baseline.high) / 0.9;
  const travelers = ctx?.travelers ?? 2;
  const days = ctx?.days ?? 5;

  const floorMin = Math.max(2500, groupBudget * 0.1);
  const ceilMax = Math.max(floorMin * 1.5, groupBudget * 1.38);

  low = Math.round(Math.max(floorMin, Math.min(low, ceilMax * 0.92)));
  high = Math.round(Math.max(low + Math.max(1200, groupBudget * 0.035), Math.min(high, ceilMax)));
  if (high <= low) high = low + Math.max(2000, groupBudget * 0.05);

  return formatGroupTripRange(low, high, travelers, days);
}

export function buildPricingBaselineFromCard(
  dailyPlan: string[],
  highlights: string[],
  pricing: string,
  planTierIndex: number,
  ctx: TripPricingContext | null,
): PricingBaseline {
  const parsed = parseRupeeRange(pricing);
  const activityCount = countActivitiesFromPlan(dailyPlan, highlights);
  if (parsed) {
    return { low: parsed.low, high: parsed.high, activityCount };
  }
  const inferred = ctx
    ? inferDefaultGroupRange(ctx.budget, planTierIndex, ctx.days, ctx.travelers)
    : inferDefaultGroupRange(40000, planTierIndex, 5, 2);
  return { ...inferred, activityCount };
}
