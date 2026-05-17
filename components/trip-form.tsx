'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BudgetWarningModal } from '@/components/ui/budget-warning-modal';
import { FormErrorModal } from '@/components/ui/form-error-modal';

const vibeOptions = [
  { id: 'adventure', label: 'Adventure', emoji: '⛰️' },
  { id: 'party', label: 'Party', emoji: '🎉' },
  { id: 'relaxed', label: 'Relaxed', emoji: '🧘' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'luxury', label: 'Luxury', emoji: '✨' },
  { id: 'cafes', label: 'Cafes', emoji: '☕' },
  { id: 'hidden', label: 'Hidden Gems', emoji: '💎' },
];

const travelWithOptions = [
  { id: 'solo', label: 'Solo', emoji: '🧑' },
  { id: 'couple', label: 'Couple', emoji: '👫' },
  { id: 'friends', label: 'Friends', emoji: '👥' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
];

const budgetStyleOptions = [
  { id: 'saver', label: 'Budget Saver', emoji: '💰' },
  { id: 'balanced', label: 'Balanced Comfort', emoji: '⚖️' },
  { id: 'premium', label: 'Premium Experience', emoji: '✨' },
];

const transportOptions = [
  { id: 'cheapest', label: 'Cheapest', emoji: '🚌' },
  { id: 'fastest', label: 'Fastest', emoji: '✈️' },
  { id: 'comfortable', label: 'Most Comfortable', emoji: '🚗' },
];

const supportedCities = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Kanpur',
  'Chandigarh',
  'Dehradun',
  'Agra',
  'Indore',
  'Bhopal',
  'Surat',
  'Nagpur',
  'Patna',
  'Varanasi',
];

const supportedDestinations = [
  'Shimla',
  'Mussoorie',
  'Manali',
  'Haridwar-Rishikesh',
  'Goa',
  'McLeodganj',
  'Udaipur',
];

const destinationBudgetRules = [
  { keys: ['shimla', 'शिमला'], name: 'Shimla', minPerPersonPerDay: 1800 },
  {
    keys: ['mussoorie', 'masoori', 'मसूरी'],
    name: 'Mussoorie',
    minPerPersonPerDay: 1600,
  },
  { keys: ['manali', 'मनाली'], name: 'Manali', minPerPersonPerDay: 2200 },
  {
    keys: [
      'haridwar',
      'rishikesh',
      'haridwar-rishikesh',
      'हरिद्वार',
      'ऋषिकेश',
    ],
    name: 'Haridwar & Rishikesh',
    minPerPersonPerDay: 1400,
  },
  { keys: ['goa', 'गोवा'], name: 'Goa', minPerPersonPerDay: 2200 },
  {
    keys: [
      'mcleodganj',
      'mc leod ganj',
      'mcleod ganj',
      'maclodganj',
      'dharamshala',
      'मैक्लॉडगंज',
    ],
    name: 'McLeodganj',
    minPerPersonPerDay: 1800,
  },
  { keys: ['udaipur', 'उदयपुर'], name: 'Udaipur', minPerPersonPerDay: 1800 },
];

const loadingSteps = [
  'Reading your travel vibe...',
  'Checking your group budget...',
  'Matching stays and transport...',
  'Finding local experiences...',
  'Creating 3 trip styles...',
  'Polishing your itinerary cards...',
];

type BudgetWarning = {
  destinationName: string;
  minimumRequiredBudget: number;
  enteredBudget: number;
  travelers: number;
  days: number;
  minPerPersonPerDay: number;
};

type FormError = {
  title: string;
  message: string;
};

