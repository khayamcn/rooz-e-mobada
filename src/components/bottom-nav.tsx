"use client";

import { Home, FileText, Phone, Users, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScreenId = "home" | "documents" | "contacts" | "family" | "sync";

interface BottomNavProps {
  active: ScreenId;
  onChange: (id: ScreenId) => void;
  pendingCount?: number;
  conflictCount?: number;
}

const NAV_ITEMS: {
  id: ScreenId;
  label: string;
  icon: typeof Home;
}[] = [
  { id: "home", label: "خانه", icon: Home },
  { id: "documents", label: "مدارک", icon: FileText },
  { id: "contacts", label: "تماس‌ها", icon: Phone },
  { id: "family", label: "خانواده", icon: Users },
  { id: "sync", label: "همگام‌سازی", icon: RefreshCw },
];

export function BottomNav({
  active,
  onChange,
  pendingCount = 0,
  conflictCount = 0,
}: BottomNavProps) {
  return (
    <nav
      aria-label="ناوبری اصلی"
      className="shrink-0 bg-white border-t border-slate-200 shadow-nav safe-bottom"
    >
      <ul className="grid grid-cols-5 h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          const badge =
            item.id === "sync"
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
                className={cn(
                  "w-full h-full flex flex-col items-center justify-center gap-1 relative transition-colors",
                  isActive ? "text-navy" : "text-text-muted hover:text-navy"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1.5 h-1 rounded-full transition-all",
                    isActive ? "w-8 bg-navy-blue" : "w-0 bg-transparent"
                  )}
                />
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                <span
                  className={cn(
                    "text-[11px] leading-none",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {item.label}
                </span>
                {badge > 0 && (
                  <span className="absolute top-1 left-1/2 -translate-x-3 min-w-[16px] h-4 px-1 rounded-full bg-alert text-white text-[10px] font-bold flex items-center justify-center fa-num">
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
