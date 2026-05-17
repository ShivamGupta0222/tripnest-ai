'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

export function Hero() {
  const router = useRouter();
  const { user } = useAuth();

  const handlePrimaryCTA = () => {
    if (user) {
      router.push('/login');
      return;
    }

    router.push('/login');
  };

  const handleExploreDestinations = () => {
    const element = document.getElementById('destinations');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      {/* Premium cinematic background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <motion.div
          className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-pink-600/15 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_40%)]" />
      </div>

      <motion.div
        className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div
          variants={itemVariants}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-white/[0.04] px-4 py-2 text-sm text-purple-200 backdrop-blur-xl"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
          AI-Powered Personalized Travel Planning
        </motion.div>

        <motion.h1
          className="mb-6 text-5xl font-bold leading-tight tracking-tight text-balance md:text-7xl"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Your Dream Trip,
          </span>

          <br />

          <span className="bg-gradient-to-r from-purple-300 via-pink-200 to-blue-300 bg-clip-text text-transparent">
            Planned by AI
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mb-8 max-w-3xl text-lg leading-8 text-foreground/70 md:text-xl"
          variants={itemVariants}
        >
          Smart itineraries crafted around your vibe, budget, travel style, and
          personality — so every journey feels uniquely yours.
        </motion.p>

        <motion.p
          className="mx-auto mb-12 max-w-2xl text-sm font-light tracking-wide text-purple-300/80 md:text-base"
          style={{
            textShadow:
              '0 0 20px rgba(192, 132, 250, 0.3), 0 0 40px rgba(139, 92, 246, 0.15)',
          }}
          variants={itemVariants}
        >
          Experience your trip before spending a single rupee ✨
        </motion.p>

        <motion.div
          className="flex flex-col justify-center gap-4 sm:flex-row"
          variants={itemVariants}
        >
          <motion.button
            onClick={handlePrimaryCTA}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-purple-500/30 transition-all"
            whileHover={{
              scale: 1.04,
              boxShadow: '0 0 50px rgba(139, 92, 246, 0.65)',
            }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {user ? 'Continue Your Journey' : 'Start My Escape ✨'}

              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>

            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </motion.button>

          <motion.button
            onClick={handleExploreDestinations}
            className="rounded-full border border-white/15 bg-white/[0.05] px-8 py-4 font-semibold text-white backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/[0.08]"
            whileHover={{
              scale: 1.04,
              boxShadow: '0 0 30px rgba(255,255,255,0.15)',
            }}
            whileTap={{ scale: 0.96 }}
          >
            Explore Destinations
          </motion.button>
        </motion.div>

        {/* Premium cards */}
        <motion.div
          className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3"
          variants={itemVariants}
        >
          {[
            {
              icon: '✈️',
              title: 'AI Smart Itineraries',
              desc: 'Trips dynamically personalized to your vibe.',
            },
            {
              icon: '💰',
              title: 'Budget Optimized',
              desc: 'Realistic planning without overspending.',
            },
            {
              icon: '🎯',
              title: 'Truly Personalized',
              desc: 'Every journey feels handcrafted for you.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-purple-500/10 backdrop-blur-xl"
              whileHover={{
                y: -8,
                borderColor: 'rgba(168,85,247,0.45)',
                boxShadow:
                  '0 25px 60px -15px rgba(139,92,246,0.35)',
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 28,
              }}
            >
              <div className="mb-4 text-5xl">{item.icon}</div>

              <h3 className="mb-2 text-lg font-bold text-white">
                {item.title}
              </h3>

              <p className="text-sm leading-6 text-foreground/60">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}