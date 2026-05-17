'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AuthButton } from './auth-button';
import {
  ArrowRight,
  BadgeIndianRupee,
  MapPinned,
  Sparkles,
  Users,
} from 'lucide-react';

const destinationCards = [
  { name: 'Goa', vibe: 'Beach sunsets', emoji: '🌊' },
  { name: 'Manali', vibe: 'Mountains & cafes', emoji: '🏔️' },
  { name: 'Udaipur', vibe: 'Royal lake escape', emoji: '🏰' },
  { name: 'Rishikesh', vibe: 'Adventure + calm', emoji: '🛶' },
];

const steps = [
  {
    icon: MapPinned,
    title: 'Share your trip mood',
    text: 'Tell us where, when, with whom and how you want the trip to feel.',
  },
  {
    icon: BadgeIndianRupee,
    title: 'Keep budget realistic',
    text: 'We check your group budget before creating plans, so options feel believable.',
  },
  {
    icon: Sparkles,
    title: 'Choose your journey',
    text: 'Compare three travel styles and pick the journey that feels right.',
  },
];

export function IntroScreen() {
  const router = useRouter();

  const goToPlanner = () => {
    router.push('/home#plans');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75 },
    },
  };

  return (
    <motion.section
      className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <AuthButton />
      </div>

      {/* Premium dark travel background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.13),transparent_32%),linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.35))]" />

        <motion.div
          className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-purple-600/25 blur-3xl sm:h-96 sm:w-96"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl sm:h-96 sm:w-96"
          animate={{
            x: [0, -30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <motion.div
          className="absolute top-1/2 right-1/4 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center">
        <motion.div
          className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero copy */}
          <div className="text-center lg:text-left">
            <motion.div variants={itemVariants} className="mb-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-foreground/75 backdrop-blur">
                <Sparkles className="h-4 w-4 text-purple-300" />
                Authentic Indian trips, planned with AI
              </span>
            </motion.div>

            <motion.h1
              className="mx-auto max-w-4xl text-5xl font-bold leading-tight text-balance sm:text-7xl lg:mx-0 lg:text-8xl"
              variants={itemVariants}
            >
              Namaste
              <br />
              <span className="bg-gradient-to-r from-orange-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                India
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/90 sm:text-2xl lg:mx-0"
              variants={itemVariants}
            >
              Plan trips that feel personal, exciting and budget-smart.
            </motion.p>

            <motion.p
              className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-foreground/62 sm:text-base lg:mx-0"
              variants={itemVariants}
            >
              TripNest AI turns your budget, group and travel mood into
              three clear journeys — save-more, smart comfort and premium —
              so planning feels simple, exciting and real.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
              variants={itemVariants}
            >
              <button
                type="button"
                onClick={goToPlanner}
                className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-7 py-3 font-semibold text-white shadow-lg shadow-purple-500/35 transition hover:shadow-xl hover:shadow-purple-500/55 sm:w-auto"
              >
                Start My Escape ✨
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => router.push('/home')}
                className="min-h-12 w-full rounded-full border border-white/15 bg-white/[0.04] px-7 py-3 font-semibold text-white transition hover:bg-white/[0.08] sm:w-auto"
              >
                Explore Travel Vibes
              </button>
            </motion.div>

            <motion.div
              className="mt-8 grid grid-cols-3 gap-3 text-left"
              variants={itemVariants}
            >
              {[
                { value: '3', label: 'Journey moods' },
                { value: '7+', label: 'Indian escapes' },
                { value: '₹', label: 'Budget checks' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4"
                >
                  <p className="text-xl font-bold text-white sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] text-foreground/55 sm:text-xs">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Visual product card */}
          <motion.div
            variants={itemVariants}
            className="relative mx-auto w-full max-w-xl"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-purple-500/20 via-cyan-500/10 to-orange-500/15 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.06] p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-purple-200">
                    Live Trip Preview
                  </p>
                  <h2 className="mt-1 text-xl font-bold">
                    Goa · 3 Days · Friends
                  </h2>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                  🌅
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  {
                    title: 'Budget Saver',
                    price: '₹13k–₹16k',
                    tag: 'Local food · Shared rides',
                    emoji: '🎒',
                  },
                  {
                    title: 'Smart Comfort',
                    price: '₹16k–₹19k',
                    tag: 'Better stay · Smooth travel',
                    emoji: '☕',
                    active: true,
                  },
                  {
                    title: 'Premium Experience',
                    price: '₹21k–₹26k',
                    tag: 'Private cab · Curated spots',
                    emoji: '🥂',
                  },
                ].map((plan) => (
                  <motion.div
                    key={plan.title}
                    className={`rounded-2xl border p-4 ${
                      plan.active
                        ? 'border-purple-400/40 bg-purple-500/12'
                        : 'border-white/10 bg-black/18'
                    }`}
                    whileHover={{ y: -3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-xl">
                        {plan.emoji}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{plan.title}</p>
                        <p className="mt-1 truncate text-xs text-foreground/55">
                          {plan.tag}
                        </p>
                      </div>

                      <p className="text-sm font-bold text-purple-200">
                        {plan.price}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-300" />
                  <p className="text-sm font-semibold">TripNest pick</p>
                </div>

                <p className="text-sm leading-6 text-foreground/65">
                  Smart Comfort gives the best balance of comfort,
                  memories and budget for this group.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* How it works */}
        <motion.div
          className="mt-14 grid gap-4 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur"
                whileHover={{ y: -4 }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Icon className="h-5 w-5 text-purple-200" />
                </div>

                <h3 className="font-bold">{step.title}</h3>

                <p className="mt-2 text-sm leading-6 text-foreground/58">
                  {step.text}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Destinations */}
        <motion.div
          className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-foreground/45">
                Supported vibes
              </p>

              <h3 className="mt-1 text-xl font-bold">
                Start with popular Indian escapes
              </h3>
            </div>

            <p className="text-sm text-foreground/55">
              More destinations coming soon.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {destinationCards.map((item) => (
              <motion.div
                key={item.name}
                className="rounded-2xl border border-white/10 bg-black/15 p-4"
                whileHover={{ y: -3 }}
              >
                <p className="text-2xl">{item.emoji}</p>

                <p className="mt-3 font-semibold">{item.name}</p>

                <p className="mt-1 text-xs text-foreground/55">
                  {item.vibe}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}