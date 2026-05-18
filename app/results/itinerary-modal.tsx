'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EditablePlace = { id: string; text: string };
export type EditableDay = { id: string; dayTitle: string; places: EditablePlace[] };
export type EditableHighlight = { id: string; text: string };

export type EditableItinerary = {
  name: string;
  description: string;
  estimatedRange: string;
  bestFor: string;
  stayStyle: string;
  transportStyle: string;
  budgetNote: string;
  highlights: EditableHighlight[];
  days: EditableDay[];
};

export type ValidatePlaceTripFields = {
  destination: string;
  fromCity: string;
  vibe: string[];
  travelWith: string;
  days: number;
  travelers: number;
  groupBudget: number;
} | null;

export type DraftChangeOptions = {
  additiveGroupCost?: { min: number; max: number };
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildEditableDays(dailyPlan: string[]): EditableDay[] {
  return dailyPlan.map((line, dIdx) => {
    const trimmed = line.trim();
    const m = trimmed.match(/^(Day\s*\d+[^:]*)\s*:\s*(.*)$/i);
    let dayTitle = `Day ${dIdx + 1}`;
    let body = trimmed;
    if (m) {
      dayTitle = m[1].trim();
      body = (m[2] ?? '').trim() || trimmed;
    }
    const bySplit = body.split(/\s*(?:\||;|•)\s*/).map((s) => s.trim()).filter(Boolean);
    const byComma =
      bySplit.length > 1
        ? bySplit
        : body.split(/,\s+/).map((s) => s.trim()).filter(Boolean);
    const items = byComma.length ? byComma : [body || trimmed];
    return {
      id: `day-${dIdx}`,
      dayTitle,
      places: items.map((text, pIdx) => ({
        id: `place-${dIdx}-${pIdx}`,
        text,
      })),
    };
  });
}

export function buildEditableFromItinerary(plan: {
  name: string;
  subtitle: string;
  pricing: string;
  bestFor: string;
  stayStyle: string;
  transportStyle: string;
  highlights?: string[];
  dailyPlan?: string[];
  budgetNote?: string;
}): EditableItinerary {
  const safeHighlights =
    Array.isArray(plan.highlights) && plan.highlights.length > 0
      ? plan.highlights
      : ['Personalized highlights will appear here.'];

  const safeDailyPlan =
    Array.isArray(plan.dailyPlan) && plan.dailyPlan.length > 0
      ? plan.dailyPlan
      : ['Day 1: Explore the destination, local food, and nearby attractions'];

  return {
    name: plan.name || 'Trip Plan',
    description: plan.subtitle || 'Personalized itinerary by TripNest AI',
    estimatedRange: plan.pricing || 'Flexible pricing',
    bestFor: plan.bestFor || 'Travelers',
    stayStyle: plan.stayStyle || 'Comfortable stays',
    transportStyle: plan.transportStyle || 'Local transport',
    budgetNote: plan.budgetNote ?? '',
    highlights: safeHighlights.map((text, i) => ({
      id: `h-${i}`,
      text,
    })),
    days: buildEditableDays(safeDailyPlan),
  };
}
export function mergeDraftToItineraryData(
  draft: EditableItinerary,
  base: {
    color: string;
    borderColor: string;
    featured?: boolean;
  },
): {
  name: string;
  subtitle: string;
  pricing: string;
  bestFor: string;
  stayStyle: string;
  transportStyle: string;
  highlights: string[];
  dailyPlan: string[];
  budgetNote: string;
  color: string;
  borderColor: string;
  featured?: boolean;
} {
  const dailyPlan = draft.days.map((day) => {
    const body = day.places.map((p) => p.text).join(', ');
    return `${day.dayTitle}: ${body}`;
  });
  return {
    name: draft.name,
    subtitle: draft.description,
    pricing: draft.estimatedRange,
    bestFor: draft.bestFor,
    stayStyle: draft.stayStyle,
    transportStyle: draft.transportStyle,
    highlights: draft.highlights.map((h) => h.text),
    dailyPlan,
    budgetNote: draft.budgetNote,
    color: base.color,
    borderColor: base.borderColor,
    featured: base.featured,
  };
}

function serializePlanForValidation(d: EditableItinerary) {
  return {
    planTitle: d.name,
    days: d.days.map((day) => ({
      dayTitle: day.dayTitle,
      places: day.places.map((p) => p.text),
    })),
    highlights: d.highlights.map((h) => h.text),
    estimatedRange: d.estimatedRange,
  };
}

type ItineraryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: EditableItinerary;
  onDraftChange: (next: EditableItinerary, options?: DraftChangeOptions) => void;
  onSave: () => void;
  onRegenerate: () => void | Promise<void>;
  regenerateBusy: boolean;
  regenerateNotice: { text: string; error: boolean } | null;
  validateTripFields: ValidatePlaceTripFields;
  accentBorderClass: string;
};

