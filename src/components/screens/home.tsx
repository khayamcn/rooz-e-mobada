"use client";

import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard } from "@/components/shared/ui";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import {
  CreditCard, FileText, Receipt, Users, ShieldCheck,
  ChevronLeft, Plus, Phone,
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
  const appVersion = useApp((s) => s.appVersion);

  const unpaidBills = bills.filter((b) => !b.isPaid);
  const totalItems = people.length + bankCards.length + documents.length + bills.length + credentials.length;
  const completionPercent = totalItems > 0 ? Math.min(100, Math.round((totalItems / 10) * 100)) : 0;

  const stats = [
    { label: "افراد", value: people.length, icon: Users, color: "from-violet-500 to-purple-600", target: "people" as ScreenId },
    { label: "کارت‌ها", value: bankCards.length, icon: CreditCard, color: "from-blue-500 to-cyan-600", target: "cards" as ScreenId },
    { label: "مدارک", value: documents.length, icon: FileText, color: "from-emerald-500 to-teal-600", target: "documents" as ScreenId },
    { label: "قبوض", value: bills.length, icon: Receipt, color: "from-amber-500 to-orange-600", target: "bills" as ScreenId },
  ];

  const quickActions = [
    { icon: Users, label: "اعضای خانواده", desc: "مدیریت افراد", color: "from-violet-500 to-purple-600", target: "people" as ScreenId },
    { icon: FileText, label: "مدارک من", desc: "اسناد و مدارک", color: "from-emerald-500 to-teal-600", target: "documents" as ScreenId },
    { icon: CreditCard, label: "کارت‌های بانکی", desc: "حساب و کارت", color: "from-blue-500 to-cyan-600", target: "cards" as ScreenId },
    { icon: Receipt, label: "قبوض", desc: "قبوض پرداخت‌نشده", color: "from-rose-500 to-pink-600", target: "bills" as ScreenId },
  ];

  return (
    <div className="flex flex-col bg-page min-h-full">
      <ScreenHeader
        title="داشبورد"
        subtitle={people.length > 0 ? `${people.length} نفر ثبت شده‌اند` : "خوش آمدید"}
        icon={<ShieldCheck className="w-5 h-5 text-white" />}
        statusPill={{ label: `v${appVersion}`, tone: "info" }}
      />

      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="surface-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-strong">پروفایل شما</p>
              <p className="text-[11px] text-soft">{completionPercent}% تکمیل شده</p>
            </div>
            <span className="text-2xl font-bold brand-text">{completionPercent}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
              className="h-full rounded-full brand-gradient"
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-4 pb-2">
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.button
                key={stat.label}
                type="button"
                onClick={() => onNavigate(stat.target)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="surface-card rounded-2xl p-2.5 text-center hover:shadow-glow transition-all"
              >
                <div className={`w-8 h-8 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-1.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-base font-bold text-strong">{stat.value}</p>
                <p className="text-[9px] text-soft">{stat.label}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Unpaid bills alert */}
      {unpaidBills.length > 0 && (
        <div className="px-4 pb-2">
          <div className="rounded-2xl p-3 bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
              <Receipt className="w-3.5 h-3.5 text-amber-500" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-300">قبوض پرداخت‌نشده</p>
              <p className="text-[10px] text-soft">{unpaidBills.length} مورد در انتظار پرداخت</p>
            </div>
            <button type="button" onClick={() => onNavigate("bills")} className="text-[11px] font-bold text-amber-600 dark:text-amber-300 flex items-center gap-0.5">
              مشاهده <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="px-4 pb-2">
        <p className="text-xs font-bold text-soft mb-2 px-1">دسترسی سریع</p>
        <div className="grid grid-cols-2 gap-3">
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
                className={`rounded-2xl p-4 text-right bg-gradient-to-br ${action.color} text-white shadow-card hover:shadow-glow transition-all`}
              >
                <Icon className="w-6 h-6 mb-2 text-white" />
                <p className="text-sm font-bold text-white">{action.label}</p>
                <p className="text-[10px] text-white/80">{action.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* People — horizontal scroll with big avatars */}
      {people.length > 0 && (
        <div className="pb-2">
          <div className="flex items-center justify-between mb-2 px-4">
            <p className="text-xs font-bold text-soft flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              اعضای خانواده
            </p>
            <button type="button" onClick={() => onNavigate("people")} className="text-[11px] font-semibold brand-text flex items-center gap-0.5">
              همه <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          {/* Horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
            {people.map((person, i) => (
              <motion.button
                key={person.id}
                type="button"
                onClick={() => { useApp.getState().setActivePerson(person.id); onNavigate("people"); }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="shrink-0 w-24 flex flex-col items-center"
              >
                {/* Big avatar */}
                <div className="relative mb-1.5">
                  <ProfileAvatar
                    name={person.fullName}
                    avatarDataUrl={person.avatarDataUrl}
                    size="xl"
                    ring
                  />
                </div>
                {/* Name */}
                <p className="text-xs font-bold text-strong text-center truncate w-full">{person.fullName.split(" ")[0]}</p>
                {/* Phone icon */}
                {person.phone ? (
                  <a
                    href={`tel:${person.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                    aria-label="تماس"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="mt-1 w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </motion.button>
            ))}
            {/* Add person button */}
            <button
              type="button"
              onClick={() => onNavigate("people")}
              className="shrink-0 w-24 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-violet-400/50 flex items-center justify-center mb-1.5">
                <Plus className="w-6 h-6 brand-text" />
              </div>
              <p className="text-[10px] text-soft text-center">افزودن فرد</p>
            </button>
          </div>
        </div>
      )}

      {/* Empty state for people */}
      {people.length === 0 && (
        <div className="px-4 pb-2">
          <AppCard className="!p-5 text-center" onClick={() => onNavigate("people")}>
            <Plus className="w-8 h-8 mx-auto mb-2 brand-text" />
            <p className="text-sm font-bold text-strong">اولین فرد را اضافه کنید</p>
            <p className="text-[11px] text-soft mt-1">برای شروع، روی این کارت بزنید</p>
          </AppCard>
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="rounded-xl px-3 py-2.5 text-[11px] text-soft flex items-start gap-2 brand-bg-soft border border-slate-200/50 dark:border-white/5">
          <ShieldCheck className="w-4 h-4 brand-text mt-0.5 shrink-0" />
          <span>تمام اطلاعات روی همین دستگاه ذخیره می‌شود. برای انتقال، از بخش «تنظیمات» بکاپ بگیرید.</span>
        </div>
      </div>
    </div>
  );
}
