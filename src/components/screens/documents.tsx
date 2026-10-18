"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Car,
  FileText,
  GraduationCap,
  HeartPulse,
  Home as HomeIcon,
  IdCard,
  Landmark,
  Pencil,
  Plus,
  Share2,
  Shield,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { Sheet } from "@/components/shared/sheet";
import { MultiImageUploader } from "@/components/shared/multi-image-uploader";
import { CopyableField } from "@/components/shared/copyable-field";
import type { DocumentCategory, DocumentItem } from "@/lib/types";

interface CategoryDef {
  id: DocumentCategory | "all";
  label: string;
  Icon: LucideIcon;
  color: string;
}

const CATEGORIES: CategoryDef[] = [
  { id: "all", label: "همه", Icon: FileText, color: "from-violet-400 to-purple-600" },
  { id: "identity", label: "هویت", Icon: IdCard, color: "from-violet-400 to-purple-600" },
  { id: "vehicle", label: "خودرو", Icon: Car, color: "from-blue-400 to-indigo-600" },
  { id: "property", label: "املاک", Icon: HomeIcon, color: "from-emerald-400 to-green-600" },
  { id: "education", label: "تحصیلی", Icon: GraduationCap, color: "from-cyan-400 to-teal-600" },
  { id: "insurance", label: "بیمه", Icon: Shield, color: "from-amber-400 to-orange-600" },
  { id: "medical", label: "پزشکی", Icon: HeartPulse, color: "from-rose-400 to-pink-600" },
  { id: "contract", label: "قرارداد", Icon: Landmark, color: "from-fuchsia-400 to-purple-600" },
  { id: "other", label: "سایر", Icon: Building2, color: "from-slate-400 to-slate-600" },
];

const INSURANCE_TYPES = [
  "بیمه شخص ثالث",
  "بیمه بدنه",
  "بیمه عمر",
  "بیمه درمان",
  "بیمه آتش‌سوزی",
  "بیمه مسئولیت",
  "سایر",
];

interface FormState {
  id?: string;
  personId: string;
  title: string;
  category: DocumentCategory;
  documentType: string;
  documentNumber: string;
  issueDateJalali: string;
  expiryDateJalali: string;
  physicalLocation: string;
  notes: string;
  imageUrls: string[];
  // Vehicle
  licenseNumber: string;
  licenseSerial: string;
  licenseIssueDate: string;
  vinNumber: string;
  plateNumber: string;
  cardSerial: string;
  serialNumber: string;
  chassisNumber: string;
  engineNumber: string;
  // Property
  contractNumber: string;
  trackingCode: string;
  // Insurance
  insuranceNumber: string;
  insuranceType: string;
  insuranceDate: string;
}

const EMPTY_FORM: FormState = {
  personId: "",
  title: "",
  category: "identity",
  documentType: "",
  documentNumber: "",
  issueDateJalali: "",
  expiryDateJalali: "",
  physicalLocation: "",
  notes: "",
  imageUrls: [],
  licenseNumber: "",
  licenseSerial: "",
  licenseIssueDate: "",
  vinNumber: "",
  plateNumber: "",
  cardSerial: "",
  serialNumber: "",
  chassisNumber: "",
  engineNumber: "",
  contractNumber: "",
  trackingCode: "",
  insuranceNumber: "",
  insuranceType: "",
  insuranceDate: "",
};

