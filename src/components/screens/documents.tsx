"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Car, Trash2, Pencil, X } from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle, StatusBadge, FileAttachmentChip } from "@/components/shared/ui";
import { Sheet } from "@/components/shared/sheet";
import { ImageUploader, type UploadedImage } from "@/components/shared/image-uploader";
import { useApp, useActiveMember, useVisibleDocuments, useVisibleVehicles } from "@/lib/store";
import { toPersian } from "@/lib/persian";
import type { DocCategory, DocumentItem } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

type FilterId = "all" | DocCategory;

const FILTERS: { id: FilterId; label: string; emoji?: string }[] = [
  { id: "all", label: "همه" },
  { id: "identity", label: "هویتی" },
  { id: "insurance", label: "بیمه‌نامه", emoji: "🔴" },
  { id: "vehicle", label: "خودروها", emoji: "🚗" },
  { id: "property", label: "املاک" },
  { id: "medical", label: "پزشکی" },
];

const CATEGORY_EMOJI: Record<DocCategory, string> = {
  identity: "🪪",
  insurance: "🛡️",
  property: "🏠",
  medical: "🩺",
  vehicle: "🚗",
  other: "📄",
};

interface DocFormState {
  title: string;
  category: DocCategory;
  documentNumber: string;
  expiryJalali: string;
  physicalLocation: string;
  notes: string;
  isPrivate: boolean;
  image: UploadedImage | null;
}

const EMPTY_FORM: DocFormState = {
  title: "",
  category: "identity",
  documentNumber: "",
  expiryJalali: "",
  physicalLocation: "",
  notes: "",
  isPrivate: false,
  image: null,
};

function expiryTone(days: number | null) {
  if (days === null) return null;
  if (days < 0) return "expired" as const;
  if (days <= 30) return "expiring" as const;
  return "valid" as const;
}

