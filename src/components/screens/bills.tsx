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
  Plus, Pencil, Trash2, Receipt, Droplet, Zap, Flame, Phone, Smartphone,
  Wifi, MoreHorizontal, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BillType, Bill } from "@/lib/types";

const BILL_TYPES: { id: BillType; label: string; icon: typeof Receipt; color: string; emoji: string }[] = [
  { id: "water", label: "آب", icon: Droplet, color: "from-blue-500 to-cyan-600", emoji: "💧" },
  { id: "electricity", label: "برق", icon: Zap, color: "from-amber-500 to-yellow-600", emoji: "⚡" },
  { id: "gas", label: "گاز", icon: Flame, color: "from-orange-500 to-red-600", emoji: "🔥" },
  { id: "telephone", label: "تلفن ثابت", icon: Phone, color: "from-violet-500 to-purple-600", emoji: "📞" },
  { id: "mobile", label: "موبایل", icon: Smartphone, color: "from-emerald-500 to-teal-600", emoji: "📱" },
  { id: "internet", label: "اینترنت", icon: Wifi, color: "from-indigo-500 to-blue-600", emoji: "🌐" },
  { id: "other", label: "سایر", icon: MoreHorizontal, color: "from-slate-500 to-gray-600", emoji: "📄" },
];

export function BillsScreen() {
  const bills = useApp((s) => s.bills);
  const people = useApp((s) => s.people);
  const addBill = useApp((s) => s.addBill);
  const updateBill = useApp((s) => s.updateBill);
  const removeBill = useApp((s) => s.removeBill);

  const [activeType, setActiveType] = useState<BillType | "all">("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({
    personId: "",
    billType: "water" as BillType,
    provider: "",
    billId: "",
    paymentId: "",
    
    
    isPaid: false,
    imageUrls: [] as string[],
    notes: "",
  });

  const openAdd = () => {
    setForm({
      personId: people[0]?.id ?? "",
      billType: "water",
      provider: "",
      billId: "",
      paymentId: "",
      
      
      isPaid: false,
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
        billType: "water",
        provider: "",
        billId: "",
        paymentId: "",
        
        
        isPaid: false,
        imageUrls: [],
        notes: "",
      });
      setEditingId(null);
      setSheetOpen(true);
    };
    window.addEventListener("rooz-fab-add", handler);
    return () => window.removeEventListener("rooz-fab-add", handler);
  }, [people]);

  const openEdit = (bill: Bill) => {
    setForm({
      personId: bill.personId,
      billType: bill.billType,
      provider: bill.provider,
      billId: bill.billId,
      paymentId: bill.paymentId,
      isPaid: bill.isPaid,
      imageUrls: bill.imageDataUrl ? [bill.imageDataUrl] : [],
      notes: bill.notes ?? "",
    });
    setEditingId(bill.id);
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!form.provider.trim() || !form.personId) return;
    const data = {
      personId: form.personId,
      billType: form.billType,
      provider: form.provider.trim(),
      billId: form.billId || "—",
      paymentId: form.paymentId || "—",
      isPaid: form.isPaid,
      imageDataUrl: form.imageUrls[0],
      notes: form.notes || undefined,
    };
    if (editingId) {
      updateBill(editingId, data);
    } else {
      addBill(data);
    }
    setSheetOpen(false);
  };

  const filteredBills = activeType === "all"
    ? bills
    : bills.filter((b) => b.billType === activeType);

  const getPersonName = (id: string) => people.find((p) => p.id === id)?.fullName ?? "—";
  const unpaidCount = bills.filter((b) => !b.isPaid).length;

  return (
    <div className="flex flex-col bg-page min-h-full">
      <ScreenHeader
        title="قبوض"
        subtitle={`${toPersian(unpaidCount)} پرداخت‌نشده`}
        icon={<Receipt className="w-5 h-5 text-white" />}
        trailing={
          <button
            type="button"
            onClick={openAdd}
            disabled={people.length === 0}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-40"
            aria-label="افزودن قبض"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      {people.length === 0 ? (
        <div className="px-4 mt-8">
          <AppCard className="!p-6 text-center">
            <p className="text-sm text-soft">برای افزودن قبض، ابتدا یک فرد ثبت کنید.</p>
          </AppCard>
        </div>
      ) : (
        <>
          {/* Type tabs */}
          <div className="px-4 -mt-3 mb-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
              <button
                type="button"
                onClick={() => setActiveType("all")}
                className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
                  activeType === "all"
                    ? "brand-gradient text-white border-transparent shadow-glow"
                    : "surface-card text-strong border-transparent"
                }`}
              >
                همه
                <span className="mr-1 opacity-70 fa-num">{toPersian(bills.length)}</span>
              </button>
              {BILL_TYPES.map((bt) => {
                const count = bills.filter((b) => b.billType === bt.id).length;
                const Icon = bt.icon;
                return (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setActiveType(bt.id)}
                    className={`shrink-0 px-3 py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      activeType === bt.id
                        ? "brand-gradient text-white border-transparent shadow-glow"
                        : "surface-card text-strong border-transparent"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {bt.label}
                    {count > 0 && <span className="opacity-70 fa-num">{toPersian(count)}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bills list */}
          <div className="px-4 mb-4">
            {filteredBills.length === 0 ? (
              <AppCard className="!p-6 text-center" onClick={openAdd}>
                <Plus className="w-8 h-8 mx-auto mb-2 brand-text" />
                <p className="text-sm font-bold text-strong">افزودن اولین قبض</p>
                <p className="text-[11px] text-soft mt-1">آب، برق، گاز، تلفن...</p>
              </AppCard>
            ) : (
              <div className="space-y-2">
                {filteredBills.map((bill, i) => {
                  const bt = BILL_TYPES.find((t) => t.id === bill.billType);
                  return (
                    <motion.div
                      key={bill.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <AppCard className="!p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bt?.color} flex items-center justify-center text-white shrink-0`}>
                            {bt?.emoji ?? "📄"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-strong truncate">{bill.provider}</p>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                bill.isPaid ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
                              }`}>
                                {bill.isPaid ? "پرداخت‌شده" : "پرداخت‌نشده"}
                              </span>
                            </div>
                            <p className="text-[10px] text-soft">{getPersonName(bill.personId)}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(bill)}
                              className="w-7 h-7 rounded-lg brand-bg-soft brand-text flex items-center justify-center"
                              aria-label="ویرایش"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(bill.id)}
                              className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center"
                              aria-label="حذف"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="flex items-center gap-1">
                            <span className="text-soft">شناسه قبض:</span>
                            <span className="text-strong font-mono fa-num truncate" dir="ltr">{bill.billId}</span>
                            <CopyChip value={bill.billId} label="شناسه قبض" size="sm" />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-soft">پرداخت:</span>
                            <span className="text-strong font-mono fa-num truncate" dir="ltr">{bill.paymentId}</span>
                            <CopyChip value={bill.paymentId} label="شناسه پرداخت" size="sm" />
                          </div>
                        </div>
                      </AppCard>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? "ویرایش قبض" : "افزودن قبض جدید"}
        footer={
          <>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.provider.trim() || !form.personId}
              className="flex-1 py-2.5 rounded-xl brand-gradient text-white text-sm font-bold shadow-glow disabled:opacity-40"
            >
              ذخیره
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="فرد">
            <select
              value={form.personId}
              onChange={(e) => setForm({ ...form, personId: e.target.value })}
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="">انتخاب فرد...</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.fullName}</option>
              ))}
            </select>
          </Field>
          <Field label="نوع قبض">
            <div className="grid grid-cols-4 gap-2">
              {BILL_TYPES.map((bt) => (
                <button
                  key={bt.id}
                  type="button"
                  onClick={() => setForm({ ...form, billType: bt.id })}
                  className={`py-2 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center gap-1 ${
                    form.billType === bt.id
                      ? "brand-gradient text-white border-transparent"
                      : "surface-card text-strong border-transparent"
                  }`}
                >
                  <span className="text-base">{bt.emoji}</span>
                  {bt.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="شرکت/ارائه‌دهنده">
            <input
              type="text"
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              placeholder="مثلاً: آبفا، توانیر، شرکت گاز..."
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="شناسه قبض">
              <input
                type="text"
                value={form.billId}
                onChange={(e) => setForm({ ...form, billId: e.target.value })}
                placeholder="شناسه قبض"
                className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num"
              />
            </Field>
            <Field label="شناسه پرداخت">
              <input
                type="text"
                value={form.paymentId}
                onChange={(e) => setForm({ ...form, paymentId: e.target.value })}
                placeholder="شناسه پرداخت"
                className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num"
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPaid}
              onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
              className="w-4 h-4 rounded accent-violet-500"
            />
            <span className="text-xs text-soft">پرداخت‌شده</span>
          </label>
          <MultiImageUploader
            images={form.imageUrls}
            onChange={(imgs) => setForm({ ...form, imageUrls: imgs })}
            label="تصویر قبض"
            maxImages={3}
          />
          <Field label="یادداشت">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="توضیحات..."
              rows={2}
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
            />
          </Field>
        </div>
      </Sheet>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirmId(null)}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="surface-card rounded-3xl p-5 max-w-xs w-full text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 mx-auto mb-3 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm font-bold text-strong mb-1">حذف قبض؟</p>
              <p className="text-[11px] text-soft mb-4">این عمل قابل بازگشت نیست.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeBill(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  حذف
                </button>
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
