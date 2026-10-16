"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const PILL_STYLES = {
  offline: {
    container: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    dot: "bg-amber-400",
  },
  online: {
    container: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    dot: "bg-emerald-400",
  },
  warning: {
    container: "bg-red-400/15 text-red-300 border-red-400/30",
    dot: "bg-red-400",
  },
  info: {
    container: "bg-violet-400/15 text-violet-300 border-violet-400/30",
    dot: "bg-violet-400",
  },
} as const;

type PillTone = keyof typeof PILL_STYLES;

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  statusPill?: { label: string; tone: PillTone };
  trailing?: ReactNode;
  icon?: ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  statusPill,
  trailing,
  icon,
}: ScreenHeaderProps) {
  return (
    <header className="header-gradient px-5 pt-5 pb-5 rounded-b-[2rem] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-12 -left-8 w-40 h-40 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-4 w-32 h-32 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <span className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 ring-1 ring-white/15">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] opacity-70 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {statusPill && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur",
                PILL_STYLES[statusPill.tone].container
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse-soft",
                  PILL_STYLES[statusPill.tone].dot
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
