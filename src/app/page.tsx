'use client'

import { PhoneFrame } from "@/components/phone-frame";
import { BottomNav } from "@/components/bottom-nav";
import { useApp } from "@/lib/store";
import { TokenActivation } from "@/components/activation/token-activation";
import { HomeScreen } from "@/components/screens/home";
import { PeopleScreen } from "@/components/screens/people";
import { DocumentsScreen } from "@/components/screens/documents";
import { BillsScreen } from "@/components/screens/bills";
import { SettingsScreen } from "@/components/screens/settings";
import { useState } from "react";
import type { ScreenId } from "@/lib/types";

export default function Page() {
  const activated = useApp((s) => s.activated);
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");

  if (!activated) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center md:py-6 px-0 md:px-6 bg-page">
        <div className="hidden md:flex flex-col items-center gap-2 mb-6 text-center">
          <h1 className="text-2xl font-bold text-strong">روز مبادا</h1>
          <p className="text-sm text-soft max-w-md">فعال‌سازی</p>
        </div>
        <PhoneFrame>
          <TokenActivation />
        </PhoneFrame>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start md:justify-center py-0 md:py-6 px-0 md:px-6 bg-page">
      <div className="hidden md:flex flex-col items-center gap-2 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full surface-card">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
          <span className="text-xs font-medium text-soft">نسخه آفلاین</span>
        </div>
        <h1 className="text-2xl font-bold text-strong">روز مبادا</h1>
      </div>

      <PhoneFrame>
        <div className="flex flex-col h-full relative bg-page">
          <div className="flex-1 overflow-y-auto no-scrollbar pb-2 bg-page">
            {activeScreen === "home" && <HomeScreen onNavigate={setActiveScreen} />}
            {activeScreen === "people" && <PeopleScreen />}
            {activeScreen === "documents" && <DocumentsScreen />}
            {activeScreen === "bills" && <BillsScreen />}
            {activeScreen === "settings" && <SettingsScreen onNavigate={setActiveScreen} />}
          </div>
          <BottomNav active={activeScreen} onChange={setActiveScreen} />
        </div>
      </PhoneFrame>
    </main>
  );
}