export function ItineraryModal({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onSave,
  onRegenerate,
  regenerateBusy,
  regenerateNotice,
  validateTripFields,
  accentBorderClass,
}: ItineraryModalProps) {
  const [customPlace, setCustomPlace] = useState('');
  const [targetDayIndex, setTargetDayIndex] = useState(0);
  const [addPlaceLoading, setAddPlaceLoading] = useState(false);
  const [addPlaceError, setAddPlaceError] = useState<string | null>(null);
  const [placeCostNote, setPlaceCostNote] = useState<string | null>(null);
  const [saveClosing, setSaveClosing] = useState(false);
  const saveCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveCloseTimerRef.current) clearTimeout(saveCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setSaveClosing(false);
      if (saveCloseTimerRef.current) {
        clearTimeout(saveCloseTimerRef.current);
        saveCloseTimerRef.current = null;
      }
    }
  }, [open]);

  const clearSaveCloseTimer = () => {
    if (saveCloseTimerRef.current) {
      clearTimeout(saveCloseTimerRef.current);
      saveCloseTimerRef.current = null;
    }
  };

  const handleDismiss = () => {
    clearSaveCloseTimer();
    setSaveClosing(false);
    onOpenChange(false);
  };

  const dayOptions = useMemo(
    () =>
      draft.days.map((d, i) => ({
        i,
        label: d.dayTitle || `Day ${i + 1}`,
      })),
    [draft.days],
  );

  const removePlace = (dayId: string, placeId: string) => {
    setAddPlaceError(null);
    setPlaceCostNote(null);
    const nextDays = draft.days
      .map((day) => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          places: day.places.filter((p) => p.id !== placeId),
        };
      })
      .filter((day) => day.places.length > 0);
    onDraftChange({ ...draft, days: nextDays });
  };

  const removeHighlight = (id: string) => {
    setAddPlaceError(null);
    setPlaceCostNote(null);
    onDraftChange({
      ...draft,
      highlights: draft.highlights.filter((h) => h.id !== id),
    });
  };

  const addCustomPlace = async () => {
    const raw = customPlace.trim();
    if (!raw) return;

    setAddPlaceError(null);
    setPlaceCostNote(null);

    if (!validateTripFields) {
      setAddPlaceError('Generate a trip from the planner first so we can validate places for your destination.');
      return;
    }

    setAddPlaceLoading(true);
    try {
      const res = await fetch('/api/validate-place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: validateTripFields.destination,
          fromCity: validateTripFields.fromCity,
          placeName: raw,
          vibe: validateTripFields.vibe,
          travelWith: validateTripFields.travelWith,
          days: validateTripFields.days,
          travelers: validateTripFields.travelers,
          groupBudget: validateTripFields.groupBudget,
          currentPlan: serializePlanForValidation(draft),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Validation request failed');
      }

      if (data.valid === false) {
        setAddPlaceError(typeof data.error === 'string' ? data.error : 'This place could not be added.');
        return;
      }

      if (data.valid !== true) {
        setAddPlaceError('Unexpected validation response. Try again.');
        return;
      }

      const normalized =
        typeof data.normalizedName === 'string' && data.normalizedName.trim().length > 0
          ? data.normalizedName.trim()
          : raw;

      const impact = data.estimatedCostImpact as { min?: number; max?: number } | undefined;
      const min = typeof impact?.min === 'number' ? impact.min : 0;
      const max = typeof impact?.max === 'number' ? impact.max : min;

      const idx = Math.min(Math.max(0, targetDayIndex), Math.max(0, draft.days.length - 1));
      const nextDays = draft.days.length
        ? draft.days.map((day, i) =>
            i === idx
              ? {
                  ...day,
                  places: [...day.places, { id: makeId('place'), text: normalized }],
                }
              : day,
          )
        : [
            {
              id: makeId('day'),
              dayTitle: 'Custom',
              places: [{ id: makeId('place'), text: normalized }],
            },
          ];

      const nextDraft = { ...draft, days: nextDays };
      onDraftChange(nextDraft, { additiveGroupCost: { min, max: Math.max(min, max) } });

      const lo = Math.min(min, max);
      const hi = Math.max(min, max);
      setPlaceCostNote(
        `Added estimated ₹${lo.toLocaleString('en-IN')}–₹${hi.toLocaleString('en-IN')} total for this trip`,
      );
      setCustomPlace('');
    } catch (e) {
      setAddPlaceError(e instanceof Error ? e.message : 'Could not validate this place.');
    } finally {
      setAddPlaceLoading(false);
    }
  };

  const handleSave = () => {
    if (saveClosing) return;
    onSave();
    setSaveClosing(true);
    clearSaveCloseTimer();
    saveCloseTimerRef.current = setTimeout(() => {
      setSaveClosing(false);
      onOpenChange(false);
      saveCloseTimerRef.current = null;
    }, 1600);
  };

  const handleRegenerate = () => {
    void onRegenerate();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[99999] h-[100dvh] w-[100vw] overflow-hidden bg-black/80 sm:flex sm:items-center sm:justify-center sm:p-4"
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100dvh',
            maxWidth: '100vw',
            maxHeight: '100dvh',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="itinerary-modal-title"
            className={cn(
              'relative flex h-[100dvh] max-h-[100dvh] w-[100vw] max-w-[100vw] flex-col overflow-hidden rounded-none border-0 bg-background shadow-2xl shadow-black/40',
              'sm:h-auto sm:max-h-[92dvh] sm:w-full sm:max-w-3xl sm:rounded-2xl sm:border sm:bg-background/95',
              accentBorderClass,
            )}
            style={{
              width: '100vw',
              height: '100dvh',
              maxWidth: '100vw',
              maxHeight: '100dvh',
            }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute right-3 top-3 z-30 rounded-full border border-white/15 bg-background/90 p-2 text-foreground/70 backdrop-blur transition hover:bg-white/10 hover:text-white sm:right-4 sm:top-4"
              aria-label="Close itinerary modal"
            >
              <X className="h-5 w-5" />
            </button>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-5 sm:px-8 sm:pb-6 sm:pt-6">
          <div className="space-y-6 sm:space-y-8">
            <header className="space-y-2 pr-10 text-left sm:pr-8">
              <h2
                id="itinerary-modal-title"
                className="text-xl font-bold tracking-tight text-balance sm:text-3xl"
              >
                {draft.name}
              </h2>
              <p className="text-sm leading-relaxed text-foreground/70 sm:text-base">
                {draft.description}
              </p>
            </header>

            <AnimatePresence>
              {(regenerateNotice || regenerateBusy) && (
                <motion.div
                  key="regenerate-feedback"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-sm text-foreground/90',
                    regenerateNotice?.error
                      ? 'border-red-500/40 bg-red-500/10'
                      : 'border-purple-500/40 bg-purple-500/10',
                  )}
                >
                  {regenerateBusy
                    ? 'Regenerating plan with your itinerary…'
                    : (regenerateNotice?.text ?? '')}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <Meta label="Estimated range" value={draft.estimatedRange} />
              <Meta label="Best for" value={draft.bestFor} />
              <Meta label="Stay style" value={draft.stayStyle} />
              <Meta label="Transport style" value={draft.transportStyle} />
            </div>

            {draft.budgetNote ? (
              <section className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
                <h3 className="text-xs uppercase tracking-wide text-foreground/50 mb-2">
                  Budget note
                </h3>
                <p className="text-sm text-foreground/85 leading-relaxed">{draft.budgetNote}</p>
              </section>
            ) : null}

            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
                Highlights
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
              </h3>
              <ul className="space-y-2">
                {draft.highlights.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                    <span className="min-w-0 flex-1 break-words text-foreground/85">{h.text}</span>
                    <button
                      type="button"
                      onClick={() => removeHighlight(h.id)}
                      className="shrink-0 rounded-lg p-1.5 text-foreground/50 hover:bg-white/10 hover:text-red-400 transition-colors"
                      aria-label="Remove highlight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-4">Day-wise itinerary</h3>
              <div className="space-y-6">
                {draft.days.map((day) => (
                  <div
                    key={day.id}
                    className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-3 sm:p-5"
                  >
                    <div className="text-xs uppercase tracking-wide text-purple-300/90 mb-3">
                      {day.dayTitle}
                    </div>
                    <ul className="space-y-2">
                      {day.places.map((place) => (
                        <li
                          key={place.id}
                          className="flex items-start gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2.5 text-sm"
                        >
                          <span className="min-w-0 flex-1 break-words text-foreground/80 leading-relaxed">
                            {place.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePlace(day.id, place.id)}
                            className="shrink-0 rounded-lg p-1.5 text-foreground/50 hover:bg-white/10 hover:text-red-400 transition-colors"
                            aria-label="Remove place or activity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
              <h3 className="text-sm font-semibold">Add custom place</h3>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="custom-place-input">
                  Custom place name
                </label>
                <input
                  id="custom-place-input"
                  type="text"
                  value={customPlace}
                  onChange={(e) => {
                    setCustomPlace(e.target.value);
                    setAddPlaceError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void addCustomPlace();
                    }
                  }}
                  placeholder="e.g. Sunset point, local café…"
                  disabled={addPlaceLoading}
                  className="min-w-0 flex-1 rounded-xl border border-white/15 bg-background/80 px-4 py-3 text-base outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 disabled:opacity-60 sm:py-2.5 sm:text-sm"
                />
                {draft.days.length > 0 ? (
                  <select
                    value={targetDayIndex}
                    onChange={(e) => setTargetDayIndex(Number(e.target.value))}
                    disabled={addPlaceLoading}
                    className="w-full rounded-xl border border-white/15 bg-background/80 px-3 py-3 text-base outline-none focus:border-purple-500/60 disabled:opacity-60 sm:max-w-[200px] sm:py-2.5 sm:text-sm"
                    aria-label="Add to day"
                  >
                    {dayOptions.map(({ i, label }) => (
                      <option key={i} value={i}>
                        Add to {label}
                      </option>
                    ))}
                  </select>
                ) : null}
                <button
                  type="button"
                  onClick={() => void addCustomPlace()}
                  disabled={addPlaceLoading}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/15 disabled:pointer-events-none disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  {addPlaceLoading ? 'Checking place…' : 'Add'}
                </button>
              </div>
              {addPlaceLoading ? (
                <p className="text-xs text-foreground/55">Checking place…</p>
              ) : null}
              {addPlaceError ? (
                <p className="text-sm text-red-400/95" role="alert">
                  {addPlaceError}
                </p>
              ) : null}
              {placeCostNote ? (
                <p className="text-xs text-emerald-400/90">{placeCostNote}</p>
              ) : null}
            </section>
          </div>
        </div>

        <div
          className={cn(
            'sticky bottom-0 z-20 shrink-0 border-t border-white/10 bg-background/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-6 sm:py-4',
            'supports-[backdrop-filter]:bg-background/85',
          )}
        >
          {saveClosing ? (
            <p className="mb-3 text-center text-sm font-medium text-emerald-400/95">
              Changes saved to your itinerary
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleDismiss}
              className="order-2 min-h-12 w-full rounded-xl border border-white/20 bg-white/[0.04] px-5 py-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-white/[0.08] sm:order-1 sm:w-auto"
            >
              Close
            </button>
            <div className="order-1 flex flex-col-reverse gap-3 sm:order-2 sm:ml-auto sm:flex-row sm:flex-nowrap">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerateBusy || saveClosing}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-5 py-3 text-sm font-medium transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
              >
                <Sparkles className="w-4 h-4 text-purple-300" />
                Regenerate this plan
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saveClosing || regenerateBusy}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-shadow hover:shadow-purple-500/40 disabled:pointer-events-none disabled:opacity-70 sm:w-auto sm:min-w-[160px]"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
      <p className="text-[10px] uppercase tracking-wider text-foreground/45 mb-1.5">{label}</p>
      <p className="break-words text-sm leading-snug text-foreground/90">{value || '—'}</p>
    </div>
  );
}
