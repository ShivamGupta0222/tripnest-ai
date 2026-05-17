'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';

const destinations = [
  {
    name: 'Goa',
    description: 'Beach sunsets, cafes, nightlife and slow coastal mornings.',
    vibe: 'Beach + Party',
    emoji: '🌊',
    tags: ['🏖️ Beaches', '🎉 Nightlife', '☕ Cafes'],
    gradient: 'from-cyan-500/25 via-blue-500/15 to-purple-500/20',
  },
  {
    name: 'Manali',
    description: 'Mountain roads, cozy cafes, snow views and adventure days.',
    vibe: 'Adventure + Nature',
    emoji: '🏔️',
    tags: ['⛰️ Trekking', '❄️ Snow', '🌲 Nature'],
    gradient: 'from-blue-500/25 via-indigo-500/15 to-purple-500/20',
  },
  {
    name: 'Mussoorie',
    description: 'Cloudy viewpoints, slow walks, cafes and peaceful hill vibes.',
    vibe: 'Relaxed + Cafes',
    emoji: '☁️',
    tags: ['🌄 Views', '☕ Cafes', '🌿 Calm'],
    gradient: 'from-sky-500/25 via-cyan-500/15 to-emerald-500/20',
  },
  {
    name: 'Rishikesh',
    description: 'River rafting, yoga mornings, cafes and spiritual calm.',
    vibe: 'Adventure + Spiritual',
    emoji: '🛶',
    tags: ['🌊 River', '🧘 Yoga', '⚡ Rafting'],
    gradient: 'from-emerald-500/25 via-cyan-500/15 to-blue-500/20',
  },
  {
    name: 'McLeodganj',
    description: 'Monastery calm, hidden trails, mountain cafes and slow sunsets.',
    vibe: 'Hidden Gems',
    emoji: '🏕️',
    tags: ['⛩️ Monastery', '🥾 Trails', '☕ Cafes'],
    gradient: 'from-green-500/25 via-teal-500/15 to-blue-500/20',
  },
  {
    name: 'Udaipur',
    description: 'Royal lakes, palaces, boutique stays and romantic sunsets.',
    vibe: 'Luxury + Couple',
    emoji: '🏰',
    tags: ['💧 Lakes', '🏰 Palaces', '✨ Luxury'],
    gradient: 'from-orange-500/25 via-pink-500/15 to-purple-500/20',
  },
];

export function Destinations() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65 },
    },
  };

  const handleExplore = (destination: string) => {
    const plans = document.getElementById('plans');

    plans?.scrollIntoView({ behavior: 'smooth' });

    window.setTimeout(() => {
      const destinationInput =
        document.querySelector<HTMLInputElement>('input[list="destination-suggestions"]');

      if (destinationInput) {
        destinationInput.value = destination;
        destinationInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 650);
  };

  return (
    <section
      id="destinations"
      className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute left-0 top-20 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mx-auto mb-14 max-w-3xl text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-white/[0.04] px-4 py-2 text-sm text-purple-200 backdrop-blur-xl">
            <Sparkles className="h-4 w-4" />
            AI-ready destinations
          </div>

          <h2 className="text-gradient text-4xl font-bold leading-tight md:text-5xl">
            Pick a destination, we’ll build the vibe
          </h2>

          <p className="mt-5 text-base leading-7 text-foreground/60">
            Choose from TripNest&apos;s supported Indian escapes — each one is
            tuned for different travel moods, budgets and group types.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.name}
              className="group relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-xl shadow-purple-500/10 backdrop-blur-xl"
              variants={itemVariants}
              whileHover={{
                y: -8,
                borderColor: 'rgba(168,85,247,0.45)',
                boxShadow: '0 25px 60px -15px rgba(139,92,246,0.35)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${dest.gradient} transition-transform duration-700 group-hover:scale-110`}
              />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_30%),linear-gradient(180deg,transparent,rgba(0,0,0,0.35))]" />

              <div className="relative z-10 flex h-full min-h-[22rem] flex-col justify-between p-6">
                <div>
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-black/20 text-4xl shadow-lg">
                      {dest.emoji}
                    </div>

                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-purple-100">
                      #{String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-foreground/70">
                    <MapPin className="h-3.5 w-3.5 text-purple-200" />
                    {dest.vibe}
                  </div>

                  <h3 className="text-3xl font-bold text-white">
                    {dest.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-foreground/68">
                    {dest.description}
                  </p>
                </div>

                <div className="mt-8">
                  <div className="mb-5 flex flex-wrap gap-2">
                    {dest.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-foreground/75"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => handleExplore(dest.name)}
                    className="group/btn flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/45"
                    whileTap={{ scale: 0.96 }}
                  >
                    Plan {dest.name} Trip
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}