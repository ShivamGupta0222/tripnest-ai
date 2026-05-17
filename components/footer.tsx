'use client';

import { motion } from 'framer-motion';
import {
  Instagram,
  Twitter,
  Linkedin,
  ArrowUpRight,
} from 'lucide-react';

const footerLinks = {
  Product: [
    'AI Itineraries',
    'Destinations',
    'Saved Trips',
    'Travel Styles',
  ],
  Explore: ['Goa', 'Manali', 'Udaipur', 'Rishikesh'],
  Company: ['About TripNest', 'Roadmap', 'Careers', 'Contact'],
  Legal: ['Privacy Policy', 'Terms', 'Cookies', 'Security'],
};

const socialLinks = [
  {
    icon: Instagram,
    href: 'https://www.instagram.com/tripnestai/',
  },
  {
    icon: Twitter,
    href: 'https://x.com/tripnestai',
  },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/company/tripnest-ai/',
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-background/60 backdrop-blur-xl">
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute left-0 top-0 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 25, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -25, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          className="mb-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr,2fr]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] p-1 shadow-lg shadow-purple-500/20 backdrop-blur-">
  <img
    src="/tripnest-logo.png"
    alt="TripNest AI"
    className="h-full w-full object-contain"
  />
</div>

              <div>
                <h3 className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-2xl font-bold text-transparent">
                  TripNest
                </h3>

                <p className="text-xs uppercase tracking-[0.2em] text-foreground/40">
                  AI Travel Experience
                </p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-7 text-foreground/60">
              TripNest helps modern travelers discover personalized journeys
              built around their vibe, budget and travel style.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-foreground/65">
                ✨ Personalized Trips
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-foreground/65">
                💰 Budget Aware
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-foreground/65">
                🧭 AI Powered
              </div>
            </div>
          </motion.div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {Object.entries(footerLinks).map(([category, links], i) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
                  {category}
                </h4>

                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="group inline-flex items-center gap-1 text-sm text-foreground/58 transition hover:text-white"
                      >
                        {link}

                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          className="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div>
            <p className="text-center text-sm text-foreground/50 md:text-left">
              © {currentYear} TripNest AI. All rights reserved.
            </p>

            <p className="mt-1 text-center text-xs text-foreground/35 md:text-left">
              Built with AI, travel vibes and founder obsession ✨
            </p>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon: Icon, href }, i) => (
              <motion.a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-foreground/70 transition hover:border-purple-400/30 hover:bg-purple-500/10 hover:text-white"
                whileHover={{
                  scale: 1.08,
                  y: -2,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-5 w-5" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}