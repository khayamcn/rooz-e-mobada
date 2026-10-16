'use client'

import { PhoneFrame } from "@/components/phone-frame";
import { BottomNav, type ScreenId } from "@/components/bottom-nav";
import { useApp } from "@/lib/store";
import { TokenActivation } from "@/components/activation/token-activation";
import { HomeScreen } from "@/components/screens/home";
import { DocumentsScreen } from "@/components/screens/documents";
import { ContactsScreen } from "@/components/screens/contacts";
import { FamilyScreen } from "@/components/screens/family";
import { SettingsScreen } from "@/components/screens/settings";
import { useState } from "react";

export default function Page() {
  const activated = useApp((s) => s.activated);
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");

  // Show activation screen if not activated
  if (!activated) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center md:py-6 px-0 md:px-6 bg-page">
        <div className="hidden md:flex flex-col items-center gap-2 mb-6 text-center">
          <h1 className="text-2xl font-bold text-strong">روز مبادا</h1>
          <p className="text-sm text-soft max-w-md">
            پرونده اضطراری خانواده — فعال‌سازی
          </p>
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
          <span className="text-xs font-medium text-soft">
            نسخه آفلاین — آماده استفاده
          </span>
        </div>
        <h1 className="text-2xl font-bold text-strong">
          روز مبادا — پرونده اضطراری خانواده
        </h1>
      </div>

      <PhoneFrame>
        <div className="flex flex-col h-full relative bg-page">
          <div className="flex-1 overflow-y-auto no-scrollbar pb-2 bg-page">
            {activeScreen === "home" && (
              <HomeScreen onNavigate={setActiveScreen} />
            )}
            {activeScreen === "documents" && <DocumentsScreen />}
            {activeScreen === "contacts" && <ContactsScreen />}
            {activeScreen === "family" && <FamilyScreen onNavigate={setActiveScreen} />}
            {activeScreen === "settings" && (
              <SettingsScreen onNavigate={setActiveScreen} />
            )}
          </div>

          <BottomNav active={activeScreen} onChange={setActiveScreen} />
        </div>
      </PhoneFrame>
    </main>
  );
}
