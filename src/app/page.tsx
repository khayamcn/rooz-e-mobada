'use client'

import { useEffect } from "react";
import { PhoneFrame } from "@/components/phone-frame";
import { BottomNav, type ScreenId } from "@/components/bottom-nav";
import { useApp } from "@/lib/store";
import { AuthFlow } from "@/components/auth/auth-flow";
import { HomeScreen } from "@/components/screens/home";
import { DocumentsScreen } from "@/components/screens/documents";
import { ContactsScreen } from "@/components/screens/contacts";
import { FamilyScreen } from "@/components/screens/family";
import { SyncScreen } from "@/components/screens/sync";
import { CloudScreen } from "@/components/screens/cloud";
import { SettingsScreen } from "@/components/screens/settings";
import { useState } from "react";

export default function Page() {
  const authScreen = useApp((s) => s.authScreen);
  const currentUser = useApp((s) => s.currentUser);
  const session = useApp((s) => s.session);
  const checkForUpdate = useApp((s) => s.checkForUpdate);

  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");

  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  // Show auth flow if not logged in
  if (!currentUser || !session || authScreen !== "main-app") {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center md:py-6 px-0 md:px-6 bg-page">
        <div className="hidden md:flex flex-col items-center gap-2 mb-6 text-center">
          <h1 className="text-2xl font-bold text-strong">روز مبادا</h1>
          <p className="text-sm text-soft max-w-md">
            پرونده اضطراری خانواده — ثبت‌نام و ورود
          </p>
        </div>
        <PhoneFrame>
          <AuthFlow />
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
            نسخه نمایشی موبایل — آماده انتشار در بازار اندروید
          </span>
        </div>
        <h1 className="text-2xl font-bold text-strong">
          روز مبادا — پرونده اضطراری خانواده
        </h1>
        <p className="text-sm text-soft max-w-md">
          مدیریت اعضا، مدارک شخصی، فضای ابری خصوصی و همگام‌سازی امن
        </p>
      </div>

      <PhoneFrame>
        <div className="flex flex-col h-full relative">
          <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
            {activeScreen === "home" && (
              <HomeScreen onNavigate={setActiveScreen} />
            )}
            {activeScreen === "documents" && <DocumentsScreen />}
            {activeScreen === "contacts" && <ContactsScreen />}
            {activeScreen === "family" && <FamilyScreen onNavigate={setActiveScreen} />}
            {activeScreen === "cloud" && <CloudScreen />}
            {activeScreen === "settings" && (
              <SettingsScreen onNavigate={setActiveScreen} />
            )}
            {/* Sync screen kept accessible from settings */}
            {activeScreen === "sync" && <SyncScreen />}
          </div>

          <BottomNav
            active={activeScreen}
            onChange={setActiveScreen}
            pendingCount={2}
            conflictCount={1}
          />
        </div>
      </PhoneFrame>

      <div className="hidden md:block mt-6 text-center">
        <p className="text-xs text-soft">
          برای تجربه بهتر، اندازه مرورگر را کوچک کنید.
        </p>
      </div>
    </main>
  );
}
