"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Onboarding } from "@/components/onboarding/onboarding";
import { TokenActivation } from "@/components/activation/token-activation";
import { PhoneFrame } from "@/components/phone-frame";
import { BottomNav } from "@/components/bottom-nav";
import { HomeScreen } from "@/components/screens/home";
import { PeopleScreen } from "@/components/screens/people";
import { DocumentsScreen } from "@/components/screens/documents";
import { CardsScreen } from "@/components/screens/cards";
import { BillsScreen } from "@/components/screens/bills";
import { PasswordsScreen } from "@/components/screens/passwords";
import { SettingsScreen } from "@/components/screens/settings";
import { PersonProfile } from "@/components/screens/person-profile";
import type { ScreenId } from "@/lib/types";

export default function Page() {
  // Hooks must run before any return — pull all state up front
  const activated = useApp((s) => s.activated);
  const hasSeenOnboarding = useApp((s) => s.hasSeenOnboarding);
  const activePersonId = useApp((s) => s.activePersonId);

  const [mounted, setMounted] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");

  // Mount gate — avoid hydration mismatch.
  useEffect(() => {
    // Use a microtask to defer the state update so it's not synchronous in effect
    Promise.resolve().then(() => setMounted(true));
  }, []);

  // Avoid hydration mismatch — render nothing until mounted.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-violet-300 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  // Flow 1: onboarding first
  if (!hasSeenOnboarding) {
    return <Onboarding />;
  }

  // Flow 2: token activation
  if (!activated) {
    return <TokenActivation />;
  }

  // Flow 3: main app
  const showProfile = Boolean(activePersonId) && activeScreen === "people";

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          {showProfile ? (
            <PersonProfile
              personId={activePersonId as string}
              onBack={() => useApp.getState().setActivePerson(null)}
            />
          ) : activeScreen === "home" ? (
            <HomeScreen onNavigate={setActiveScreen} />
          ) : activeScreen === "people" ? (
            <PeopleScreen />
          ) : activeScreen === "documents" ? (
            <DocumentsScreen />
          ) : activeScreen === "cards" ? (
            <CardsScreen />
          ) : activeScreen === "bills" ? (
            <BillsScreen />
          ) : activeScreen === "passwords" ? (
            <PasswordsScreen />
          ) : activeScreen === "settings" ? (
            <SettingsScreen />
          ) : null}
        </div>
        <BottomNav active={activeScreen} onChange={setActiveScreen} />
      </div>
    </PhoneFrame>
  );
}
