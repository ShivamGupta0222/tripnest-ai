'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Sparkles, X } from 'lucide-react';

type FormErrorModalProps = {
  open: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onClose: () => void;
};

export function FormErrorModal({
  open,
  title,
  message,
  actionLabel = 'Got it',
  onClose,
}: FormErrorModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-400/25 bg-background/95 shadow-2xl shadow-red-500/10"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-400 via-purple-500 to-blue-500" />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-border/50 bg-background/70 p-2 text-foreground/70 transition hover:border-red-400/70 hover:text-white"
              aria-label="Close error popup"
            >
              <X size={18} />
            </button>

            <div className="p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10">
                  <AlertCircle className="text-red-300" size={28} />
                </div>

                <div>
                  <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
                    <Sparkles size={14} />
                    TripNest Check
                  </p>

                  <h3 className="mt-1 text-xl font-bold sm:text-2xl">
                    {title}
                  </h3>
                </div>
              </div>

              <p className="text-sm leading-6 text-foreground/65">{message}</p>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-purple-500/30"
              >
                {actionLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}