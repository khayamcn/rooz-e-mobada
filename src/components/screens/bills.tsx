"use client";

import { useMemo, useState } from "react";
import {
  Flame,
  Globe,
  Phone,
  Plus,
  Receipt,
  Smartphone,
  Trash2,
  Zap,
  Pencil,
  type LucideIcon,
  Droplets,
  FileText,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard } from "@/components/shared/ui";
import { Sheet } from "@/components/shared/sheet";
import { ImageUploader } from "@/components/shared/image-uploader";
import { CopyableField, CopyChip } from "@/components/shared/copyable-field";
import type { Bill, BillType } from "@/lib/types";

interface TypeDef {
  id: BillType | "all";
  label: string;
  Icon: LucideIcon;
  color: string;
}

const TYPES: TypeDef[] = [
  { id: "all", label: "همه", Icon: Receipt, color: "from-violet-400 to-purple-600" },
  { id: "water", label: "آب", Icon: Droplets, color: "from-cyan-400 to-blue-600" },
  { id: "electricity", label: "برق", Icon: Zap, color: "from-amber-400 to-yellow-600" },
  { id: "gas", label: "گاز", Icon: Flame, color: "from-orange-400 to-red-600" },
  { id: "telephone", label: "تلفن", Icon: Phone, color: "from-emerald-400 to-green-600" },
  { id: "mobile", label: "موبایل", Icon: Smartphone, color: "from-pink-400 to-rose-600" },
  { id: "internet", label: "اینترنت", Icon: Globe, color: "from-indigo-400 to-purple-600" },
  { id: "other", label: "سایر", Icon: FileText, color: "from-slate-400 to-slate-600" },
];

interface FormState {
  id?: string;
  personId: string;
  billType: BillType;
  provider: string;
  billId: string;
  paymentId: string;
  isPaid: boolean;
  imageDataUrl?: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  personId: "",
  billType: "electricity",
  provider: "",
  billId: "",
  paymentId: "",
  isPaid: false,
  notes: "",
};

