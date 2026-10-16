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
  Plus, Pencil, Trash2, FileText, IdCard, Car, Home, GraduationCap,
  ShieldCheck, HeartPulse, FileSignature, MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DocumentCategory, DocumentItem } from "@/lib/types";

const CATEGORIES: { id: DocumentCategory; label: string; icon: typeof FileText; color: string; types: string[] }[] = [
  { id: "identity", label: "مدارک شناسایی", icon: IdCard, color: "from-violet-500 to-purple-600", types: ["کارت ملی", "شناسنامه", "گذرنامه", "گواهینامه"] },
  { id: "vehicle", label: "مدارک خودرو", icon: Car, color: "from-blue-500 to-cyan-600", types: ["کارت خودرو", "سند خودرو", "بیمه‌نامه شخص ثالث", "بیمه بدنه"] },
  { id: "property", label: "مدارک ملکی", icon: Home, color: "from-emerald-500 to-teal-600", types: ["سند مالکیت", "قرارداد اجاره", "وکالت‌نامه"] },
  { id: "education", label: "مدارک تحصیلی", icon: GraduationCap, color: "from-amber-500 to-orange-600", types: ["گواهینامه تحصیلی", "لوح تقدیر", "مدرک زبان"] },
  { id: "insurance", label: "بیمه‌نامه‌ها", icon: ShieldCheck, color: "from-rose-500 to-pink-600", types: ["بیمه تامین اجتماعی", "بیمه ماشین", "بیمه درمانی", "بیمه آتش‌سوزی"] },
  { id: "medical", label: "مدارک پزشکی", icon: HeartPulse, color: "from-red-500 to-rose-600", types: ["پرونده پزشکی", "نسخه دارو", "آزمایش"] },
  { id: "contract", label: "قراردادها", icon: FileSignature, color: "from-indigo-500 to-blue-600", types: ["قرارداد کاری", "قرارداد خدمات"] },
  { id: "other", label: "سایر", icon: MoreHorizontal, color: "from-slate-500 to-gray-600", types: ["سایر"] },
];

const INSURANCE_TYPES = ["تامین اجتماعی", "بیمه ماشین", "بیمه درمانی", "بیمه آتش‌سوزی", "بیمه عمر", "سایر"];

