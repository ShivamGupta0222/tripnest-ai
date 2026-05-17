'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  Briefcase,
  CalendarCheck,
  Compass,
  CreditCard,
  Crown,
  Heart,
  Home,
  LogIn,
  LogOut,
  Mail,
  Map,
  Menu,
  MapPinned,
  PenLine,
  Plane,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  User,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/auth-provider';
import { createClient } from '../../lib/supabase/client';

type SavedTrip = {
  savedAt?: string;
  tripContext?: {
    destination?: string;
    fromCity?: string;
    budget?: number;
    travelers?: number;
    days?: number;
    travelWith?: string;
    vibe?: string[];
  };
  selectedPlan?: {
    name?: string;
    pricing?: string;
  } | null;
};

type CloudSavedTrip = {
  id: string;
  title: string;
  destination: string | null;
  selected_plan: string | null;
  payload: {
    tripContext?: SavedTrip['tripContext'];
    selectedPlan?: SavedTrip['selectedPlan'];
    itineraries?: unknown;
  } | null;
  created_at: string;
};

type BookingRequest = {
  id: string;
  destination: string | null;
  selected_plan: string | null;
  budget: number | null;
  travelers: number | null;
  days: number | null;
  status: string | null;
  created_at: string;
};

type TravelPreferences = {
  vibe: string[];
  budgetStyle: string;
  travelWith: string;
  transport: string;
  travelers: number;
};

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  gender: string | null;
};

const defaultPreferences: TravelPreferences = {
  vibe: ['adventure'],
  budgetStyle: 'balanced',
  travelWith: 'friends',
  transport: 'cheapest',
  travelers: 2,
};

const vibeOptions = [
  { id: 'adventure', label: 'Adventure', emoji: '⛰️' },
  { id: 'party', label: 'Party', emoji: '🎉' },
  { id: 'relaxed', label: 'Relaxed', emoji: '🧘' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'luxury', label: 'Luxury', emoji: '✨' },
  { id: 'cafes', label: 'Cafes', emoji: '☕' },
  { id: 'hidden', label: 'Hidden Gems', emoji: '💎' },
];

const budgetOptions = [
  { id: 'saver', label: 'Budget Saver', emoji: '💰' },
  { id: 'balanced', label: 'Balanced Comfort', emoji: '⚖️' },
  { id: 'premium', label: 'Premium Experience', emoji: '✨' },
];

