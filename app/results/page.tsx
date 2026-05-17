'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useAuth } from '@/components/auth-provider';
import {
  ArrowLeft,
  BadgeIndianRupee,
  CalendarCheck,
  CheckCircle,
  Download,
  MessageCircle,
  Save,
  Share2,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  ItineraryModal,
  buildEditableFromItinerary,
  mergeDraftToItineraryData,
  type EditableItinerary,
} from './itinerary-modal';
import {
  adjustGroupRangeForItineraryChange,
  buildPricingBaselineFromCard,
  mergeAdditiveGroupCostIntoRange,
  type PricingBaseline,
  type TripPricingContext,
} from '@/lib/trip-pricing';

interface TripPlan {
  title: string;
  description: string;
  estimatedRange: string;
  bestFor: string;
  stayStyle: string;
  transportStyle: string;
  dailyPlan: string[];
  highlights: string[];
  budgetNote: string;
}

interface ItineraryData {
  name: string;
  pricing: string;
  subtitle: string;
  bestFor: string;
  stayStyle: string;
  transportStyle: string;
  dailyPlan: string[];
  color: string;
  borderColor: string;
  highlights: string[];
  budgetNote?: string;
  featured?: boolean;
}

interface TripFormStored {
  fromCity: string;
  destination: string;
  budget: number;
  travelers: number;
  days: number;
  dates?: string;
  travelWith: string;
  vibe: string[];
  budgetStyle: string;
  transportPreference: string;
}

function toTripPricingContext(t: TripFormStored | null): TripPricingContext | null {
  if (!t) return null;
  return { budget: t.budget, travelers: t.travelers, days: t.days };
}

function getPlanMeta(index: number, name?: string) {
  const normalizedName = (name || '').toLowerCase();

  if (index === 0 || normalizedName.includes('budget')) {
    return {
      label: 'Lowest realistic cost',
      short: 'Save More',
      mood: 'Spend less, explore smart',
      icon: BadgeIndianRupee,
      note:
        'Built around the minimum realistic budget using budget stays, local food, and shared transport.',
      badgeClass: 'border-green-400/30 bg-green-500/10 text-green-200',
      chips: ['Budget stay', 'Local food', 'Shared rides'],
      vibeEmoji: '🎒',
      travelMood: 'Backpack energy, local food, beach walks, and smart savings.',
      sensoryLine: 'Raw, flexible, local and pocket-friendly.',
      scores: {
        budgetFit: 95,
        comfort: 55,
        experience: 68,
        convenience: 52,
      },
    };
  }

  if (index === 1 || normalizedName.includes('smart')) {
    return {
      label: 'Best value balance',
      short: 'Best Balance',
      mood: 'Best memories per rupee',
      icon: Sparkles,
      note:
        'Adds better stays, smoother movement, and selected paid experiences without overspending.',
      badgeClass: 'border-purple-400/30 bg-purple-500/10 text-purple-200',
      chips: ['Better stay', 'Smooth travel', 'Paid experiences'],
      vibeEmoji: '🌅',
      travelMood: 'Sunsets, cafes, smoother stays, and balanced exploration.',
      sensoryLine: 'Comfortable, social, scenic and value-packed.',
      scores: {
        budgetFit: 82,
        comfort: 78,
        experience: 84,
        convenience: 76,
      },
    };
  }

  return {
    label: 'Upgrade experience',
    short: 'Feel Premium',
    mood: 'Travel without compromises',
    icon: TrendingUp,
    note:
      'Upgrades stay quality, private movement, food options, and premium experiences.',
    badgeClass: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200',
    chips: ['Premium stay', 'Private cab', 'Curated spots'],
    vibeEmoji: '🥂',
    travelMood: 'Boutique stays, private rides, curated food spots, and no-rush travel.',
    sensoryLine: 'Polished, relaxed, premium and convenience-first.',
    scores: {
      budgetFit: 58,
      comfort: 94,
      experience: 92,
      convenience: 95,
    },
  };
}

