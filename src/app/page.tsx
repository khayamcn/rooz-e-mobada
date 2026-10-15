'use client'

import { useState, useCallback } from "react";
import { PhoneFrame } from "@/components/phone-frame";
import { BottomNav, type ScreenId } from "@/components/bottom-nav";
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

  return (
    <main className="min-h-screen w-full bg-surface-muted flex flex-col items-center justify-start md:justify-center py-0 md:py-8 px-0 md:px-6">
      {/* Heading — only on desktop */}
      <div className="hidden md:flex flex-col items-center gap-2 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-card">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs font-medium text-text-muted">
            نسخه نمایشی موبایل — برای انتشار در بازار اندروید
          </span>
        </div>
        <h1 className="text-2xl font-bold text-navy">
          روز مبادا — پرونده اضطراری خانواده
        </h1>
        <p className="text-sm text-text-muted max-w-md">
          رابط کاربری RTL فارسی، آفلاین‌اول و مینیمال — قابل تبدیل به APK از طریق
          PWABuilder یا Capacitor
        </p>
      </div>

      <PhoneFrame>
        <div className="flex flex-col h-full bg-surface-muted">
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {activeScreen === "home" && (
              <HomeScreen onNavigate={handleNavigate} />
            )}
            {activeScreen === "documents" && <DocumentsScreen />}
            {activeScreen === "contacts" && <ContactsScreen />}
            {activeScreen === "family" && <FamilyScreen />}
            {activeScreen === "sync" && <SyncScreen />}
          </div>
          <BottomNav
            active={activeScreen}
            onChange={handleNavigate}
            pendingCount={2}
            conflictCount={1}
          />
        </div>
      </PhoneFrame>

      {/* Footer hints — only on desktop */}
      <div className="hidden md:block mt-6 text-center">
        <p className="text-xs text-text-muted">
          برای تجربه بهتر روی موبایل، اندازه مرورگر را کوچک کنید یا از مرورگر
          موبایل خود استفاده کنید.
        </p>
      </div>
    </main>
  );
}
