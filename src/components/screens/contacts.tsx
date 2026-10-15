"use client";

import { useState } from "react";
import { Phone, Plus, BookOpen, Clock, ChevronLeft } from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { emergencyContacts, emergencyGuides } from "@/lib/mock-data";
import { toPersian, persianPhone } from "@/lib/persian";

type Tab = "contacts" | "guides";

const GUIDE_CATEGORIES: Record<
  string,
  { label: string; emoji: string; color: string }
> = {
  first_aid: {
    label: "کمک‌های اولیه",
    emoji: "🩹",
    color: "bg-alert/10",
  },
  earthquake: {
    label: "زلزله",
    emoji: "🌍",
    color: "bg-waiting/10",
  },
  fire: {
    label: "آتش‌سوزی",
    emoji: "🔥",
    color: "bg-alert/10",
  },
  home_utilities: {
    label: "شیرهای اصلی منزل",
    emoji: "🚰",
    color: "bg-navy-blue/10",
  },
};

export function ContactsScreen() {
  const [tab, setTab] = useState<Tab>("contacts");
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="تماس‌ها و راهنمای بحران"
        icon={<Phone className="w-5 h-5 text-white" />}
        trailing={
          <button
            type="button"
            aria-label="ثبت تماس جدید"
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      {/* Tab switcher */}
      <div className="px-4 -mt-2 mb-4">
        <div className="bg-white border border-slate-200 rounded-xl p-1 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setTab("contacts")}
            className={`py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
              tab === "contacts"
                ? "bg-navy text-white shadow-card"
                : "text-text-muted"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            تماس‌های ضروری
          </button>
          <button
            type="button"
            onClick={() => setTab("guides")}
            className={`py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
              tab === "guides"
                ? "bg-navy text-white shadow-card"
                : "text-text-muted"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            راهنماهای آفلاین
          </button>
        </div>
      </div>

      {tab === "guides" && (
        <section className="px-4 mb-4">
          <div className="bg-success/10 border border-success/30 rounded-xl px-3 py-2 text-[11px] text-success flex items-center gap-2 mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>۱۰۰٪ در دسترس بدون اینترنت — روی دستگاه ذخیره شده</span>
          </div>
          <SectionTitle title="راهنماهای حیاتی" />

          <div className="space-y-2.5">
            {emergencyGuides.map((g) => {
              const cat = GUIDE_CATEGORIES[g.category];
              const isExpanded = expandedGuideId === g.id;
              return (
                <AppCard key={g.id} className="!p-0 overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedGuideId(isExpanded ? null : g.id)
                    }
                    className="w-full text-right p-3.5 hover:bg-surface-muted/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${cat.color}`}
                        >
                          {cat.emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text-strong leading-snug">
                            {g.title}
                          </p>
                          <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">
                            {g.summary}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-muted">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span className="fa-num">
                                {toPersian(g.readingTimeMinutes)} دقیقه مطالعه
                              </span>
                            </span>
                            {g.isPinned && (
                              <span className="inline-flex items-center gap-1 text-navy-blue font-semibold">
                                📌 پین‌شده
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronLeft
                        className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${
                          isExpanded ? "-rotate-90" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 animate-slide-up">
                      <div className="border-t border-slate-100 pt-3">
                        <p className="text-[11px] font-bold text-navy mb-2">
                          گام‌به‌گام:
                        </p>
                        <ol className="space-y-2">
                          {g.steps.map((step, idx) => (
                            <li
                              key={idx}
                              className="flex gap-2.5 text-[12px] text-text-strong leading-relaxed"
                            >
                              <span className="shrink-0 w-5 h-5 rounded-full bg-navy-blue/10 text-navy-blue text-[10px] font-bold flex items-center justify-center fa-num">
                                {toPersian(idx + 1)}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </AppCard>
              );
            })}
          </div>
        </section>
      )}

      {tab === "contacts" && (
        <>
          {/* System emergency contacts — quick grid */}
          <section className="px-4 mb-5">
            <SectionTitle title="مراکز اضطراری" />
            <div className="grid grid-cols-3 gap-2">
              {emergencyContacts
                .filter((c) => c.isSystemEmergency)
                .map((c) => (
                  <a
                    key={c.id}
                    href={`tel:${c.phonePrimary}`}
                    className="bg-alert text-white rounded-2xl p-3 text-center active:scale-95 transition-transform shadow-card"
                  >
                    <div className="text-2xl mb-1">{c.iconLabel}</div>
                    <div className="text-xs font-bold">{c.name}</div>
                    <div className="text-[11px] opacity-90 fa-num">
                      {persianPhone(c.phonePrimary)}
                    </div>
                  </a>
                ))}
            </div>
          </section>

          {/* Family emergency contacts — list */}
          <section className="px-4 mb-5">
            <SectionTitle
              title="تماس‌های اضطراری خانواده"
              action={
                <span className="text-[11px] text-text-muted fa-num">
                  {toPersian(
                    emergencyContacts.filter((c) => !c.isSystemEmergency).length
                  )}{" "}
                  نفر
                </span>
              }
            />
            <div className="space-y-2.5">
              {emergencyContacts
                .filter((c) => !c.isSystemEmergency)
                .map((c) => (
                  <AppCard key={c.id} className="!p-3.5">
                    <div className="flex items-start gap-2.5 mb-2.5">
                      <span className="w-11 h-11 rounded-xl bg-surface-muted flex items-center justify-center text-xl shrink-0">
                        {c.iconLabel}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-text-strong truncate">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-text-muted truncate">
                              {c.relationOrRole}
                            </p>
                          </div>
                          {c.isPrivate && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded bg-navy-blue/10 text-navy-blue text-[10px] font-semibold">
                              شخصی
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-[11px] text-text-strong font-medium fa-num">
                          {persianPhone(c.phonePrimary)}
                        </div>
                        {c.phoneSecondary && (
                          <div className="text-[11px] text-text-muted fa-num mt-0.5">
                            {persianPhone(c.phoneSecondary)}
                          </div>
                        )}
                        {c.address && (
                          <div className="text-[11px] text-text-muted mt-1 flex items-start gap-1">
                            <span>📍</span>
                            <span>{c.address}</span>
                          </div>
                        )}
                        {c.medicalOrUrgentNote && (
                          <div className="mt-2 bg-waiting/10 border border-waiting/20 rounded-lg px-2.5 py-1.5 text-[11px] text-waiting flex items-start gap-1.5">
                            <span>⚠️</span>
                            <span>{c.medicalOrUrgentNote}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${c.phonePrimary}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-navy-blue text-white py-2 rounded-lg text-xs font-semibold active:scale-95 transition-transform"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        تماس مستقیم
                      </a>
                      <button
                        type="button"
                        className="px-3 inline-flex items-center justify-center gap-1.5 bg-surface-muted text-text-strong border border-slate-200 py-2 rounded-lg text-xs font-semibold active:scale-95 transition-transform"
                      >
                        کپی شماره
                      </button>
                    </div>
                  </AppCard>
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
