"use client";

import { Search, Phone, Plus, AlertTriangle, ShieldCheck } from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle, FileAttachmentChip } from "@/components/shared/ui";
import {
  documents,
  emergencyContacts,
  vehicles,
} from "@/lib/mock-data";
import { toPersian } from "@/lib/persian";
import type { ScreenId } from "@/components/bottom-nav";

interface HomeScreenProps {
  onNavigate: (id: ScreenId) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  // Aggregate expiring items for the urgent alerts section
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

  // Pick first 4 contacts for the 2x2 grid (priority order)
  const quickContacts = emergencyContacts.slice(0, 4);

  // Quick shortcuts
  const shortcuts = [
    {
      id: "vehicles",
      icon: "🚗",
      title: "مشخصات خودروها",
      count: toPersian(vehicles.length),
      target: "documents" as ScreenId,
    },
    {
      id: "guides",
      icon: "📕",
      title: "راهنماهای اضطراری",
      count: "آفلاین",
      target: "contacts" as ScreenId,
    },
    {
      id: "docs",
      icon: "📄",
      title: "اسناد حیاتی",
      count: toPersian(documents.length),
      target: "documents" as ScreenId,
    },
    {
      id: "checklist",
      icon: "🎒",
      title: "چک‌لیست کیف بحران",
      count: "آماده",
      target: "contacts" as ScreenId,
    },
  ];

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="پرونده خانواده رضایی"
        icon={<ShieldCheck className="w-5 h-5 text-white" />}
        statusPill={{ label: "آفلاین", tone: "offline" }}
        trailing={
          <button
            type="button"
            aria-label="جست‌وجو"
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
          >
            <Search className="w-4.5 h-4.5 text-white" />
          </button>
        }
      />

      <div className="px-4 -mt-2 mb-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white/80 flex items-center justify-between">
          <span>آخرین همگام‌سازی موفق: امروز ۱۴:۲۰</span>
          <span className="fa-num">۲ تغییر در صف ارسال</span>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            inputMode="search"
            placeholder="جست‌وجوی سریع در مدارک، خودرو، تماس‌ها و راهنماها..."
            className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-sm text-text-strong placeholder:text-text-muted focus:outline-none focus:border-navy-blue focus:ring-2 focus:ring-navy-blue/15"
          />
        </div>
      </div>

      {/* Urgent alerts */}
      <section className="px-4 mb-5">
        <SectionTitle
          icon={<AlertTriangle className="w-4 h-4" />}
          title="هشدارهای مهم"
          tone="alert"
          action={
            <span className="text-[11px] font-semibold text-alert fa-num">
              {toPersian(urgentItems.length)} مورد
            </span>
          }
        />
        <div className="space-y-2">
          {urgentItems.map((item) => (
            <AppCard key={item.id} className="!p-3 border-alert/30 bg-alert-soft/40">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-alert animate-pulse-soft shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-strong leading-snug">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      <span className="text-alert font-bold">
                        {item.daysLeft === 0
                          ? "امروز منقضی می‌شود"
                          : `${toPersian(item.daysLeft)} روز دیگر تا انقضا`}
                      </span>
                      {" · "}
                      <span className="fa-num">{item.date}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate("documents")}
                  className="shrink-0 text-navy-blue text-xs font-semibold whitespace-nowrap"
                >
                  مشاهده ←
                </button>
              </div>
            </AppCard>
          ))}
        </div>
      </section>

      {/* Emergency contacts grid */}
      <section className="px-4 mb-5">
        <SectionTitle
          icon={<Phone className="w-4 h-4" />}
          title="تماس‌های ضروری"
          action={
            <button
              type="button"
              onClick={() => onNavigate("contacts")}
              className="text-[11px] font-semibold text-navy-blue"
            >
              همه ←
            </button>
          }
        />
        <div className="grid grid-cols-2 gap-2">
          {quickContacts.map((c) => (
            <AppCard key={c.id} className="!p-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center text-lg shrink-0">
                  {c.iconLabel}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{c.name}</p>
                  <p className="text-[11px] text-text-muted truncate fa-num">
                    {c.phonePrimary}
                  </p>
                </div>
              </div>
              <a
                href={`tel:${c.phonePrimary}`}
                className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 bg-navy-blue text-white py-2 rounded-lg text-xs font-semibold active:scale-95 transition-transform"
              >
                <Phone className="w-3.5 h-3.5" />
                تماس فوری
              </a>
            </AppCard>
          ))}
        </div>
      </section>

      {/* Quick shortcuts */}
      <section className="px-4 mb-5">
        <SectionTitle title="میانبرهای سریع" />
        <div className="grid grid-cols-2 gap-2">
          {shortcuts.map((s) => (
            <AppCard
              key={s.id}
              onClick={() => onNavigate(s.target)}
              className="!p-3 hover:bg-surface-muted/40"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center text-lg shrink-0">
                  {s.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{s.title}</p>
                  <p className="text-[11px] text-text-muted fa-num">{s.count}</p>
                </div>
              </div>
            </AppCard>
          ))}
        </div>
      </section>

      {/* Offline note */}
      <div className="px-4 pb-4">
        <div className="bg-navy-blue/5 border border-navy-blue/20 rounded-xl px-3 py-2.5 text-[11px] text-text-muted flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-navy-blue mt-0.5 shrink-0" />
          <span>
            تمام اطلاعات متنی این صفحه روی دستگاه شما ذخیره شده و بدون اینترنت
            قابل مشاهده است. فایل‌های پیوست پس از اتصال مجدد همگام می‌شوند.
          </span>
        </div>
      </div>
    </div>
  );
}
