"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard } from "@/components/shared/ui";
import { CopyChip } from "@/components/shared/copyable-field";
import { MultiImageUploader } from "@/components/shared/multi-image-uploader";
import { Sheet } from "@/components/shared/sheet";
import { toPersian } from "@/lib/persian";
import {
  Plus, Pencil, Trash2, CreditCard, ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BankCard as BankCardType } from "@/lib/types";

const BANKS = [
  "ملی", "ملت", "صادرات", "تجارت", "سپه", "کشاورزی", "مسکن",
  "پاسارگاد", "سینا", "شهر", "گردشگری", "اقتصاد نوین", "پارسیان",
  "مهر اقتصاد", "سرمايه", "دانا", "سامان", "کاپیتال", "آینده",
  "رسالت", "صنعت و معدن", "خاورميانه", "تات", "قوامین", "انصار",
  "اينده", "ايرانيان", "مهر ايرانيان", "کارآفرین", "رفاه", "سایر",
];

export function CardsScreen() {
  const bankCards = useApp((s) => s.bankCards);
  const people = useApp((s) => s.people);
  const addBankCard = useApp((s) => s.addBankCard);
  const updateBankCard = useApp((s) => s.updateBankCard);
  const removeBankCard = useApp((s) => s.removeBankCard);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewingCard, setViewingCard] = useState<BankCardType | null>(null);
  const [form, setForm] = useState({
    personId: "",
    bankName: "",
    cardNumber: "",
    accountNumber: "",
    shaba: "",
    cvv2: "",
    expiryMonth: "",
    expiryYear: "",
    cardHolderName: "",
    imageUrls: [] as string[],
    notes: "",
  });

  const openAdd = () => {
    setForm({
      personId: people[0]?.id ?? "",
      bankName: "",
      cardNumber: "",
      accountNumber: "",
      shaba: "",
      cvv2: "",
      expiryMonth: "",
      expiryYear: "",
      cardHolderName: "",
      imageUrls: [],
      notes: "",
    });
    setEditingId(null);
    setSheetOpen(true);
  };

  useEffect(() => {
    const handler = () => {
      setForm({
        personId: people[0]?.id ?? "",
        bankName: "",
        cardNumber: "",
        accountNumber: "",
        shaba: "",
        cvv2: "",
        expiryMonth: "",
        expiryYear: "",
        cardHolderName: "",
        imageUrls: [],
        notes: "",
      });
      setEditingId(null);
      setSheetOpen(true);
    };
    window.addEventListener("rooz-fab-add", handler);
    return () => window.removeEventListener("rooz-fab-add", handler);
  }, [people]);

  const openEdit = (card: BankCardType) => {
    setForm({
      personId: card.personId,
      bankName: card.bankName,
      cardNumber: card.cardNumber,
      accountNumber: card.accountNumber,
      shiba: card.shiba,
      cvv2: card.cvv2,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cardHolderName: card.cardHolderName,
      imageUrls: card.cardImageDataUrl ? [card.cardImageDataUrl] : [],
      notes: card.notes ?? "",
    });
    setEditingId(card.id);
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!form.bankName.trim() || !form.personId) return;
    const data = {
      personId: form.personId,
      bankName: form.bankName.trim(),
      cardNumber: form.cardNumber.replace(/\D/g, "") || "—",
      accountNumber: form.accountNumber.replace(/\D/g, "") || "—",
      shiba: form.shiba.replace(/\s/g, "") || "—",
      cvv2: form.cvv2.replace(/\D/g, "") || "—",
      expiryMonth: form.expiryMonth,
      expiryYear: form.expiryYear,
      cardHolderName: form.cardHolderName.trim() || "—",
      cardImageDataUrl: form.imageUrls[0],
      notes: form.notes || undefined,
    };
    if (editingId) {
      updateBankCard(editingId, data);
    } else {
      addBankCard(data);
    }
    setSheetOpen(false);
  };

  const getPersonName = (id: string) => people.find((p) => p.id === id)?.fullName ?? "—";

  const formatCardNumber = (num: string) => {
    return num.replace(/(.{4})/g, "$1 ").trim();
  };

  return (
    <div className="flex flex-col bg-page min-h-full">
      <ScreenHeader
        title="کارت‌های بانکی"
        subtitle={`${toPersian(bankCards.length)} کارت`}
        icon={<CreditCard className="w-5 h-5 text-white" />}
        trailing={
          <button
            type="button"
            onClick={openAdd}
            disabled={people.length === 0}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-40"
            aria-label="افزودن کارت"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      {people.length === 0 ? (
        <div className="px-4 mt-8">
          <AppCard className="!p-6 text-center">
            <p className="text-sm text-soft">برای افزودن کارت، ابتدا یک فرد ثبت کنید.</p>
          </AppCard>
        </div>
      ) : (
        <div className="px-4 -mt-3 mb-4">
          {bankCards.length === 0 ? (
            <AppCard className="!p-6 text-center" onClick={openAdd}>
              <Plus className="w-8 h-8 mx-auto mb-2 brand-text" />
              <p className="text-sm font-bold text-strong">افزودن اولین کارت بانکی</p>
              <p className="text-[11px] text-soft mt-1">شماره کارت، حساب، شبا، CVV2</p>
            </AppCard>
          ) : (
            <div className="space-y-3">
              {bankCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {/* Card visual */}
                  <div className="rounded-2xl overflow-hidden shadow-glow mb-1">
                    <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-4 text-white">
                      {card.cardImageDataUrl && (
                        <img src={card.cardImageDataUrl} alt={card.bankName} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                      )}
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold opacity-90">{card.bankName}</span>
                          <span className="text-[9px] opacity-70">بانک</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-base font-mono tracking-widest fa-num" dir="ltr">
                            {formatCardNumber(card.cardNumber)}
                          </span>
                          <CopyChip value={card.cardNumber} label="شماره کارت" size="sm" />
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[9px] opacity-70">دارنده</p>
                            <p className="text-xs font-semibold">{card.cardHolderName}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-[9px] opacity-70">انقضا</p>
                            <p className="text-xs font-mono fa-num" dir="ltr">{card.expiryMonth}/{card.expiryYear}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-[9px] opacity-70">CVV2</p>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-mono fa-num" dir="ltr">{card.cvv2}</span>
                              <CopyChip value={card.cvv2} label="CVV2" size="sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional info */}
                  <AppCard className="!p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] text-soft">{getPersonName(card.personId)}</p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(card)}
                          className="w-7 h-7 rounded-lg brand-bg-soft brand-text flex items-center justify-center"
                          aria-label="ویرایش"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(card.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-soft w-16 shrink-0">شماره شبا:</span>
                        <span className="text-[11px] text-strong font-mono fa-num truncate flex-1" dir="ltr">{card.shiba}</span>
                        <CopyChip value={card.shiba} label="شبا" size="sm" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-soft w-16 shrink-0">شماره حساب:</span>
                        <span className="text-[11px] text-strong font-mono fa-num truncate flex-1" dir="ltr">{card.accountNumber}</span>
                        <CopyChip value={card.accountNumber} label="حساب" size="sm" />
                      </div>
                    </div>
                  </AppCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? "ویرایش کارت" : "افزودن کارت بانکی"}
        footer={
          <>
            <button type="button" onClick={() => setSheetOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button>
            <button type="button" onClick={handleSave} disabled={!form.bankName.trim() || !form.personId} className="flex-1 py-2.5 rounded-xl brand-gradient text-white text-sm font-bold shadow-glow disabled:opacity-40">ذخیره</button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="فرد">
            <select value={form.personId} onChange={(e) => setForm({ ...form, personId: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40">
              <option value="">انتخاب فرد...</option>
              {people.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          </Field>
          <Field label="بانک">
            <select value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40">
              <option value="">انتخاب بانک...</option>
              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="نام دارنده کارت">
            <input type="text" value={form.cardHolderName} onChange={(e) => setForm({ ...form, cardHolderName: e.target.value })} placeholder="نام و نام خانوادگی" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
          </Field>
          <Field label="شماره کارت (۱۶ رقم)">
            <input type="text" inputMode="numeric" dir="ltr" value={form.cardNumber} onChange={(e) => { let v = e.target.value.replace(/\D/g, ""); if (v.length > 16) v = v.slice(0, 16); setForm({ ...form, cardNumber: v }); }} placeholder="1234 5678 9012 3456" maxLength={16} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="شماره حساب">
              <input type="text" inputMode="numeric" dir="ltr" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder="شماره حساب" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" />
            </Field>
            <Field label="CVV2">
              <input type="text" inputMode="numeric" dir="ltr" value={form.cvv2} onChange={(e) => { let v = e.target.value.replace(/\D/g, ""); if (v.length > 4) v = v.slice(0, 4); setForm({ ...form, cvv2: v }); }} placeholder="123" maxLength={4} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" />
            </Field>
          </div>
          <Field label="شماره شبا (IR...)">
            <input type="text" dir="ltr" value={form.shiba} onChange={(e) => setForm({ ...form, shiba: e.target.value })} placeholder="IR000000000000000000000000" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ماه انقضا">
              <input type="text" inputMode="numeric" dir="ltr" value={form.expiryMonth} onChange={(e) => { let v = e.target.value.replace(/\D/g, ""); if (v.length > 2) v = v.slice(0, 2); setForm({ ...form, expiryMonth: v }); }} placeholder="12" maxLength={2} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-center fa-num" />
            </Field>
            <Field label="سال انقضا">
              <input type="text" inputMode="numeric" dir="ltr" value={form.expiryYear} onChange={(e) => { let v = e.target.value.replace(/\D/g, ""); if (v.length > 2) v = v.slice(0, 2); setForm({ ...form, expiryYear: v }); }} placeholder="27" maxLength={2} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-center fa-num" />
            </Field>
          </div>
          <MultiImageUploader images={form.imageUrls} onChange={(imgs) => setForm({ ...form, imageUrls: imgs })} label="عکس کارت" maxImages={2} />
          <Field label="یادداشت">
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="توضیحات..." rows={2} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none" />
          </Field>
        </div>
      </Sheet>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmId(null)} className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="surface-card rounded-3xl p-5 max-w-xs w-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 mx-auto mb-3 flex items-center justify-center"><Trash2 className="w-6 h-6 text-red-500" /></div>
              <p className="text-sm font-bold text-strong mb-1">حذف کارت؟</p>
              <p className="text-[11px] text-soft mb-4">این عمل قابل بازگشت نیست.</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button>
                <button type="button" onClick={() => { removeBankCard(deleteConfirmId); setDeleteConfirmId(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">حذف</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-soft mb-1.5">{label}</label>
      {children}
    </div>
  );
}