export function DocumentsScreen() {
  const documents = useApp((s) => s.documents);
  const people = useApp((s) => s.people);
  const addDocument = useApp((s) => s.addDocument);
  const updateDocument = useApp((s) => s.updateDocument);
  const removeDocument = useApp((s) => s.removeDocument);

  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "all">("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const [viewingImageIndex, setViewingImageIndex] = useState(0);
  const [form, setForm] = useState({
    personId: "",
    title: "",
    category: "identity" as DocumentCategory,
    documentType: "",
    documentNumber: "",
    issueDateJalali: "",
    expiryDateJalali: "",
    physicalLocation: "",
    notes: "",
    imageUrls: [] as string[],
    // Vehicle fields
    licenseNumber: "",
    licenseSerial: "",
    licenseIssueDate: "",
    vinNumber: "",
    plateNumber: "",
    cardSerial: "",
    serialNumber: "",
    chassisNumber: "",
    engineNumber: "",
    // Property fields
    contractNumber: "",
    trackingCode: "",
    // Insurance fields
    insuranceNumber: "",
    insuranceType: "",
    insuranceDate: "",
  });

  const resetForm = () => {
    setForm({
      personId: people[0]?.id ?? "",
      title: "",
      category: activeCategory === "all" ? "identity" : activeCategory,
      documentType: "",
      documentNumber: "",
      issueDateJalali: "",
      expiryDateJalali: "",
      physicalLocation: "",
      notes: "",
      imageUrls: [],
      licenseNumber: "", licenseSerial: "", licenseIssueDate: "",
      vinNumber: "", plateNumber: "", cardSerial: "",
      serialNumber: "", chassisNumber: "", engineNumber: "",
      contractNumber: "", trackingCode: "",
      insuranceNumber: "", insuranceType: "", insuranceDate: "",
    });
  };

  useEffect(() => {
    const handler = () => {
      resetForm();
      setEditingId(null);
      setSheetOpen(true);
    };
    window.addEventListener("rooz-fab-add", handler);
    return () => window.removeEventListener("rooz-fab-add", handler);
  }, [people, activeCategory]);

  const openAdd = () => {
    resetForm();
    setEditingId(null);
    setSheetOpen(true);
  };

  const openEdit = (doc: DocumentItem) => {
    setForm({
      personId: doc.personId,
      title: doc.title,
      category: doc.category,
      documentType: doc.documentType ?? "",
      documentNumber: doc.documentNumber,
      issueDateJalali: doc.issueDateJalali ?? "",
      expiryDateJalali: doc.expiryDateJalali ?? "",
      physicalLocation: doc.physicalLocation ?? "",
      notes: doc.notes ?? "",
      imageUrls: doc.imageUrls,
      licenseNumber: doc.licenseNumber ?? "",
      licenseSerial: doc.licenseSerial ?? "",
      licenseIssueDate: doc.licenseIssueDate ?? "",
      vinNumber: doc.vinNumber ?? "",
      plateNumber: doc.plateNumber ?? "",
      cardSerial: doc.cardSerial ?? "",
      serialNumber: doc.serialNumber ?? "",
      chassisNumber: doc.chassisNumber ?? "",
      engineNumber: doc.engineNumber ?? "",
      contractNumber: doc.contractNumber ?? "",
      trackingCode: doc.trackingCode ?? "",
      insuranceNumber: doc.insuranceNumber ?? "",
      insuranceType: doc.insuranceType ?? "",
      insuranceDate: doc.insuranceDate ?? "",
    });
    setEditingId(doc.id);
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.personId) return;
    const data: Omit<DocumentItem, "id" | "createdAt"> = {
      personId: form.personId,
      title: form.title.trim(),
      category: form.category,
      documentType: form.documentType || undefined,
      documentNumber: form.documentNumber || "—",
      issueDateJalali: form.issueDateJalali || undefined,
      expiryDateJalali: form.expiryDateJalali || undefined,
      physicalLocation: form.physicalLocation || undefined,
      notes: form.notes || undefined,
      imageUrls: form.imageUrls,
      // Vehicle fields
      licenseNumber: form.licenseNumber || undefined,
      licenseSerial: form.licenseSerial || undefined,
      licenseIssueDate: form.licenseIssueDate || undefined,
      vinNumber: form.vinNumber || undefined,
      plateNumber: form.plateNumber || undefined,
      cardSerial: form.cardSerial || undefined,
      serialNumber: form.serialNumber || undefined,
      chassisNumber: form.chassisNumber || undefined,
      engineNumber: form.engineNumber || undefined,
      // Property fields
      contractNumber: form.contractNumber || undefined,
      trackingCode: form.trackingCode || undefined,
      // Insurance fields
      insuranceNumber: form.insuranceNumber || undefined,
      insuranceType: form.insuranceType || undefined,
      insuranceDate: form.insuranceDate || undefined,
    };
    if (editingId) {
      updateDocument(editingId, data);
    } else {
      addDocument(data);
    }
    setSheetOpen(false);
  };

  const filteredDocs = activeCategory === "all"
    ? documents
    : documents.filter((d) => d.category === activeCategory);

  const getPersonName = (id: string) => people.find((p) => p.id === id)?.fullName ?? "—";

  return (
    <div className="flex flex-col bg-page min-h-full">
      <ScreenHeader
        title="مدارک"
        subtitle={`${toPersian(documents.length)} سند`}
        icon={<FileText className="w-5 h-5 text-white" />}
        trailing={
          <button
            type="button"
            onClick={openAdd}
            disabled={people.length === 0}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-40"
            aria-label="افزودن مدرک"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      {people.length === 0 ? (
        <div className="px-4 mt-8">
          <AppCard className="!p-6 text-center">
            <p className="text-sm text-soft">برای افزودن مدرک، ابتدا یک فرد ثبت کنید.</p>
          </AppCard>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Vertical category sidebar - scrollable */}
          <div className="w-24 shrink-0 border-l border-slate-200/50 dark:border-white/5 overflow-y-auto no-scrollbar bg-page">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`w-full p-2.5 flex flex-col items-center gap-1 transition-colors border-r-2 ${
                activeCategory === "all"
                  ? "brand-bg-soft brand-text border-r-brand-500"
                  : "text-soft border-r-transparent"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-[9px] font-bold">همه</span>
              <span className="text-[8px] opacity-60 fa-num">{toPersian(documents.length)}</span>
            </button>
            {CATEGORIES.map((cat) => {
              const count = documents.filter((d) => d.category === cat.id).length;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full p-2.5 flex flex-col items-center gap-1 transition-colors border-r-2 ${
                    activeCategory === cat.id
                      ? "brand-bg-soft brand-text border-r-brand-500"
                      : "text-soft border-r-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] font-bold text-center leading-tight">{cat.label}</span>
                  {count > 0 && <span className="text-[8px] opacity-60 fa-num">{toPersian(count)}</span>}
                </button>
              );
            })}
          </div>

          {/* Documents list */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4">
            {filteredDocs.length === 0 ? (
              <AppCard className="!p-6 text-center mt-4" onClick={openAdd}>
                <Plus className="w-8 h-8 mx-auto mb-2 brand-text" />
                <p className="text-sm font-bold text-strong">افزودن اولین مدرک</p>
                <p className="text-[11px] text-soft mt-1">کارت ملی، شناسنامه، سند، بیمه‌نامه...</p>
              </AppCard>
            ) : (
              <div className="space-y-2 pt-3">
                {filteredDocs.map((doc, i) => {
                  const cat = CATEGORIES.find((c) => c.id === doc.category);
                  const Icon = cat?.icon ?? FileText;
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <AppCard asDiv onClick={() => { setViewingDoc(doc); setViewingImageIndex(0); }} className="!p-3">
                        <div className="flex items-start gap-2">
                          {doc.imageUrls[0] ? (
                            <img src={doc.imageUrls[0]} alt={doc.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                          ) : (
                            <span className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat?.color} flex items-center justify-center text-white shrink-0`}>
                              <Icon className="w-5 h-5" />
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-strong truncate">{doc.title}</p>
                            {doc.documentType && <p className="text-[10px] text-soft">{doc.documentType}</p>}
                            <p className="text-[10px] text-soft mt-0.5">{getPersonName(doc.personId)}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {doc.documentNumber && doc.documentNumber !== "—" && (
                                <>
                                  <span className="text-[10px] text-soft">شماره:</span>
                                  <span className="text-[10px] text-strong font-mono fa-num" dir="ltr">{doc.documentNumber}</span>
                                  <CopyChip value={doc.documentNumber} label="شماره" size="sm" />
                                </>
                              )}
                              {doc.imageUrls.length > 1 && (
                                <span className="mr-auto text-[9px] text-soft fa-num">
                                  {toPersian(doc.imageUrls.length)} تصویر
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(doc); }} className="w-7 h-7 rounded-lg brand-bg-soft brand-text flex items-center justify-center" aria-label="ویرایش"><Pencil className="w-3 h-3" /></button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(doc.id); }} className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center" aria-label="حذف"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </AppCard>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? "ویرایش مدرک" : "افزودن مدرک جدید"}
        footer={
          <>
            <button type="button" onClick={() => setSheetOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button>
            <button type="button" onClick={handleSave} disabled={!form.title.trim() || !form.personId} className="flex-1 py-2.5 rounded-xl brand-gradient text-white text-sm font-bold shadow-glow disabled:opacity-40">ذخیره</button>
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
          <Field label="عنوان مدرک">
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثلاً: کارت ملی علی رضایی" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
          </Field>
          <Field label="دسته‌بندی">
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id} type="button" onClick={() => setForm({ ...form, category: cat.id })} className={`py-2 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center gap-1 ${form.category === cat.id ? "brand-gradient text-white border-transparent" : "surface-card text-strong border-transparent"}`}>
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </Field>
          {form.category && (
            <Field label="نوع مدرک">
              <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40">
                <option value="">انتخاب نوع...</option>
                {CATEGORIES.find((c) => c.id === form.category)?.types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="شماره مدرک">
              <input type="text" value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} placeholder="مثلاً: 0012345678" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num" />
            </Field>
            <Field label="تاریخ صدور (شمسی)">
              <input type="text" value={form.issueDateJalali} onChange={(e) => setForm({ ...form, issueDateJalali: e.target.value })} placeholder="۱۴۰۰/۰۱/۰۱" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="تاریخ انقضا (شمسی)">
              <input type="text" value={form.expiryDateJalali} onChange={(e) => setForm({ ...form, expiryDateJalali: e.target.value })} placeholder="۱۴۱۰/۰۱/۰۱" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num" />
            </Field>
            <Field label="محل نگهداری">
              <input type="text" value={form.physicalLocation} onChange={(e) => setForm({ ...form, physicalLocation: e.target.value })} placeholder="مثلاً: گاوصندوق" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
            </Field>
          </div>

          {/* Vehicle-specific fields */}
          {form.category === "vehicle" && (
            <div className="rounded-xl p-3 surface-card space-y-3">
              <p className="text-xs font-bold brand-text">اطلاعات خودرو</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="شماره گواهینامه"><input type="text" dir="ltr" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" /></Field>
                <Field label="سریال گواهینامه"><input type="text" dir="ltr" value={form.licenseSerial} onChange={(e) => setForm({ ...form, licenseSerial: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" /></Field>
                <Field label="تاریخ صدور گواهینامه"><input type="text" value={form.licenseIssueDate} onChange={(e) => setForm({ ...form, licenseIssueDate: e.target.value })} placeholder="۱۴۰۰/۰۱/۰۱" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num" /></Field>
                <Field label="VIN خودرو"><input type="text" dir="ltr" value={form.vinNumber} onChange={(e) => setForm({ ...form, vinNumber: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" /></Field>
                <Field label="شماره پلاک"><input type="text" dir="ltr" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} placeholder="۱۲ب۳۴۵-۶۸" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" /></Field>
                <Field label="سریال بارکد کارت ماشین"><input type="text" dir="ltr" value={form.cardSerial} onChange={(e) => setForm({ ...form, cardSerial: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" /></Field>
                <Field label="شماره مسلسل"><input type="text" dir="ltr" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" /></Field>
                <Field label="شماره شاسی"><input type="text" dir="ltr" value={form.chassisNumber} onChange={(e) => setForm({ ...form, chassisNumber: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" /></Field>
                <Field label="شماره موتور"><input type="text" dir="ltr" value={form.engineNumber} onChange={(e) => setForm({ ...form, engineNumber: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" /></Field>
              </div>
            </div>
          )}

          {/* Property-specific fields */}
          {form.category === "property" && (
            <div className="rounded-xl p-3 surface-card space-y-3">
              <p className="text-xs font-bold brand-text">اطلاعات ملکی</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="شماره قولنامه"><input type="text" dir="ltr" value={form.contractNumber} onChange={(e) => setForm({ ...form, contractNumber: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" /></Field>
                <Field label="کد رهگیری"><input type="text" dir="ltr" value={form.trackingCode} onChange={(e) => setForm({ ...form, trackingCode: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" /></Field>
              </div>
            </div>
          )}

          {/* Insurance-specific fields */}
          {form.category === "insurance" && (
            <div className="rounded-xl p-3 surface-card space-y-3">
              <p className="text-xs font-bold brand-text">اطلاعات بیمه</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="شماره بیمه"><input type="text" dir="ltr" value={form.insuranceNumber} onChange={(e) => setForm({ ...form, insuranceNumber: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left fa-num" /></Field>
                <Field label="نوع بیمه">
                  <select value={form.insuranceType} onChange={(e) => setForm({ ...form, insuranceType: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40">
                    <option value="">انتخاب...</option>
                    {INSURANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="تاریخ بیمه"><input type="text" value={form.insuranceDate} onChange={(e) => setForm({ ...form, insuranceDate: e.target.value })} placeholder="۱۴۰۰/۰۱/۰۱" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num" /></Field>
              </div>
            </div>
          )}

          <MultiImageUploader images={form.imageUrls} onChange={(imgs) => setForm({ ...form, imageUrls: imgs })} label="تصاویر مدرک (چندصفحه‌ای)" />
          <Field label="یادداشت">
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="توضیحات اضافی..." rows={2} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none" />
          </Field>
        </div>
      </Sheet>

      {/* Document viewer */}
      <Sheet
        open={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        title={viewingDoc?.title ?? ""}
        subtitle={viewingDoc ? `${getPersonName(viewingDoc.personId)} · ${viewingDoc.documentType ?? ""}` : undefined}
      >
        {viewingDoc && (
          <div className="space-y-3">
            {viewingDoc.imageUrls.length > 0 && (
              <div>
                <div className="relative rounded-2xl overflow-hidden surface-card">
                  <img src={viewingDoc.imageUrls[viewingImageIndex]} alt={viewingDoc.title} className="w-full h-64 object-contain" />
                  {viewingDoc.imageUrls.length > 1 && (
                    <>
                      <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/50 text-white text-[10px] font-bold fa-num">{toPersian(viewingImageIndex + 1)} / {toPersian(viewingDoc.imageUrls.length)}</span>
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                        {viewingDoc.imageUrls.map((_, i) => (
                          <button key={i} type="button" onClick={() => setViewingImageIndex(i)} className={`h-1.5 rounded-full transition-all ${i === viewingImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {viewingDoc.documentNumber && viewingDoc.documentNumber !== "—" && <InfoRow label="شماره" value={viewingDoc.documentNumber} copyable />}
              {viewingDoc.issueDateJalali && <InfoRow label="تاریخ صدور" value={viewingDoc.issueDateJalali} faNum />}
              {viewingDoc.expiryDateJalali && <InfoRow label="تاریخ انقضا" value={viewingDoc.expiryDateJalali} faNum />}
              {viewingDoc.physicalLocation && <InfoRow label="محل نگهداری" value={viewingDoc.physicalLocation} />}
            </div>
            {/* Vehicle fields in viewer */}
            {viewingDoc.category === "vehicle" && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                {viewingDoc.licenseNumber && <InfoRow label="گواهینامه" value={viewingDoc.licenseNumber} faNum />}
                {viewingDoc.licenseSerial && <InfoRow label="سریال گواهینامه" value={viewingDoc.licenseSerial} faNum />}
                {viewingDoc.licenseIssueDate && <InfoRow label="تاریخ گواهینامه" value={viewingDoc.licenseIssueDate} faNum />}
                {viewingDoc.vinNumber && <InfoRow label="VIN" value={viewingDoc.vinNumber} faNum />}
                {viewingDoc.plateNumber && <InfoRow label="پلاک" value={viewingDoc.plateNumber} faNum />}
                {viewingDoc.cardSerial && <InfoRow label="سریال کارت" value={viewingDoc.cardSerial} faNum />}
                {viewingDoc.serialNumber && <InfoRow label="مسلسل" value={viewingDoc.serialNumber} faNum />}
                {viewingDoc.chassisNumber && <InfoRow label="شاسی" value={viewingDoc.chassisNumber} faNum />}
                {viewingDoc.engineNumber && <InfoRow label="موتور" value={viewingDoc.engineNumber} faNum />}
              </div>
            )}
            {/* Property fields */}
            {viewingDoc.category === "property" && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                {viewingDoc.contractNumber && <InfoRow label="قولنامه" value={viewingDoc.contractNumber} faNum />}
                {viewingDoc.trackingCode && <InfoRow label="کد رهگیری" value={viewingDoc.trackingCode} faNum />}
              </div>
            )}
            {/* Insurance fields */}
            {viewingDoc.category === "insurance" && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                {viewingDoc.insuranceNumber && <InfoRow label="شماره بیمه" value={viewingDoc.insuranceNumber} faNum />}
                {viewingDoc.insuranceType && <InfoRow label="نوع بیمه" value={viewingDoc.insuranceType} />}
                {viewingDoc.insuranceDate && <InfoRow label="تاریخ بیمه" value={viewingDoc.insuranceDate} faNum />}
              </div>
            )}
            {viewingDoc.notes && (
              <div className="rounded-xl p-3 brand-bg-soft">
                <p className="text-[10px] text-soft mb-1">یادداشت</p>
                <p className="text-xs text-strong">{viewingDoc.notes}</p>
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmId(null)} className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="surface-card rounded-3xl p-5 max-w-xs w-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 mx-auto mb-3 flex items-center justify-center"><Trash2 className="w-6 h-6 text-red-500" /></div>
              <p className="text-sm font-bold text-strong mb-1">حذف مدرک؟</p>
              <p className="text-[11px] text-soft mb-4">این عمل قابل بازگشت نیست.</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button>
                <button type="button" onClick={() => { removeDocument(deleteConfirmId); setDeleteConfirmId(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">حذف</button>
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

function InfoRow({ label, value, faNum, copyable }: { label: string; value?: string; faNum?: boolean; copyable?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] text-soft">{label}</p>
      <div className="flex items-center gap-1">
        <span className={`text-xs text-strong font-medium flex-1 truncate ${faNum ? "fa-num" : ""}`} dir="ltr">{value}</span>
        {copyable && <CopyChip value={value} label={label} size="sm" />}
      </div>
    </div>
  );
}
