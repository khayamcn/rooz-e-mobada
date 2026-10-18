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
    <div className="shrink-0 px-3 pb-2 pt-1 bg-transparent">
      <nav
        aria-label="ناوبری اصلی"
        className="rounded-full bg-[#1F2937] shadow-lg overflow-hidden"
        style={{ boxShadow: "0 -2px 20px rgba(0,0,0,0.15)" }}
      >
        <ul className="flex items-center justify-around h-14 px-1">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id} className="flex-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  className="relative flex flex-col items-center justify-center w-full h-full transition-colors"
                >
                  <AnimatePresence mode="wait">
                    {isActive ? (
                      <motion.div
                        key="active"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute inset-1 rounded-full bg-gradient-to-br from-violet-500 to-purple-600"
                        style={{ boxShadow: "0 2px 8px rgba(139,92,246,0.5)" }}
                      />
                    ) : null}
                  </AnimatePresence>
                  <motion.div
                    animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative z-10"
                  >
                    <Icon
                      className="w-4 h-4"
                      strokeWidth={isActive ? 2.5 : 1.8}
                      color={isActive ? "#FFFFFF" : "#9CA3AF"}
                    />
                  </motion.div>
                  <motion.span
                    animate={{ opacity: isActive ? 1 : 0.6 }}
                    className="relative z-10 text-[8px] leading-none mt-0.5"
                    style={{ color: isActive ? "#FFFFFF" : "#9CA3AF", fontWeight: isActive ? 700 : 500 }}
                  >
                    {item.label}
                  </motion.span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
