'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Tell Us Your Budget',
    description: 'Set your spending limit and trip duration',
  },
  {
    number: '02',
    title: 'Choose Your Travel Vibe',
    description: 'Pick your preferred travel style and activities',
  },
  {
    number: '03',
    title: 'Get 3 Personalized Plans',
    description: 'Receive AI-curated itineraries instantly',
  },
];

export function HowItWorks() {
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
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Connection lines */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative"
              variants={itemVariants}
            >
              {/* Step number circle */}
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold mb-6 mx-auto shadow-lg shadow-purple-500/50"
                whileHover={{ scale: 1.15, boxShadow: '0 0 30px rgba(139, 92, 246, 0.8)' }}
              >
                {step.number}
              </motion.div>

              {/* Content */}
              <div className="glass-card p-6 rounded-2xl h-full">
                <h3 className="text-xl font-semibold mb-3 text-white text-center">
                  {step.title}
                </h3>
                <p className="text-foreground/60 text-center">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
