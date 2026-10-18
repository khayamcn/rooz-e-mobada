"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: SheetProps) {
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || "sheet"}
    >
      <div
        className="absolute inset-0 bg-black/55 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        dir="rtl"
        className="relative w-full sm:max-w-[420px] max-h-[92vh] surface-card rounded-t-card-lg flex flex-col animate-slide-up"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <span className="h-1 w-10 rounded-full bg-current opacity-20" />
        </div>

        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-2 px-5 pt-1 pb-3">
            <div className="min-w-0">
              {title && (
                <h3 className="text-base font-bold text-strong truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-soft mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="shrink-0 h-8 w-8 rounded-full surface-input flex items-center justify-center pressable"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-5">
          {children}
        </div>

        {footer && (
          <div className="border-t border-violet-100/40 dark:border-white/5 px-5 py-3 safe-bottom">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
