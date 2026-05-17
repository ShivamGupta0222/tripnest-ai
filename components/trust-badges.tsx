'use client';

import { motion } from 'framer-motion';

const badges = [
  {
    icon: '🎯',
    title: 'Personalized Itineraries',
    description: 'AI-crafted plans tailored to your style and preferences',
  },
  {
    icon: '💰',
    title: 'Budget Optimization',
    description: 'Maximum value for every rupee you spend',
  },
  {
    icon: '💎',
    title: 'Hidden Gems',
    description: 'Discover secret spots locals love',
  },
  {
    icon: '👥',
    title: 'Group Trip Planning',
    description: 'Perfect plans for friends, families, and couples',
  },
  {
    icon: '🤖',
    title: 'AI-Powered',
    description: 'Machine learning optimizes your experience',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Get your plan in minutes, not hours',
  },
];

export function TrustBadges() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -50, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              className="glass-card p-6 rounded-2xl group cursor-pointer border border-white/20 shadow-lg shadow-purple-500/20"
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.4)',
                borderColor: 'rgba(168, 85, 247, 0.5)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="text-4xl mb-4">{badge.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                {badge.title}
              </h3>
              <p className="text-foreground/60 text-sm">
                {badge.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
