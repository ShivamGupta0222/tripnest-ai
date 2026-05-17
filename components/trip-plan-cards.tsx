'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Budget Saver',
    description: 'Maximum savings with smart planning.',
    pricing: 'Flexible Pricing',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
    features: [
      'Budget-friendly accommodations',
      'Street food experiences',
      'Free attractions',
      'Local transport tips',
      'Group discounts',
    ],
  },
  {
    name: 'Smart Comfort',
    description: 'Balanced comfort and experiences.',
    pricing: 'Personalized For Your Budget',
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    highlighted: true,
    features: [
      '4-star hotels',
      'Mix of restaurants',
      'Popular attractions',
      'Guided experiences',
      'Flexible itinerary',
      ' 24/7 support',
    ],
  },
  {
    name: 'Premium Experience',
    description: 'Luxury, comfort, and convenience.',
    pricing: 'Flexible Pricing',
    color: 'from-yellow-500/20 to-orange-500/20',
    borderColor: 'border-yellow-500/30',
    features: [
      '5-star hotels',
      'Fine dining',
      'VIP experiences',
      'Private transport',
      'Spa treatments',
      'Personal concierge',
    ],
  },
];

export function TripPlanCards() {
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated gradients */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -50, 0],
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
          Your Budget. Your Vibe. Your Journey.
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={`relative rounded-3xl p-8 border backdrop-blur-xl ${
                plan.highlighted ? `bg-gradient-to-b ${plan.color} ${plan.borderColor} ring-2 ring-purple-500/50 scale-105 md:scale-110` : `bg-gradient-to-b ${plan.color} ${plan.borderColor}`
              }`}
              variants={itemVariants}
              whileHover={{ y: plan.highlighted ? -10 : -5 }}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 rounded-full text-sm font-semibold text-white">
                    Most Popular
                  </div>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-foreground/70 text-sm mb-4">{plan.description}</p>
              
              <div className="mb-8">
                <div className="text-2xl font-bold text-purple-400">{plan.pricing}</div>
                <p className="text-xs text-foreground/60">customized to your needs</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-xl font-semibold transition-all ${
                plan.highlighted
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                  : 'bg-white/10 hover:bg-white/20 border border-white/20'
              }`}>
                Choose Plan
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
