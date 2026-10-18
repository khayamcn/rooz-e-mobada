"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const PILL_STYLES = {
  offline: { container: "bg-amber-500/15 text-amber-600 border-amber-500/30", dot: "bg-amber-500" },
  online: { container: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", dot: "bg-emerald-500" },
  warning: { container: "bg-red-500/15 text-red-500 border-red-500/30", dot: "bg-red-500" },
  info: { container: "bg-violet-500/15 text-violet-600 border-violet-500/30", dot: "bg-violet-500" },
} as const;

type PillTone = keyof typeof PILL_STYLES;

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  statusPill?: { label: string; tone: PillTone };
  trailing?: ReactNode;
  icon?: ReactNode;
}

export function ScreenHeader({ title, subtitle, statusPill, trailing, icon }: ScreenHeaderProps) {
  return (
    <header className="header-gradient px-5 pt-5 pb-5 rounded-b-3xl relative overflow-hidden">
      <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -right-4 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight truncate text-white">{title}</h1>
            {subtitle && <p className="text-[11px] opacity-70 mt-0.5 truncate text-white">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {statusPill && (
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur", PILL_STYLES[statusPill.tone].container)}>
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse-soft", PILL_STYLES[statusPill.tone].dot)} />
              {statusPill.label}
            </span>
          )}
          {trailing}
        </div>
      </div>
    </header>
  );
}
