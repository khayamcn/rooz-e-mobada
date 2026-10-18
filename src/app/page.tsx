'use client'

import { PhoneFrame } from "@/components/phone-frame";
import { BottomNav } from "@/components/bottom-nav";
import { useApp } from "@/lib/store";
import { TokenActivation } from "@/components/activation/token-activation";
import { Onboarding } from "@/components/onboarding/onboarding";
import { HomeScreen } from "@/components/screens/home";
import { PeopleScreen } from "@/components/screens/people";
import { DocumentsScreen } from "@/components/screens/documents";
import { CardsScreen } from "@/components/screens/cards";
import { BillsScreen } from "@/components/screens/bills";
import { PasswordsScreen } from "@/components/screens/passwords";
import { SettingsScreen } from "@/components/screens/settings";
import { useState } from "react";
import type { ScreenId } from "@/lib/types";

export default function Page() {
  const activated = useApp((s) => s.activated);
  const hasSeenOnboarding = useApp((s) => s.hasSeenOnboarding);
  const completeOnboarding = useApp((s) => s.completeOnboarding);
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");

  if (!hasSeenOnboarding) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-page">
        <PhoneFrame>
          <Onboarding onComplete={completeOnboarding} />
        </PhoneFrame>
      </main>
    );
  }

  if (!activated) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-page">
        <PhoneFrame>
          <TokenActivation />
        </PhoneFrame>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-page">
      <PhoneFrame>
        <div className="flex flex-col h-full bg-page relative">
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {activeScreen === "home" && <HomeScreen onNavigate={setActiveScreen} />}
            {activeScreen === "people" && <PeopleScreen />}
            {activeScreen === "documents" && <DocumentsScreen />}
            {activeScreen === "cards" && <CardsScreen />}
            {activeScreen === "bills" && <BillsScreen />}
            {activeScreen === "passwords" && <PasswordsScreen />}
            {activeScreen === "settings" && <SettingsScreen onNavigate={setActiveScreen} />}
          </div>
          {/* Fixed bottom nav — always at bottom of frame */}
          <BottomNav active={activeScreen} onChange={setActiveScreen} />
        </div>
      </PhoneFrame>
    </main>
  );
}
