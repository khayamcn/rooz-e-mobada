"use client";

import { Home, FileText, Phone, Users, Cloud, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScreenId =
  | "home"
  | "documents"
  | "contacts"
  | "family"
  | "cloud"
  | "settings";

interface BottomNavProps {
  active: ScreenId;
  onChange: (id: ScreenId) => void;
  pendingCount?: number;
  conflictCount?: number;
}

const NAV_ITEMS: { id: ScreenId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "خانه", icon: Home },
  { id: "documents", label: "مدارک", icon: FileText },
  { id: "contacts", label: "تماس‌ها", icon: Phone },
  { id: "cloud", label: "فضای ابری", icon: Cloud },
  { id: "family", label: "خانواده", icon: Users },
  { id: "settings", label: "تنظیمات", icon: Settings },
];

/**
 * BottomNav — standard 6-item bottom tab bar.
 * Simpler and more touch-friendly than the previous radial design.
 */
export function BottomNav({
  active,
  onChange,
  pendingCount = 0,
  conflictCount = 0,
}: BottomNavProps) {
  return (
    <nav
      aria-label="ناوبری اصلی"
      className="shrink-0 surface-nav border-t"
    >
      <ul className="grid grid-cols-6 h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          const badge =
            item.id === "settings"
              ? conflictCount + pendingCount > 0
                ? conflictCount + pendingCount
                : 0
              : 0;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className={cn(
                  "w-full h-full flex flex-col items-center justify-center gap-1 relative transition-colors",
                  isActive
                    ? "text-violet-500 dark:text-violet-300"
                    : "text-soft hover:text-violet-500 dark:hover:text-violet-300"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-1 rounded-full transition-all",
                    isActive ? "w-8 bg-violet-500" : "w-0 bg-transparent"
                  )}
                />
                <Icon
                  className={cn(
                    "transition-transform",
                    isActive ? "scale-110" : ""
                  )}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                <span
                  className={cn(
                    "text-[10px] leading-none",
                    isActive ? "font-bold" : "font-medium"
                  )}
                >
                  {item.label}
                </span>
                {badge > 0 && (
                  <span className="absolute top-1 left-1/2 -translate-x-3 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center fa-num">
                    {badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