export function DocumentsScreen() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DocFormState>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const documents = useVisibleDocuments();
  const vehicles = useVisibleVehicles();
  const activeMember = useActiveMember();
  const addDocument = useApp((s) => s.addDocument);
  const updateDocument = useApp((s) => s.updateDocument);
  const removeDocument = useApp((s) => s.removeDocument);

  // Listen for FAB add events
  useEffect(() => {
    const handler = () => {
      setForm(EMPTY_FORM);
      setEditingId(null);
      setSheetOpen(true);
    };
    window.addEventListener("rooz-fab-add", handler);
    return () => window.removeEventListener("rooz-fab-add", handler);
  }, []);

  const filteredDocs =
    filter === "all"
      ? documents
      : filter === "vehicle"
      ? []
      : documents.filter((d) => d.category === filter);

  const showVehicles = filter === "all" || filter === "vehicle";

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setSheetOpen(true);
  };

  const openEdit = (doc: DocumentItem) => {
    setForm({
      title: doc.title,
      category: doc.category,
      documentNumber: doc.documentNumber,
      expiryJalali: doc.expiryJalali ?? "",
      physicalLocation: doc.physicalLocation,
      notes: doc.notes ?? "",
      isPrivate: doc.isPrivate,
      image: null,
    });
    setEditingId(doc.id);
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !activeMember) return;
    if (editingId) {
      updateDocument(editingId, {
        title: form.title.trim(),
        category: form.category,
        documentNumber: form.documentNumber || "—",
        expiryJalali: form.expiryJalali || null,
        expiryDays: form.expiryJalali ? daysToNow(form.expiryJalali) : null,
        physicalLocation: form.physicalLocation || "—",
        notes: form.notes,
        isPrivate: form.isPrivate,
        attachmentStatus: form.image ? "cached" : "uploaded",
        attachmentLabel: form.image ? form.image.name : "بدون پیوست",
      });
    } else {
      addDocument({
        title: form.title.trim(),
        category: form.category,
        documentNumber: form.documentNumber || "—",
        issueJalali: "1405/07/23",
        expiryJalali: form.expiryJalali || null,
        expiryDays: form.expiryJalali ? daysToNow(form.expiryJalali) : null,
        physicalLocation: form.physicalLocation || "—",
        notes: form.notes,
        isPrivate: form.isPrivate,
        ownerName: activeMember.fullName,
        attachmentLabel: form.image ? form.image.name : "بدون پیوست",
        attachmentStatus: form.image ? "cached" : "uploaded",
        syncStatus: "pending",
      });
    }
    setSheetOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="مدارک و دارایی‌ها"
        subtitle={activeMember ? `پرونده ${activeMember.fullName}` : undefined}
        icon={<FileText className="w-5 h-5 text-white" />}
        trailing={
          <button
            type="button"
            onClick={openAdd}
            aria-label="افزودن مدرک جدید"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      {/* Counts summary */}
      <div className="px-4 -mt-3 mb-3">
        <div className="rounded-xl px-3 py-2 text-[11px] text-soft flex items-center justify-between bg-violet-500/5 border border-violet-500/15">
          <span>
            مجموع:{" "}
            <span className="fa-num font-semibold text-strong">
              {toPersian(documents.length + vehicles.length)}
            </span>{" "}
            مورد
          </span>
          <span className="fa-num text-soft">{toPersian(documents.length)} سند · {toPersian(vehicles.length)} خودرو</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
                filter === f.id
                  ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white border-transparent shadow-glow"
                  : "surface-card text-strong border-transparent hover:shadow-glow"
              }`}
            >
              {f.emoji && <span className="ml-1">{f.emoji}</span>}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles */}
      {showVehicles && (
        <section className="px-4 mb-5">
          <SectionTitle
            icon={<Car className="w-4 h-4" />}
            title="خودروها"
            action={
              <span className="text-[11px] text-soft fa-num">{toPersian(vehicles.length)} مورد</span>
            }
          />
          <div className="space-y-2.5">
            {vehicles.map((v) => {
              const tone = expiryTone(v.thirdPartyDaysToExpiry);
              return (
                <AppCard key={v.id} className="!p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-lg shrink-0">🚗</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-strong truncate">{v.title}</p>
                        <p className="text-[11px] text-soft fa-num">
                          پلاک: {toPersian(v.plate.twoDigits)} {v.plate.letter}{" "}
                          {toPersian(v.plate.threeDigits)} - ایران {toPersian(v.plate.iranCode)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge tone={v.syncStatus === "pending" ? "pending" : v.syncStatus === "conflict" ? "conflict" : "synced"} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] mb-2.5">
                    <div>
                      <span className="text-soft">شاسی: </span>
                      <span className="text-strong font-medium">{v.chassis}</span>
                    </div>
                    <div>
                      <span className="text-soft">بیمه: </span>
                      <span className="text-strong font-medium">{v.thirdPartyInsCompany}</span>
                    </div>
                  </div>
                  <div className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-[11px] mb-2 ${tone === "expired" || tone === "expiring" ? "bg-red-500/10 text-red-500 dark:text-red-300" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"}`}>
                    <span>بیمه شخص ثالث</span>
                    <span className="font-bold fa-num">
                      {tone === "expired" ? "منقضی" : tone === "expiring" ? `${toPersian(v.thirdPartyDaysToExpiry)} روز تا انقضا` : "معتبر"}
                      {" · "}
                      {v.thirdPartyExpiryJalali}
                    </span>
                  </div>
                  <FileAttachmentChip status={v.attachmentStatus} label="برگ سبز خودرو" />
                </AppCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Documents */}
      {filteredDocs.length > 0 && (
        <section className="px-4 mb-5">
          <SectionTitle
            icon={<FileText className="w-4 h-4" />}
            title="اسناد و مدارک"
            action={
              <span className="text-[11px] text-soft fa-num">{toPersian(filteredDocs.length)} مورد</span>
            }
          />
          <div className="space-y-2.5">
            {filteredDocs.map((d) => {
              const tone = expiryTone(d.expiryDays);
              return (
                <AppCard key={d.id} className="!p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-lg shrink-0">
                        {CATEGORY_EMOJI[d.category]}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-strong truncate">{d.title}</p>
                        <p className="text-[11px] text-soft">
                          {d.isPrivate ? "شخصی · " : "مشترک · "}
                          {d.ownerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(d)}
                        aria-label="ویرایش"
                        className="w-7 h-7 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 dark:text-violet-300 flex items-center justify-center transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(d.id)}
                        aria-label="حذف"
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] mb-2.5">
                    <div>
                      <span className="text-soft">شماره: </span>
                      <span className="text-strong font-medium fa-num">{d.documentNumber}</span>
                    </div>
                    <div>
                      <span className="text-soft">صادر: </span>
                      <span className="text-strong font-medium fa-num">{d.issueJalali}</span>
                    </div>
                    {d.expiryJalali && (
                      <div className="col-span-2">
                        <span className="text-soft">انقضا: </span>
                        <span className={`font-bold fa-num ${tone === "valid" ? "text-emerald-500 dark:text-emerald-300" : "text-red-500 dark:text-red-300"}`}>
                          {d.expiryJalali}
                          {tone === "valid" && " 🟢"}
                          {tone === "expiring" && " 🔴"}
                          {tone === "expired" && " ⛔"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-soft mb-2 flex items-start gap-1">
                    <span>📍</span>
                    <span>{d.physicalLocation}</span>
                  </div>

                  <FileAttachmentChip status={d.attachmentStatus} label={d.attachmentLabel} />
                </AppCard>
              );
            })}
          </div>
        </section>
      )}

      {filteredDocs.length === 0 && !showVehicles && (
        <div className="px-4 py-10 text-center text-soft text-sm">
          موردی در این دسته‌بندی وجود ندارد.
        </div>
      )}

      {/* Floating Add button when nothing is in current filter */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={openAdd}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-violet-500/40 text-violet-500 dark:text-violet-300 hover:bg-violet-500/5 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
        >
          <Plus className="w-4 h-4" />
          افزودن مدرک جدید
        </button>
      </div>

      {/* Add/Edit sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? "ویرایش مدرک" : "افزودن مدرک جدید"}
        subtitle={activeMember ? `ثبت در پرونده ${activeMember.fullName}` : undefined}
        footer={
          <>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shadow-glow disabled:opacity-40 hover:opacity-95 transition-opacity"
            >
              ذخیره
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="عنوان مدرک">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثلاً: کارت ملی هوشمند"
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </Field>

          <Field label="دسته‌بندی">
            <div className="grid grid-cols-3 gap-2">
              {(["identity", "insurance", "property", "medical", "vehicle", "other"] as DocCategory[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, category: c })}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.category === c
                      ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white border-transparent"
                      : "surface-card text-strong border-transparent"
                  }`}
                >
                  {CATEGORY_EMOJI[c]}{" "}
                  {c === "identity" ? "هویتی" : c === "insurance" ? "بیمه" : c === "property" ? "املاک" : c === "medical" ? "پزشکی" : c === "vehicle" ? "خودرو" : "سایر"}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="شماره سند">
              <input
                type="text"
                value={form.documentNumber}
                onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                placeholder="مثلاً: ۰۰۱۲۳۴۵۶۷۸"
                className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </Field>
            <Field label="تاریخ انقضا (شمسی)">
              <input
                type="text"
                value={form.expiryJalali}
                onChange={(e) => setForm({ ...form, expiryJalali: e.target.value })}
                placeholder="۱۴۰۶/۰۵/۰۱"
                className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num"
              />
            </Field>
          </div>

          <Field label="محل نگهداری فیزیکی">
            <input
              type="text"
              value={form.physicalLocation}
              onChange={(e) => setForm({ ...form, physicalLocation: e.target.value })}
              placeholder="مثلاً: گاوصندوق طبقه دوم"
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </Field>

          <Field label="یادداشت (اختیاری)">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="هر توضیح اضافی..."
              rows={2}
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
            />
          </Field>

          <ImageUploader
            value={form.image}
            onChange={(img) => setForm({ ...form, image: img })}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPrivate}
              onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
              className="w-4 h-4 rounded accent-violet-500"
            />
            <span className="text-xs text-soft">این مدرک خصوصی است (فقط برای من و مدیر خانواده)</span>
          </label>
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
            className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
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
              <p className="text-sm font-bold text-strong mb-1">حذف مدرک؟</p>
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
                    removeDocument(deleteConfirmId);
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

function daysToNow(jalaliInput: string): number {
  // Simple: assume today is around 1405/07/23 — diff by parsing into approx days.
  // For demo purposes only. Production would use the proper Jalali→Gregorian diff.
  try {
    const latin = jalaliInput.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
    const [y, m, d] = latin.split("/").map((x) => parseInt(x, 10));
    const todayDays = 1405 * 365 + 7 * 30 + 23;
    const targetDays = y * 365 + m * 30 + d;
    return targetDays - todayDays;
  } catch {
    return 365;
  }
}
