'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, IndianRupee, Sparkles, X } from 'lucide-react';

type BudgetWarning = {
  destinationName: string;
  minimumRequiredBudget: number;
  enteredBudget: number;
  travelers: number;
  days: number;
  minPerPersonPerDay: number;
};

type BudgetWarningModalProps = {
  open: boolean;
  warning: BudgetWarning | null;
  onClose: () => void;
  onIncreaseBudget: () => void;
  onEditTravelers: () => void;
};

export function BudgetWarningModal({
  open,
  warning,
  onClose,
  onIncreaseBudget,
  onEditTravelers,
}: BudgetWarningModalProps) {
  if (!warning) return null;

  const budgetGap = warning.minimumRequiredBudget - warning.enteredBudget;

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
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-purple-500/30 bg-background/95 shadow-2xl shadow-purple-500/20"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400" />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-border/50 bg-background/70 p-2 text-foreground/70 transition hover:border-purple-500/70 hover:text-white"
              aria-label="Close budget warning"
            >
              <X size={18} />
            </button>

            <div className="p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <AlertTriangle className="text-yellow-400" size={28} />
                </div>

                <div>
                  <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
                    <Sparkles size={14} />
                    AI Budget Check
                  </p>

                  <h3 className="mt-1 text-xl font-bold sm:text-2xl">
                    Budget is too low for this trip
                  </h3>
                </div>
              </div>

              <p className="text-sm leading-6 text-foreground/65">
                TripNest AI estimated that your current budget may not cover a
                realistic {warning.destinationName} trip for your selected group
                size and duration.
              </p>

              <div className="mt-6 rounded-2xl border border-border/60 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-foreground/50">
                      Recommended minimum
                    </p>

                    <p className="mt-1 text-3xl font-bold text-white">
                      ₹{warning.minimumRequiredBudget.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300">
                    <IndianRupee size={24} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-background/60 p-3">
                    <p className="text-foreground/45">Your budget</p>
                    <p className="font-semibold">
                      ₹{warning.enteredBudget.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="rounded-xl bg-background/60 p-3">
                    <p className="text-foreground/45">Budget gap</p>
                    <p className="font-semibold text-yellow-300">
                      ₹{budgetGap.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="rounded-xl bg-background/60 p-3">
                    <p className="text-foreground/45">Travelers</p>
                    <p className="font-semibold">{warning.travelers}</p>
                  </div>

                  <div className="rounded-xl bg-background/60 p-3">
                    <p className="text-foreground/45">Days</p>
                    <p className="font-semibold">{warning.days}</p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-foreground/50">
                  Calculation: ₹
                  {warning.minPerPersonPerDay.toLocaleString('en-IN')} per
                  person/day × {warning.travelers} traveler(s) × {warning.days}{' '}
                  day(s). Includes stay, food, travel, local transport and basic
                  sightseeing.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onIncreaseBudget}
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Increase Budget
                </button>

                <button
                  type="button"
                  onClick={onEditTravelers}
                  className="rounded-xl border border-border/60 bg-background px-4 py-3 font-semibold transition hover:border-purple-500/70"
                >
                  Edit Travelers / Days
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full rounded-xl px-4 py-3 text-sm text-foreground/60 transition hover:text-white"
              >
                I’ll adjust it manually
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}