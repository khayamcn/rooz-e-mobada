"use client";

import { type ReactNode } from "react";

/**
 * PhoneFrame — renders children inside a phone-shaped device shell.
 * Fixed at 1080x1920 portrait (standard Android aspect ratio).
 * Bottom nav is fixed at the bottom of the frame.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full md:w-[400px]">
      {/* Mobile: full-screen */}
      <div className="md:hidden fixed inset-0 overflow-hidden flex flex-col bg-page">
        {children}
      </div>

      {/* Desktop: device mockup — 1080x1920 portrait aspect ratio */}
      <div className="hidden md:flex flex-col items-center">
        <div
          className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-800 via-slate-900 to-violet-950 p-2.5 shadow-2xl border-[3px] border-slate-800"
          style={{ width: "400px", height: "711px" }}
        >
          {/* Side buttons */}
          <div className="absolute -right-[3px] top-32 w-[3px] h-14 bg-slate-700 rounded-l" />
          <div className="absolute -left-[3px] top-28 w-[3px] h-10 bg-slate-700 rounded-r" />
          <div className="absolute -left-[3px] top-44 w-[3px] h-16 bg-slate-700 rounded-r" />

          {/* Screen — fixed height, bottom nav stays at bottom */}
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-page">
            {children}
          </div>
        </div>
        <div className="mt-2 w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
      </div>
    </div>
  );
}
