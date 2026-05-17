'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'College Traveler · Goa',
    avatar: '👩‍🎓',
    text: 'TripNest AI made our college trip feel planned but not boring. The budget options, cafes, beaches and hidden gems felt made for our group.',
    rating: 5,
    tag: 'Friends Trip',
  },
  {
    name: 'Raj & Anaya',
    role: 'Couple Escape · Udaipur',
    avatar: '💑',
    text: 'The itinerary understood our couple vibe perfectly — slow mornings, romantic sunset spots, lake views and cozy dinner suggestions.',
    rating: 5,
    tag: 'Couple',
  },
  {
    name: 'The Squad',
    role: 'Friend Group · Rishikesh',
    avatar: '🧑‍🤝‍🧑',
    text: 'Finally a planner that gets group chaos. Adventure, rafting, food breaks and evening hangouts were balanced without crossing our budget.',
    rating: 5,
    tag: 'Adventure',
  },
  {
    name: 'Aashi Verma',
    role: 'Nature Lover · Manali',
    avatar: '🌿',
    text: 'The Manali plan had peaceful trails, scenic cafes and nature-first experiences. It felt more personal than a generic travel package.',
    rating: 5,
    tag: 'Nature',
  },
];

export function Testimonials() {
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
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65 },
    },
  };

  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute left-0 top-1/3 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
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
            <Star className="h-4 w-4 fill-purple-300 text-purple-300" />
            Real travel vibes
          </div>

          <h2 className="text-4xl font-bold leading-tight text-gradient md:text-5xl">
            Loved by travelers who hate boring plans
          </h2>

          <p className="mt-5 text-base leading-7 text-foreground/60">
            From couple escapes to friends&apos; trips, TripNest builds plans
            that feel personal, practical and budget-aware.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-purple-500/10 backdrop-blur-xl"
              variants={itemVariants}
              whileHover={{
                y: -8,
                borderColor: 'rgba(168,85,247,0.45)',
                boxShadow: '0 25px 60px -15px rgba(139,92,246,0.35)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl transition group-hover:bg-purple-500/20" />

              <div className="relative z-10">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl">
                      {testimonial.avatar}
                    </div>

                    <div>
                      <h4 className="font-bold text-white">
                        {testimonial.name}
                      </h4>
                      <p className="mt-1 text-sm text-foreground/55">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-200">
                    {testimonial.tag}
                  </span>
                </div>

                <div className="mb-5 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-yellow-300 text-yellow-300"
                    />
                  ))}
                </div>

                <Quote className="mb-3 h-6 w-6 text-purple-300/70" />

                <p className="text-sm leading-7 text-foreground/75 sm:text-base">
                  “{testimonial.text}”
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-5 text-center backdrop-blur-xl"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm leading-6 text-foreground/65">
            TripNest is built for Indian travelers who want custom trips without
            wasting hours comparing random blogs, reels and packages.
          </p>
        </motion.div>
      </div>
    </section>
  );
}