"use client";

import { useMemo } from "react";
import {
  ArrowRight,
  CreditCard,
  FileText,
  Hash,
  KeyRound,
  Phone,
  Receipt,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { CopyableField } from "@/components/shared/copyable-field";

export function PersonProfile({
  personId,
  onBack,
}: {
  personId: string;
  onBack: () => void;
}) {
  const person = useApp((s) => s.people.find((p) => p.id === personId) || null);
  const bankCards = useApp((s) => s.bankCards);
  const documents = useApp((s) => s.documents);
  const bills = useApp((s) => s.bills);
  const credentials = useApp((s) => s.credentials);

  // CRITICAL: use useMemo to avoid infinite re-render with inline filter
  const personCards = useMemo(
    () => bankCards.filter((c) => c.personId === personId),
    [bankCards, personId],
  );
  const personDocs = useMemo(
    () => documents.filter((d) => d.personId === personId),
    [documents, personId],
  );
  const personBills = useMemo(
    () => bills.filter((b) => b.personId === personId),
    [bills, personId],
  );
  const personCredentials = useMemo(
    () => credentials.filter((c) => c.personId === personId),
    [credentials, personId],
  );

  if (!person) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="شخص پیدا نشد" />
        <div className="p-6">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-full brand-bg-soft text-brand-text text-sm pressable"
          >
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "کارت", value: personCards.length, Icon: CreditCard, color: "from-pink-400 to-rose-600" },
    { label: "سند", value: personDocs.length, Icon: FileText, color: "from-emerald-400 to-green-600" },
    { label: "قبض", value: personBills.length, Icon: Receipt, color: "from-amber-400 to-orange-600" },
    { label: "رمز", value: personCredentials.length, Icon: KeyRound, color: "from-violet-400 to-purple-600" },
  ];

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title={person.fullName}
        subtitle={person.relation}
        trailing={
          <button
            type="button"
            onClick={onBack}
            aria-label="بازگشت"
            className="h-9 w-9 rounded-full bg-white/20 text-white flex items-center justify-center pressable"
          >
            <ArrowRight size={18} />
          </button>
        }
      />

      <div className="px-4 -mt-6 space-y-5">
        {/* Profile header card */}
        <AppCard asDiv className="!p-4 flex items-center gap-3">
          <ProfileAvatar
            name={person.fullName}
            avatarDataUrl={person.avatarDataUrl}
            size="lg"
            ring
          />
          <div className="min-w-0 flex-1">
            <div className="text-base font-bold text-strong truncate">
              {person.fullName}
            </div>
            <div className="text-xs text-soft truncate">{person.relation}</div>
            {person.phone && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  dir="ltr"
                  className="text-xs font-mono text-strong"
                >
                  {person.phone}
                </span>
                <a
                  href={`tel:${person.phone}`}
                  className="h-6 w-6 rounded-full brand-bg-soft text-brand-text flex items-center justify-center"
                  aria-label="تماس"
                >
                  <Phone size={12} />
                </a>
              </div>
            )}
          </div>
        </AppCard>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map(({ label, value, Icon, color }) => (
            <div
              key={label}
              className="surface-card rounded-card p-2.5 flex flex-col items-center gap-1"
            >
              <div
                className={`h-8 w-8 rounded-lg bg-gradient-to-br ${color} text-white flex items-center justify-center`}
              >
                <Icon size={14} />
              </div>
              <span className="text-base font-bold text-strong">{value}</span>
              <span className="text-[10px] text-soft">{label}</span>
            </div>
          ))}
        </div>

        {/* Personal info */}
        <div>
          <SectionTitle icon={<Hash size={14} />} label="اطلاعات شخصی" />
          <div className="space-y-2">
            {person.birthDateJalali && (
              <CopyableField
                label="تاریخ تولد"
                value={person.birthDateJalali}
                dir="ltr"
              />
            )}
            {person.bloodType && (
              <CopyableField
                label="گروه خونی"
                value={person.bloodType}
                dir="ltr"
              />
            )}
            {person.nationalId && (
              <CopyableField
                label="کد ملی"
                value={person.nationalId}
                dir="ltr"
                mono
              />
            )}
            {person.phone && (
              <CopyableField
                label="شماره موبایل"
                value={person.phone}
                dir="ltr"
                mono
              />
            )}
            {person.notes && (
              <div className="surface-input rounded-card-sm p-3">
                <div className="text-[10px] text-soft mb-0.5">یادداشت</div>
                <div className="text-sm text-strong leading-relaxed">
                  {person.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bank cards */}
        {personCards.length > 0 && (
          <div>
            <SectionTitle
              icon={<CreditCard size={14} />}
              label="کارت‌های بانکی"
            />
            <div className="space-y-2">
              {personCards.map((c) => (
                <div key={c.id} className="space-y-2">
                  <div className="rounded-card p-3 brand-gradient text-white">
                    <div className="text-xs opacity-90">{c.bankName}</div>
                    <div
                      dir="ltr"
                      className="text-sm font-mono tracking-widest mt-1"
                    >
                      {c.cardNumber.replace(/(.{4})/g, "$1 ").trim()}
                    </div>
                    <div className="text-[10px] opacity-80 mt-1">
                      {c.cardHolderName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <CopyableField label="شبا" value={c.shiba} dir="ltr" mono />
                    <CopyableField
                      label="شماره حساب"
                      value={c.accountNumber}
                      dir="ltr"
                      mono
                    />
                    <CopyableField label="CVV2" value={c.cvv2} dir="ltr" mono />
                    <CopyableField
                      label="انقضا"
                      value={`${c.expiryMonth}/${c.expiryYear}`}
                      dir="ltr"
                      mono
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {personDocs.length > 0 && (
          <div>
            <SectionTitle icon={<FileText size={14} />} label="اسناد" />
            <div className="space-y-2">
              {personDocs.map((d) => (
                <AppCard key={d.id} asDiv className="!p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-strong truncate">
                        {d.title}
                      </div>
                      <div className="text-[10px] text-soft truncate">
                        {d.documentType || d.category}
                      </div>
                    </div>
                  </div>
                  {d.documentNumber && (
                    <div className="mt-2">
                      <CopyableField
                        label="شماره سند"
                        value={d.documentNumber}
                        dir="ltr"
                        mono
                      />
                    </div>
                  )}
                </AppCard>
              ))}
            </div>
          </div>
        )}

        {/* Credentials */}
        {personCredentials.length > 0 && (
          <div>
            <SectionTitle icon={<KeyRound size={14} />} label="رمزها" />
            <div className="space-y-2">
              {personCredentials.map((c) => (
                <AppCard key={c.id} asDiv className="!p-3">
                  <div className="text-sm font-bold text-strong mb-2">
                    {c.serviceName}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <CopyableField
                      label="نام کاربری"
                      value={c.username}
                      dir="ltr"
                      mono
                    />
                    <CopyableField
                      label="رمز عبور"
                      value={c.password}
                      dir="ltr"
                      mono
                    />
                  </div>
                </AppCard>
              ))}
            </div>
          </div>
        )}

        {/* Bills */}
        {personBills.length > 0 && (
          <div>
            <SectionTitle icon={<Receipt size={14} />} label="قبوض" />
            <div className="space-y-2">
              {personBills.map((b) => (
                <AppCard key={b.id} asDiv className="!p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-sm font-bold text-strong flex-1 truncate">
                      {b.provider || "قبض"}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        b.isPaid
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {b.isPaid ? "پرداخت شده" : "پرداخت نشده"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <CopyableField
                      label="شناسه قبض"
                      value={b.billId}
                      dir="ltr"
                      mono
                    />
                    <CopyableField
                      label="شناسه پرداخت"
                      value={b.paymentId}
                      dir="ltr"
                      mono
                    />
                  </div>
                </AppCard>
              ))}
            </div>
          </div>
        )}

        <div className="h-2" />
      </div>
    </div>
  );
}
