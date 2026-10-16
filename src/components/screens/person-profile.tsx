"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { CopyChip } from "@/components/shared/copyable-field";
import { AppCard } from "@/components/shared/ui";
import { toPersian, persianPhone } from "@/lib/persian";
import {
  ChevronRight, CreditCard, FileText, Receipt, KeyRound,
  Phone, MapPin, Calendar, Droplet, Pencil, Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Person } from "@/lib/types";

interface PersonProfileProps {
  person: Person;
  onBack: () => void;
  onEdit: () => void;
}

export function PersonProfile({ person, onBack, onEdit }: PersonProfileProps) {
  const bankCards = useApp((s) => s.bankCards.filter((c) => c.personId === person.id));
  const documents = useApp((s) => s.documents.filter((d) => d.personId === person.id));
  const bills = useApp((s) => s.bills.filter((b) => b.personId === person.id));
  const credentials = useApp((s) => s.credentials.filter((c) => c.personId === person.id));
  const contacts = useApp((s) => s.contacts);

  // Find emergency contacts associated with this person (by phone match)
  const personContacts = contacts.filter((c) => !c.isSystemEmergency);

  return (
    <div className="flex flex-col bg-page min-h-full">
      {/* Header with cover */}
      <div className="header-gradient px-5 pt-5 pb-16 rounded-b-3xl relative">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center mb-3 transition-colors"
          aria-label="بازگشت"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <ProfileAvatar
              name={person.fullName}
              avatarDataUrl={person.avatarDataUrl}
              size="xl"
              ring
            />
            <button
              type="button"
              onClick={onEdit}
              className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full brand-gradient text-white flex items-center justify-center shadow-glow border-2 border-white dark:border-slate-900"
              aria-label="ویرایش پروفایل"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{person.fullName}</h1>
            <p className="text-sm text-white/70">{person.relation}</p>
            {person.phone && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] text-white/60 fa-num" dir="ltr">
                  {persianPhone(person.phone)}
                </span>
                <CopyChip value={person.phone} label="شماره موبایل" size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-4 -mt-10 mb-5">
        <div className="grid grid-cols-4 gap-2">
          <StatCard icon={CreditCard} value={bankCards.length} label="کارت" color="from-blue-500 to-cyan-600" />
          <StatCard icon={FileText} value={documents.length} label="سند" color="from-emerald-500 to-teal-600" />
          <StatCard icon={Receipt} value={bills.length} label="قبض" color="from-amber-500 to-orange-600" />
          <StatCard icon={KeyRound} value={credentials.length} label="رمز" color="from-violet-500 to-purple-600" />
        </div>
      </div>

      {/* Personal info */}
      <section className="px-4 mb-5">
        <p className="text-xs font-bold text-soft mb-2.5 px-1">اطلاعات فردی</p>
        <AppCard className="!p-4">
          <div className="grid grid-cols-2 gap-3">
            <InfoField icon={Calendar} label="تاریخ تولد" value={person.birthDateJalali} faNum />
            <InfoField icon={Droplet} label="گروه خونی" value={person.bloodType} />
            <InfoField icon={FileText} label="کد ملی" value={person.nationalId} faNum dir="ltr" copyable />
            <InfoField icon={Phone} label="موبایل" value={person.phone} faNum dir="ltr" copyable />
          </div>
          {person.notes && (
            <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-white/5">
              <p className="text-[10px] text-soft mb-1">یادداشت</p>
              <p className="text-xs text-strong">{person.notes}</p>
            </div>
          )}
        </AppCard>
      </section>

      {/* Bank cards */}
      <section className="px-4 mb-5">
        <p className="text-xs font-bold text-soft mb-2.5 px-1 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          کارت‌های بانکی
          <span className="mr-auto text-[10px] fa-num">{toPersian(bankCards.length)}</span>
        </p>
        {bankCards.length === 0 ? (
          <EmptyCard label="کارت بانکی" />
        ) : (
          <div className="space-y-2">
            {bankCards.map((card) => (
              <AppCard key={card.id} className="!p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                    {card.bankName.slice(0, 2)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-strong truncate">{card.bankName}</p>
                    <p className="text-[10px] text-soft">{card.cardHolderName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm text-strong font-mono fa-num tracking-wider" dir="ltr">
                    {card.cardNumber.replace(/(.{4})/g, "$1 ")}
                  </span>
                  <CopyChip value={card.cardNumber} label="شماره کارت" size="sm" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1">
                    <span className="text-soft">شبا:</span>
                    <span className="text-strong font-mono fa-num truncate" dir="ltr">{card.shiba}</span>
                    <CopyChip value={card.shiba} label="شبا" size="sm" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-soft">CVV2:</span>
                    <span className="text-strong font-mono fa-num" dir="ltr">{card.cvv2}</span>
                    <CopyChip value={card.cvv2} label="CVV2" size="sm" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-soft">حساب:</span>
                    <span className="text-strong font-mono fa-num truncate" dir="ltr">{card.accountNumber}</span>
                    <CopyChip value={card.accountNumber} label="شماره حساب" size="sm" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-soft">انقضا:</span>
                    <span className="text-strong font-mono fa-num" dir="ltr">{card.expiryMonth}/{card.expiryYear}</span>
                  </div>
                </div>
              </AppCard>
            ))}
          </div>
        )}
      </section>

      {/* Documents */}
      <section className="px-4 mb-5">
        <p className="text-xs font-bold text-soft mb-2.5 px-1 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          مدارک
          <span className="mr-auto text-[10px] fa-num">{toPersian(documents.length)}</span>
        </p>
        {documents.length === 0 ? (
          <EmptyCard label="مدرک" />
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <AppCard key={doc.id} className="!p-3">
                <div className="flex items-start gap-2">
                  {doc.imageUrls[0] ? (
                    <img src={doc.imageUrls[0]} alt={doc.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <span className="w-10 h-10 rounded-lg brand-bg-soft flex items-center justify-center text-lg shrink-0">📄</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-strong truncate">{doc.title}</p>
                    {doc.documentType && <p className="text-[10px] text-soft">{doc.documentType}</p>}
                    <div className="flex items-center gap-1.5 mt-1">
                      {doc.documentNumber && (
                        <>
                          <span className="text-[10px] text-soft">شماره:</span>
                          <span className="text-[10px] text-strong font-mono fa-num" dir="ltr">{doc.documentNumber}</span>
                          <CopyChip value={doc.documentNumber} label="شماره سند" size="sm" />
                        </>
                      )}
                      {doc.imageUrls.length > 1 && (
                        <span className="mr-auto text-[9px] text-soft fa-num">
                          {toPersian(doc.imageUrls.length)} تصویر
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </AppCard>
            ))}
          </div>
        )}
      </section>

      {/* Credentials */}
      {credentials.length > 0 && (
        <section className="px-4 mb-5">
          <p className="text-xs font-bold text-soft mb-2.5 px-1 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            رمزهای عبور
            <span className="mr-auto text-[10px] fa-num">{toPersian(credentials.length)}</span>
          </p>
          <div className="space-y-2">
            {credentials.map((cr) => (
              <AppCard key={cr.id} className="!p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-9 h-9 rounded-lg brand-bg-soft flex items-center justify-center text-base">🔐</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-strong truncate">{cr.serviceName}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-soft w-14">نام کاربری</span>
                    <span className="text-[11px] text-strong font-mono truncate flex-1" dir="ltr">{cr.username}</span>
                    <CopyChip value={cr.username} label="نام کاربری" size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-soft w-14">گذرواژه</span>
                    <span className="text-[11px] text-strong font-mono flex-1" dir="ltr">••••••••</span>
                    <CopyChip value={cr.password} label="گذرواژه" size="sm" />
                  </div>
                </div>
              </AppCard>
            ))}
          </div>
        </section>
      )}

      {/* Bills */}
      {bills.length > 0 && (
        <section className="px-4 mb-5">
          <p className="text-xs font-bold text-soft mb-2.5 px-1 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5" />
            قبوض
            <span className="mr-auto text-[10px] fa-num">{toPersian(bills.length)}</span>
          </p>
          <div className="space-y-2">
            {bills.map((bill) => (
              <AppCard key={bill.id} className="!p-3">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-base">
                    {bill.billType === "water" ? "💧" : bill.billType === "electricity" ? "⚡" : bill.billType === "gas" ? "🔥" : "📄"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-strong truncate">{bill.provider}</p>
                    <p className="text-[10px] text-soft fa-num">شناسه قبض: {bill.billId}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${bill.isPaid ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"}`}>
                    {bill.isPaid ? "پرداخت‌شده" : "پرداخت‌نشده"}
                  </span>
                </div>
                {bill.amount && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] text-soft">مبلغ:</span>
                    <span className="text-[11px] text-strong font-bold fa-num">{toPersian(Number(bill.amount).toLocaleString("en-US"))} ریال</span>
                  </div>
                )}
              </AppCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }: { icon: typeof CreditCard; value: number; label: string; color: string }) {
  return (
    <div className="surface-card rounded-2xl p-2.5 text-center">
      <div className={`w-7 h-7 mx-auto rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-1`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <p className="text-sm font-bold text-strong fa-num">{toPersian(value)}</p>
      <p className="text-[9px] text-soft">{label}</p>
    </div>
  );
}

function InfoField({ icon: Icon, label, value, faNum, dir, copyable }: {
  icon: typeof Calendar; label: string; value?: string; faNum?: boolean; dir?: "rtl" | "ltr"; copyable?: boolean;
}) {
  if (!value) return null;
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] text-soft mb-0.5">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="flex items-center gap-1">
        <span className={`text-xs text-strong font-medium flex-1 truncate ${faNum ? "fa-num" : ""}`} dir={dir}>
          {value}
        </span>
        {copyable && <CopyChip value={value} label={label} size="sm" />}
      </div>
    </div>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <AppCard className="!p-5 text-center">
      <Plus className="w-6 h-6 mx-auto mb-1 brand-text" />
      <p className="text-[11px] text-soft">هنوز {label}‌ای ثبت نشده</p>
    </AppCard>
  );
}