export function TripForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  const [budgetWarning, setBudgetWarning] = useState<BudgetWarning | null>(
    null
  );
  const [isBudgetWarningOpen, setIsBudgetWarningOpen] = useState(false);

  const [formError, setFormError] = useState<FormError | null>(null);

  const [formData, setFormData] = useState({
    from: '',
    destination: '',
    budget: 20000,
    travelers: 2,
    days: 3,
    dates: '',
    travelWith: 'friends',
    budgetStyle: 'balanced',
    transport: 'cheapest',
  });

  const [travelersInput, setTravelersInput] = useState('2');
  const [daysInput, setDaysInput] = useState('3');

  const [selectedVibes, setSelectedVibes] = useState<string[]>(['adventure']);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % loadingSteps.length);
    }, 1400);

    return () => window.clearInterval(interval);
  }, [isLoading]);

  const showFormError = (title: string, message: string) => {
    setFormError({ title, message });
  };

  const getDestinationBudgetRule = (destination: string) => {
    const cleanDestination = destination.trim().toLowerCase();

    return destinationBudgetRules.find((rule) =>
      rule.keys.some((key) => cleanDestination.includes(key))
    );
  };

  const destinationRule = getDestinationBudgetRule(formData.destination);
  const recommendedBudget = destinationRule
    ? destinationRule.minPerPersonPerDay * formData.travelers * formData.days
    : null;

  const budgetGap = recommendedBudget
    ? recommendedBudget - formData.budget
    : 0;

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe)
        ? prev.filter((v) => v !== vibe)
        : [...prev, vibe]
    );
  };

  const updateTravelers = (value: number) => {
    const safeValue = Math.max(1, Math.min(20, value));

    if (safeValue > 1 && formData.travelWith === 'solo') {
      setFormData({
        ...formData,
        travelers: safeValue,
        travelWith: 'friends',
      });
      setTravelersInput(String(safeValue));
      return;
    }

    if (safeValue === 1) {
      setFormData({
        ...formData,
        travelers: 1,
        travelWith: 'solo',
      });
      setTravelersInput('1');
      return;
    }

    setFormData({
      ...formData,
      travelers: safeValue,
    });
    setTravelersInput(String(safeValue));
  };

  const updateDays = (value: number) => {
    const safeValue = Math.max(1, Math.min(30, value));

    setFormData({
      ...formData,
      days: safeValue,
    });
    setDaysInput(String(safeValue));
  };

  const handleTravelWithChange = (travelType: string) => {
    if (travelType === 'solo') {
      setFormData({
        ...formData,
        travelWith: 'solo',
        travelers: 1,
      });
      setTravelersInput('1');
      return;
    }

    const nextTravelers = formData.travelers < 2 ? 2 : formData.travelers;

    setFormData({
      ...formData,
      travelWith: travelType,
      travelers: nextTravelers,
    });
    setTravelersInput(String(nextTravelers));
  };

  const handleTravelersInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    if (value === '') {
      setTravelersInput('');
      return;
    }

    if (!/^\d+$/.test(value)) return;

    setTravelersInput(value);

    const numericValue = Number(value);

    if (numericValue >= 1 && numericValue <= 20) {
      updateTravelers(numericValue);
    }
  };

  const handleTravelersBlur = () => {
    if (travelersInput === '') {
      updateTravelers(formData.travelers || 1);
      return;
    }

    updateTravelers(Number(travelersInput));
  };

  const handleDaysInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setDaysInput('');
      return;
    }

    if (!/^\d+$/.test(value)) return;

    setDaysInput(value);

    const numericValue = Number(value);

    if (numericValue >= 1 && numericValue <= 30) {
      updateDays(numericValue);
    }
  };

  const handleDaysBlur = () => {
    if (daysInput === '') {
      updateDays(formData.days || 1);
      return;
    }

    updateDays(Number(daysInput));
  };

  const isSupportedCity = (cityName: string) => {
    const normalizedCity = cityName.trim().toLowerCase();

    return supportedCities.some(
      (city) => city.toLowerCase() === normalizedCity
    );
  };

  const isSupportedDestination = (destinationName: string) => {
    const normalizedDestination = destinationName.trim().toLowerCase();

    return supportedDestinations.some(
      (destination) => destination.toLowerCase() === normalizedDestination
    );
  };

  const scrollToTravelersInput = () => {
    const travelerInput = document.getElementById('travelers-input');

    if (travelerInput) {
      travelerInput.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      setTimeout(() => {
        travelerInput.focus();
      }, 400);
    }
  };

  const handleGenerateTrip = async () => {
    if (!formData.from || !formData.destination) {
      showFormError(
        'Missing trip details',
        'Please enter your from city and destination before generating your trip.'
      );
      return;
    }

    if (!isSupportedCity(formData.from)) {
      showFormError(
        'City not supported yet',
        'TripNest AI is currently available for selected major Indian cities. Please choose a supported city from the suggestions.'
      );
      return;
    }

    if (!isSupportedDestination(formData.destination)) {
      showFormError(
        'Destination not supported yet',
        'TripNest AI currently supports Shimla, Mussoorie, Manali, Haridwar-Rishikesh, Goa, McLeodganj, and Udaipur.'
      );
      return;
    }

    const selectedDate = new Date(formData.dates);

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (
      !formData.dates ||
      selectedDate < todayDate ||
      selectedDate.getFullYear() > 2035
    ) {
      showFormError(
        'Invalid travel date',
        'Please select a valid future travel date from the calendar.'
      );
      return;
    }

    if (selectedVibes.length === 0) {
      showFormError(
        'Choose your travel vibe',
        'Please select at least one travel vibe so TripNest AI can personalize your itinerary.'
      );
      return;
    }

    if (travelersInput === '' || daysInput === '') {
      showFormError(
        'Complete traveler details',
        'Please enter a valid number of travelers and days before generating your trip.'
      );
      return;
    }

    setIsLoading(true);

    try {
   const tripData = {
  fromCity: formData.from.trim(),
  destination: formData.destination.trim(),
  budget: formData.budget,
  travelers: formData.travelers,
  days: formData.days,
  dates: formData.dates,
  travelWith: formData.travelWith,
  vibe: selectedVibes,
  budgetStyle: formData.budgetStyle,
  transportPreference: formData.transport,
};


localStorage.setItem(
  'tripnestPreferences',
  JSON.stringify({
    vibe: selectedVibes,
    budgetStyle: formData.budgetStyle,
    travelWith: formData.travelWith,
    transport: formData.transport,
    travelers: formData.travelers,
  })
);

      const response = await fetch('/api/generate-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.code === 'BUDGET_TOO_LOW' && errorData.budgetWarning) {
          setBudgetWarning(errorData.budgetWarning);
          setIsBudgetWarningOpen(true);
          return;
        }

        throw new Error(errorData.error || 'Failed to generate trip plans');
      }

      const result = await response.json();

      if (result.plans && Array.isArray(result.plans)) {
        sessionStorage.setItem('generatedTrips', JSON.stringify(result.plans));
        sessionStorage.setItem('tripFormData', JSON.stringify(tripData));

        router.push('/results');
      } else {
        throw new Error(result.error || 'Failed to generate trip plans');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';

      showFormError('Trip generation failed', errorMessage);
      console.error('[TripForm] Error generating trip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-black/80 px-3 py-5 backdrop-blur-xl sm:items-center sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 25, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          <motion.div
            className="absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, -25, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
          />

          <motion.div
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-purple-400/30 bg-background/90 p-5 shadow-2xl shadow-purple-500/20 sm:p-7 max-h-[92vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.92, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400" />

            <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
              <motion.div
  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 p-2 sm:h-16 sm:w-16"
  animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }}
  transition={{ duration: 2.2, repeat: Infinity }}
>
  <img
    src="/tripnest-logo.png"
    alt="TripNest AI"
    className="h-full w-full object-contain"
  />
</motion.div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-purple-300">
                  TripNest AI
                </p>
                <h3 className="mt-1 text-xl font-bold sm:text-2xl">
                  Building your travel vibe...
                </h3>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <motion.p
                key={loadingStepIndex}
                className="text-base font-semibold text-white sm:text-lg"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {loadingSteps[loadingStepIndex]}
              </motion.p>

              <p className="mt-2 text-sm leading-6 text-foreground/60">
                We&apos;re building budget, comfort, and premium trip options
                around your destination, group size, and travel vibe.
              </p>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400"
                  animate={{ x: ['-100%', '120%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: '55%' }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-foreground/60 sm:mt-5 sm:gap-3 sm:text-xs">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
                💸 Budget
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
                🌅 Comfort
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
                ✨ Premium
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-foreground/45">
              Hold tight — TripNest AI is crafting your journey.
            </p>
          </motion.div>
        </motion.div>
      )}

      <BudgetWarningModal
        open={isBudgetWarningOpen}
        warning={budgetWarning}
        onClose={() => setIsBudgetWarningOpen(false)}
        onIncreaseBudget={() => {
          if (budgetWarning) {
            setFormData((prev) => ({
              ...prev,
              budget: budgetWarning.minimumRequiredBudget,
            }));
          }

          setIsBudgetWarningOpen(false);
        }}
        onEditTravelers={() => {
          setIsBudgetWarningOpen(false);
          scrollToTravelersInput();
        }}
      />

      <FormErrorModal
        open={!!formError}
        title={formError?.title || ''}
        message={formError?.message || ''}
        onClose={() => setFormError(null)}
      />

      <section id="plans" className="scroll-mt-28 px-3 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="mb-4 text-center text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Craft Your Next Escape ✈️
          </motion.h2>

          <motion.p
            className="mb-8 text-center text-sm leading-6 text-foreground/60 sm:mb-12 sm:text-base"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            From mountain mornings to beach sunsets — TripNest AI builds your trip around your vibe, group and budget.
          </motion.p>

          <motion.div
            className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {[
              { emoji: '🌅', text: 'Sunset escapes' },
              { emoji: '🏔️', text: 'Mountain mornings' },
              { emoji: '🍜', text: 'Local food vibes' },
              { emoji: '🛶', text: 'Adventure moments' },
            ].map((item) => (
              <motion.div
                key={item.text}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center backdrop-blur"
              >
                <p className="text-2xl">{item.emoji}</p>
                <p className="mt-2 text-xs text-foreground/70 sm:text-sm">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="glass rounded-3xl p-5 sm:p-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Starting City
                </label>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Delhi"
                    value={formData.from}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        from: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-base outline-none transition-colors focus:border-purple-500"
                    list="city-suggestions"
                  />

                  <datalist id="city-suggestions">
                    {supportedCities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>

                  <p className="text-xs text-foreground/50 mt-2">
                    Start from a supported city — more pickup cities are coming
                    soon.
                  </p>

                  {formData.from.trim() !== '' &&
                    !isSupportedCity(formData.from) && (
                      <p className="text-xs text-red-400 mt-2">
                        We are currently not serving this city yet.
                      </p>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Dream Destination
                </label>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Goa"
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        destination: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-base outline-none transition-colors focus:border-purple-500"
                    list="destination-suggestions"
                  />

                  <datalist id="destination-suggestions">
                    {supportedDestinations.map((destination) => (
                      <option key={destination} value={destination} />
                    ))}
                  </datalist>

                  <p className="text-xs text-foreground/50 mt-2">
                    Choose a supported escape — more destinations are coming soon.
                  </p>

                  {formData.destination.trim() !== '' &&
                    !isSupportedDestination(formData.destination) && (
                      <p className="text-xs text-red-400 mt-2">
                        We are currently not supporting this destination yet.
                      </p>
                    )}

                  {formData.destination.trim() !== '' &&
                    isSupportedDestination(formData.destination) && (
                      <p className="mt-2 text-xs text-cyan-200">
                        {formData.destination.toLowerCase().includes('goa') &&
                          'Beach sunsets, cafes and late-night vibes await 🌊'}

                        {formData.destination
                          .toLowerCase()
                          .includes('manali') &&
                          'Mountain air, cafes and scenic roads await 🏔️'}

                        {formData.destination
                          .toLowerCase()
                          .includes('udaipur') &&
                          'Royal lakes, sunsets and calm luxury await 🏰'}

                        {formData.destination
                          .toLowerCase()
                          .includes('rishikesh') &&
                          'River rafting, cafés and peaceful mornings await 🛶'}

                        {formData.destination
                          .toLowerCase()
                          .includes('shimla') &&
                          'Mall Road walks, pine air and cozy cafés await 🌲'}

                        {formData.destination
                          .toLowerCase()
                          .includes('mussoorie') &&
                          'Cloudy viewpoints, cafés and slow mountain walks await ☁️'}

                        {formData.destination
                          .toLowerCase()
                          .includes('mcleodganj') &&
                          'Monastery calm, mountain cafés and hidden trails await 🏕️'}
                      </p>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Budget: ₹{formData.budget.toLocaleString('en-IN')}
                </label>

                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="1000"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budget: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-border/50 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />

                {destinationRule && recommendedBudget && (
                  <div
                    className={`mt-3 rounded-xl border px-4 py-3 text-xs leading-5 ${
                      formData.budget >= recommendedBudget
                        ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                        : 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200'
                    }`}
                  >
                    {formData.budget >= recommendedBudget ? (
                      <>
                        Your budget looks realistic for {destinationRule.name}.{' '}
                        Recommended minimum: ₹
                        {recommendedBudget.toLocaleString('en-IN')}.
                      </>
                    ) : (
                      <>
                        Recommended minimum for {destinationRule.name}: ₹
                        {recommendedBudget.toLocaleString('en-IN')}. Your
                        budget is short by ₹{budgetGap.toLocaleString('en-IN')}.
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Travel Squad Size
                </label>

                <input
                  id="travelers-input"
                  type="number"
                  min="1"
                  max="20"
                  value={travelersInput}
                  onChange={handleTravelersInputChange}
                  onBlur={handleTravelersBlur}
                  className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-base outline-none transition-colors focus:border-purple-500"
                />

                <p className="text-xs text-foreground/50 mt-2">
                  Allowed range: 1 to 20 travelers.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Trip Duration
                </label>

                <input
                  id="days-input"
                  type="number"
                  min="1"
                  max="30"
                  value={daysInput}
                  onChange={handleDaysInputChange}
                  onBlur={handleDaysBlur}
                  className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-base outline-none transition-colors focus:border-purple-500"
                />

                <p className="text-xs text-foreground/50 mt-2">
                  Allowed range: 1 to 30 days.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Journey Date
                </label>

                <input
                  type="date"
                  value={formData.dates}
                  min={today}
                  max="2035-12-31"
                  onKeyDown={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dates: e.target.value,
                    })
                  }
                  className="w-full cursor-pointer rounded-xl border border-border/50 bg-background px-4 py-3 text-base outline-none transition-colors focus:border-purple-500"
                  style={{ colorScheme: 'dark' }}
                />

                <p className="text-xs text-foreground/50 mt-2">
                  Select a valid future date from the calendar.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">
                Who’s coming along?
              </label>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {travelWithOptions.map((option) => {
                  const isSoloDisabled =
                    option.id === 'solo' && formData.travelers > 1;

                  const isCoupleDisabled =
                    option.id === 'couple' &&
                    (formData.travelers < 2 || formData.travelers % 2 !== 0);

                  const isDisabled = isSoloDisabled || isCoupleDisabled;

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleTravelWithChange(option.id)}
                      className={`px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-2 border ${
                        formData.travelWith === option.id
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-500 shadow-lg shadow-purple-500/50'
                          : 'bg-background border-border/50 hover:border-purple-500'
                      } ${
                        isDisabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                      whileHover={{
                        y: isDisabled ? 0 : -2,
                      }}
                    >
                      <span className="text-2xl">{option.emoji}</span>

                      <span className="text-xs font-medium">
                        {option.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-foreground/50">
                {formData.travelers === 1
                  ? 'Solo mode is active because you selected 1 traveler.'
                  : formData.travelers % 2 !== 0
                    ? 'Couple mode is disabled for odd traveler counts. Use 2 travelers for Couple mode.'
                    : 'Solo is available only for 1 traveler. Couple works best with 2 travelers.'}
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">
                Pick your travel vibe
              </label>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {vibeOptions.map((vibe) => (
                  <motion.button
                    key={vibe.id}
                    type="button"
                    onClick={() => toggleVibe(vibe.id)}
                    className={`px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-2 border ${
                      selectedVibes.includes(vibe.id)
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-500 shadow-lg shadow-purple-500/50'
                        : 'bg-background border-border/50 hover:border-purple-500'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    <span className="text-xl">{vibe.emoji}</span>

                    <span className="text-xs font-medium">{vibe.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">
                Choose your budget mood
              </label>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {budgetStyleOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        budgetStyle: option.id,
                      })
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-2 border ${
                      formData.budgetStyle === option.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-500 shadow-lg shadow-purple-500/50'
                        : 'bg-background border-border/50 hover:border-purple-500'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    <span className="text-2xl">{option.emoji}</span>

                    <span className="text-sm font-medium">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">
                Transport Preference
              </label>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {transportOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        transport: option.id,
                      })
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-2 border ${
                      formData.transport === option.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-500 shadow-lg shadow-purple-500/50'
                        : 'bg-background border-border/50 hover:border-purple-500'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    <span className="text-2xl">{option.emoji}</span>

                    <span className="text-sm font-medium">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              type="button"
              onClick={handleGenerateTrip}
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-70 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading
                ? 'Building your travel vibe...'
                : 'Plan My Escape ✨'}
            </motion.button>
          </motion.div>
        </div>
      </section>
    </>
  );
}