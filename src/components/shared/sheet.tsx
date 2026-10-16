"use client";

import { type ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Sheet — bottom-sheet modal used for CRUD forms.
 * Slides up from the bottom with a backdrop overlay.
 */
export function Sheet({ open, onClose, title, subtitle, children, footer }: SheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="absolute bottom-0 left-0 right-0 max-h-[88%] flex flex-col rounded-t-3xl bg-white dark:bg-slate-900 shadow-2xl border-t border-white/10"
          >
            {/* Drag handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="بستن"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-3 border-t border-slate-200/60 dark:border-slate-800 flex gap-2 safe-bottom">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