const travelWithOptions = [
  { id: 'solo', label: 'Solo', emoji: '🧑' },
  { id: 'couple', label: 'Couple', emoji: '👫' },
  { id: 'friends', label: 'Friends', emoji: '👥' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
];

const transportOptions = [
  { id: 'cheapest', label: 'Cheapest', emoji: '🚌' },
  { id: 'fastest', label: 'Fastest', emoji: '✈️' },
  { id: 'comfortable', label: 'Comfortable', emoji: '🚗' },
];

const vibeLabelMap: Record<string, string> = {
  adventure: 'Adventure',
  party: 'Party',
  relaxed: 'Relaxed',
  nature: 'Nature',
  luxury: 'Luxury',
  cafes: 'Cafe Explorer',
  hidden: 'Hidden Gems',
};

const travelWithLabelMap: Record<string, string> = {
  solo: 'Solo Trip',
  couple: 'Couple Trip',
  friends: 'Friends Trip',
  family: 'Family Trip',
};

const budgetStyleLabelMap: Record<string, string> = {
  saver: 'Budget Saver',
  balanced: 'Balanced Comfort',
  premium: 'Premium',
};

const navItems = [
  { title: 'Dashboard', icon: Home, panel: null },
  { title: 'Plan New Trip', icon: Plane, panel: 'newtrip' as const },
  { title: 'My Trips', icon: Briefcase, panel: 'trips' as const },
  { title: 'Continue Trip', icon: Compass, panel: 'continue' as const },
  { title: 'Preferences', icon: Heart, panel: 'preferences' as const },
  { title: 'Booking Requests', icon: CalendarCheck, panel: 'booking' as const },
  { title: 'Payments', icon: CreditCard, panel: 'payments' as const },
  { title: 'Share TripNest', icon: Share2, panel: 'share' as const },
];

type Panel =
  | 'trips'
  | 'preferences'
  | 'booking'
  | 'payments'
  | 'newtrip'
  | null;

function getMostCommonDestination(trips: CloudSavedTrip[]) {
  const counts = trips.reduce<Record<string, number>>((acc, trip) => {
    const destination =
      trip.destination || trip.payload?.tripContext?.destination || '';

    if (!destination) return acc;
    acc[destination] = (acc[destination] || 0) + 1;
    return acc;
  }, {});

  return (
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No favorite yet'
  );
}

function getDestinationImage(destination: string) {
  const clean = destination.toLowerCase();

  if (clean.includes('goa')) {
    return {
      image:
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80',
      label: 'Goa beach escape',
    };
  }

  if (clean.includes('shimla')) {
    return {
      image:
        'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80',
      label: 'Shimla hill escape',
    };
  }

  if (clean.includes('manali')) {
    return {
      image:
        'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80',
      label: 'Manali mountain escape',
    };
  }

  if (clean.includes('mussoorie')) {
    return {
      image:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      label: 'Mussoorie hill escape',
    };
  }

  if (clean.includes('rishikesh') || clean.includes('haridwar')) {
    return {
      image:
        'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=900&q=80',
      label: 'Rishikesh river escape',
    };
  }

  if (clean.includes('mcleod') || clean.includes('dharamshala')) {
    return {
      image:
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
      label: 'McLeodganj mountain escape',
    };
  }

  if (clean.includes('udaipur')) {
    return {
      image:
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80',
      label: 'Udaipur lake escape',
    };
  }

  return {
    image:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
    label: 'TripNest travel escape',
  };
}

function getTravelPersonality(preferences: TravelPreferences, tripsCount: number) {
  const vibes = preferences.vibe;

  if (vibes.includes('luxury')) {
    return {
      title: 'Comfort Curator',
      quote:
        'Premium stays, smooth routes, curated food stops and stress-free travel.',
    };
  }

  if (vibes.includes('party')) {
    return {
      title: 'Social Explorer',
      quote:
        'High-energy plans, nightlife, friends, group fun and memorable evenings.',
    };
  }

  if (vibes.includes('relaxed') || vibes.includes('cafes')) {
    return {
      title: 'Slow Travel Aesthetic',
      quote:
        'Cafes, sunsets, scenic pauses and peaceful travel moments.',
    };
  }

  if (vibes.includes('nature')) {
    return {
      title: 'Nature Seeker',
      quote:
        'Quiet viewpoints, fresh air, scenic routes and nature-first experiences.',
    };
  }

  if (vibes.includes('adventure')) {
    return {
      title: 'Adventure Chaser',
      quote:
        'Mountains, local discoveries, active days and hidden routes.',
    };
  }

  if (tripsCount > 2) {
    return {
      title: 'Frequent Planner',
      quote:
        'You are building a clear travel pattern across destinations and styles.',
    };
  }

  return {
    title: 'Curious Traveler',
    quote:
      'You are still discovering your travel style — TripNest will learn with you.',
  };
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  const [savedTrip, setSavedTrip] = useState<SavedTrip | null>(null);
  const [cloudTrips, setCloudTrips] = useState<CloudSavedTrip[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [preferences, setPreferences] =
    useState<TravelPreferences>(defaultPreferences);
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [profileGenderInput, setProfileGenderInput] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const rawTrip = localStorage.getItem('tripnestSavedTrip');
      setSavedTrip(rawTrip ? (JSON.parse(rawTrip) as SavedTrip) : null);

      const rawPrefs = localStorage.getItem('tripnestPreferences');
      if (rawPrefs) {
        setPreferences({
          ...defaultPreferences,
          ...(JSON.parse(rawPrefs) as Partial<TravelPreferences>),
        });
      }
    } catch {
      setSavedTrip(null);
      setPreferences(defaultPreferences);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setCloudTrips([]);
      setBookingRequests([]);
      return;
    }

    let active = true;

    const fetchTrips = async () => {
      setTripsLoading(true);

      const { data, error } = await supabase
        .from('saved_trips')
        .select('id,title,destination,selected_plan,payload,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!active) return;

      if (error) {
        setNotice('Could not load saved trips.');
      } else {
        setCloudTrips((data ?? []) as CloudSavedTrip[]);
      }

      setTripsLoading(false);
    };

    const fetchBookingRequests = async () => {
      const { data, error } = await supabase
        .from('booking_requests')
        .select(
          'id,destination,selected_plan,budget,travelers,days,status,created_at'
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!active) return;

      if (!error) {
        setBookingRequests((data ?? []) as BookingRequest[]);
      }
    };

    void fetchTrips();
    void fetchBookingRequests();

    return () => {
      active = false;
    };
  }, [supabase, user]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileNameInput('');
      setProfileGenderInput('');
      return;
    }

    let active = true;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,email,full_name,gender')
        .eq('id', user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setNotice('Could not load profile details.');
        window.setTimeout(() => setNotice(null), 3000);
        return;
      }

      if (data) {
        const typedProfile = data as UserProfile;
        setProfile(typedProfile);
        setProfileNameInput(typedProfile.full_name || '');
        setProfileGenderInput(typedProfile.gender || '');
        return;
      }

      const fallbackName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        '';

      setProfileNameInput(fallbackName);
      setProfileGenderInput('');
    };

    void fetchProfile();

    return () => {
      active = false;
    };
  }, [supabase, user]);

  const profileName = useMemo(() => {
    if (profile?.full_name) return profile.full_name;
    if (profileNameInput.trim()) return profileNameInput.trim();
    if (!user?.email) return 'Traveler';
    return user.email.split('@')[0] || 'Traveler';
  }, [profile?.full_name, profileNameInput, user?.email]);

  const latestCloudTrip = cloudTrips[0] ?? null;

  const savedDestination =
    latestCloudTrip?.destination ||
    latestCloudTrip?.payload?.tripContext?.destination ||
    savedTrip?.tripContext?.destination ||
    'No saved destination yet';

  const savedPlan =
    latestCloudTrip?.selected_plan ||
    latestCloudTrip?.payload?.selectedPlan?.name ||
    savedTrip?.selectedPlan?.name ||
    'No selected plan yet';

  const favoriteVibe =
    preferences.vibe[0] ? vibeLabelMap[preferences.vibe[0]] || preferences.vibe[0] : 'Not set';

  const travelWithLabel =
    travelWithLabelMap[preferences.travelWith] || 'Travel mode';

  const budgetStyleLabel =
    budgetStyleLabelMap[preferences.budgetStyle] || 'Balanced Comfort';

  const favoriteDestination = getMostCommonDestination(cloudTrips);

  const travelPersonality = getTravelPersonality(preferences, cloudTrips.length);

  const profileStats = [
    {
      icon: Trophy,
      label: 'Trips Planned',
      value: String(cloudTrips.length),
      text: 'Cloud saved journeys',
    },
    {
      icon: Sparkles,
      label: 'Favorite Vibe',
      value: favoriteVibe,
      text:
        preferences.vibe.length > 1
          ? `${preferences.vibe.length} vibes selected`
          : 'Main travel mood',
    },
    {
      icon: MapPinned,
      label: 'Top Destination',
      value: favoriteDestination,
      text: 'Most visited place',
    },
    {
      icon: Star,
      label: 'Travel Style',
      value: budgetStyleLabel,
      text: `${travelWithLabel} · ${preferences.transport}`,
    },
  ];

  const toggleVibe = (vibe: string) => {
    setPreferences((prev) => {
      const exists = prev.vibe.includes(vibe);
      const nextVibes = exists
        ? prev.vibe.filter((item) => item !== vibe)
        : [...prev.vibe, vibe];

      return {
        ...prev,
        vibe: nextVibes.length > 0 ? nextVibes : prev.vibe,
      };
    });
  };

  const savePreferences = () => {
    localStorage.setItem('tripnestPreferences', JSON.stringify(preferences));
    setNotice('Travel preferences saved ✨');
    window.setTimeout(() => setNotice(null), 3000);
  };

  const saveProfile = async () => {
    if (!user) {
      setNotice('Please login first.');
      window.setTimeout(() => setNotice(null), 3000);
      return;
    }

    const cleanName = profileNameInput.trim();

    if (!cleanName) {
      setNotice('Please enter your name.');
      window.setTimeout(() => setNotice(null), 3000);
      return;
    }

    setProfileSaving(true);

    const payload = {
      id: user.id,
      email: user.email || null,
      full_name: cleanName,
      gender: profileGenderInput || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select('id,email,full_name,gender')
      .single();

    setProfileSaving(false);

    if (error) {
      setNotice(`Profile save failed: ${error.message}`);
      window.setTimeout(() => setNotice(null), 4000);
      return;
    }

    setProfile(data as UserProfile);
    setProfileEditorOpen(false);
    setNotice('Profile saved successfully ✨');
    window.setTimeout(() => setNotice(null), 3000);
  };

  const handleShare = async () => {
    const text =
      'I am planning my next trip with TripNest AI — an AI travel planner for Indian trips.';

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'TripNest AI',
          text,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // ignore
    }
  };

  const handleContinueTrip = () => {
    const hasGeneratedTrips =
      typeof window !== 'undefined' && sessionStorage.getItem('generatedTrips');

    if (hasGeneratedTrips) {
      sessionStorage.setItem('tripnestReturnTo', 'dashboard');
      router.replace('/results');
      return;
    }

    router.replace('/home#plans');
  };

  const handleOpenCloudTrip = (trip: CloudSavedTrip) => {
    if (trip.payload?.itineraries) {
      sessionStorage.setItem(
        'generatedTrips',
        JSON.stringify(trip.payload.itineraries)
      );
    }

    if (trip.payload?.tripContext) {
      sessionStorage.setItem(
        'tripFormData',
        JSON.stringify(trip.payload.tripContext)
      );
    }

    sessionStorage.setItem(
      'restoredTrip',
      JSON.stringify({
        tripContext: trip.payload?.tripContext,
        selectedPlan: trip.payload?.selectedPlan,
        itineraries: trip.payload?.itineraries,
      })
    );

 sessionStorage.setItem('tripnestReturnTo', 'dashboard');
      router.replace('/results');
  };

  const handleNav = (panel: 'trips' | 'preferences' | 'booking' | 'payments' | 'continue' | 'share' | 'newtrip' | null) => {
    setMobileMenuOpen(false);

    if (panel === null) {
      setActivePanel(null);
      return;
    }

    if (panel === 'newtrip') {
      router.replace('/home#plans');
      return;
    }

    if (panel === 'continue') {
      handleContinueTrip();
      return;
    }

    if (panel === 'share') {
      void handleShare();
      return;
    }

    setActivePanel(panel);
  };

  const latestTripDate = latestCloudTrip
    ? new Date(latestCloudTrip.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const latestDestinationImage = getDestinationImage(savedDestination);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050812] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_40%)]" />

      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/10 bg-[#070b16]/80 p-6 backdrop-blur-xl lg:block">
        <button
          type="button"
          onClick={() => router.replace('/')}
          className="mb-10 flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] p-1 shadow-lg shadow-purple-500/20 backdrop-blur-xl">
            <img
              src="/tripnest-logo.png"
              alt="TripNest AI"
              className="h-full w-full object-contain"
            />
          </span>
          <span className="text-2xl font-bold">
            TripNest <span className="text-purple-300">AI</span>
          </span>
        </button>

        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.panel === activePanel || (item.panel === null && activePanel === null);

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => handleNav(item.panel)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                  isActive
                    ? 'border border-purple-400/25 bg-purple-500/15 text-white'
                    : 'text-foreground/70 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.title}
                {item.title === 'Payments' && (
                  <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-blue-200">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-yellow-400/15 bg-gradient-to-br from-yellow-500/10 to-purple-500/10 p-5">
          <div className="mb-3 flex items-center gap-2 text-yellow-200">
            <Crown className="h-5 w-5" />
            <p className="font-semibold">TripNest Premium</p>
          </div>
          <p className="text-sm leading-6 text-foreground/60">
            Exclusive stays, curated deals and priority trip support.
          </p>
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold"
          >
            Coming Soon
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] lg:hidden">
          <button
            type="button"
            aria-label="Close mobile menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.aside
            className="absolute left-0 top-0 h-full w-[82vw] max-w-sm border-r border-white/10 bg-[#070b16] p-5 shadow-2xl shadow-purple-500/20"
            initial={{ x: -360 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <div className="mb-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.replace('/');
                }}
                className="flex items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-xl">
                  ✈️
                </span>
                <span className="text-xl font-bold">
                  TripNest <span className="text-purple-300">AI</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-foreground/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.panel === activePanel ||
                  (item.panel === null && activePanel === null);

                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => handleNav(item.panel)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                      isActive
                        ? 'border border-purple-400/25 bg-purple-500/15 text-white'
                        : 'text-foreground/70 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                    {item.title === 'Payments' && (
                      <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-blue-200">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-yellow-400/15 bg-gradient-to-br from-yellow-500/10 to-purple-500/10 p-5">
              <div className="mb-2 flex items-center gap-2 text-yellow-200">
                <Crown className="h-5 w-5" />
                <p className="font-semibold">TripNest Premium</p>
              </div>
              <p className="text-sm leading-6 text-foreground/60">
                Exclusive stays and priority trip support.
              </p>
            </div>
          </motion.aside>
        </div>
      )}

      <section className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050812]/75 px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-2 text-foreground/70 transition hover:bg-white/[0.08] hover:text-white lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => router.replace('/')}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                <span className="sm:hidden">← Home</span>
                <span className="hidden sm:inline">← Back to home</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-purple-100 sm:inline-flex">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Profile
              </button>

              <button className="hidden rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-foreground/70 sm:inline-flex">
                <Bell className="h-5 w-5" />
              </button>

       {user ? (
  <button
    type="button"
    onClick={async () => {
      await signOut();
      router.replace('/');
    }}
    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white transition hover:bg-white/[0.08] sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-sm sm:font-semibold"
  >
    <LogOut className="h-4 w-4" />
    <span className="hidden sm:inline">Logout</span>
  </button>
) : null}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          {!user && !loading ? (
            <div className="mx-auto mt-20 max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 text-center backdrop-blur-xl">
              <Sparkles className="mx-auto mb-4 h-10 w-10 text-purple-200" />
              <h1 className="text-3xl font-bold">Login to your travel dashboard</h1>
              <p className="mt-3 text-foreground/60">
                Save trips, manage preferences and continue your itinerary anytime.
              </p>
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold"
              >
                <LogIn className="h-5 w-5" />
                Login with Google
              </button>
            </div>
          ) : (
            <>
              <motion.div
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1020] p-6 shadow-2xl shadow-purple-500/10 sm:p-8"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="absolute inset-0 opacity-70">
                  <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_70%_40%,rgba(168,85,247,0.26),transparent_30%),linear-gradient(135deg,transparent,rgba(37,99,235,0.16))]" />
                  <div className="absolute bottom-0 right-0 h-40 w-[45rem] bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.12),transparent_65%)]" />
                </div>

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative h-28 w-28 shrink-0 rounded-full bg-gradient-to-br from-purple-500 via-blue-400 to-orange-300 p-[3px]">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0b1020]">
                        <User className="h-14 w-14 text-foreground/70" />
                      </div>
                    </div>

                    <div>
                      <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                        Hey,{' '}
                        <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                          {loading ? 'Traveler' : profileName}
                        </span>{' '}
                        👋
                      </h1>

                      <div className="mt-4 flex flex-wrap gap-3 text-sm">
                        {profile?.gender && (
                          <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-blue-100">
                            <User className="h-4 w-4" />
                            {profile.gender.replaceAll('_', ' ')}
                          </span>
                        )}

                        {user?.email && (
                          <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-foreground/70">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </span>
                        )}
                      </div>

                      <p className="mt-4 max-w-xl text-base leading-7 text-foreground/65">
                        “{travelPersonality.quote}”
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setProfileEditorOpen(true)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.08]"
                  >
                    <PenLine className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>
              </motion.div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                {profileStats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <motion.div
                      key={stat.label}
                      className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl"
                      whileHover={{ y: -4 }}
                    >
                      <div className="mb-4 flex items-center gap-4">
                        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-purple-500/15">
                          <Icon className="h-6 w-6 text-purple-200" />
                        </div>

                        <div>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-sm text-foreground/55">{stat.label}</p>
                        </div>
                      </div>

                      <p className="text-sm text-foreground/45">{stat.text}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                <motion.div
                  className="rounded-[2rem] border border-emerald-400/15 bg-emerald-500/10 p-6 backdrop-blur-xl"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-emerald-200">
                        <Plane className="h-5 w-5" />
                        <p className="font-semibold">Latest saved trip</p>
                      </div>

                      <h2 className="text-4xl font-bold">{savedDestination}</h2>
                      <p className="mt-2 text-foreground/60">{savedPlan}</p>
                      {latestTripDate && (
                        <p className="mt-2 text-sm text-foreground/40">
                          Saved on {latestTripDate}
                        </p>
                      )}

                      <div className="relative mt-5 h-40 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-xl shadow-black/25 sm:hidden">
                        <img
                          src={latestDestinationImage.image}
                          alt={latestDestinationImage.label}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">
                          {latestDestinationImage.label}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          latestCloudTrip
                            ? handleOpenCloudTrip(latestCloudTrip)
                            : handleContinueTrip()
                        }
                        className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-3 text-sm font-semibold shadow-lg shadow-purple-500/20"
                      >
                        Open Trip →
                      </button>
                    </div>

                    <motion.div
                      className="relative hidden h-44 w-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/30 sm:block"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    >
                      <img
                        src={latestDestinationImage.image}
                        alt={latestDestinationImage.label}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                        loading="lazy"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] text-white/85 backdrop-blur-md">
                          <Map className="h-3.5 w-3.5 text-blue-200" />
                          {latestDestinationImage.label}
                        </div>

                        <p className="line-clamp-1 text-lg font-bold text-white">
                          {savedDestination}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  className="rounded-[2rem] border border-purple-400/15 bg-purple-500/10 p-6 backdrop-blur-xl"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                >
                  <div className="mb-5 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-purple-200" />
                    <p className="font-semibold">Account status</p>
                  </div>

                  <p className="text-5xl font-bold text-emerald-300">
                    {user ? 'Active' : 'Guest'}
                  </p>

                  <p className="mt-4 text-foreground/60">
                    {user
                      ? `${cloudTrips.length} cloud trip(s) saved`
                      : 'Login to save your journeys'}
                  </p>
                </motion.div>
              </div>

              <div className="mt-8 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold">Quick actions</h2>
                <button
                  type="button"
                  onClick={() => setActivePanel('trips')}
                  className="text-sm text-foreground/55 transition hover:text-white"
                >
                  All features →
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                {navItems.slice(1).map((item) => {
                  const Icon = item.icon;

                  return (
                    <motion.button
                      key={item.title}
                      type="button"
                      onClick={() => handleNav(item.panel)}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur-xl transition hover:border-purple-400/40 hover:bg-white/[0.07]"
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15">
                        <Icon className="h-6 w-6 text-purple-200" />
                      </div>
                      <h3 className="font-bold">
                        {item.title === 'Payments' ? 'Payments (Soon)' : item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-foreground/55">
                        {item.title === 'Plan New Trip' && 'Start a fresh personalized journey'}
                        {item.title === 'My Trips' && 'View saved & cloud trips'}
                        {item.title === 'Continue Trip' && 'Jump back to your itinerary'}
                        {item.title === 'Preferences' && 'Edit vibe, budget and group type'}
                        {item.title === 'Booking Requests' && 'Track your demo requests'}
                        {item.title === 'Payments' && 'View orders & payments'}
                        {item.title === 'Share TripNest' && 'Invite friends to explore'}
                      </p>
                      <p className="mt-4 text-xl text-foreground/70">→</p>
                    </motion.button>
                  );
                })}
              </div>

              {activePanel === 'preferences' && (
                <motion.div
                  className="mt-6 rounded-[2rem] border border-purple-400/25 bg-purple-500/10 p-5 backdrop-blur-xl"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <PanelHeader
                    title="Travel Preferences"
                    subtitle="Tune your default trip vibe"
                    onClose={() => setActivePanel(null)}
                  />

                  <div className="space-y-5">
                    <PreferenceGroup title="Favorite vibes">
                      {vibeOptions.map((item) => (
                        <ChoiceButton
                          key={item.id}
                          active={preferences.vibe.includes(item.id)}
                          onClick={() => toggleVibe(item.id)}
                        >
                          <span className="mr-1">{item.emoji}</span>
                          {item.label}
                        </ChoiceButton>
                      ))}
                    </PreferenceGroup>

                    <PreferenceGroup title="Budget mood">
                      {budgetOptions.map((item) => (
                        <ChoiceButton
                          key={item.id}
                          active={preferences.budgetStyle === item.id}
                          onClick={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              budgetStyle: item.id,
                            }))
                          }
                        >
                          <span className="mr-1">{item.emoji}</span>
                          {item.label}
                        </ChoiceButton>
                      ))}
                    </PreferenceGroup>

                    <PreferenceGroup title="Usually traveling with">
                      {travelWithOptions.map((item) => (
                        <ChoiceButton
                          key={item.id}
                          active={preferences.travelWith === item.id}
                          onClick={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              travelWith: item.id,
                              travelers:
                                item.id === 'solo'
                                  ? 1
                                  : item.id === 'couple'
                                    ? 2
                                    : prev.travelers < 2
                                      ? 2
                                      : prev.travelers,
                            }))
                          }
                        >
                          <span className="mr-1">{item.emoji}</span>
                          {item.label}
                        </ChoiceButton>
                      ))}
                    </PreferenceGroup>

                    <PreferenceGroup title="Transport preference">
                      {transportOptions.map((item) => (
                        <ChoiceButton
                          key={item.id}
                          active={preferences.transport === item.id}
                          onClick={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              transport: item.id,
                            }))
                          }
                        >
                          <span className="mr-1">{item.emoji}</span>
                          {item.label}
                        </ChoiceButton>
                      ))}
                    </PreferenceGroup>

                    <button
                      type="button"
                      onClick={savePreferences}
                      className="min-h-12 w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-purple-500/40"
                    >
                      Save Travel Preferences
                    </button>
                  </div>
                </motion.div>
              )}

              {activePanel === 'trips' && (
                <motion.div
                  className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <PanelHeader
                    title="My Saved Trips"
                    subtitle={
                      cloudTrips.length > 0
                        ? `${cloudTrips.length} saved journey(s)`
                        : 'No saved trips yet'
                    }
                    onClose={() => setActivePanel(null)}
                  />

                  {tripsLoading ? (
                    <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-sm text-foreground/60">
                      Loading your saved trips...
                    </div>
                  ) : cloudTrips.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {cloudTrips.map((trip) => {
                        const destination =
                          trip.destination ||
                          trip.payload?.tripContext?.destination ||
                          'Saved trip';

                        const plan =
                          trip.selected_plan ||
                          trip.payload?.selectedPlan?.name ||
                          'Selected plan';

                        const date = new Date(trip.created_at).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        );

                        return (
                          <div
                            key={trip.id}
                            className="rounded-2xl border border-white/10 bg-black/15 p-4"
                          >
                            <p className="text-lg font-bold">{destination}</p>
                            <p className="mt-1 text-sm text-foreground/65">{plan}</p>
                            <p className="mt-1 text-xs text-foreground/45">
                              Saved on {date}
                            </p>

                            <button
                              type="button"
                              onClick={() => handleOpenCloudTrip(trip)}
                              className="mt-4 min-h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white"
                            >
                              Open trip
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                      <p className="font-semibold">No saved trips yet</p>
                      <p className="mt-2 text-sm leading-6 text-foreground/60">
                        Generate a trip, select a plan, then save it to your profile.
                      </p>
                      <button
                        type="button"
                        onClick={() => router.replace('/home#plans')}
                        className="mt-4 min-h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white"
                      >
                        Plan your first trip
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {activePanel === 'booking' && (
                <motion.div
                  className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <PanelHeader
                    title="Booking Requests"
                    subtitle={
                      bookingRequests.length > 0
                        ? `${bookingRequests.length} early access request(s)`
                        : 'No booking requests yet'
                    }
                    onClose={() => setActivePanel(null)}
                  />

                  {bookingRequests.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {bookingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="rounded-2xl border border-white/10 bg-black/15 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-lg font-bold">
                              {request.destination || 'Trip Request'}
                            </p>

                            <span className="shrink-0 rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                              Early Access
                            </span>
                          </div>

                          <p className="text-sm text-foreground/65">
                            {request.selected_plan || 'Recommended Plan'}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground/55">
                            <span className="rounded-full border border-white/10 px-2 py-1">
                              ₹{(request.budget || 0).toLocaleString('en-IN')}
                            </span>

                            <span className="rounded-full border border-white/10 px-2 py-1">
                              {request.travelers || 0} travelers
                            </span>

                            <span className="rounded-full border border-white/10 px-2 py-1">
                              {request.days || 0} days
                            </span>
                          </div>

                          <p className="mt-4 text-xs text-foreground/40">
                            Requested on{' '}
                            {new Date(request.created_at).toLocaleDateString(
                              'en-IN',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                      <p className="font-semibold">No booking requests yet</p>

                      <p className="mt-2 text-sm leading-6 text-foreground/60">
                        Request early access from any generated itinerary and it
                        will appear here.
                      </p>

                      <button
                        type="button"
                        onClick={() => router.replace('/home#plans')}
                        className="mt-4 min-h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white"
                      >
                        Create a trip request
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {activePanel === 'payments' && (
                <InfoPanel
                  title="Demo Payments"
                  subtitle="Payment demo coming next"
                  text="We will add a safe demo payment flow here before live launch."
                  onClose={() => setActivePanel(null)}
                />
              )}

              {(notice || copied) && (
                <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 backdrop-blur-xl">
                  {notice || 'TripNest link copied.'}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {profileEditorOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <motion.div
            className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0b1020] p-6 shadow-2xl shadow-purple-500/20"
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">
                  Profile Details
                </p>
                <h2 className="mt-1 text-2xl font-bold">Edit profile</h2>
              </div>

              <button
                type="button"
                onClick={() => setProfileEditorOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-foreground/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-foreground/60">
                  Display name
                </label>
                <input
                  type="text"
                  value={profileNameInput}
                  onChange={(e) => setProfileNameInput(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-foreground/60">
                  Gender
                </label>
                <select
                  value={profileGenderInput}
                  onChange={(e) => setProfileGenderInput(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-400"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <button
                type="button"
                onClick={saveProfile}
                disabled={profileSaving}
                className="min-h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-purple-500/40 disabled:opacity-60"
              >
                {profileSaving ? 'Saving profile...' : 'Save Profile'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

function PanelHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-purple-200">
          {title}
        </p>
        <h2 className="mt-1 text-xl font-bold">{subtitle}</h2>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground/70 transition hover:bg-white/[0.08] hover:text-white"
      >
        Close
      </button>
    </div>
  );
}

function PreferenceGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold">{title}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{children}</div>
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-3 text-sm transition ${
        active
          ? 'border-purple-400 bg-purple-500/20 text-white'
          : 'border-white/10 bg-black/15 text-foreground/65 hover:bg-white/[0.06]'
      }`}
    >
      {children}
    </button>
  );
}

function InfoPanel({
  title,
  subtitle,
  text,
  onClose,
}: {
  title: string;
  subtitle: string;
  text: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <PanelHeader title={title} subtitle={subtitle} onClose={onClose} />
      <p className="text-sm leading-6 text-foreground/60">{text}</p>
    </motion.div>
  );
}
