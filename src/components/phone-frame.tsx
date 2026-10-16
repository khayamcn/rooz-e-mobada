"use client";

import { type ReactNode } from "react";

/**
 * PhoneFrame — renders children inside a phone-shaped device shell.
 * Top status bar removed per user request — full screen content.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full md:w-[410px]">
      {/* Mobile: full-screen */}
      <div className="md:hidden h-screen overflow-hidden flex flex-col bg-page">
        <div className="flex-1 overflow-hidden flex flex-col bg-page">{children}</div>
      </div>

      {/* Desktop: device mockup */}
      <div className="hidden md:flex flex-col items-center">
        <div className="relative w-[410px] h-[860px] rounded-[2.75rem] bg-gradient-to-br from-slate-800 via-slate-900 to-violet-950 p-3 shadow-2xl border-[3px] border-slate-800">
          <div className="absolute -right-[3px] top-32 w-[3px] h-14 bg-slate-700 rounded-l" />
          <div className="absolute -left-[3px] top-28 w-[3px] h-10 bg-slate-700 rounded-r" />
          <div className="absolute -left-[3px] top-44 w-[3px] h-16 bg-slate-700 rounded-r" />
          <div className="relative w-full h-full rounded-[2.25rem] overflow-hidden bg-page">
            <div className="absolute inset-0 flex flex-col bg-page">
              {children}
            </div>
          </div>
        </div>
        <div className="mt-2 w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
      </div>
    </div>
  );
}
