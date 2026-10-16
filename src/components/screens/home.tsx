"use client";

import { Search, Phone, AlertTriangle, ShieldCheck, ChevronLeft, Plus, UserPlus, Cloud, Database } from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { AdsBanner } from "@/components/shared/ads-banner";
import { useApp, useActiveMember, useVisibleDocuments, useVisibleContacts, useVisibleVehicles } from "@/lib/store";
import { toPersian } from "@/lib/persian";
import type { ScreenId } from "@/components/bottom-nav";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface HomeScreenProps {
  onNavigate: (id: ScreenId) => void;
}

const ROLE_LABELS: Record<string, { label: string; tone: string }> = {
  admin: { label: "مدیر", tone: "bg-violet-500/15 text-violet-500 dark:text-violet-300" },
  editor: { label: "ویرایشگر", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  viewer: { label: "مشاهده‌گر", tone: "bg-slate-500/15 text-slate-500 dark:text-slate-400" },
};

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const members = useApp((s) => s.members);
  const activeMember = useActiveMember();
  const setActiveMember = useApp((s) => s.setActiveMember);
  const documents = useVisibleDocuments();
  const contacts = useVisibleContacts();
  const vehicles = useVisibleVehicles();
  const syncMeta = useApp((s) => s.syncMeta);
  const [showAllMembers, setShowAllMembers] = useState(false);

  useEffect(() => {
    const handler = () => onNavigate("family");
    window.addEventListener("rooz-fab-add", handler);
    return () => window.removeEventListener("rooz-fab-add", handler);
  }, [onNavigate]);

  if (!activeMember) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-sm text-soft">ابتدا یک عضو خانواده اضافه کنید.</p>
      </div>
    );
  }

  const expiringDocs = documents.filter(
    (d) => d.expiryDays !== null && d.expiryDays >= 0 && d.expiryDays <= 30
  );
  const expiringVehicles = vehicles.filter(
    (v) => v.thirdPartyDaysToExpiry >= 0 && v.thirdPartyDaysToExpiry <= 30
  );
  const urgentItems = [
    ...expiringDocs.map((d) => ({
      id: d.id,
      title: d.title,
      daysLeft: d.expiryDays!,
      date: d.expiryJalali!,
    })),
    ...expiringVehicles.map((v) => ({
      id: v.id,
      title: `بیمه شخص ثالث ${v.title}`,
      daysLeft: v.thirdPartyDaysToExpiry,
      date: v.thirdPartyExpiryJalali,
    })),
  ].sort((a, b) => a.daysLeft - b.daysLeft);

  const memberContacts = contacts.filter((c) => {
    if (c.isSystemEmergency) return true;
    if (!c.isPrivate) return true;
    return c.name.includes(activeMember.fullName);
  });
  const quickContacts = memberContacts.slice(0, 4);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title={activeMember.fullName}
        subtitle={activeMember.relation}
        statusPill={{
          label: syncMeta.connectionStatus === "online" ? "آنلاین" : "آفلاین",
          tone: syncMeta.connectionStatus === "online" ? "online" : "offline",
        }}
        trailing={
          <button
            type="button"
            aria-label="جست‌وجو"
            onClick={() => onNavigate("documents")}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Search className="w-4.5 h-4.5 text-white" />
          </button>
        }
      />

      {/* Active member hero card with profile photo */}
      <div className="px-4 -mt-3 mb-4">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent border border-violet-500/15">
          <div className="flex items-center gap-3 mb-3">
            <ProfileAvatar
              name={activeMember.fullName}
              initials={activeMember.avatarInitials}
              avatarDataUrl={activeMember.avatarDataUrl}
              size="lg"
              ring
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-strong truncate">
                  {activeMember.fullName}
                </p>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${ROLE_LABELS[activeMember.role].tone}`}>
                  {ROLE_LABELS[activeMember.role].label}
                </span>
              </div>
              <p className="text-[11px] text-soft mt-0.5">
                {activeMember.relation} · آخرین فعالیت: {activeMember.lastActiveJalali}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="مدارک" value={toPersian(documents.length)} onClick={() => onNavigate("documents")} />
            <Stat label="خودرو" value={toPersian(vehicles.length)} onClick={() => onNavigate("documents")} />
            <Stat label="تماس" value={toPersian(memberContacts.length)} onClick={() => onNavigate("contacts")} />
          </div>
        </div>
      </div>

      {/* Family member selector with profile photos */}
      <section className="px-4 mb-5">
        <SectionTitle
          icon={<UserPlus className="w-4 h-4" />}
          title="اعضای خانواده"
          action={
            <button
              type="button"
              onClick={() => setShowAllMembers((v) => !v)}
              className="text-[11px] font-semibold text-violet-500 dark:text-violet-300"
            >
              {showAllMembers ? "نمایش کمتر" : "همه ←"}
            </button>
          }
        />
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {members.slice(0, showAllMembers ? members.length : 5).map((m, i) => {
            const isActive = m.id === activeMember.id;
            return (
              <motion.button
                key={m.id}
                type="button"
                onClick={() => setActiveMember(m.id)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`shrink-0 flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all w-[80px] ${
                  isActive
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-glow"
                    : "surface-card text-strong hover:shadow-glow"
                }`}
              >
                <ProfileAvatar
                  name={m.fullName}
                  initials={m.avatarInitials}
                  avatarDataUrl={m.avatarDataUrl}
                  size="md"
                  ring={isActive}
                />
                <span className="text-[10px] font-semibold max-w-[68px] truncate text-center">
                  {m.fullName.split(" ")[0]}
                </span>
                <span className={`text-[9px] ${isActive ? "text-white/80" : "text-soft"}`}>
                  {ROLE_LABELS[m.role].label}
                </span>
              </motion.button>
            );
          })}
          <button
            type="button"
            onClick={() => onNavigate("family")}
            className="shrink-0 flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl border-2 border-dashed border-violet-500/40 text-violet-500 dark:text-violet-300 hover:bg-violet-500/5 transition-colors w-[80px] h-[112px]"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-semibold">افزودن عضو</span>
          </button>
        </div>
      </section>

      {/* Search bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
          <input
            type="text"
            inputMode="search"
            placeholder="جست‌وجوی سریع در مدارک، خودرو و تماس‌ها..."
            className="w-full surface-input rounded-xl pr-10 pl-4 py-3 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
          />
        </div>
      </div>

      {/* Urgent alerts */}
      {urgentItems.length > 0 && (
        <section className="px-4 mb-5">
          <SectionTitle
            icon={<AlertTriangle className="w-4 h-4" />}
            title="هشدارهای مهم"
            tone="alert"
            action={
              <span className="text-[11px] font-semibold text-red-500 dark:text-red-400 fa-num">
                {toPersian(urgentItems.length)} مورد
              </span>
            }
          />
          <div className="space-y-2">
            {urgentItems.slice(0, 3).map((item) => (
              <AppCard key={item.id} className="!p-3 border-red-500/20 bg-red-500/5" onClick={() => onNavigate("documents")}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-red-500 animate-pulse-soft shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-strong leading-snug truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-soft mt-0.5">
                        <span className="text-red-500 dark:text-red-400 font-bold">
                          {item.daysLeft === 0
                            ? "امروز منقضی می‌شود"
                            : `${toPersian(item.daysLeft)} روز دیگر تا انقضا`}
                        </span>
                        {" · "}
                        <span className="fa-num">{item.date}</span>
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="shrink-0 w-4 h-4 text-violet-500 dark:text-violet-300" />
                </div>
              </AppCard>
            ))}
          </div>
        </section>
      )}

      {/* Emergency contacts grid */}
      <section className="px-4 mb-5">
        <SectionTitle
          icon={<Phone className="w-4 h-4" />}
          title="تماس‌های ضروری"
          action={
            <button
              type="button"
              onClick={() => onNavigate("contacts")}
              className="text-[11px] font-semibold text-violet-500 dark:text-violet-300"
            >
              همه ←
            </button>
          }
        />
        <div className="grid grid-cols-2 gap-2">
          {quickContacts.map((c) => (
            <AppCard key={c.id} className="!p-3">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-base shrink-0">
                  {c.iconLabel}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-strong truncate">{c.name}</p>
                  <p className="text-[10px] text-soft truncate fa-num">
                    {c.phonePrimary}
                  </p>
                </div>
              </div>
              <a
                href={`tel:${c.phonePrimary}`}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-br from-violet-500 to-purple-600 text-white py-1.5 rounded-lg text-[11px] font-semibold active:scale-95 transition-transform"
              >
                <Phone className="w-3 h-3" />
                تماس فوری
              </a>
            </AppCard>
          ))}
        </div>
      </section>

      {/* Quick shortcuts — now includes Cloud Drive */}
      <section className="px-4 mb-5">
        <SectionTitle title="میانبرهای سریع" />
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "🚗", title: "خودروها", count: toPersian(vehicles.length), target: "documents" as ScreenId },
            { icon: "📕", title: "راهنماها", count: "آفلاین", target: "contacts" as ScreenId },
            { icon: "📄", title: "اسناد", count: toPersian(documents.length), target: "documents" as ScreenId },
            { icon: "⚙️", title: "تنظیمات", count: "بکاپ", target: "settings" as ScreenId },
          ].map((s) => (
            <AppCard key={s.title} onClick={() => onNavigate(s.target)} className="!p-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-lg shrink-0">
                  {s.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-strong truncate">{s.title}</p>
                  <p className="text-[11px] text-soft fa-num">{s.count}</p>
                </div>
              </div>
            </AppCard>
          ))}
        </div>
      </section>

      {/* Ads banner (Bazaar promotional section) */}
      <AdsBanner onNavigate={onNavigate} />

      <div className="px-4 pb-4">
        <div className="rounded-xl px-3 py-2.5 text-[11px] text-soft flex items-start gap-2 bg-violet-500/5 border border-violet-500/15">
          <ShieldCheck className="w-4 h-4 text-violet-500 dark:text-violet-300 mt-0.5 shrink-0" />
          <span>
            تمام اطلاعات متنی این صفحه روی دستگاه شما ذخیره شده و بدون اینترنت
            قابل مشاهده است. فایل‌های پیوست پس از اتصال مجدد همگام می‌شوند.
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur py-2 hover:bg-white dark:hover:bg-white/10 transition-colors"
    >
      <p className="text-base font-bold text-strong fa-num">{value}</p>
      <p className="text-[10px] text-soft">{label}</p>
    </button>
  );
}
