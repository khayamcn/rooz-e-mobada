"use client";

import { Home, FileText, Receipt, Users, Settings, CreditCard, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScreenId } from "@/lib/types";

interface BottomNavProps {
  active: ScreenId;
  onChange: (id: ScreenId) => void;
}

const NAV_ITEMS: { id: ScreenId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "داشبورد", icon: Home },
  { id: "people", label: "افراد", icon: Users },
  { id: "documents", label: "مدارک", icon: FileText },
  { id: "cards", label: "کارت‌ها", icon: CreditCard },
  { id: "bills", label: "قبوض", icon: Receipt },
  { id: "passwords", label: "رمزها", icon: KeyRound },
  { id: "settings", label: "تنظیمات", icon: Settings },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div className="shrink-0 px-3 pb-2 pt-1">
      <nav
        aria-label="ناوبری اصلی"
        className="rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-around h-14 px-1"
        style={{ boxShadow: "0 -2px 20px rgba(0,0,0,0.08)" }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className="flex-1 flex items-center justify-center h-full"
            >
              <motion.div
                layout
                className={`flex items-center gap-1.5 px-3 h-9 rounded-full transition-colors ${
                  isActive
                    ? "bg-violet-500/10 dark:bg-violet-500/20"
                    : "bg-transparent"
                }`}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon
                    className="w-5 h-5"
                    strokeWidth={isActive ? 2.5 : 1.8}
                    color={isActive ? "var(--brand-500)" : "#94a3b8"}
                  />
                </motion.div>
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="overflow-hidden whitespace-nowrap text-[11px] font-bold brand-text"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
