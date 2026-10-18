"use client";

import { type ReactNode } from "react";

/**
 * PhoneFrame — fixed full-screen container on mobile, device mockup on desktop.
 * Content fills the frame; bottom nav stays fixed at bottom.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full md:w-[400px]">
      {/* Mobile: fixed full-screen */}
      <div className="md:hidden fixed inset-0 overflow-hidden flex flex-col bg-page">
        {children}
      </div>
      {/* Desktop: device mockup */}
      <div className="hidden md:flex flex-col items-center">
        <div
          className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-800 via-slate-900 to-violet-950 p-2.5 shadow-2xl border-[3px] border-slate-800"
          style={{ width: "400px", height: "780px" }}
        >
          <div className="absolute -right-[3px] top-32 w-[3px] h-14 bg-slate-700 rounded-l" />
          <div className="absolute -left-[3px] top-28 w-[3px] h-10 bg-slate-700 rounded-r" />
          <div className="absolute -left-[3px] top-44 w-[3px] h-16 bg-slate-700 rounded-r" />
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-page flex flex-col">
            {children}
          </div>
        </div>
        <div className="mt-2 w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
      </div>
    </div>
  );
}