export function BillsScreen() {
  const people = useApp((s) => s.people);
  const bills = useApp((s) => s.bills);
  const addBill = useApp((s) => s.addBill);
  const updateBill = useApp((s) => s.updateBill);
  const deleteBill = useApp((s) => s.deleteBill);

  const [activeType, setActiveType] = useState<BillType | "all">("all");
  const [open, setOpen] = useState(false);
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bills.length };
    for (const b of bills) {
      c[b.billType] = (c[b.billType] || 0) + 1;
    }
    return c;
  }, [bills]);

  const filtered = useMemo(
    () =>
      activeType === "all"
        ? bills
        : bills.filter((b) => b.billType === activeType),
    [bills, activeType],
  );

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

  const openEdit = (b: Bill) => {
    setForm({
      id: b.id,
      personId: b.personId,
      billType: b.billType,
      provider: b.provider,
      billId: b.billId,
      paymentId: b.paymentId,
      isPaid: b.isPaid,
      imageDataUrl: b.imageDataUrl,
      notes: b.notes || "",
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.billId.trim() && !form.paymentId.trim()) return;
    const personId = form.personId || people[0]?.id;
    if (!personId) return;
    const payload = {
      personId,
      billType: form.billType,
      provider: form.provider.trim(),
      billId: form.billId.trim(),
      paymentId: form.paymentId.trim(),
      isPaid: form.isPaid,
      imageDataUrl: form.imageDataUrl,
      notes: form.notes.trim() || undefined,
    };
    if (form.id) {
      updateBill(form.id, payload);
    } else {
      addBill(payload);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("این قبض حذف شود؟")) deleteBill(id);
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="قبوض"
        subtitle={`${bills.length} قبض ثبت شده`}
        trailing={
          <button
            type="button"
            onClick={openAdd}
            className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center pressable"
            aria-label="افزودن قبض"
          >
            <Plus size={20} />
          </button>
        }
      />

      <div className="flex flex-1 min-h-0">
        <aside
          dir="rtl"
          className="w-24 shrink-0 border-l border-violet-100/40 dark:border-white/5 overflow-y-auto no-scrollbar py-2"
        >
          {TYPES.map((t) => {
            const isActive = activeType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveType(t.id)}
                className={`w-full flex flex-col items-center gap-1 py-2.5 px-1 transition-colors ${
                  isActive ? "brand-bg-soft" : "hover:bg-violet-50/50 dark:hover:bg-white/5"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-lg bg-gradient-to-br ${t.color} text-white flex items-center justify-center`}
                >
                  <t.Icon size={15} />
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "text-brand-text" : "text-soft"
                  }`}
                >
                  {t.label}
                </span>
                <span className="text-[9px] text-faint">
                  {counts[t.id] || 0}
                </span>
              </button>
            );
          })}
        </aside>

        <div className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar">
          {filtered.length === 0 ? (
            <AppCard asDiv className="!p-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl brand-bg-soft text-brand-text flex items-center justify-center mb-3">
                <Receipt size={22} />
              </div>
              <p className="text-sm font-bold text-strong mb-1">
                قبضی در این دسته نیست
              </p>
              <button
                type="button"
                onClick={openAdd}
                className="text-xs text-brand-text pressable"
              >
                افزودن قبض
              </button>
            </AppCard>
          ) : (
            <div className="space-y-2">
              {filtered.map((b) => {
                const type = TYPES.find((t) => t.id === b.billType);
                return (
                  <AppCard key={b.id} asDiv className="!p-3">
                    <button
                      type="button"
                      onClick={() => setViewBill(b)}
                      className="w-full text-right flex items-center gap-3"
                    >
                      <div
                        className={`h-10 w-10 rounded-lg bg-gradient-to-br ${type?.color || "from-violet-400 to-purple-600"} text-white flex items-center justify-center shrink-0`}
                      >
                        {type?.Icon ? <type.Icon size={18} /> : <Receipt size={18} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-strong truncate">
                          {b.provider || type?.label || "قبض"}
                        </div>
                        <div className="text-[10px] text-soft truncate">
                          {personName(b.personId)}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                          b.isPaid
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {b.isPaid ? "پرداخت شده" : "پرداخت نشده"}
                      </span>
                    </button>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="surface-input rounded-card-sm p-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[10px] text-soft">شناسه قبض</div>
                          <div dir="ltr" className="text-xs font-mono text-strong truncate text-right">
                            {b.billId || "—"}
                          </div>
                        </div>
                        {b.billId && <CopyChip value={b.billId} size={28} label="کپی شناسه قبض" />}
                      </div>
                      <div className="surface-input rounded-card-sm p-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[10px] text-soft">شناسه پرداخت</div>
                          <div dir="ltr" className="text-xs font-mono text-strong truncate text-right">
                            {b.paymentId || "—"}
                          </div>
                        </div>
                        {b.paymentId && <CopyChip value={b.paymentId} size={28} label="کپی شناسه پرداخت" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => openEdit(b)}
                        className="flex-1 h-8 rounded-lg surface-input text-strong flex items-center justify-center gap-1.5 text-[11px] font-medium pressable"
                      >
                        <Pencil size={12} /> ویرایش
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        aria-label="حذف"
                        className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center pressable"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </AppCard>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "ویرایش قبض" : "افزودن قبض"}
        subtitle="اطلاعات قبض را وارد کنید"
        footer={
          <button
            type="button"
            onClick={handleSave}
            disabled={!form.billId.trim() && !form.paymentId.trim()}
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

          <Field label="نوع قبض">
            <div className="grid grid-cols-4 gap-2">
              {TYPES.filter((t) => t.id !== "all").map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, billType: t.id as BillType }))
                  }
                  className={`flex flex-col items-center gap-1 px-1 py-2 rounded-lg text-[10px] font-medium pressable ${
                    form.billType === t.id
                      ? "brand-gradient text-white"
                      : "surface-input text-soft"
                  }`}
                >
                  <t.Icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="ارائه‌دهنده">
            <input
              type="text"
              dir="rtl"
              value={form.provider}
              onChange={(e) =>
                setForm((f) => ({ ...f, provider: e.target.value }))
              }
              placeholder="مثلاً شرکت آب منطقه‌ای"
            />
          </Field>

          <Field label="شناسه قبض">
            <input
              type="tel"
              dir="ltr"
              value={form.billId}
              onChange={(e) => {
                let v = e.target.value.replace(/[^0-9]/g, "");
                if (v.length > 13) v = v.slice(0, 13);
                setForm((f) => ({ ...f, billId: v }));
              }}
              placeholder="شناسه قبض"
              inputMode="numeric"
              className="text-right font-mono"
            />
          </Field>

          <Field label="شناسه پرداخت">
            <input
              type="tel"
              dir="ltr"
              value={form.paymentId}
              onChange={(e) => {
                let v = e.target.value.replace(/[^0-9]/g, "");
                if (v.length > 13) v = v.slice(0, 13);
                setForm((f) => ({ ...f, paymentId: v }));
              }}
              placeholder="شناسه پرداخت"
              inputMode="numeric"
              className="text-right font-mono"
            />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPaid}
              onChange={(e) =>
                setForm((f) => ({ ...f, isPaid: e.target.checked }))
              }
              className="h-5 w-5 accent-violet-600"
            />
            <span className="text-sm text-strong">پرداخت شده</span>
          </label>

          <Field label="تصویر قبض">
            <ImageUploader
              value={form.imageDataUrl}
              onChange={(url) =>
                setForm((f) => ({ ...f, imageDataUrl: url }))
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

      <Sheet
        open={!!viewBill}
        onClose={() => setViewBill(null)}
        title={viewBill?.provider || "قبض"}
        subtitle={viewBill ? personName(viewBill.personId) : undefined}
      >
        {viewBill && (
          <div className="space-y-3 py-2">
            {viewBill.imageDataUrl && (
              <div className="rounded-card overflow-hidden border border-violet-200/40">
                <img
                  src={viewBill.imageDataUrl}
                  alt="تصویر قبض"
                  className="w-full max-h-72 object-contain bg-slate-100 dark:bg-slate-800"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-soft">وضعیت</span>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full ${
                  viewBill.isPaid
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                }`}
              >
                {viewBill.isPaid ? "پرداخت شده" : "پرداخت نشده"}
              </span>
            </div>
            <CopyableField
              label="شناسه قبض"
              value={viewBill.billId}
              dir="ltr"
              mono
            />
            <CopyableField
              label="شناسه پرداخت"
              value={viewBill.paymentId}
              dir="ltr"
              mono
            />
            {viewBill.notes && (
              <div className="surface-input rounded-card-sm p-3">
                <div className="text-[10px] text-soft mb-0.5">یادداشت</div>
                <div className="text-sm text-strong leading-relaxed">
                  {viewBill.notes}
                </div>
              </div>
            )}
          </div>
        )}
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
