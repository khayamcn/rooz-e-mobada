"use client";

import { useEffect, type ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Prevent body scroll bounce when sheet is open etc — handled here as well
    document.body.style.overscrollBehavior = "contain";
  }, []);

  return (
    <div className="min-h-screen bg-page flex items-stretch sm:items-center justify-center sm:p-4">
      {/* Mobile: full screen */}
      <div className="w-full h-screen sm:h-auto sm:max-w-[420px] sm:my-auto sm:rounded-[2.25rem] sm:shadow-2xl overflow-hidden relative bg-page sm:border sm:border-violet-200/40">
        {children}
      </div>

      {/* Desktop decorative side buttons */}
      <div className="hidden sm:flex flex-col gap-2 fixed ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <span className="block w-1 h-12 rounded-full bg-violet-300/60" />
        <span className="block w-1 h-20 rounded-full bg-violet-300/40" />
      </div>
    </div>
  );
}
