"use client";

import { Home, FileText, Receipt, Users, Settings, CreditCard, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <nav aria-label="ناوبری اصلی" className="shrink-0 surface-nav">
      <ul className="grid grid-cols-7 h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "w-full h-full flex flex-col items-center justify-center gap-1 relative transition-colors",
                  isActive ? "text-white" : "text-[var(--nav-fg)]"
                )}
                style={isActive ? { color: "var(--nav-fg-active)" } : { color: "var(--nav-fg)" }}
              >
                <span
                  className={cn(
                    "absolute top-1 h-1 rounded-full transition-all",
                    isActive ? "w-6 brand-gradient" : "w-0 bg-transparent"
                  )}
                />
                <Icon className={cn("transition-transform", isActive ? "scale-110" : "")} strokeWidth={isActive ? 2.4 : 1.8} />
                <span className={cn("text-[9px] leading-none", isActive ? "font-bold" : "font-medium")}>
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
