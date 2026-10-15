"use client";

import { type ReactNode } from "react";

/**
 * PhoneFrame — renders children inside a phone-shaped device shell.
 * On mobile, it takes the full viewport; on desktop, it shows a device mockup.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full md:w-[400px]">
      {/* Mobile: full-screen */}
      <div className="md:hidden h-screen bg-surface-muted overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
      </div>

      {/* Desktop: device mockup */}
      <div className="hidden md:flex flex-col items-center">
        <div className="relative w-[400px] h-[820px] rounded-[2.5rem] bg-navy-deep-gradient p-3 shadow-2xl border-[3px] border-slate-800">
          {/* Side buttons */}
          <div className="absolute -right-[3px] top-32 w-[3px] h-14 bg-slate-700 rounded-l" />
          <div className="absolute -left-[3px] top-28 w-[3px] h-10 bg-slate-700 rounded-r" />
          <div className="absolute -left-[3px] top-44 w-[3px] h-16 bg-slate-700 rounded-r" />

          {/* Screen */}
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-surface-muted">
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 z-30 h-8 bg-navy-deep-gradient flex items-center justify-between px-6 text-white text-[11px] font-medium">
              <span className="fa-num">۱۴:۲۰</span>
              {/* Camera notch */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-16 h-4 bg-slate-900 rounded-full" />
              <div className="flex items-center gap-1">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M1 6l1.5 1.5L4 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M4 5l2 2 4-4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="11" cy="3" r="1" fill="white" />
                </svg>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <rect x="0.5" y="2.5" width="10" height="5" rx="1.2" stroke="white" strokeWidth="0.8" />
                  <rect x="11" y="4" width="1.5" height="2" rx="0.4" fill="white" />
                  <rect x="2" y="4" width="6" height="2" rx="0.3" fill="white" />
                </svg>
              </div>
            </div>
            {/* App content */}
            <div className="absolute inset-0 pt-8 pb-0 flex flex-col">
              {children}
            </div>
          </div>
        </div>
        {/* Home indicator */}
        <div className="mt-2 w-32 h-1 bg-slate-300 rounded-full" />
      </div>
    </div>
  );
}
