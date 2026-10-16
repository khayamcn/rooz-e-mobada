'use client'

import { useState, useCallback } from "react";
import { PhoneFrame } from "@/components/phone-frame";
import { RadialNav, type ScreenId } from "@/components/bottom-nav";
import { HomeScreen } from "@/components/screens/home";
import { DocumentsScreen } from "@/components/screens/documents";
import { ContactsScreen } from "@/components/screens/contacts";
import { FamilyScreen } from "@/components/screens/family";
import { SyncScreen } from "@/components/screens/sync";

export default function Page() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("home");

  const handleNavigate = useCallback((id: ScreenId) => {
    setActiveScreen(id);
  }, []);

  // The FAB at the bottom of the radial nav opens a quick-add menu;
  // each menu item triggers a context-specific action by switching to
  // the relevant screen with an "addIntent" signal.
  const handleFabClick = useCallback(() => {
    // The FAB click is routed through the screen via a custom event.
    // We dispatch an event so the active screen can open its add-form sheet.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("rooz-fab-add"));
    }
  }, []);

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start md:justify-center py-0 md:py-6 px-0 md:px-6">
      {/* Heading — only on desktop */}
      <div className="hidden md:flex flex-col items-center gap-2 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full surface-card">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
          <span className="text-xs font-medium text-soft">
            نسخه نمایشی موبایل — برای انتشار در بازار اندروید
          </span>
        </div>
        <h1 className="text-2xl font-bold text-strong">
          روز مبادا — پرونده اضطراری خانواده
        </h1>
        <p className="text-sm text-soft max-w-md">
          رابط کاربری RTL فارسی با حالت روز/شب، منوی نیم‌دایره چرخان و مدیریت
          اعضای خانواده
        </p>
      </div>

      <PhoneFrame>
        <div className="flex flex-col h-full relative">
          <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
            {activeScreen === "home" && (
              <HomeScreen onNavigate={handleNavigate} />
            )}
            {activeScreen === "documents" && <DocumentsScreen />}
            {activeScreen === "contacts" && <ContactsScreen />}
            {activeScreen === "family" && <FamilyScreen />}
            {activeScreen === "sync" && <SyncScreen />}
          </div>

          {/* Floating radial nav */}
          <div className="absolute bottom-0 left-0 right-0 z-30">
            <RadialNav
              active={activeScreen}
              onChange={handleNavigate}
              pendingCount={2}
              conflictCount={1}
              onFabClick={handleFabClick}
            />
          </div>
        </div>
      </PhoneFrame>

      <div className="hidden md:block mt-6 text-center">
        <p className="text-xs text-soft">
          برای تجربه بهتر، اندازه مرورگر را کوچک کنید یا از مرورگر موبایل
          استفاده کنید.
        </p>
      </div>
    </main>
  );
}
