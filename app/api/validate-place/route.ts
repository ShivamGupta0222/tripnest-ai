import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';

export type EstimatedCostImpact = {
  min: number;
  max: number;
  label: string;
};

export type ValidatePlaceSuccess = {
  valid: true;
  normalizedName: string;
  category: string;
  reason: string;
  estimatedCostImpact: EstimatedCostImpact;
};

export type ValidatePlaceFailure = {
  valid: false;
  error: string;
};

export type ValidatePlaceResponse = ValidatePlaceSuccess | ValidatePlaceFailure;

interface ValidatePlaceRequestBody {
  destination: string;
  fromCity?: string;
  placeName: string;
  vibe: string[];
  travelWith: string;
  days: number;
  travelers: number;
  groupBudget: number;
  currentPlan: unknown;
}

function buildValidatePrompt(b: ValidatePlaceRequestBody): string {
  const planJson = JSON.stringify(b.currentPlan ?? {}, null, 2);
  const vibe = Array.isArray(b.vibe) ? b.vibe.join(', ') : '';

  return `You validate whether a user-added stop makes sense for an Indian trip itinerary.

TRIP CONTEXT:
- Primary destination (where the trip is centered): ${b.destination}
- Origin / from city: ${b.fromCity ?? 'not specified'}
- Party: ${b.travelWith}, ${b.travelers} traveler(s), ${b.days} day(s)
- Vibes / interests: ${vibe}
- **GROUP total trip budget** (whole party, entire trip — NOT per person): ₹${b.groupBudget.toLocaleString('en-IN')}

CURRENT PLAN SNAPSHOT (JSON):
${planJson}

USER WANTS TO ADD THIS STOP/ACTIVITY (raw text): "${b.placeName.trim()}"

YOUR JOB:
1. Decide if it is a **real** place or activity (not gibberish).
2. Decide if it is **geographically and thematically relevant** to destination "${b.destination}" (e.g. Eiffel Tower for Goa → invalid).
3. Check fit with vibes + party type + **practicality for ${b.days} days** (e.g. multi-day trek squeezed into 1 day → invalid or warn as impractical → invalid).
4. Estimate **incremental cost impact in INR for the ENTIRE GROUP** (not per person) if they add this stop — a conservative band **min** and **max** extra rupees on the **group trip total** for typical Indian pricing (entries, local transport slice, meal upgrade, activity fee spread across the group as applicable). If essentially free, use small non-zero band like 0–500.
5. If invalid, return JSON with valid:false and a short, helpful error for the user (match tone of examples below).

ERROR EXAMPLES (use similar clarity when applicable):
- Wrong region: "This place doesn't seem relevant to your destination."
- Nonsense / unverifiable: "We couldn't verify this place. Try a known place or activity."

Return ONLY valid JSON, one of these shapes (no markdown, no backticks):

{"valid":true,"normalizedName":"","category":"","reason":"","estimatedCostImpact":{"min":0,"max":0,"label":""}}

OR

{"valid":false,"error":""}

Rules for valid:true:
- normalizedName: concise title-case name for the itinerary list
- category: short e.g. "beach", "viewpoint", "temple", "food", "activity"
- reason: one sentence why it fits the trip
- estimatedCostImpact.min and .max are non-negative integers (INR), whole-group incremental impact
- estimatedCostImpact.label: short human phrase e.g. "Mostly local transport + snacks"`;
}

function parseValidateJson(text: string): ValidatePlaceResponse | null {
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const raw = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    if (raw.valid === false) {
      const err = typeof raw.error === 'string' ? raw.error : 'This place could not be added.';
      return { valid: false, error: err };
    }

    if (raw.valid !== true) return null;

    const impact = raw.estimatedCostImpact as Record<string, unknown> | undefined;
    const min = typeof impact?.min === 'number' ? impact.min : parseInt(String(impact?.min ?? 0), 10);
    const max = typeof impact?.max === 'number' ? impact.max : parseInt(String(impact?.max ?? 0), 10);
    const label =
      typeof impact?.label === 'string' && impact.label.length > 0
        ? impact.label
        : 'Estimated extra for the group';

    return {
      valid: true,
      normalizedName:
        typeof raw.normalizedName === 'string' && raw.normalizedName.trim().length > 0
          ? raw.normalizedName.trim()
          : String(raw.normalizedName ?? 'Custom stop'),
      category: typeof raw.category === 'string' ? raw.category : 'activity',
      reason: typeof raw.reason === 'string' ? raw.reason : '',
      estimatedCostImpact: {
        min: Number.isFinite(min) ? Math.max(0, Math.round(min)) : 0,
        max: Number.isFinite(max) ? Math.max(0, Math.round(max)) : 0,
        label,
      },
    };
  } catch {
    return null;
  }
}

/**
 * POST /api/validate-place — Gemini validates a custom place before it is added to the itinerary.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as ValidatePlaceRequestBody;

    if (!body.destination?.trim()) {
      return NextResponse.json({ error: 'destination is required' }, { status: 400 });
    }
    if (!body.placeName?.trim()) {
      return NextResponse.json({ error: 'placeName is required' }, { status: 400 });
    }
    if (!Number.isFinite(body.days) || body.days < 1) {
      return NextResponse.json({ error: 'days must be a positive number' }, { status: 400 });
    }
    if (!Number.isFinite(body.travelers) || body.travelers < 1) {
      return NextResponse.json({ error: 'travelers must be a positive number' }, { status: 400 });
    }
    if (!Number.isFinite(body.groupBudget) || body.groupBudget < 0) {
      return NextResponse.json({ error: 'groupBudget must be a non-negative number' }, { status: 400 });
    }

    const prompt = buildValidatePrompt({
      ...body,
      vibe: Array.isArray(body.vibe) ? body.vibe : [],
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseValidateJson(text);

    if (!parsed) {
      return NextResponse.json(
        { valid: false as const, error: 'We could not read the validation response. Try again.' },
        { status: 502 },
      );
    }

    if (!parsed.valid) {
      return NextResponse.json(parsed, { status: 200 });
    }

    if (parsed.estimatedCostImpact.max < parsed.estimatedCostImpact.min) {
      const t = parsed.estimatedCostImpact.min;
      parsed.estimatedCostImpact.min = parsed.estimatedCostImpact.max;
      parsed.estimatedCostImpact.max = t;
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error('[validate-place] Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to validate place';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
