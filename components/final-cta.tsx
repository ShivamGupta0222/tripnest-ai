'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

export function FinalCTA() {
  const router = useRouter();
  const { user } = useAuth();

  const handleStartPlanning = () => {
    if (user) {
      router.push('/login');
      return;
    }

    router.push('/login');
  };

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="absolute left-1/4 top-1/2 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </motion.div>

      <motion.div
        className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.045] p-8 text-center shadow-2xl shadow-purple-500/10 backdrop-blur-xl sm:p-12"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75 }}
      >
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-200">
          <Sparkles className="h-4 w-4" />
          Your AI travel companion is ready
        </div>

        <h2 className="text-balance bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-5xl font-bold leading-tight text-transparent md:text-6xl">
          Your next story starts before you book.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-foreground/65 md:text-lg">
          Tell TripNest your vibe, budget and destination — we’ll craft a journey that feels built for you..
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-foreground/60">
          <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2">
            ✨ Personalized itinerary
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2">
            💰 Group budget aware
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2">
            🧭 Save & continue anytime
          </span>
        </div>

        <motion.button
          onClick={handleStartPlanning}
          className="group mx-auto mt-10 flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 px-10 py-4 font-semibold text-white shadow-2xl shadow-purple-500/30 transition-all"
          whileHover={{
            scale: 1.04,
            boxShadow: '0 0 45px rgba(139,92,246,0.6)',
          }}
          whileTap={{ scale: 0.96 }}
        >
          {user ? 'Continue Your Journey' : 'Start My Escape ✨'}
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </motion.button>
      </motion.div>
    </section>
  );
}