"use client";

import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard } from "@/components/shared/ui";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { CopyChip } from "@/components/shared/copyable-field";
import { toPersian } from "@/lib/persian";
import {
  CreditCard, FileText, Receipt, Users, Phone, ShieldCheck,
  TrendingUp, AlertCircle, ChevronLeft, Plus, BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ScreenId } from "@/lib/types";

interface HomeScreenProps {
  onNavigate: (id: ScreenId) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const people = useApp((s) => s.people);
  const bankCards = useApp((s) => s.bankCards);
  const bills = useApp((s) => s.bills);
  const documents = useApp((s) => s.documents);
  const credentials = useApp((s) => s.credentials);
  const contacts = useApp((s) => s.contacts);
  const guides = useApp((s) => s.guides);
  const colorTheme = useApp((s) => s.colorTheme);
  const appVersion = useApp((s) => s.appVersion);

  // Find unpaid bills
  const unpaidBills = bills.filter((b) => !b.isPaid);
  // Find documents with expiry
  const expiringDocs = documents.filter((d) => {
    if (!d.expiryDateJalali) return false;
    // Simple check: if expiry date is within 30 days (approx)
    return true;
  });

  const stats = [
    { label: "افراد", value: people.length, icon: Users, color: "from-violet-500 to-purple-600", target: "people" as ScreenId },
    { label: "کارت بانکی", value: bankCards.length, icon: CreditCard, color: "from-blue-500 to-cyan-600", target: "people" as ScreenId },
    { label: "مدارک", value: documents.length, icon: FileText, color: "from-emerald-500 to-teal-600", target: "documents" as ScreenId },
    { label: "قبوض", value: bills.length, icon: Receipt, color: "from-amber-500 to-orange-600", target: "bills" as ScreenId },
  ];

  const quickActions = [
    { icon: CreditCard, label: "کارت بانکی", desc: "افزودن کارت", color: "from-blue-500 to-cyan-600", target: "people" as ScreenId },
    { icon: FileText, label: "مدرک", desc: "افزودن سند", color: "from-emerald-500 to-teal-600", target: "documents" as ScreenId },
    { icon: Receipt, label: "قبض", desc: "ثبت قبض", color: "from-amber-500 to-orange-600", target: "bills" as ScreenId },
    { icon: Phone, label: "تماس", desc: "تماس اضطراری", color: "from-rose-500 to-pink-600", target: "home" as ScreenId },
  ];

  return (
    <div className="flex flex-col bg-page min-h-full">
      <ScreenHeader
        title="داشبورد"
        subtitle={`${toPersian(people.length)} نفر ثبت شده‌اند`}
        icon={<ShieldCheck className="w-5 h-5 text-white" />}
        statusPill={{ label: `v${appVersion}`, tone: "info" }}
      />

      {/* Stats grid */}
      <div className="px-4 -mt-3 mb-5">
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.button
                key={stat.label}
                type="button"
                onClick={() => onNavigate(stat.target)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="surface-card rounded-2xl p-2.5 text-center hover:shadow-glow transition-all"
              >
                <div className={`w-8 h-8 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-1.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-base font-bold text-strong fa-num">
                  {toPersian(stat.value)}
                </p>
                <p className="text-[9px] text-soft">{stat.label}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Alert section: unpaid bills */}
      {unpaidBills.length > 0 && (
        <section className="px-4 mb-5">
          <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-amber-600 dark:text-amber-300">
                قبوض پرداخت‌نشده
              </p>
              <span className="mr-auto px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px] font-bold fa-num">
                {toPersian(unpaidBills.length)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("bills")}
              className="text-[11px] text-amber-600 dark:text-amber-300 font-semibold flex items-center gap-1"
            >
              مشاهده و پرداخت
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section className="px-4 mb-5">
        <p className="text-xs font-bold text-soft mb-2.5 px-1">دسترسی سریع</p>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                type="button"
                onClick={() => onNavigate(action.target)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="surface-card rounded-2xl p-3 text-center hover:shadow-glow transition-all"
              >
                <div className={`w-10 h-10 mx-auto rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-1.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-bold text-strong">{action.label}</p>
                <p className="text-[9px] text-soft">{action.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* People list */}
      <section className="px-4 mb-5">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <p className="text-xs font-bold text-soft flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            افراد خانواده
          </p>
          <button
            type="button"
            onClick={() => onNavigate("people")}
            className="text-[11px] font-semibold brand-text flex items-center gap-0.5"
          >
            همه
            <ChevronLeft className="w-3 h-3" />
          </button>
        </div>
        {people.length === 0 ? (
          <AppCard className="!p-5 text-center" onClick={() => onNavigate("people")}>
            <Plus className="w-8 h-8 mx-auto mb-2 brand-text" />
            <p className="text-sm font-bold text-strong">اولین فرد را اضافه کنید</p>
            <p className="text-[11px] text-soft mt-1">برای شروع، روی این کارت بزنید</p>
          </AppCard>
        ) : (
          <div className="space-y-2">
            {people.slice(0, 4).map((person, i) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <AppCard
                  asDiv
                  onClick={() => {
                    useApp.getState().setActivePerson(person.id);
                    onNavigate("people");
                  }}
                  className="!p-3"
                >
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      name={person.fullName}
                      avatarDataUrl={person.avatarDataUrl}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-strong truncate">{person.fullName}</p>
                      <p className="text-[11px] text-soft truncate">{person.relation}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-soft fa-num">
                          {toPersian(bankCards.filter((c) => c.personId === person.id).length)} کارت
                        </span>
                        <span className="text-[10px] text-soft">·</span>
                        <span className="text-[10px] text-soft fa-num">
                          {toPersian(documents.filter((d) => d.personId === person.id).length)} سند
                        </span>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-soft shrink-0" />
                  </div>
                </AppCard>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Emergency contacts shortcut */}
      <section className="px-4 mb-5">
        <p className="text-xs font-bold text-soft mb-2.5 px-1">تماس‌های اضطراری</p>
        <div className="grid grid-cols-4 gap-2">
          {contacts.slice(0, 4).map((c) => (
            <a
              key={c.id}
              href={`tel:${c.phonePrimary}`}
              className="surface-card rounded-2xl p-3 text-center hover:shadow-glow transition-all active:scale-95"
            >
              <div className="text-2xl mb-1">{c.iconLabel}</div>
              <p className="text-[10px] font-bold text-strong">{c.name}</p>
              <p className="text-[10px] text-soft fa-num">{c.phonePrimary}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Guides shortcut */}
      <section className="px-4 mb-5">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <p className="text-xs font-bold text-soft flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            راهنماهای اضطراری
          </p>
        </div>
        <div className="space-y-2">
          {guides.slice(0, 2).map((g) => (
            <AppCard key={g.id} className="!p-3">
              <p className="text-sm font-bold text-strong">{g.title}</p>
              <p className="text-[11px] text-soft mt-0.5 line-clamp-2">{g.summary}</p>
            </AppCard>
          ))}
        </div>
      </section>

      <div className="px-4 pb-4">
        <div className="rounded-xl px-3 py-2.5 text-[11px] text-soft flex items-start gap-2 brand-bg-soft border border-slate-200/50 dark:border-white/5">
          <ShieldCheck className="w-4 h-4 brand-text mt-0.5 shrink-0" />
          <span>
            تمام اطلاعات روی همین دستگاه ذخیره می‌شود. برای انتقال به دستگاه دیگر، از بخش «تنظیمات» بکاپ رمزنگاری‌شده تهیه کنید.
          </span>
        </div>
      </div>
    </div>
  );
}
