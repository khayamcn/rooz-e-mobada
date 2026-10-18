"use client";

import type { ReactNode } from "react";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  status?: { label: string; tone?: "info" | "warning" | "success" };
  trailing?: ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  status,
  trailing,
}: ScreenHeaderProps) {
  return (
    <header className="relative overflow-hidden header-gradient px-5 pt-7 pb-6 rounded-b-card-lg">
      {/* Decorative blur blobs */}
      <div
        aria-hidden
        className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/15 blur-2xl"
      />
      <div
        aria-hidden
        className="absolute top-4 -left-10 h-24 w-24 rounded-full bg-white/10 blur-2xl"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {subtitle && (
            <p className="text-white/75 text-xs font-medium mb-1 truncate">
              {subtitle}
            </p>
          )}
          <h1 className="text-white text-xl font-bold truncate">{title}</h1>
          {status && (
            <span
              className={`inline-flex mt-2 items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                status.tone === "warning"
                  ? "bg-amber-400/30 text-amber-50"
                  : status.tone === "success"
                    ? "bg-emerald-400/30 text-emerald-50"
                    : "bg-white/20 text-white"
              }`}
            >
              {status.label}
            </span>
          )}
        </div>
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
    </header>
  );
}