export function DocumentsScreen() {
  const people = useApp((s) => s.people);
  const documents = useApp((s) => s.documents);
  const addDocument = useApp((s) => s.addDocument);
  const updateDocument = useApp((s) => s.updateDocument);
  const deleteDocument = useApp((s) => s.deleteDocument);

  const [activeCat, setActiveCat] = useState<DocumentCategory | "all">("all");
  const [open, setOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<DocumentItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageIdx, setImageIdx] = useState(0);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: documents.length };
    for (const d of documents) {
      c[d.category] = (c[d.category] || 0) + 1;
    }
    return c;
  }, [documents]);

  const filtered = useMemo(
    () =>
      activeCat === "all"
        ? documents
        : documents.filter((d) => d.category === activeCat),
    [documents, activeCat],
  );

  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      personId: people[0]?.id || "",
    });
    setImageIdx(0);
    setOpen(true);
  };

  const openEdit = (d: DocumentItem) => {
    setForm({
      id: d.id,
      personId: d.personId,
      title: d.title,
      category: d.category,
      documentType: d.documentType || "",
      documentNumber: d.documentNumber,
      issueDateJalali: d.issueDateJalali || "",
      expiryDateJalali: d.expiryDateJalali || "",
      physicalLocation: d.physicalLocation || "",
      notes: d.notes || "",
      imageUrls: d.imageUrls || [],
      licenseNumber: d.licenseNumber || "",
      licenseSerial: d.licenseSerial || "",
      licenseIssueDate: d.licenseIssueDate || "",
      vinNumber: d.vinNumber || "",
      plateNumber: d.plateNumber || "",
      cardSerial: d.cardSerial || "",
      serialNumber: d.serialNumber || "",
      chassisNumber: d.chassisNumber || "",
      engineNumber: d.engineNumber || "",
      contractNumber: d.contractNumber || "",
      trackingCode: d.trackingCode || "",
      insuranceNumber: d.insuranceNumber || "",
      insuranceType: d.insuranceType || "",
      insuranceDate: d.insuranceDate || "",
    });
    setImageIdx(0);
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const personId = form.personId || people[0]?.id;
    if (!personId) return;
    const payload = {
      personId,
      title: form.title.trim(),
      category: form.category,
      documentType: form.documentType.trim() || undefined,
      documentNumber: form.documentNumber.trim(),
      issueDateJalali: form.issueDateJalali.trim() || undefined,
      expiryDateJalali: form.expiryDateJalali.trim() || undefined,
      physicalLocation: form.physicalLocation.trim() || undefined,
      notes: form.notes.trim() || undefined,
      imageUrls: form.imageUrls,
      licenseNumber: form.licenseNumber.trim() || undefined,
      licenseSerial: form.licenseSerial.trim() || undefined,
      licenseIssueDate: form.licenseIssueDate.trim() || undefined,
      vinNumber: form.vinNumber.trim() || undefined,
      plateNumber: form.plateNumber.trim() || undefined,
      cardSerial: form.cardSerial.trim() || undefined,
      serialNumber: form.serialNumber.trim() || undefined,
      chassisNumber: form.chassisNumber.trim() || undefined,
      engineNumber: form.engineNumber.trim() || undefined,
      contractNumber: form.contractNumber.trim() || undefined,
      trackingCode: form.trackingCode.trim() || undefined,
      insuranceNumber: form.insuranceNumber.trim() || undefined,
      insuranceType: form.insuranceType.trim() || undefined,
      insuranceDate: form.insuranceDate.trim() || undefined,
    };
    if (form.id) {
      updateDocument(form.id, payload);
    } else {
      addDocument(payload);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("این سند حذف شود؟")) deleteDocument(id);
  };

  const personName = (id: string) =>
    people.find((p) => p.id === id)?.fullName || "نامشخص";

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="اسناد"
        subtitle={`${documents.length} سند ثبت شده`}
        trailing={
          <button
            type="button"
            onClick={openAdd}
            className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center pressable"
            aria-label="افزودن سند"
          >
            <Plus size={20} />
          </button>
        }
      />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar — icon only, narrow strip */}
        <aside
          dir="rtl"
          className="w-14 shrink-0 border-l border-violet-100/40 dark:border-white/5 overflow-y-auto no-scrollbar py-2 flex flex-col items-center gap-1"
        >
          {/* All button */}
          <button
            type="button"
            onClick={() => setActiveCat("all")}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              activeCat === "all" ? "brand-bg-soft brand-text" : "text-soft hover:bg-violet-50/50 dark:hover:bg-white/5"
            }`}
            aria-label="همه"
          >
            <FileText size={18} />
          </button>
          <div className="w-8 h-px bg-violet-100/40 dark:bg-white/5 my-0.5" />
          {CATEGORIES.map((c) => {
            const isActive = activeCat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCat(c.id)}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? "brand-bg-soft" : "hover:bg-violet-50/50 dark:hover:bg-white/5"
                }`}
                aria-label={c.label}
              >
                <div
                  className={`h-7 w-7 rounded-lg bg-gradient-to-br ${c.color} text-white flex items-center justify-center`}
                >
                  <c.Icon size={14} />
                </div>
                {isActive && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full brand-gradient" />
                )}
                {counts[c.id] > 0 && (
                  <span className="absolute -top-0.5 -left-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-violet-500 text-white text-[8px] font-bold flex items-center justify-center">
                    {counts[c.id]}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Document list */}
        <div className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar">
          {/* Active category label */}
          <div className="px-1 pb-2 text-sm font-bold text-strong">
            {activeCat === "all"
              ? "همه"
              : CATEGORIES.find((c) => c.id === activeCat)?.label || "همه"}
          </div>
          {filtered.length === 0 ? (
            <AppCard asDiv className="!p-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl brand-bg-soft text-brand-text flex items-center justify-center mb-3">
                <FileText size={22} />
              </div>
              <p className="text-sm font-bold text-strong mb-1">
                سندی در این دسته نیست
              </p>
              <button
                type="button"
                onClick={openAdd}
                className="text-xs text-brand-text pressable"
              >
                افزودن سند
              </button>
            </AppCard>
          ) : (
            <div className="space-y-2">
              {filtered.map((d) => {
                const cat = CATEGORIES.find((c) => c.id === d.category);
                return (
                  <AppCard
                    key={d.id}
                    asDiv
                    className="!p-3"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setViewDoc(d);
                        setImageIdx(0);
                      }}
                      className="w-full text-right flex items-center gap-3"
                    >
                      <div
                        className={`h-10 w-10 rounded-lg bg-gradient-to-br ${cat?.color || "from-violet-400 to-purple-600"} text-white flex items-center justify-center shrink-0`}
                      >
                        {cat?.Icon ? <cat.Icon size={18} /> : <FileText size={18} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-strong truncate">
                          {d.title}
                        </div>
                        <div className="text-[10px] text-soft truncate">
                          {personName(d.personId)}
                          {d.documentType ? ` • ${d.documentType}` : ""}
                        </div>
                      </div>
                      {d.imageUrls.length > 0 && (
                        <div className="text-[10px] text-faint shrink-0">
                          {d.imageUrls.length} تصویر
                        </div>
                      )}
                    </button>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => openEdit(d)}
                        className="flex-1 h-8 rounded-lg surface-input text-strong flex items-center justify-center gap-1.5 text-[11px] font-medium pressable"
                      >
                        <Pencil size={12} /> ویرایش
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(d.id)}
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

      {/* Add/Edit sheet */}
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "ویرایش سند" : "افزودن سند"}
        subtitle="اطلاعات سند را وارد کنید"
        footer={
          <button
            type="button"
            onClick={handleSave}
            disabled={!form.title.trim() || !form.personId}
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

          <Field label="عنوان سند">
            <input
              type="text"
              dir="rtl"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="مثلاً شناسنامه"
            />
          </Field>

          <Field label="دسته‌بندی">
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, category: c.id as DocumentCategory }))
                  }
                  className={`flex items-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-medium pressable ${
                    form.category === c.id
                      ? "brand-gradient text-white"
                      : "surface-input text-soft"
                  }`}
                >
                  <c.Icon size={14} />
                  {c.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="نوع سند">
            <input
              type="text"
              dir="rtl"
              value={form.documentType}
              onChange={(e) =>
                setForm((f) => ({ ...f, documentType: e.target.value }))
              }
              placeholder="مثلاً شناسنامه، کارت ملی، سند خانه"
            />
          </Field>

          <Field label="شماره سند">
            <input
              type="text"
              dir="ltr"
              value={form.documentNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, documentNumber: e.target.value }))
              }
              placeholder="شماره سند"
              className="text-right font-mono"
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="تاریخ صدور">
              <input
                type="text"
                dir="ltr"
                value={form.issueDateJalali}
                onChange={(e) =>
                  setForm((f) => ({ ...f, issueDateJalali: e.target.value }))
                }
                placeholder="1370/01/15"
                className="text-right font-mono"
              />
            </Field>
            <Field label="تاریخ انقضا">
              <input
                type="text"
                dir="ltr"
                value={form.expiryDateJalali}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expiryDateJalali: e.target.value }))
                }
                placeholder="1410/01/15"
                className="text-right font-mono"
              />
            </Field>
          </div>

          <Field label="محل نگهداری">
            <input
              type="text"
              dir="rtl"
              value={form.physicalLocation}
              onChange={(e) =>
                setForm((f) => ({ ...f, physicalLocation: e.target.value }))
              }
              placeholder="مثلاً گاوصندوق خانه"
            />
          </Field>

          {/* Category-specific fields */}
          {form.category === "vehicle" && (
            <div className="space-y-3 p-3 rounded-card brand-bg-soft">
              <p className="text-xs font-bold text-brand-text">اطلاعات خودرو</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="شماره کارت">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.cardSerial}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cardSerial: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
                <Field label="سریال کارت">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.serialNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, serialNumber: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
                <Field label="شماره پلاک">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.plateNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, plateNumber: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
                <Field label="شماره شاسی">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.chassisNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, chassisNumber: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
                <Field label="شماره موتور">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.engineNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, engineNumber: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
                <Field label="شماره VIN">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.vinNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, vinNumber: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
                <Field label="شماره گواهی">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.licenseNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, licenseNumber: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
                <Field label="سریال گواهی">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.licenseSerial}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, licenseSerial: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
                <Field label="تاریخ صدور گواهی">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.licenseIssueDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, licenseIssueDate: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
              </div>
            </div>
          )}

          {form.category === "property" && (
            <div className="space-y-3 p-3 rounded-card brand-bg-soft">
              <p className="text-xs font-bold text-brand-text">اطلاعات ملک</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="شماره قرارداد">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.contractNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, contractNumber: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
                <Field label="کد رهگیری">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.trackingCode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, trackingCode: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
              </div>
            </div>
          )}

          {form.category === "insurance" && (
            <div className="space-y-3 p-3 rounded-card brand-bg-soft">
              <p className="text-xs font-bold text-brand-text">اطلاعات بیمه</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="شماره بیمه">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.insuranceNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, insuranceNumber: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
                <Field label="تاریخ بیمه">
                  <input
                    type="text"
                    dir="ltr"
                    value={form.insuranceDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, insuranceDate: e.target.value }))
                    }
                    className="text-right font-mono"
                  />
                </Field>
              </div>
              <Field label="نوع بیمه">
                <select
                  value={form.insuranceType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, insuranceType: e.target.value }))
                  }
                >
                  <option value="">انتخاب کنید</option>
                  {INSURANCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          <Field label="یادداشت">
            <textarea
              dir="rtl"
              rows={3}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="توضیحات اضافی..."
            />
          </Field>

          <MultiImageUploader
            value={form.imageUrls}
            onChange={(urls) =>
              setForm((f) => ({ ...f, imageUrls: urls }))
            }
            label="تصاویر سند"
          />
        </div>
      </Sheet>

      {/* Viewer */}
      <Sheet
        open={!!viewDoc}
        onClose={() => setViewDoc(null)}
        title={viewDoc?.title || "سند"}
        subtitle={viewDoc ? personName(viewDoc.personId) : undefined}
      >
        {viewDoc && (
          <div className="space-y-4 py-2">
            {viewDoc.imageUrls.length > 0 && (
              <div className="space-y-2">
                <div className="relative rounded-card overflow-hidden border border-violet-200/40">
                  <img
                    src={viewDoc.imageUrls[imageIdx]}
                    alt={`صفحه ${imageIdx + 1}`}
                    className="w-full max-h-72 object-contain bg-slate-100 dark:bg-slate-800"
                  />
                  {/* Share button */}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const dataUrl = viewDoc.imageUrls[imageIdx];
                        const res = await fetch(dataUrl);
                        const blob = await res.blob();
                        const file = new File([blob], `${viewDoc.title}-page${imageIdx + 1}.jpg`, { type: "image/jpeg" });
                        if (navigator.share && navigator.canShare({ files: [file] })) {
                          await navigator.share({ files: [file], title: viewDoc.title });
                        } else if (navigator.share) {
                          await navigator.share({ title: viewDoc.title, text: viewDoc.title });
                        } else {
                          // Fallback: download
                          const a = document.createElement("a");
                          a.href = dataUrl;
                          a.download = `${viewDoc.title}-page${imageIdx + 1}.jpg`;
                          a.click();
                        }
                      } catch {}
                    }}
                    className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    aria-label="اشتراک‌گذاری"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                {viewDoc.imageUrls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {viewDoc.imageUrls.map((u, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImageIdx(i)}
                        className={`h-12 w-12 rounded-lg overflow-hidden border-2 shrink-0 ${
                          imageIdx === i ? "border-violet-500" : "border-transparent"
                        }`}
                      >
                        <img src={u} alt={`thumbnail ${i + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {viewDoc.documentNumber && (
              <CopyableField
                label="شماره سند"
                value={viewDoc.documentNumber}
                dir="ltr"
                mono
              />
            )}
            {viewDoc.documentType && (
              <CopyableField
                label="نوع سند"
                value={viewDoc.documentType}
                dir="rtl"
              />
            )}
            {viewDoc.issueDateJalali && (
              <CopyableField
                label="تاریخ صدور"
                value={viewDoc.issueDateJalali}
                dir="ltr"
              />
            )}
            {viewDoc.expiryDateJalali && (
              <CopyableField
                label="تاریخ انقضا"
                value={viewDoc.expiryDateJalali}
                dir="ltr"
              />
            )}
            {viewDoc.physicalLocation && (
              <CopyableField
                label="محل نگهداری"
                value={viewDoc.physicalLocation}
                dir="rtl"
              />
            )}

            {/* Vehicle-specific in viewer */}
            {viewDoc.category === "vehicle" && (
              <div className="grid grid-cols-2 gap-2">
                {viewDoc.licenseNumber && (
                  <CopyableField label="شماره گواهی" value={viewDoc.licenseNumber} dir="ltr" mono />
                )}
                {viewDoc.licenseSerial && (
                  <CopyableField label="سریال گواهی" value={viewDoc.licenseSerial} dir="ltr" mono />
                )}
                {viewDoc.plateNumber && (
                  <CopyableField label="شماره پلاک" value={viewDoc.plateNumber} dir="ltr" mono />
                )}
                {viewDoc.chassisNumber && (
                  <CopyableField label="شماره شاسی" value={viewDoc.chassisNumber} dir="ltr" mono />
                )}
                {viewDoc.engineNumber && (
                  <CopyableField label="شماره موتور" value={viewDoc.engineNumber} dir="ltr" mono />
                )}
                {viewDoc.vinNumber && (
                  <CopyableField label="VIN" value={viewDoc.vinNumber} dir="ltr" mono />
                )}
                {viewDoc.cardSerial && (
                  <CopyableField label="سریال کارت" value={viewDoc.cardSerial} dir="ltr" mono />
                )}
                {viewDoc.serialNumber && (
                  <CopyableField label="شماره کارت" value={viewDoc.serialNumber} dir="ltr" mono />
                )}
              </div>
            )}

            {/* Property-specific */}
            {viewDoc.category === "property" && (
              <div className="grid grid-cols-2 gap-2">
                {viewDoc.contractNumber && (
                  <CopyableField label="شماره قرارداد" value={viewDoc.contractNumber} dir="ltr" mono />
                )}
                {viewDoc.trackingCode && (
                  <CopyableField label="کد رهگیری" value={viewDoc.trackingCode} dir="ltr" mono />
                )}
              </div>
            )}

            {/* Insurance-specific */}
            {viewDoc.category === "insurance" && (
              <div className="grid grid-cols-2 gap-2">
                {viewDoc.insuranceNumber && (
                  <CopyableField label="شماره بیمه" value={viewDoc.insuranceNumber} dir="ltr" mono />
                )}
                {viewDoc.insuranceType && (
                  <CopyableField label="نوع بیمه" value={viewDoc.insuranceType} dir="rtl" />
                )}
                {viewDoc.insuranceDate && (
                  <CopyableField label="تاریخ بیمه" value={viewDoc.insuranceDate} dir="ltr" />
                )}
              </div>
            )}

            {viewDoc.notes && (
              <div className="surface-input rounded-card-sm p-3">
                <div className="text-[10px] text-soft mb-0.5">یادداشت</div>
                <div className="text-sm text-strong leading-relaxed">
                  {viewDoc.notes}
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