function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-foreground/60">
        <span>{label}</span>
        <span>{Math.round(value / 10)}/10</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState<ItineraryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tripContext, setTripContext] = useState<TripFormStored | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [activePlanIndex, setActivePlanIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<EditableItinerary | null>(null);
  const [pricingBaseline, setPricingBaseline] =
    useState<PricingBaseline | null>(null);
  const [regenerateBusy, setRegenerateBusy] = useState(false);
  const [regenerateNotice, setRegenerateNotice] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  const closeModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectPlan = useCallback((index: number) => {
    setSelectedPlanIndex(index);

    try {
      sessionStorage.setItem('tripnestSelectedPlanIndex', String(index));
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    const generatedTripsStr = sessionStorage.getItem('generatedTrips');
    const formDataStr = sessionStorage.getItem('tripFormData');

    let parsedForm: TripFormStored | null = null;

    if (formDataStr) {
      try {
        parsedForm = JSON.parse(formDataStr) as TripFormStored;
      } catch {
        parsedForm = null;
      }
    }

    setTripContext(parsedForm);

    if (!generatedTripsStr || !formDataStr) {
      const restoredTrip = sessionStorage.getItem('restoredTrip');

      if (restoredTrip) {
        try {
          const parsedRestore = JSON.parse(restoredTrip) as {
            tripContext?: TripFormStored;
            selectedPlanIndex?: number;
            selectedPlan?: ItineraryData;
            itineraries?: ItineraryData[];
          };

          if (parsedRestore.tripContext) {
            setTripContext(parsedRestore.tripContext);
            sessionStorage.setItem(
              'tripFormData',
              JSON.stringify(parsedRestore.tripContext)
            );
          }

          if (
            parsedRestore.itineraries &&
            Array.isArray(parsedRestore.itineraries) &&
            parsedRestore.itineraries.length > 0
          ) {
            setItineraries(parsedRestore.itineraries);

            const restoredGeneratedTrips = parsedRestore.itineraries.map(
              (plan) => ({
                title: plan.name,
                description: plan.subtitle,
                estimatedRange: plan.pricing,
                bestFor: plan.bestFor,
                stayStyle: plan.stayStyle,
                transportStyle: plan.transportStyle,
                dailyPlan: plan.dailyPlan,
                highlights: plan.highlights,
                budgetNote: plan.budgetNote ?? '',
              })
            );

            sessionStorage.setItem(
              'generatedTrips',
              JSON.stringify(restoredGeneratedTrips)
            );

            const restoredIndexByName = parsedRestore.selectedPlan?.name
              ? parsedRestore.itineraries?.findIndex(
                  (item) => item.name === parsedRestore.selectedPlan?.name
                )
              : -1;

            if (
              typeof restoredIndexByName === 'number' &&
              restoredIndexByName >= 0
            ) {
              setSelectedPlanIndex(restoredIndexByName);
              sessionStorage.setItem(
                'tripnestSelectedPlanIndex',
                String(restoredIndexByName)
              );
            } else if (typeof parsedRestore.selectedPlanIndex === 'number') {
              setSelectedPlanIndex(parsedRestore.selectedPlanIndex);
              sessionStorage.setItem(
                'tripnestSelectedPlanIndex',
                String(parsedRestore.selectedPlanIndex)
              );
            }

            sessionStorage.removeItem('restoredTrip');
            setIsLoading(false);
            return;
          }
        } catch {
          sessionStorage.removeItem('restoredTrip');
        }
      }

      setItineraries(getDefaultItineraries());
      setIsLoading(false);
      return;
    }

    try {
      const generatedTrips = JSON.parse(generatedTripsStr);

      const plans: ItineraryData[] = generatedTrips.map(
        (plan: TripPlan, index: number) => {
          const colors = [
            {
              color: 'from-green-500/20 to-emerald-500/20',
              border: 'border-green-500/30',
            },
            {
              color: 'from-purple-500/20 to-pink-500/20',
              border: 'border-purple-500/30',
            },
            {
              color: 'from-yellow-500/20 to-orange-500/20',
              border: 'border-yellow-500/30',
            },
          ];

          const { color, border } = colors[index] || colors[0];

          return transformTripPlan(plan, color, border, index === 1);
        }
      );

      setItineraries(plans);

      const restoredTrip = sessionStorage.getItem('restoredTrip');

      if (restoredTrip) {
        try {
          const parsedRestore = JSON.parse(restoredTrip) as {
            tripContext?: TripFormStored;
            selectedPlanIndex?: number;
            selectedPlan?: ItineraryData;
            itineraries?: ItineraryData[];
          };

          if (parsedRestore.tripContext) {
            setTripContext(parsedRestore.tripContext);
            sessionStorage.setItem(
              'tripFormData',
              JSON.stringify(parsedRestore.tripContext)
            );
          }

          if (
            parsedRestore.itineraries &&
            Array.isArray(parsedRestore.itineraries) &&
            parsedRestore.itineraries.length > 0
          ) {
            setItineraries(parsedRestore.itineraries);

            const restoredGeneratedTrips = parsedRestore.itineraries.map(
              (plan) => ({
                title: plan.name,
                description: plan.subtitle,
                estimatedRange: plan.pricing,
                bestFor: plan.bestFor,
                stayStyle: plan.stayStyle,
                transportStyle: plan.transportStyle,
                dailyPlan: plan.dailyPlan,
                highlights: plan.highlights,
                budgetNote: plan.budgetNote ?? '',
              })
            );

            sessionStorage.setItem(
              'generatedTrips',
              JSON.stringify(restoredGeneratedTrips)
            );
          }

          const restoredIndexByName = parsedRestore.selectedPlan?.name
            ? parsedRestore.itineraries?.findIndex(
                (item) => item.name === parsedRestore.selectedPlan?.name
              )
            : -1;

          if (
            typeof restoredIndexByName === 'number' &&
            restoredIndexByName >= 0
          ) {
            setSelectedPlanIndex(restoredIndexByName);
            sessionStorage.setItem(
              'tripnestSelectedPlanIndex',
              String(restoredIndexByName)
            );
          } else if (typeof parsedRestore.selectedPlanIndex === 'number') {
            setSelectedPlanIndex(parsedRestore.selectedPlanIndex);
            sessionStorage.setItem(
              'tripnestSelectedPlanIndex',
              String(parsedRestore.selectedPlanIndex)
            );
          }

          sessionStorage.removeItem('restoredTrip');
        } catch {
          sessionStorage.removeItem('restoredTrip');
        }
      } else {
        const storedSelectedIndex = Number(
          sessionStorage.getItem('tripnestSelectedPlanIndex')
        );

        if (
          Number.isInteger(storedSelectedIndex) &&
          storedSelectedIndex >= 0 &&
          storedSelectedIndex < plans.length
        ) {
          setSelectedPlanIndex(storedSelectedIndex);
        }
      }
    } catch (error) {
      console.error('Error loading trip data:', error);
      setItineraries(getDefaultItineraries());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDraftChange = useCallback(
    (
      next: EditableItinerary,
      options?: { additiveGroupCost?: { min: number; max: number } }
    ) => {
      const ctx = toTripPricingContext(tripContext);
      let estimatedRange = next.estimatedRange;

      if (pricingBaseline) {
        estimatedRange = adjustGroupRangeForItineraryChange(
          pricingBaseline,
          next,
          ctx
        );
      }

      if (options?.additiveGroupCost && ctx) {
        estimatedRange = mergeAdditiveGroupCostIntoRange(
          estimatedRange,
          options.additiveGroupCost,
          ctx
        );
      }

      setDraft({ ...next, estimatedRange });
    },
    [pricingBaseline, tripContext]
  );

  const openItinerary = useCallback(
    (index: number) => {
      if (closeModalTimerRef.current) {
        clearTimeout(closeModalTimerRef.current);
        closeModalTimerRef.current = null;
      }

      const plan = itineraries[index];
      if (!plan) return;

      setActivePlanIndex(index);
      setPricingBaseline(
        buildPricingBaselineFromCard(
          plan.dailyPlan,
          plan.highlights,
          plan.pricing,
          index,
          toTripPricingContext(tripContext)
        )
      );
      setDraft(buildEditableFromItinerary(plan));
      setModalOpen(true);
    },
    [itineraries, tripContext]
  );

  const handleRegeneratePlan = useCallback(async () => {
    if (draft === null || activePlanIndex === null) return;

    if (!tripContext) {
      setRegenerateNotice({
        text: 'Generate a trip from the planner first so regeneration can use your group budget and route.',
        error: true,
      });

      window.setTimeout(() => setRegenerateNotice(null), 5200);
      return;
    }

    setRegenerateBusy(true);
    setRegenerateNotice({
      text: 'Regenerating plan with your itinerary…',
      error: false,
    });

    try {
      const res = await fetch('/api/regenerate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripFormData: tripContext,
          planTierIndex: activePlanIndex,
          currentPlanTitle: draft.name,
          currentDescription: draft.description,
          customizedDailyPlan: draft.days.map(
            (d) => `${d.dayTitle}: ${d.places.map((p) => p.text).join(', ')}`
          ),
          customizedHighlights: draft.highlights.map((h) => h.text),
          currentEstimatedRange: draft.estimatedRange,
          currentStayStyle: draft.stayStyle,
          currentTransportStyle: draft.transportStyle,
          currentBudgetNote: draft.budgetNote,
        }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof payload.error === 'string'
            ? payload.error
            : 'Regeneration failed'
        );
      }

      const plan = payload.plan as TripPlan;
      let merged: ItineraryData | null = null;

      setItineraries((prev) => {
        const cur = prev[activePlanIndex];
        if (!cur) return prev;

        merged = transformTripPlan(plan, cur.color, cur.borderColor, cur.featured);

        return prev.map((p, i) => (i === activePlanIndex ? merged! : p));
      });

      if (merged) {
        setDraft(buildEditableFromItinerary(merged));
        setPricingBaseline(
          buildPricingBaselineFromCard(
            merged.dailyPlan,
            merged.highlights,
            merged.pricing,
            activePlanIndex,
            toTripPricingContext(tripContext)
          )
        );
      }

      setRegenerateNotice({
        text: 'Plan refreshed for your edited stops and group budget.',
        error: false,
      });

      window.setTimeout(() => setRegenerateNotice(null), 4200);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Regeneration failed';

      setRegenerateNotice({ text: msg, error: true });
      window.setTimeout(() => setRegenerateNotice(null), 6000);
    } finally {
      setRegenerateBusy(false);
    }
  }, [draft, activePlanIndex, tripContext]);

  const handleSaveDraft = useCallback(() => {
    if (draft === null || activePlanIndex === null) return;

    let savedRow: ItineraryData | null = null;

    setItineraries((prev) => {
      const row = prev[activePlanIndex];
      if (!row) return prev;

      const saved = mergeDraftToItineraryData(draft, {
        color: row.color,
        borderColor: row.borderColor,
        featured: row.featured,
      });

      savedRow = saved as ItineraryData;

      return prev.map((p, i) => (i === activePlanIndex ? savedRow! : p));
    });

    if (!savedRow) return;

    setDraft(buildEditableFromItinerary(savedRow));
    setPricingBaseline(
      buildPricingBaselineFromCard(
        savedRow.dailyPlan,
        savedRow.highlights,
        savedRow.pricing,
        activePlanIndex,
        toTripPricingContext(tripContext)
      )
    );

    try {
      const raw = sessionStorage.getItem('generatedTrips');

      if (raw) {
        const plans = JSON.parse(raw) as TripPlan[];

        if (Array.isArray(plans) && plans[activePlanIndex]) {
          plans[activePlanIndex] = {
            title: savedRow.name,
            description: savedRow.subtitle,
            estimatedRange: savedRow.pricing,
            bestFor: savedRow.bestFor,
            stayStyle: savedRow.stayStyle,
            transportStyle: savedRow.transportStyle,
            dailyPlan: savedRow.dailyPlan,
            highlights: savedRow.highlights,
            budgetNote: savedRow.budgetNote ?? '',
          };

          sessionStorage.setItem('generatedTrips', JSON.stringify(plans));
        }
      }
    } catch {
      // ignore session sync errors
    }
  }, [draft, activePlanIndex, tripContext]);

  const handleModalOpenChange = useCallback((open: boolean) => {
    setModalOpen(open);

    if (!open) {
      if (closeModalTimerRef.current) clearTimeout(closeModalTimerRef.current);

      closeModalTimerRef.current = setTimeout(() => {
        setActivePlanIndex(null);
        setDraft(null);
        setPricingBaseline(null);
        setRegenerateNotice(null);
        closeModalTimerRef.current = null;
      }, 280);
    } else if (closeModalTimerRef.current) {
      clearTimeout(closeModalTimerRef.current);
      closeModalTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (closeModalTimerRef.current) clearTimeout(closeModalTimerRef.current);
    };
  }, []);


  const buildTripSummaryText = useCallback(() => {
    const destination = tripContext?.destination || 'your selected destination';
    const travelers = tripContext?.travelers || 0;
    const days = tripContext?.days || 0;
    const budget = tripContext?.budget
      ? `₹${tripContext.budget.toLocaleString('en-IN')}`
      : 'selected budget';

    const selectedPlan =
      selectedPlanIndex !== null ? itineraries[selectedPlanIndex] : null;

    const selectedPlanText = selectedPlan
      ? `\n✅ Selected Plan\n${selectedPlan.name}\nEstimated: ${selectedPlan.pricing}\nWhy: ${selectedPlan.budgetNote || selectedPlan.subtitle}\n`
      : '\n⚠️ Selected Plan: Not selected yet\n';

    const planLines = itineraries
      .map(
        (plan, index) =>
          `${index + 1}. ${plan.name}\nEstimated: ${plan.pricing}\n${plan.subtitle}`
      )
      .join('\n\n');

    return `TripNest AI Trip Summary ✈️\n\nDestination: ${destination}\nTravelers: ${travelers}\nDays: ${days}\nBudget: ${budget}${selectedPlanText}\nAll Options:\n${planLines}\n\nGenerated with TripNest AI.`;
  }, [itineraries, tripContext, selectedPlanIndex]);

  const handleSaveTrip = useCallback(async () => {
    if (!user) {
      setBookingNotice('Please login first to save this trip.');
      window.setTimeout(() => setBookingNotice(null), 3500);
      return;
    }

    const effectiveSelectedPlanIndex =
      selectedPlanIndex !== null
        ? selectedPlanIndex
        : itineraries[1]
          ? 1
          : itineraries[0]
            ? 0
            : null;

    const selectedPlan =
      effectiveSelectedPlanIndex !== null
        ? itineraries[effectiveSelectedPlanIndex] || null
        : null;

    if (!selectedPlan || effectiveSelectedPlanIndex === null) {
      setBookingNotice('Please select a plan first.');
      window.setTimeout(() => setBookingNotice(null), 3500);
      return;
    }

    const safeTitle =
      selectedPlan.name ||
      selectedPlan.subtitle ||
      `Trip to ${tripContext?.destination || 'your destination'}`;

    const safeDestination = tripContext?.destination || 'Saved destination';

    const selectedPlanForSave = {
      ...selectedPlan,
      name: safeTitle,
    };

    const savedTrip = {
      savedAt: new Date().toISOString(),
      tripContext,
      selectedPlanIndex: effectiveSelectedPlanIndex,
      selectedPlan: selectedPlanForSave,
      itineraries,
    };

    try {
      localStorage.setItem('tripnestSavedTrip', JSON.stringify(savedTrip));

      const cleanPayload = JSON.parse(
        JSON.stringify({
          tripContext,
          selectedPlanIndex: effectiveSelectedPlanIndex,
          selectedPlan: selectedPlanForSave,
          itineraries,
        })
      );

      const { error } = await supabase.from('saved_trips').insert({
        user_id: user.id,
        title: safeTitle,
        destination: safeDestination,
        selected_plan: safeTitle,
        payload: cleanPayload,
      });

      if (error) {
        setBookingNotice(`Cloud save failed: ${error.message || 'Unknown error'}`);
        window.setTimeout(() => setBookingNotice(null), 4500);
        return;
      }

      setBookingNotice('Trip saved to your profile successfully ✨');

      window.setTimeout(() => {
        setBookingNotice(null);
        setBookingModalOpen(false);
      }, 900);
    } catch {
      setBookingNotice('Unable to save this trip. Please try again.');
      window.setTimeout(() => setBookingNotice(null), 3500);
    }
  }, [
    itineraries,
    selectedPlanIndex,
    supabase,
    tripContext,
    user,
  ]);

  const handleCopyTripSummary = useCallback(async () => {
    const summary = buildTripSummaryText();

    try {
      await navigator.clipboard.writeText(summary);
      setBookingNotice('Trip summary copied. You can share it with a travel expert.');
    } catch {
      setBookingNotice('Copy failed. Please try again from your browser.');
    }

    window.setTimeout(() => setBookingNotice(null), 3500);
  }, [buildTripSummaryText]);

  const handleShareTrip = useCallback(async () => {
    const summary = buildTripSummaryText();

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'TripNest AI Trip Plan',
          text: summary,
        });
        setBookingNotice('Share sheet opened for your trip plan.');
      } else {
        await navigator.clipboard.writeText(summary);
        setBookingNotice('Sharing is not available here, so the trip summary was copied.');
      }
    } catch {
      setBookingNotice('Share cancelled or unavailable.');
    }

    window.setTimeout(() => setBookingNotice(null), 3500);
  }, [buildTripSummaryText]);

  const handleDownloadTripSummary = useCallback(() => {
    const summary = buildTripSummaryText();
    const destination = tripContext?.destination || 'trip';
    const fileName = `tripnest-${destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-summary.txt`;

    try {
      const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
      setBookingNotice('Trip summary downloaded.');
    } catch {
      setBookingNotice('Download failed. Please try copying the summary instead.');
    }

    window.setTimeout(() => setBookingNotice(null), 3500);
  }, [buildTripSummaryText, tripContext?.destination]);


  if (isLoading) {
    return (
      <main className="bg-background min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-2xl font-semibold mb-4">
            Loading your trip plans...
          </div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full mx-auto"
          />
        </motion.div>
      </main>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const accentPlan =
    activePlanIndex !== null ? itineraries[activePlanIndex] : undefined;

  const selectedPlan =
    selectedPlanIndex !== null
      ? itineraries[selectedPlanIndex] || null
      : null;

const handleProceedToBooking = async () => {
  if (selectedPlanIndex === null) {
    const recommendedIndex = itineraries[1]
      ? 1
      : itineraries[0]
        ? 0
        : null;

    if (recommendedIndex === null) {
      setBookingNotice('No itinerary found. Please generate a trip again.');
      setBookingModalOpen(true);
      return;
    }

    selectPlan(recommendedIndex);
  }

  if (!user) {
    setBookingNotice('Please login first to request early access.');
    setBookingModalOpen(true);
    return;
  }

  try {
    const selectedPlan =
      selectedPlanIndex !== null
        ? itineraries[selectedPlanIndex]
        : itineraries[1] || itineraries[0];

    const { error } = await supabase.from('booking_requests').insert({
      user_id: user.id,
      user_email: user.email,
      destination: tripContext?.destination || '',
      selected_plan: selectedPlan?.name || 'Recommended',
      budget: tripContext?.budget || 0,
      travelers: tripContext?.travelers || 0,
      days: tripContext?.days || 0,
      travel_with: tripContext?.travelWith || '',
      vibe: tripContext?.vibe || [],
      payload: {
        tripContext,
        selectedPlan,
      },
    });

    if (error) {
      setBookingNotice(error.message);
      setBookingModalOpen(true);
      return;
    }

    setBookingNotice(
      'You joined early access successfully ✨ Our team will contact you soon.'
    );

    setBookingModalOpen(true);
  } catch {
    setBookingNotice('Something went wrong. Please try again.');
    setBookingModalOpen(true);
  }
};
  return (
    <main className="bg-background min-h-screen overflow-hidden py-12 sm:py-20">
      {bookingModalOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/70 px-3 py-5 backdrop-blur-md sm:items-center sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-purple-500/30 bg-background/95 shadow-2xl shadow-purple-500/20 max-h-[92vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400" />

            <button
              type="button"
              onClick={() => setBookingModalOpen(false)}
              className="absolute right-4 top-4 rounded-full border border-border/50 bg-background/70 p-2 text-foreground/70 transition hover:border-purple-500/70 hover:text-white"
              aria-label="Close booking modal"
            >
              <X size={18} />
            </button>

            <div className="p-5 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <CalendarCheck className="text-purple-300" size={28} />
                </div>

                <div>
                  <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
                    <Sparkles size={14} />
                    Booking Preview
                  </p>

                  <h3 className="mt-1 text-xl font-bold sm:text-2xl">
                    {selectedPlan ? 'Selected itinerary preview' : 'Select an itinerary first'}
                  </h3>
                </div>
              </div>

              <p className="text-sm leading-6 text-foreground/65">
                {selectedPlan
                  ? 'Save this trip to your profile, share it with friends, copy it for a travel expert, or download a simple summary. Direct booking is coming soon.'
                  : 'Please choose one itinerary card first. This helps TripNest AI know which plan you want to continue with.'}
              </p>

              {tripContext && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                  <p className="mb-2 font-semibold">Current trip</p>
                  <div className="grid grid-cols-2 gap-3 text-xs text-foreground/70">
                    <span>{tripContext.destination}</span>
                    <span>{tripContext.travelers} traveler(s)</span>
                    <span>{tripContext.days} day(s)</span>
                    <span>₹{tripContext.budget.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {selectedPlan && (
                <div className="mt-4 rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4 text-sm">
                  <p className="mb-2 flex items-center gap-2 font-semibold text-purple-200">
                    <CheckCircle size={16} />
                    Selected plan
                  </p>
                  <p className="font-bold">{selectedPlan.name}</p>
                  <p className="mt-1 text-xs text-foreground/70">
                    {selectedPlan.pricing}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-foreground/65">
                    {selectedPlan.budgetNote || selectedPlan.subtitle}
                  </p>
                </div>
              )}

              {bookingNotice && (
                <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {bookingNotice}
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleSaveTrip}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-purple-500/30"
                >
                  <Save size={18} />
                  Save Trip
                </button>

                <button
                  type="button"
                  onClick={handleShareTrip}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-3 font-semibold transition hover:border-purple-500/70"
                >
                  <Share2 size={18} />
                  Share Plan
                </button>

                <button
                  type="button"
                  onClick={handleCopyTripSummary}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-3 font-semibold transition hover:border-purple-500/70"
                >
                  <MessageCircle size={18} />
                  Copy for Expert
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTripSummary}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-3 font-semibold transition hover:border-purple-500/70"
                >
                  <Download size={18} />
                  Download Summary
                </button>
              </div>

              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="mt-3 w-full rounded-xl px-4 py-3 text-sm text-foreground/60 transition hover:text-white"
              >
                Back to plans
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {draft !== null && activePlanIndex !== null && accentPlan ? (
        <ItineraryModal
          open={modalOpen}
          onOpenChange={handleModalOpenChange}
          draft={draft}
          onDraftChange={handleDraftChange}
          onSave={handleSaveDraft}
          onRegenerate={handleRegeneratePlan}
          regenerateBusy={regenerateBusy}
          regenerateNotice={regenerateNotice}
          validateTripFields={
            tripContext
              ? {
                  destination: tripContext.destination,
                  fromCity: tripContext.fromCity,
                  vibe: tripContext.vibe,
                  travelWith: tripContext.travelWith,
                  days: tripContext.days,
                  travelers: tripContext.travelers,
                  groupBudget: tripContext.budget,
                }
              : null
          }
          accentBorderClass={accentPlan.borderColor}
        />
      ) : null}

      <div className="absolute inset-0 -z-10">
        {tripContext?.destination?.toLowerCase().includes('goa') && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,140,66,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(0,180,255,0.12),transparent_40%)]" />
        )}

        {tripContext?.destination?.toLowerCase().includes('manali') && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,170,255,0.16),transparent_35%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_40%)]" />
        )}

        {tripContext?.destination?.toLowerCase().includes('udaipur') && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,190,90,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(255,120,60,0.12),transparent_40%)]" />
        )}

        {tripContext?.destination?.toLowerCase().includes('rishikesh') && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,220,180,0.14),transparent_35%),radial-gradient(circle_at_bottom,rgba(90,180,255,0.10),transparent_40%)]" />
        )}

        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8 flex flex-col items-start gap-4 sm:mb-10 sm:flex-row sm:items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
         <button
  type="button"
  onClick={() => {
    const returnTo = sessionStorage.getItem('tripnestReturnTo');

    if (returnTo === 'dashboard') {
      sessionStorage.removeItem('tripnestReturnTo');
      router.replace('/login');
      return;
    }

    router.replace('/home');
  }}
  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
><ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Your Journey Starts Here ✨
          </h1>
        </motion.div>

        <motion.div
          className="mb-10 max-w-3xl sm:mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-base leading-7 text-foreground/70 sm:text-lg">
            Pick the version of your trip — save-more backpacking, balanced
            comfort, or a premium no-compromise escape.
          </p>

          <p className="mt-4 text-sm leading-7 text-cyan-100/80 sm:text-base">
            {tripContext?.destination?.toLowerCase().includes('goa') &&
              'Sunsets, cafés, beaches and unforgettable nights are waiting 🌊'}

            {tripContext?.destination?.toLowerCase().includes('manali') &&
              'Cold mountain air, cafés and scenic roads are calling 🏔️'}

            {tripContext?.destination?.toLowerCase().includes('udaipur') &&
              'Royal sunsets, lakes and slow luxury await 🏰'}

            {tripContext?.destination?.toLowerCase().includes('rishikesh') &&
              'Adventure, cafés and peaceful mornings await 🛶'}

            {tripContext?.destination?.toLowerCase().includes('shimla') &&
              'Pine air, Mall Road walks and cozy mountain evenings await 🌲'}

            {tripContext?.destination?.toLowerCase().includes('mussoorie') &&
              'Cloudy viewpoints, cafés and slow hill walks await ☁️'}

            {tripContext?.destination?.toLowerCase().includes('mcleodganj') &&
              'Monastery calm, mountain cafés and hidden trails await 🏕️'}
          </p>

          {tripContext && (
            <div className="mt-5 flex flex-wrap gap-3 text-xs text-foreground/70">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {tripContext.destination}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {tripContext.travelers} traveler(s)
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {tripContext.days} day(s)
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                Budget ₹{tripContext.budget.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <motion.div
            className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4">
              <p className="text-xl sm:text-2xl">🌍</p>
              <p className="mt-2 text-xs font-semibold sm:text-sm">Explore freely</p>
              <p className="mt-1 hidden text-xs text-foreground/55 sm:block">
                Local streets, hidden spots, easy plans.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4">
              <p className="text-xl sm:text-2xl">☕</p>
              <p className="mt-2 text-xs font-semibold sm:text-sm">Slow moments</p>
              <p className="mt-1 hidden text-xs text-foreground/55 sm:block">
                Cafes, sunsets, relaxed breaks.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4">
              <p className="text-xl sm:text-2xl">✨</p>
              <p className="mt-2 text-xs font-semibold sm:text-sm">Better comfort</p>
              <p className="mt-1 hidden text-xs text-foreground/55 sm:block">
                Better stays, smoother movement.
              </p>
            </div>
          </motion.div>

          {itineraries[1] && (
            <motion.div
              className="mt-6 rounded-3xl border border-purple-400/30 bg-gradient-to-r from-purple-500/15 to-blue-500/10 p-4 sm:mt-8 sm:p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-200">
                    <Sparkles size={14} />
                    TripNest AI recommends
                  </div>
                  <h2 className="text-xl font-bold">{itineraries[1].name}</h2>
                  <p className="mt-1 text-sm text-foreground/65">
                    Best balance of memories, comfort and budget for your group.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => selectPlan(1)}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-purple-500/30 sm:w-auto"
                >
                  Choose recommended
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {itineraries.map((itinerary, index) => {
            const meta = getPlanMeta(index, itinerary.name);
            const MetaIcon = meta.icon;

            return (
              <motion.div
                key={index}
                className={`relative rounded-3xl overflow-hidden border transition-all ${
                  selectedPlanIndex === index
                    ? 'border-purple-400 shadow-2xl shadow-purple-500/30 ring-2 ring-purple-400/50'
                    : itinerary.borderColor
                }`}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.3)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${itinerary.color}`}
                />

                <div className="absolute inset-0 backdrop-blur-xl bg-white/5" />

                {itinerary.featured && selectedPlanIndex !== index && (
                  <motion.div
                    className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1.5 text-xs font-semibold sm:right-4 sm:top-4 sm:px-4 sm:py-2 sm:text-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.4 }}
                  >
                    Most Popular
                  </motion.div>
                )}

                {selectedPlanIndex === index && (
                  <motion.div
                    className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-1.5 text-xs font-semibold text-white sm:right-4 sm:top-4 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <CheckCircle size={16} />
                    Selected
                  </motion.div>
                )}

                <div className="relative z-10 flex h-full flex-col p-4 sm:p-6">
                  <div>
                    <div className="mb-5 flex items-start justify-between gap-3 sm:gap-4">
                      <div
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${meta.badgeClass}`}
                      >
                        <MetaIcon className="h-3.5 w-3.5" />
                        {meta.short}
                      </div>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl shadow-lg sm:h-14 sm:w-14 sm:text-3xl">
                        {meta.vibeEmoji}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold sm:text-2xl">{itinerary.name}</h3>
                    <p className="mt-1 text-sm italic text-foreground/60">
                      “{meta.mood}”
                    </p>
                    <p className="mt-3 hidden text-sm leading-6 text-foreground/75 sm:block">
                      {meta.travelMood}
                    </p>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4 sm:mt-6">
                      <p className="text-xs uppercase tracking-wide text-foreground/50">
                        Estimated group total
                      </p>
                      <p className="mt-2 break-words text-lg font-bold leading-snug text-purple-300 sm:text-xl">
                        {itinerary.pricing}
                      </p>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-foreground/75 sm:mt-5">
                      {itinerary.subtitle || itinerary.bestFor}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                      {meta.chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/75"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.06] to-transparent p-4 sm:block">
                      <p className="text-xs uppercase tracking-wide text-foreground/50">
                        Travel vibe
                      </p>
                      <p className="mt-2 text-sm leading-6 text-foreground/80">
                        {meta.sensoryLine}
                      </p>
                    </div>

                    <div className="mt-6 hidden space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:block">
                      <ScoreBar label="Budget fit" value={meta.scores.budgetFit} />
                      <ScoreBar label="Comfort" value={meta.scores.comfort} />
                      <ScoreBar label="Experience" value={meta.scores.experience} />
                      <ScoreBar label="Convenience" value={meta.scores.convenience} />
                    </div>

                    <div className="mt-5 hidden rounded-2xl border border-white/10 bg-black/10 p-4 sm:block">
                      <p className="text-xs uppercase tracking-wide text-foreground/50">
                        Quick reason
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-foreground/75">
                        {itinerary.budgetNote || meta.note}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8">
                    <motion.button
                      type="button"
                      onClick={() => selectPlan(index)}
                      className={`w-full rounded-xl py-3 font-semibold transition-all cursor-pointer ${
                        selectedPlanIndex === index
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/60'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedPlanIndex === index ? 'Selected Plan ✓' : 'Choose This Journey'}
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => openItinerary(index)}
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 font-semibold text-white transition-all cursor-pointer hover:bg-white/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:mt-12 sm:p-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-300" />
            <h3 className="text-xl font-bold">How the trip feeling changes</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="font-semibold">Budget Saver → Smart Comfort</p>
              <p className="mt-2 text-sm leading-6 text-foreground/65">
                From backpacker mode to a smoother vacation: better stay,
                fewer travel hassles, better food stops, and more memorable paid experiences.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <p className="font-semibold">Smart Comfort → Premium Experience</p>
              <p className="mt-2 text-sm leading-6 text-foreground/65">
                From balanced comfort to no-rush travel: private movement,
                upgraded stays, curated cafes, premium activities, and more breathing room.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-14 rounded-[2rem] border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02] p-6 text-center backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-lg font-semibold leading-8 text-white sm:text-2xl">
            “Travel isn&apos;t just about places — it&apos;s about the version
            of yourself you meet there.”
          </p>

          <p className="mt-3 text-sm text-foreground/55">
            Crafted with TripNest AI ✨
          </p>
        </motion.div>

        <motion.div
          className="mt-14 max-w-3xl mx-auto text-center sm:mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to continue this journey?
          </h2>

          <p className="text-foreground/70 mb-6">
            Choose your favorite itinerary and request early access to personalized trip planning.
          </p>

          {selectedPlan ? (
            <div className="mb-8 rounded-2xl border border-purple-400/30 bg-purple-500/10 px-5 py-4 text-left">
              <p className="text-xs uppercase tracking-wide text-purple-200">
                Selected itinerary
              </p>
              <p className="mt-1 font-bold">{selectedPlan.name}</p>
              <p className="mt-1 text-sm text-foreground/70">
                {selectedPlan.pricing}
              </p>
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-4 text-sm text-yellow-200">
              Choose the journey that feels right, then continue to booking preview.
            </div>
          )}

          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <motion.button
              type="button"
              onClick={() => router.back()}
              className="w-full rounded-full border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white transition-all hover:bg-white/20 cursor-pointer sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Adjust Preferences
            </motion.button>

            <motion.button
              type="button"
              onClick={handleProceedToBooking}
              className="w-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-3 font-semibold text-white shadow-lg shadow-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/70 cursor-pointer sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Request Early Access ✨
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function transformTripPlan(
  plan: TripPlan,
  color: string,
  borderColor: string,
  featured?: boolean
): ItineraryData {
  return {
    name: plan.title,
    pricing: plan.estimatedRange,
    subtitle: plan.description,
    bestFor: plan.bestFor,
    stayStyle: plan.stayStyle,
    transportStyle: plan.transportStyle,
    dailyPlan: plan.dailyPlan,
    color,
    borderColor,
    highlights: plan.highlights,
    budgetNote: plan.budgetNote ?? '',
    featured,
  };
}

function getDefaultItineraries(): ItineraryData[] {
  return [
    {
      name: 'Budget Saver',
      pricing: 'Flexible Pricing',
      subtitle: 'Maximum savings with smart planning',
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      bestFor: 'Backpackers and value-focused travelers',
      stayStyle: 'Hostels, guesthouses, and homestays',
      transportStyle: 'Public buses, metro, and shared rides',
      highlights: [
        'Budget-friendly accommodations',
        'Street food experiences',
        'Free attractions',
        'Local transport tips',
        'Group discounts',
      ],
      dailyPlan: [
        'Day 1: Arrival & Local Exploration',
        'Day 2: Street Food Tour',
        'Day 3: Free Attractions & Markets',
        'Day 4: Adventure Activities',
        'Day 5: Departure',
      ],
      budgetNote:
        'This plan keeps costs low with budget stays, local food, shared transport, and free or low-cost experiences.',
    },
    {
      name: 'Smart Comfort',
      pricing: 'Personalized For Your Budget',
      subtitle: 'Balanced comfort and experiences',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      bestFor: 'Couples and small groups wanting balance',
      stayStyle: 'Boutique hotels and well-rated 3–4★ stays',
      transportStyle: 'Mix of private cabs and premium trains',
      highlights: [
        '4-star hotels',
        'Mix of restaurants',
        'Popular attractions',
        'Guided experiences',
        'Flexible itinerary',
      ],
      dailyPlan: [
        'Day 1: Welcome & City Tour',
        'Day 2: Guided Cultural Experience',
        'Day 3: Adventure & Local Cuisine',
        'Day 4: Relaxation & Spa',
        'Day 5: Departure',
      ],
      featured: true,
      budgetNote:
        'This plan costs more than Budget Saver because it adds better stays, smoother transport, and selected paid experiences.',
    },
    {
      name: 'Premium Experience',
      pricing: 'Flexible Pricing',
      subtitle: 'Luxury, comfort, and convenience',
      color: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      bestFor: 'Travelers prioritizing comfort and exclusivity',
      stayStyle: '5-star hotels and private villas',
      transportStyle: 'Chauffeured cars and premium flights',
      highlights: [
        '5-star hotels',
        'Fine dining',
        'VIP experiences',
        'Private transport',
        'Personal concierge',
      ],
      dailyPlan: [
        'Day 1: Luxury Welcome & Private Tour',
        'Day 2: VIP Experiences',
        'Day 3: Fine Dining & Exclusive Events',
        'Day 4: Spa & Wellness',
        'Day 5: Premium Departure',
      ],
      budgetNote:
        'This plan costs more because it upgrades stay quality, transport convenience, food options, and premium experiences.',
    },
  ];
}