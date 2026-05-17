'use client';

import { motion } from 'framer-motion';
import { Menu, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './auth-provider';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

  const handlePrimaryCTA = () => {
    if (user) {
      router.push('/login');
      return;
    }

    router.push('/login');
  };

  const handleLogoClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setIsOpen(false);
  };

  const navItems = [
    { label: 'Destinations', href: '#destinations' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Plans', href: '#plans' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.nav
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#050816]/70 backdrop-blur-2xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.button
          onClick={handleLogoClick}
          className="flex items-center gap-3"
          whileHover={{ scale: 1.03 }}
        >
         <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-1 shadow-lg shadow-purple-500/20 backdrop-blur-xl">
  <img
    src="/tripnest-logo.png"
    alt="TripNest AI"
    className="h-full w-full object-contain"
  />
</div>

          <div className="text-left">
            <span className="block bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-xl font-bold text-transparent">
              TripNest
            </span>

            <span className="text-xs tracking-[0.2em] text-purple-200/70">
              AI TRAVEL
            </span>
          </div>
        </motion.button>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-xl md:flex">
          {navItems.map((item) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/65 transition-all hover:bg-white/[0.06] hover:text-white"
              whileHover={{ y: -1 }}
            >
              {item.label}
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden items-center md:flex">
          <motion.button
            onClick={handlePrimaryCTA}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-purple-500/25 transition-all"
            whileHover={{
              scale: 1.03,
              boxShadow: '0 0 35px rgba(139,92,246,0.45)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />

              {user
                ? 'Continue Your Journey'
                : 'Start My Escape'}
            </span>

            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </motion.button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white backdrop-blur-xl md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <motion.div
          className="border-t border-white/10 bg-[#070b16]/95 backdrop-blur-2xl md:hidden"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
        >
          <div className="space-y-3 px-4 py-5">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm font-medium text-foreground/70 transition-all hover:border-purple-400/20 hover:bg-purple-500/10 hover:text-white"
              >
                {item.label}
              </a>
            ))}

            <motion.button
              onClick={handlePrimaryCTA}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-4 font-semibold text-white shadow-lg shadow-purple-500/25"
              whileTap={{ scale: 0.97 }}
            >
              {user
                ? 'Continue Your Journey'
                : 'Start My Escape ✨'}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}