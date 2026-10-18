"use client";

import { useMemo, useState } from "react";
import { CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { Sheet } from "@/components/shared/sheet";
import { ImageUploader } from "@/components/shared/image-uploader";
import { CopyableField, CopyChip } from "@/components/shared/copyable-field";
import type { BankCard } from "@/lib/types";

const BANKS = [
  "بانک ملت", "بانک ملی", "بانک صادرات", "بانک تجارت", "بانک سپه",
  "بانک کشاورزی", "بانک مسکن", "بانک توسعه تعاون", "بانک صنعت و معدن",
  "بانک توسعه صادرات", "بانک پاسارگاد", "بانک پارسیان", "بانک کارآفرین",
  "بانک سامان", "بانک اقتصاد نوین", "بانک سینا", "بانک سرمایه",
  "بانک تات", "بانک شهر", "بانک دی", "بانک پست بانک", "بانک رفاه",
  "بانک انصار", "بانک مهر اقتصاد", "بانک گردشگری", "بانک خاورمیانه",
  "بانک قرض‌الحسنه مهر", "بانک آینده", "بانک حکمت", "بانک ایران زمین",
  "بانک شاپرک",
];

// Bank-specific colors for card visual
const BANK_COLORS: Record<string, string> = {
  "بانک ملت": "from-blue-600 to-blue-800",
  "بانک ملی": "from-yellow-500 to-amber-700",
  "بانک صادرات": "from-blue-500 to-indigo-700",
  "بانک تجارت": "from-teal-600 to-cyan-800",
  "بانک سپه": "from-orange-500 to-red-700",
  "بانک کشاورزی": "from-green-600 to-emerald-800",
  "بانک مسکن": "from-amber-600 to-yellow-800",
  "بانک پاسارگاد": "from-violet-500 to-purple-700",
  "بانک پارسیان": "from-sky-500 to-blue-700",
  "بانک سامان": "from-emerald-500 to-teal-700",
  "بانک سینا": "from-rose-500 to-pink-700",
  "بانک شهر": "from-fuchsia-500 to-purple-700",
  "بانک دی": "from-cyan-500 to-blue-700",
  "بانک رفاه": "from-indigo-500 to-blue-700",
  "بانک انصار": "from-slate-600 to-gray-800",
  "بانک کارآفرین": "from-green-500 to-emerald-700",
  "بانک اقتصاد نوین": "from-blue-400 to-indigo-600",
};

function getBankColor(bankName: string): string {
  return BANK_COLORS[bankName] || "from-violet-500 to-purple-700";
}

function normalizeCardNumber(input: string): string {
  let v = (input || "").replace(/[^0-9]/g, "");
  if (v.length > 16) v = v.slice(0, 16);
  return v;
}
function normalizeCvv(input: string): string {
  let v = (input || "").replace(/[^0-9]/g, "");
  if (v.length > 4) v = v.slice(0, 4);
  return v;
}
function normalizeAccount(input: string): string {
  let v = (input || "").replace(/[^0-9]/g, "");
  if (v.length > 20) v = v.slice(0, 20);
  return v;
}
function normalizeShiba(input: string): string {
  let v = (input || "").replace(/[^0-9]/g, "");
  if (v.length > 24) v = v.slice(0, 24);
  return v;
}

function formatCardNumber(v: string): string {
  return v.replace(/(.{4})/g, "$1 ").trim();
}

interface FormState {
  id?: string;
  personId: string;
  bankName: string;
  cardNumber: string;
  accountNumber: string;
  shiba: string;
  cvv2: string;
  expiryMonth: string;
  expiryYear: string;
  cardHolderName: string;
  cardImageDataUrl?: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  personId: "",
  bankName: "بانک ملت",
  cardNumber: "",
  accountNumber: "",
  shiba: "",
  cvv2: "",
  expiryMonth: "",
  expiryYear: "",
  cardHolderName: "",
  notes: "",
};

export function CardsScreen() {
  const people = useApp((s) => s.people);
  const bankCards = useApp((s) => s.bankCards);
  const addBankCard = useApp((s) => s.addBankCard);
  const updateBankCard = useApp((s) => s.updateBankCard);
  const deleteBankCard = useApp((s) => s.deleteBankCard);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const personName = useMemo(
    () => (id: string) => people.find((p) => p.id === id)?.fullName || "نامشخص",
    [people],
  );

  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      personId: people[0]?.id || "",
    });
    setOpen(true);
  };

  const openEdit = (c: BankCard) => {
    setForm({
      id: c.id,
      personId: c.personId,
      bankName: c.bankName,
      cardNumber: c.cardNumber,
      accountNumber: c.accountNumber,
      shiba: c.shiba,
      cvv2: c.cvv2,
      expiryMonth: c.expiryMonth,
      expiryYear: c.expiryYear,
      cardHolderName: c.cardHolderName,
      cardImageDataUrl: c.cardImageDataUrl,
      notes: c.notes || "",
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.cardNumber.trim() || !form.personId) return;
    const personId = form.personId || people[0]?.id;
    if (!personId) return;
    const payload = {
      personId,
      bankName: form.bankName,
      cardNumber: normalizeCardNumber(form.cardNumber),
      accountNumber: normalizeAccount(form.accountNumber),
      shiba: normalizeShiba(form.shiba),
      cvv2: normalizeCvv(form.cvv2),
      expiryMonth: form.expiryMonth.trim(),
      expiryYear: form.expiryYear.trim(),
      cardHolderName: form.cardHolderName.trim(),
      cardImageDataUrl: form.cardImageDataUrl,
      notes: form.notes.trim() || undefined,
    };
    if (form.id) {
      updateBankCard(form.id, payload);
    } else {
      addBankCard(payload);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("این کارت حذف شود؟")) deleteBankCard(id);
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="کارت‌ها"
        subtitle={`${bankCards.length} کارت ثبت شده`}
        trailing={
          <button
            type="button"
            onClick={openAdd}
            className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center pressable"
            aria-label="افزودن کارت"
          >
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 -mt-4 space-y-3">
        {bankCards.length === 0 && (
          <AppCard asDiv className="!p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl brand-bg-soft text-brand-text flex items-center justify-center mb-3">
              <CreditCard size={22} />
            </div>
            <p className="text-sm font-bold text-strong mb-1">
              کارتی ثبت نشده
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="text-xs text-brand-text pressable"
            >
              افزودن کارت
            </button>
          </AppCard>
        )}

        {bankCards.map((c) => (
          <AppCard key={c.id} asDiv className="!p-4">
            {/* Card visual */}
            <div className={`relative rounded-card overflow-hidden p-4 bg-gradient-to-br ${getBankColor(c.bankName)} text-white`}>
              <div
                aria-hidden
                className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-white/15 blur-2xl"
              />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] opacity-80">بانک</div>
                    <div className="text-sm font-bold">{c.bankName}</div>
                  </div>
                  <CreditCard size={20} className="opacity-70" />
                </div>
                <div
                  dir="ltr"
                  className="font-mono tracking-[0.2em] text-base mt-6 text-right"
                >
                  {formatCardNumber(c.cardNumber)}
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div>
                    <div className="text-[9px] opacity-80">دارنده</div>
                    <div className="text-xs font-medium">
                      {c.cardHolderName || "—"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] opacity-80">انقضا</div>
                    <div dir="ltr" className="text-xs font-mono">
                      {c.expiryMonth}/{c.expiryYear}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] opacity-80">CVV2</div>
                    <div dir="ltr" className="text-xs font-mono">
                      {c.cvv2}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Below: shiba + account number */}
            <div className="mt-3 space-y-2">
              <div className="surface-input rounded-card-sm p-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] text-soft">شبا</div>
                  <div dir="ltr" className="text-xs font-mono text-strong truncate text-right">
                    {c.shiba ? `IR ${c.shiba}` : "—"}
                  </div>
                </div>
                {c.shiba && <CopyChip value={`IR${c.shiba}`} size={32} label="کپی شبا" />}
              </div>
              <div className="surface-input rounded-card-sm p-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] text-soft">شماره حساب</div>
                  <div dir="ltr" className="text-xs font-mono text-strong truncate text-right">
                    {c.accountNumber || "—"}
                  </div>
                </div>
                {c.accountNumber && <CopyChip value={c.accountNumber} size={32} label="کپی شماره حساب" />}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => openEdit(c)}
                className="flex-1 h-9 rounded-lg surface-input text-strong flex items-center justify-center gap-1.5 text-xs font-medium pressable"
              >
                <Pencil size={14} /> ویرایش
              </button>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                aria-label="حذف"
                className="h-9 w-9 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center pressable"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </AppCard>
        ))}
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "ویرایش کارت" : "افزودن کارت"}
        subtitle="اطلاعات کارت بانکی"
        footer={
          <button
            type="button"
            onClick={handleSave}
            disabled={!form.cardNumber.trim() || !form.personId}
            className="w-full h-11 rounded-full brand-gradient text-white font-bold text-sm pressable shadow-glow"
          >
            ذخیره
          </button>
        }
      >
        <div className="space-y-4 py-2">
          <Field label="شخص">
            <select
              value={form.personId}
              onChange={(e) =>
                setForm((f) => ({ ...f, personId: e.target.value }))
              }
            >
              <option value="">انتخاب کنید</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="نام بانک">
            <select
              value={form.bankName}
              onChange={(e) =>
                setForm((f) => ({ ...f, bankName: e.target.value }))
              }
            >
              {BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>

          <Field label="نام دارنده کارت">
            <input
              type="text"
              dir="rtl"
              value={form.cardHolderName}
              onChange={(e) =>
                setForm((f) => ({ ...f, cardHolderName: e.target.value }))
              }
              placeholder="نام و نام خانوادگی دارنده"
            />
          </Field>

          <Field label="شماره کارت">
            <input
              type="tel"
              dir="ltr"
              value={form.cardNumber}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  cardNumber: normalizeCardNumber(e.target.value),
                }))
              }
              placeholder="۱۶ رقم کارت"
              inputMode="numeric"
              maxLength={16}
              className="text-right font-mono"
            />
          </Field>

          <div className="grid grid-cols-3 gap-2">
            <Field label="ماه انقضا">
              <input
                type="tel"
                dir="ltr"
                value={form.expiryMonth}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^0-9]/g, "");
                  if (v.length > 2) v = v.slice(0, 2);
                  setForm((f) => ({ ...f, expiryMonth: v }));
                }}
                placeholder="MM"
                inputMode="numeric"
                maxLength={2}
                className="text-right font-mono"
              />
            </Field>
            <Field label="سال انقضا">
              <input
                type="tel"
                dir="ltr"
                value={form.expiryYear}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^0-9]/g, "");
                  if (v.length > 2) v = v.slice(0, 2);
                  setForm((f) => ({ ...f, expiryYear: v }));
                }}
                placeholder="YY"
                inputMode="numeric"
                maxLength={2}
                className="text-right font-mono"
              />
            </Field>
            <Field label="CVV2">
              <input
                type="tel"
                dir="ltr"
                value={form.cvv2}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cvv2: normalizeCvv(e.target.value) }))
                }
                placeholder="CVV2"
                inputMode="numeric"
                maxLength={4}
                className="text-right font-mono"
              />
            </Field>
          </div>

          <Field label="شماره حساب">
            <input
              type="tel"
              dir="ltr"
              value={form.accountNumber}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  accountNumber: normalizeAccount(e.target.value),
                }))
              }
              placeholder="شماره حساب"
              inputMode="numeric"
              className="text-right font-mono"
            />
          </Field>

          <Field label="شماره شبا (بدون IR)">
            <input
              type="tel"
              dir="ltr"
              value={form.shiba}
              onChange={(e) =>
                setForm((f) => ({ ...f, shiba: normalizeShiba(e.target.value) }))
              }
              placeholder="۲۴ رقم شبا"
              inputMode="numeric"
              maxLength={24}
              className="text-right font-mono"
            />
          </Field>

          <Field label="عکس کارت">
            <ImageUploader
              value={form.cardImageDataUrl}
              onChange={(url) =>
                setForm((f) => ({ ...f, cardImageDataUrl: url }))
              }
            />
          </Field>

          <Field label="یادداشت">
            <textarea
              dir="rtl"
              rows={3}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="توضیحات..."
            />
          </Field>
        </div>
      </Sheet>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-soft block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
