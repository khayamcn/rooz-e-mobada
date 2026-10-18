"use client";

import {
  AlertTriangle,
  CreditCard,
  FileText,
  Phone,
  Plus,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import type { ScreenId } from "@/lib/types";

const EMERGENCY_META: Record<string, { label: string; color: string }> = {
  "115": { label: "اورژانس", color: "from-red-400 to-rose-600" },
  "110": { label: "پلیس", color: "from-blue-400 to-indigo-600" },
  "125": { label: "آتش‌نشانی", color: "from-orange-400 to-amber-600" },
  "191": { label: "گاز", color: "from-yellow-400 to-amber-500" },
};

export function HomeScreen({
  onNavigate,
}: {
  onNavigate: (s: ScreenId) => void;
}) {
  const people = useApp((s) => s.people);
  const bankCards = useApp((s) => s.bankCards);
  const bills = useApp((s) => s.bills);
  const documents = useApp((s) => s.documents);
  const contacts = useApp((s) => s.contacts);

  const unpaidBills = bills.filter((b) => !b.isPaid);

  const totalItems =
    people.length + bankCards.length + bills.length + documents.length;
  const completion = Math.min(
    100,
    totalItems === 0
      ? 0
      : Math.round(
          (Math.min(totalItems, 20) / 20) * 100,
        ),
  );

  const stats: {
    label: string;
    value: number;
    Icon: LucideIcon;
    from: string;
    to: string;
    screen: ScreenId;
  }[] = [
    {
      label: "افراد",
      value: people.length,
      Icon: Users,
      from: "var(--stat-people-from)",
      to: "var(--stat-people-to)",
      screen: "people",
    },
    {
      label: "کارت‌ها",
      value: bankCards.length,
      Icon: CreditCard,
      from: "var(--stat-cards-from)",
      to: "var(--stat-cards-to)",
      screen: "cards",
    },
    {
      label: "اسناد",
      value: documents.length,
      Icon: FileText,
      from: "var(--stat-docs-from)",
      to: "var(--stat-docs-to)",
      screen: "documents",
    },
    {
      label: "قبوض",
      value: bills.length,
      Icon: Receipt,
      from: "var(--stat-bills-from)",
      to: "var(--stat-bills-to)",
      screen: "bills",
    },
  ];

  const quickActions: { label: string; Icon: LucideIcon; screen: ScreenId }[] = [
    { label: "افزودن شخص", Icon: Users, screen: "people" },
    { label: "افزودن سند", Icon: FileText, screen: "documents" },
    { label: "افزودن کارت", Icon: CreditCard, screen: "cards" },
    { label: "افزودن رمز", Icon: Plus, screen: "passwords" },
  ];

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="روز مبادا"
        subtitle="خلاصهٔ وضعیت شما"
        status={{
          label:
            completion === 0
              ? "شروع کنید"
              : completion < 50
                ? "در حال تکمیل"
                : completion < 100
                  ? "نزدیک تکمیل"
                  : "تکمیل شد",
          tone: completion >= 100 ? "success" : "info",
        }}
      />

      <div className="px-4 -mt-4 space-y-5">
        {/* Completion progress */}
        <AppCard asDiv className="!p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-soft">میزان تکمیل مخزن</span>
            <span className="text-sm font-bold text-brand-text">
              {completion}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-violet-100 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full brand-gradient transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="text-[10px] text-faint mt-2">
            با افزودن اطلاعات افراد، اسناد و کارت‌ها، مخزن شما کامل‌تر می‌شود.
          </p>
        </AppCard>

        {/* Unpaid bills alert */}
        {unpaidBills.length > 0 && (
          <div className="surface-card rounded-card p-3 flex items-center gap-3 border border-amber-200/60 dark:border-amber-700/30">
            <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-strong">
                {unpaidBills.length} قبض پرداخت‌نشده
              </p>
              <p className="text-[10px] text-soft">برای پیگیری به قبوض مراجعه کنید</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("bills")}
              className="text-[10px] font-bold text-brand-text pressable px-2.5 py-1 rounded-full brand-bg-soft"
            >
              مشاهده
            </button>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, Icon, from, to, screen }) => (
            <AppCard
              key={label}
              onClick={() => onNavigate(screen)}
              className="!p-4 flex items-center gap-3"
            >
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
                }}
              >
                <Icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-2xl font-bold text-strong leading-none">
                  {value}
                </div>
                <div className="text-xs text-soft mt-1">{label}</div>
              </div>
            </AppCard>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <SectionTitle label="دسترسی سریع" />
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, Icon, screen }) => (
              <button
                key={label}
                type="button"
                onClick={() => onNavigate(screen)}
                className="surface-card rounded-card p-4 flex flex-col items-start gap-3 pressable text-right"
              >
                <div className="h-10 w-10 rounded-xl brand-gradient flex items-center justify-center text-white">
                  <Icon size={18} />
                </div>
                <span className="text-sm font-bold text-strong">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* People preview */}
        {people.length > 0 && (
          <div>
            <SectionTitle
              icon={<Users size={14} />}
              label="افراد"
              action={
                <button
                  type="button"
                  onClick={() => onNavigate("people")}
                  className="text-[10px] text-brand-text pressable"
                >
                  همه
                </button>
              }
            />
            <div className="space-y-2">
              {people.slice(0, 4).map((p) => (
                <AppCard
                  key={p.id}
                  onClick={() => {
                    useApp.getState().setActivePerson(p.id);
                    onNavigate("people");
                  }}
                  className="!p-3 flex items-center gap-3"
                >
                  <ProfileAvatar
                    name={p.fullName}
                    avatarDataUrl={p.avatarDataUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-strong truncate">
                      {p.fullName}
                    </div>
                    <div className="text-[10px] text-soft truncate">
                      {p.relation}
                    </div>
                  </div>
                  {p.phone && (
                    <a
                      href={`tel:${p.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 w-8 rounded-full brand-bg-soft text-brand-text flex items-center justify-center pressable"
                      aria-label="تماس"
                    >
                      <Phone size={14} />
                    </a>
                  )}
                </AppCard>
              ))}
            </div>
          </div>
        )}

        {/* Emergency contacts */}
        <div>
          <SectionTitle
            icon={<Phone size={14} />}
            label="اطلاعات تماس اضطراری"
          />
          <div className="grid grid-cols-2 gap-3">
            {contacts
              .slice()
              .sort((a, b) => a.priorityOrder - b.priorityOrder)
              .slice(0, 4)
              .map((c) => {
                const meta = EMERGENCY_META[c.phonePrimary] || {
                  label: c.name,
                  color: "from-violet-400 to-purple-600",
                };
                return (
                  <a
                    key={c.id}
                    href={`tel:${c.phonePrimary}`}
                    className="surface-card rounded-card p-3 flex items-center gap-3 pressable"
                  >
                    <div
                      className={`h-10 w-10 rounded-xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center`}
                    >
                      <Phone size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-strong truncate">
                        {c.name}
                      </div>
                      <div
                        dir="ltr"
                        className="text-[10px] text-soft font-mono truncate"
                      >
                        {c.phonePrimary}
                      </div>
                    </div>
                  </a>
                );
              })}
          </div>
        </div>

        <div className="h-2" />
      </div>
    </div>
  );
}
