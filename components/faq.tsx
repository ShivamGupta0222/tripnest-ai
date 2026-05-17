'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';

const faqs = [
  {
    question: 'Will every user get the same itinerary?',
    answer:
      'No. TripNest uses your destination, budget, travel vibe, group type, dates and preferences to shape the plan. A couple trip, friends trip and family trip for the same place should feel different.',
  },
  {
    question: 'Is TripNest only for budget trips?',
    answer:
      'No. TripNest creates multiple styles — Budget Saver, Smart Comfort and Premium Experience — so you can compare savings, comfort and upgraded travel before choosing one.',
  },
  {
    question: 'Can I edit the itinerary after it is generated?',
    answer:
      'Yes. You can open a plan, adjust the itinerary, regenerate it and save the version that feels right for your trip.',
  },
  {
    question: 'Can I save my trips?',
    answer:
      'Yes. Once you log in, you can save trips to your profile and reopen them later from your dashboard.',
  },
  {
    question: 'Does TripNest book hotels or flights right now?',
    answer:
      'Not yet. The current version focuses on personalized planning, saving and trip comparison. Booking support can be added later as TripNest grows.',
  },
  {
    question: 'Who is TripNest AI for?',
    answer:
      'TripNest is for Indian travelers who want personalized travel planning without spending hours comparing random packages, reels, blogs and spreadsheets.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55 },
    },
  };

  return (
    <section id="faq" className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      <div className="mx-auto max-w-4xl">
        <motion.div
          className="mx-auto mb-12 max-w-3xl text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-white/[0.04] px-4 py-2 text-sm text-purple-200 backdrop-blur-xl">
            <Sparkles className="h-4 w-4" />
            Before you start
          </div>

          <h2 className="text-gradient text-4xl font-bold leading-tight md:text-5xl">
            Questions travelers usually ask
          </h2>

          <p className="mt-5 text-base leading-7 text-foreground/60">
            Clear answers about personalization, saving trips and what TripNest
            can do right now.
          </p>
        </motion.div>

        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;

            return (
              <motion.div
                key={faq.question}
                className={`overflow-hidden rounded-[1.5rem] border backdrop-blur-xl transition ${
                  isOpen
                    ? 'border-purple-400/35 bg-purple-500/10 shadow-xl shadow-purple-500/10'
                    : 'border-white/10 bg-white/[0.04]'
                }`}
                variants={itemVariants}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-white/[0.04] sm:p-6"
                >
                  <h3 className="text-base font-semibold text-white sm:text-lg">
                    {faq.question}
                  </h3>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.28 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm leading-7 text-foreground/65 sm:px-6 sm:pb-6 sm:text-base">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}