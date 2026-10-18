"use client";

import {
  CreditCard,
  FileText,
  Home,
  KeyRound,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import type { ScreenId } from "@/lib/types";

interface NavItem {
  id: ScreenId;
  label: string;
  Icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "خانه", Icon: Home },
  { id: "people", label: "افراد", Icon: Users },
  { id: "documents", label: "اسناد", Icon: FileText },
  { id: "cards", label: "کارت‌ها", Icon: CreditCard },
  { id: "bills", label: "قبوض", Icon: Receipt },
  { id: "passwords", label: "رمزها", Icon: KeyRound },
  { id: "settings", label: "تنظیمات", Icon: Settings },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: ScreenId;
  onChange: (id: ScreenId) => void;
}) {
  return (
    <nav
      dir="rtl"
      className="surface-nav border-t border-white/5 px-1.5 pt-1.5 pb-2 safe-bottom sticky bottom-0 z-30"
      role="tablist"
      aria-label="ناوبری اصلی"
    >
      <ul className="flex items-stretch justify-between gap-0.5">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <li key={id} className="flex-1 min-w-0">
              <button
                role="tab"
                aria-selected={isActive}
                aria-label={label}
                onClick={() => onChange(id)}
                className={`w-full flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-xl pressable ${
                  isActive
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                <span
                  className={`relative flex h-6 w-6 items-center justify-center transition-colors ${
                    isActive ? "text-violet-300" : "text-slate-400"
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                  {isActive && (
                    <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-violet-300" />
                  )}
                </span>
                <span
                  className={`text-[10px] leading-tight font-medium transition-colors ${
                    isActive ? "text-violet-200" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
