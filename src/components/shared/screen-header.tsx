"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * ScreenHeader — sticky app bar with title, optional status pill, and trailing action.
 */
interface ScreenHeaderProps {
  title: string;
  statusPill?: {
    label: string;
    tone: "offline" | "online" | "warning";
  };
  trailing?: ReactNode;
  icon?: ReactNode;
}

const PILL_STYLES = {
  offline: "bg-waiting/15 text-amber-200 border-waiting/40",
  online: "bg-success/15 text-green-200 border-success/40",
  warning: "bg-alert/15 text-red-200 border-alert/40",
};

const PILL_DOT = {
  offline: "bg-waiting",
  online: "bg-success",
  warning: "bg-alert",
};

export function ScreenHeader({
  title,
  statusPill,
  trailing,
  icon,
}: ScreenHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-navy-deep-gradient text-white px-4 pt-4 pb-4 rounded-b-3xl shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight truncate">
              {title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {statusPill && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-sm",
                PILL_STYLES[statusPill.tone]
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse-soft",
                  PILL_DOT[statusPill.tone]
                )}
              />
              {statusPill.label}
            </span>
          )}
          {trailing}
        </div>
      </div>
    </header>
  );
}
