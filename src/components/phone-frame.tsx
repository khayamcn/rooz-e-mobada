"use client";

import { type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PhoneFrame — renders children inside a phone-shaped device shell.
 * On mobile: full-screen. On desktop: device mockup.
 * Includes the day/night theme toggle in the top status bar.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const theme = useApp((s) => s.theme);
  const toggleTheme = useApp((s) => s.toggleTheme);

  return (
    <div className="relative w-full md:w-[410px]">
      {/* Mobile: full-screen */}
      <div className="md:hidden h-screen overflow-hidden flex flex-col">
        <StatusBar theme={theme} onToggle={toggleTheme} />
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
      </div>

      {/* Desktop: device mockup */}
      <div className="hidden md:flex flex-col items-center">
        <div className="relative w-[410px] h-[860px] rounded-[2.75rem] bg-gradient-to-br from-slate-800 via-slate-900 to-violet-950 p-3 shadow-2xl border-[3px] border-slate-800">
          {/* Side buttons */}
          <div className="absolute -right-[3px] top-32 w-[3px] h-14 bg-slate-700 rounded-l" />
          <div className="absolute -left-[3px] top-28 w-[3px] h-10 bg-slate-700 rounded-r" />
          <div className="absolute -left-[3px] top-44 w-[3px] h-16 bg-slate-700 rounded-r" />

          {/* Screen */}
          <div className="relative w-full h-full rounded-[2.25rem] overflow-hidden">
            <StatusBar theme={theme} onToggle={toggleTheme} />
            <div className="absolute inset-0 pt-9 pb-0 flex flex-col">
              {children}
            </div>
          </div>
        </div>
        <div className="mt-2 w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
      </div>
    </div>
  );
}

function StatusBar({
  theme,
  onToggle,
}: {
  theme: "light" | "dark";
  onToggle: () => void;
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 h-9 bg-gradient-to-b from-slate-900 to-slate-900/80 flex items-center justify-between px-5 text-white text-[11px] font-medium backdrop-blur">
      <span className="fa-num">۱۴:۲۰</span>
      <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-16 h-4 bg-slate-900 rounded-full hidden md:block" />
      <div className="flex items-center gap-2.5">
        <ThemeToggle theme={theme} onToggle={onToggle} />
        <div className="flex items-center gap-1">
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 6l1.5 1.5L4 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M4 5l2 2 4-4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="11" cy="3" r="1" fill="white" />
          </svg>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <rect x="0.5" y="2.5" width="10" height="5" rx="1.2" stroke="white" strokeWidth="0.8" />
            <rect x="11" y="4" width="1.5" height="2" rx="0.4" fill="white" />
            <rect x="2" y="4" width="6" height="2" rx="0.3" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: "light" | "dark";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === "dark" ? "حالت روز" : "حالت شب"}
      className="relative w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="w-4 h-4 text-violet-300" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="w-4 h-4 text-amber-300" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
