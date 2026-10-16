"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Car, Trash2, Pencil, Copy, Check, Eye, EyeOff, User, GraduationCap, KeyRound, HeartPulse, Wallet, Info } from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle, StatusBadge, FileAttachmentChip } from "@/components/shared/ui";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { Sheet } from "@/components/shared/sheet";
import { ImageUploader, type UploadedImage } from "@/components/shared/image-uploader";
import { useApp, useActiveMember, useDocumentsForActiveMember, useCredentialsForActiveMember, useVisibleVehicles } from "@/lib/store";
import { toPersian } from "@/lib/persian";
import type { DocCategory, DocumentItem, MemberCategory, CredentialItem } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const MEMBER_CATEGORIES: { id: MemberCategory; label: string; icon: typeof Info }[] = [
  { id: "personal", label: "اطلاعات فردی", icon: Info },
  { id: "identity", label: "مدارک شناسایی", icon: User },
  { id: "education", label: "مدارک تحصیلی", icon: GraduationCap },
  { id: "credentials", label: "نام‌کاربری و گذرواژه", icon: KeyRound },
  { id: "medical", label: "اطلاعات پزشکی", icon: HeartPulse },
  { id: "financial", label: "اطلاعات مالی", icon: Wallet },
];

const CATEGORY_EMOJI: Record<DocCategory, string> = {
  identity: "🪪",
  insurance: "🛡️",
  property: "🏠",
  medical: "🩺",
  vehicle: "🚗",
  other: "📄",
};

const DOC_CATEGORY_BY_MEMBER: Record<MemberCategory, DocCategory> = {
  personal: "other",
  identity: "identity",
  education: "other",
  credentials: "other",
  medical: "medical",
  financial: "property",
};

function expiryTone(days: number | null) {
  if (days === null) return null;
  if (days < 0) return "expired" as const;
  if (days <= 30) return "expiring" as const;
  return "valid" as const;
}

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

const EMPTY_DOC_FORM: DocFormState = {
  title: "",
  category: "identity",
  documentNumber: "",
  expiryJalali: "",
  physicalLocation: "",
  notes: "",
  isPrivate: false,
  image: null,
};

interface CredentialFormState {
  serviceName: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  isPrivate: boolean;
}

const EMPTY_CR_FORM: CredentialFormState = {
  serviceName: "",
  username: "",
  password: "",
  url: "",
  notes: "",
  isPrivate: true,
};

export function DocumentsScreen() {
  const [activeCategory, setActiveCategory] = useState<MemberCategory>("personal");
  const [docSheetOpen, setDocSheetOpen] = useState(false);
  const [crSheetOpen, setCrSheetOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingCrId, setEditingCrId] = useState<string | null>(null);
  const [docForm, setDocForm] = useState<DocFormState>(EMPTY_DOC_FORM);
  const [crForm, setCrForm] = useState<CredentialFormState>(EMPTY_CR_FORM);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [deleteCrId, setDeleteCrId] = useState<string | null>(null);

  const activeMember = useActiveMember();
  const allDocs = useDocumentsForActiveMember();
  const credentials = useCredentialsForActiveMember();
  const vehicles = useVisibleVehicles();
  const personalInfo = useApp((s) => s.personalInfo);
  const updatePersonalInfo = useApp((s) => s.updatePersonalInfo);
  const addDocument = useApp((s) => s.addDocument);
  const updateDocument = useApp((s) => s.updateDocument);
  const removeDocument = useApp((s) => s.removeDocument);
  const addCredential = useApp((s) => s.addCredential);
  const updateCredential = useApp((s) => s.updateCredential);
  const removeCredential = useApp((s) => s.removeCredential);

  useEffect(() => {
    const handler = () => {
      if (activeCategory === "credentials") {
        setCrForm(EMPTY_CR_FORM);
        setEditingCrId(null);
        setCrSheetOpen(true);
      } else {
        setDocForm(EMPTY_DOC_FORM);
        setEditingDocId(null);
        setDocSheetOpen(true);
      }
    };
    window.addEventListener("rooz-fab-add", handler);
    return () => window.removeEventListener("rooz-fab-add", handler);
  }, [activeCategory]);

  if (!activeMember) {
    return <div className="p-6 text-center text-soft text-sm">عضوی انتخاب نشده است.</div>;
  }

  const memberDocs = allDocs.filter((d) => d.memberCategory === activeCategory || (!d.memberCategory && activeCategory === "identity" && d.category === "identity"));
  const memberInfo = personalInfo[activeMember.id] ?? { memberId: activeMember.id };

  const openAddDoc = () => {
    setDocForm(EMPTY_DOC_FORM);
    setEditingDocId(null);
    setDocSheetOpen(true);
  };

  const openEditDoc = (doc: DocumentItem) => {
    setDocForm({
      title: doc.title,
      category: doc.category,
      documentNumber: doc.documentNumber,
      expiryJalali: doc.expiryJalali ?? "",
      physicalLocation: doc.physicalLocation,
      notes: doc.notes ?? "",
      isPrivate: doc.isPrivate,
      image: null,
    });
    setEditingDocId(doc.id);
    setDocSheetOpen(true);
  };

  const handleSaveDoc = () => {
    if (!docForm.title.trim() || !activeMember) return;
    if (editingDocId) {
      updateDocument(editingDocId, {
        title: docForm.title.trim(),
        category: docForm.category,
        documentNumber: docForm.documentNumber || "—",
        expiryJalali: docForm.expiryJalali || null,
        expiryDays: docForm.expiryJalali ? 365 : null,
        physicalLocation: docForm.physicalLocation || "—",
        notes: docForm.notes,
        isPrivate: docForm.isPrivate,
        memberCategory: activeCategory,
        attachmentStatus: docForm.image ? "cached" : "uploaded",
        attachmentLabel: docForm.image ? docForm.image.name : "بدون پیوست",
        imageDataUrl: docForm.image?.dataUrl,
      });
    } else {
      addDocument({
        title: docForm.title.trim(),
        category: docForm.category,
        memberCategory: activeCategory,
        ownerId: activeMember.id,
        documentNumber: docForm.documentNumber || "—",
        issueJalali: "1405/07/23",
        expiryJalali: docForm.expiryJalali || null,
        expiryDays: docForm.expiryJalali ? 365 : null,
        physicalLocation: docForm.physicalLocation || "—",
        notes: docForm.notes,
        isPrivate: docForm.isPrivate,
        ownerName: activeMember.fullName,
        attachmentLabel: docForm.image ? docForm.image.name : "بدون پیوست",
        attachmentStatus: docForm.image ? "cached" : "uploaded",
        imageDataUrl: docForm.image?.dataUrl,
        syncStatus: "pending",
      });
    }
    setDocSheetOpen(false);
    setDocForm(EMPTY_DOC_FORM);
    setEditingDocId(null);
  };

  const openAddCr = () => {
    setCrForm(EMPTY_CR_FORM);
    setEditingCrId(null);
    setCrSheetOpen(true);
  };

  const openEditCr = (cr: CredentialItem) => {
    setCrForm({
      serviceName: cr.serviceName,
      username: cr.username,
      password: cr.password,
      url: cr.url ?? "",
      notes: cr.notes ?? "",
      isPrivate: cr.isPrivate,
    });
    setEditingCrId(cr.id);
    setCrSheetOpen(true);
  };

  const handleSaveCr = () => {
    if (!crForm.serviceName.trim() || !crForm.username.trim() || !activeMember) return;
    if (editingCrId) {
      updateCredential(editingCrId, {
        serviceName: crForm.serviceName.trim(),
        username: crForm.username.trim(),
        password: crForm.password,
        url: crForm.url || undefined,
        notes: crForm.notes,
        isPrivate: crForm.isPrivate,
        updatedAt: "۱۴۰۵/۰۷/۲۳",
      });
    } else {
      addCredential({
        ownerId: activeMember.id,
        serviceName: crForm.serviceName.trim(),
        username: crForm.username.trim(),
        password: crForm.password,
        url: crForm.url || undefined,
        notes: crForm.notes,
        isPrivate: crForm.isPrivate,
        updatedAt: "۱۴۰۵/۰۷/۲۳",
      });
    }
    setCrSheetOpen(false);
    setCrForm(EMPTY_CR_FORM);
    setEditingCrId(null);
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="مدارک و اطلاعات"
        subtitle={`پرونده ${activeMember.fullName}`}
        icon={<FileText className="w-5 h-5 text-white" />}
        trailing={
          <button
            type="button"
            onClick={() => activeCategory === "credentials" ? openAddCr() : openAddDoc()}
            aria-label="افزودن"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      {/* Active member hero */}
      <div className="px-4 -mt-3 mb-3">
        <div className="rounded-2xl p-3 surface-card flex items-center gap-3">
          <ProfileAvatar
            name={activeMember.fullName}
            initials={activeMember.avatarInitials}
            avatarDataUrl={activeMember.avatarDataUrl}
            size="md"
            ring
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-strong truncate">{activeMember.fullName}</p>
            <p className="text-[11px] text-soft truncate">{activeMember.relation} · {activeMember.phone}</p>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {MEMBER_CATEGORIES.map((c) => {
            const Icon = c.icon;
            const isActive = activeCategory === c.id;
            const count = c.id === "credentials" ? credentials.length : memberDocs.length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`shrink-0 px-3 py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white border-transparent shadow-glow"
                    : "surface-card text-strong border-transparent hover:shadow-glow"
                }`}
              >
                <Icon className="w-3 h-3" />
                {c.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold fa-num ${isActive ? "bg-white/20" : "bg-violet-500/10 text-violet-500 dark:text-violet-300"}`}>
                    {toPersian(count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Personal info tab */}
      {activeCategory === "personal" && (
        <section className="px-4 mb-5">
          <SectionTitle title="اطلاعات فردی" icon={<Info className="w-4 h-4" />} />
          <AppCard className="!p-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Field label="کد ملی" value={activeMember.nationalId || "—"} editable onSave={(v) => updatePersonalInfo(activeMember.id, { nationalId: v })} />
              <Field label="گروه خونی" value={memberInfo.bloodType || "—"} editable onSave={(v) => updatePersonalInfo(activeMember.id, { bloodType: v })} />
              <Field label="تاریخ تولد (شمسی)" value={memberInfo.birthDateJalali || "—"} editable onSave={(v) => updatePersonalInfo(activeMember.id, { birthDateJalali: v })} />
              <Field label="آدرس" value={memberInfo.address || "—"} editable onSave={(v) => updatePersonalInfo(activeMember.id, { address: v })} />
            </div>
          </AppCard>
          <AppCard className="!p-4 mt-2.5">
            <p className="text-[11px] font-bold text-violet-500 dark:text-violet-300 mb-2">یادداشت‌های پزشکی</p>
            <div className="space-y-2">
              <Field label="حساسیت‌ها" value={memberInfo.allergies || "—"} editable onSave={(v) => updatePersonalInfo(activeMember.id, { allergies: v })} />
              <Field label="بیماری‌های مزمن" value={memberInfo.chronicDiseases || "—"} editable onSave={(v) => updatePersonalInfo(activeMember.id, { chronicDiseases: v })} />
              <Field label="داروهای مصرفی" value={memberInfo.medications || "—"} editable onSave={(v) => updatePersonalInfo(activeMember.id, { medications: v })} />
            </div>
          </AppCard>
        </section>
      )}

      {/* Documents tab */}
      {activeCategory !== "personal" && activeCategory !== "credentials" && (
        <section className="px-4 mb-5">
          <SectionTitle
            title={MEMBER_CATEGORIES.find((c) => c.id === activeCategory)?.label || "مدارک"}
            action={<span className="text-[11px] text-soft fa-num">{toPersian(memberDocs.length)} مورد</span>}
          />
          {memberDocs.length === 0 ? (
            <AppCard className="!p-6 text-center">
              <p className="text-3xl mb-2">📄</p>
              <p className="text-sm text-soft">موردی ثبت نشده است.</p>
              <button type="button" onClick={openAddDoc} className="mt-3 text-xs font-bold text-violet-500 dark:text-violet-300">
                افزودن اولین مورد +
              </button>
            </AppCard>
          ) : (
            <div className="space-y-2.5">
              {memberDocs.map((d) => (
                <AppCard key={d.id} className="!p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {d.imageDataUrl ? (
                        <img src={d.imageDataUrl} alt={d.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      ) : (
                        <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-lg shrink-0">
                          {CATEGORY_EMOJI[d.category]}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-strong truncate">{d.title}</p>
                        <p className="text-[11px] text-soft">{d.isPrivate ? "شخصی · " : "مشترک · "}{d.ownerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => openEditDoc(d)} className="w-7 h-7 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 dark:text-violet-300 flex items-center justify-center transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => setDeleteDocId(d.id)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mb-2">
                    <div><span className="text-soft">شماره: </span><span className="text-strong font-medium fa-num">{d.documentNumber}</span></div>
                    {d.expiryJalali && (
                      <div>
                        <span className="text-soft">انقضا: </span>
                        <span className={`font-bold fa-num ${expiryTone(d.expiryDays) === "valid" ? "text-emerald-500 dark:text-emerald-300" : "text-red-500 dark:text-red-300"}`}>{d.expiryJalali}</span>
                      </div>
                    )}
                  </div>
                  {d.imageDataUrl && <FileAttachmentChip status="cached" label="تصویر بارگذاری‌شده" />}
                </AppCard>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Credentials tab */}
      {activeCategory === "credentials" && (
        <section className="px-4 mb-5">
          <SectionTitle
            title="نام‌های کاربری و گذرواژه‌ها"
            icon={<KeyRound className="w-4 h-4" />}
            action={<span className="text-[11px] text-soft fa-num">{toPersian(credentials.length)} مورد</span>}
          />
          {credentials.length === 0 ? (
            <AppCard className="!p-6 text-center">
              <p className="text-3xl mb-2">🔐</p>
              <p className="text-sm text-soft">هنوز رمزی ثبت نشده است.</p>
              <button type="button" onClick={openAddCr} className="mt-3 text-xs font-bold text-violet-500 dark:text-violet-300">
                افزودن اولین رمز +
              </button>
            </AppCard>
          ) : (
            <div className="space-y-2.5">
              {credentials.map((cr) => (
                <CredentialCard
                  key={cr.id}
                  credential={cr}
                  onEdit={() => openEditCr(cr)}
                  onDelete={() => setDeleteCrId(cr.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Add document button */}
      {activeCategory !== "personal" && activeCategory !== "credentials" && (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={openAddDoc}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-violet-500/40 text-violet-500 dark:text-violet-300 hover:bg-violet-500/5 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            افزودن مدرک
          </button>
        </div>
      )}

      {/* Add/edit document sheet */}
      <Sheet
        open={docSheetOpen}
        onClose={() => setDocSheetOpen(false)}
        title={editingDocId ? "ویرایش مدرک" : "افزودن مدرک جدید"}
        subtitle={`ثبت در دسته: ${MEMBER_CATEGORIES.find((c) => c.id === activeCategory)?.label}`}
        footer={
          <>
            <button type="button" onClick={() => setDocSheetOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button>
            <button type="button" onClick={handleSaveDoc} disabled={!docForm.title.trim()} className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shadow-glow disabled:opacity-40 transition-opacity">ذخیره</button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="عنوان">
            <input type="text" value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} placeholder="مثلاً: کارت ملی هوشمند" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="شماره سند">
              <input type="text" value={docForm.documentNumber} onChange={(e) => setDocForm({ ...docForm, documentNumber: e.target.value })} placeholder="۰۰۱۲۳۴۵۶۷۸" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num" />
            </Field>
            <Field label="تاریخ انقضا (شمسی)">
              <input type="text" value={docForm.expiryJalali} onChange={(e) => setDocForm({ ...docForm, expiryJalali: e.target.value })} placeholder="۱۴۰۶/۰۵/۰۱" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num" />
            </Field>
          </div>
          <Field label="محل نگهداری">
            <input type="text" value={docForm.physicalLocation} onChange={(e) => setDocForm({ ...docForm, physicalLocation: e.target.value })} placeholder="گاوصندوق..." className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
          </Field>
          <ImageUploader value={docForm.image} onChange={(img) => setDocForm({ ...docForm, image: img })} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={docForm.isPrivate} onChange={(e) => setDocForm({ ...docForm, isPrivate: e.target.checked })} className="w-4 h-4 rounded accent-violet-500" />
            <span className="text-xs text-soft">این مدرک خصوصی است</span>
          </label>
        </div>
      </Sheet>

      {/* Add/edit credential sheet */}
      <Sheet
        open={crSheetOpen}
        onClose={() => setCrSheetOpen(false)}
        title={editingCrId ? "ویرایش رمز" : "افزودن رمز جدید"}
        subtitle="نام کاربری و گذرواژه با قابلیت کپی"
        footer={
          <>
            <button type="button" onClick={() => setCrSheetOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button>
            <button type="button" onClick={handleSaveCr} disabled={!crForm.serviceName.trim() || !crForm.username.trim()} className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shadow-glow disabled:opacity-40 transition-opacity">ذخیره</button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="نام سرویس">
            <input type="text" value={crForm.serviceName} onChange={(e) => setCrForm({ ...crForm, serviceName: e.target.value })} placeholder="مثلاً: اینستاگرام" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
          </Field>
          <Field label="نام کاربری">
            <input type="text" value={crForm.username} onChange={(e) => setCrForm({ ...crForm, username: e.target.value })} placeholder="username" dir="ltr" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left" />
          </Field>
          <Field label="گذرواژه">
            <input type="text" value={crForm.password} onChange={(e) => setCrForm({ ...crForm, password: e.target.value })} placeholder="••••••••" dir="ltr" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left" />
          </Field>
          <Field label="آدرس سایت (اختیاری)">
            <input type="url" value={crForm.url} onChange={(e) => setCrForm({ ...crForm, url: e.target.value })} placeholder="https://..." dir="ltr" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left" />
          </Field>
          <Field label="یادداشت (اختیاری)">
            <textarea value={crForm.notes} onChange={(e) => setCrForm({ ...crForm, notes: e.target.value })} rows={2} placeholder="مثلاً: رمز بازیابی..." className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none" />
          </Field>
        </div>
      </Sheet>

      {/* Delete confirmations */}
      <AnimatePresence>
        {deleteDocId && (
          <DeleteConfirm
            title="حذف مدرک؟"
            onCancel={() => setDeleteDocId(null)}
            onConfirm={() => { removeDocument(deleteDocId); setDeleteDocId(null); }}
          />
        )}
        {deleteCrId && (
          <DeleteConfirm
            title="حذف رمز؟"
            onCancel={() => setDeleteCrId(null)}
            onConfirm={() => { removeCredential(deleteCrId); setDeleteCrId(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value, editable, onSave, children }: { label: string; value?: string; editable?: boolean; onSave?: (v: string) => void; children?: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  // If children are provided, render them (form input mode).
  if (children !== undefined) {
    return (
      <div>
        <label className="block text-xs font-semibold text-soft mb-1.5">{label}</label>
        {children}
      </div>
    );
  }
  // Otherwise render the editable display mode (for personal info).
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-soft">{label}</span>
        {editable && (
          <button type="button" onClick={() => { setDraft(value ?? ""); setEditing(true); }} className="text-violet-500 dark:text-violet-300">
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-1 flex gap-1">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 surface-input rounded-lg px-2 py-1 text-xs text-strong focus:outline-none focus:ring-1 focus:ring-violet-500/40 fa-num"
          />
          <button
            type="button"
            onClick={() => { onSave?.(draft); setEditing(false); }}
            className="px-2 rounded-lg bg-violet-500 text-white"
          >
            <Check className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <p className="text-strong font-medium fa-num">{value}</p>
      )}
    </div>
  );
}

function CredentialCard({ credential, onEdit, onDelete }: { credential: CredentialItem; onEdit: () => void; onDelete: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<"user" | "pass" | null>(null);

  const copy = (text: string, what: "user" | "pass") => {
    navigator.clipboard?.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <AppCard className="!p-3.5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-lg shrink-0">🔐</span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-strong truncate">{credential.serviceName}</p>
            {credential.url && (
              <p className="text-[10px] text-soft truncate" dir="ltr">{credential.url}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onEdit} className="w-7 h-7 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 dark:text-violet-300 flex items-center justify-center transition-colors">
            <Pencil className="w-3 h-3" />
          </button>
          <button type="button" onClick={onDelete} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-soft w-16 shrink-0">نام کاربری</span>
          <input readOnly value={credential.username} dir="ltr" className="flex-1 surface-input rounded-lg px-2 py-1 text-[11px] text-strong fa-num text-left bg-slate-50 dark:bg-slate-800/50" />
          <button type="button" onClick={() => copy(credential.username, "user")} className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-500 dark:text-violet-300 flex items-center justify-center" aria-label="کپی">
            {copied === "user" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-soft w-16 shrink-0">گذرواژه</span>
          <input
            readOnly
            type={showPassword ? "text" : "password"}
            value={credential.password}
            dir="ltr"
            className="flex-1 surface-input rounded-lg px-2 py-1 text-[11px] text-strong fa-num text-left bg-slate-50 dark:bg-slate-800/50"
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-500 dark:text-violet-300 flex items-center justify-center" aria-label="نمایش/پنهان">
            {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <button type="button" onClick={() => copy(credential.password, "pass")} className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-500 dark:text-violet-300 flex items-center justify-center" aria-label="کپی">
            {copied === "pass" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        {credential.notes && (
          <p className="text-[10px] text-soft mt-1">{credential.notes}</p>
        )}
      </div>
    </AppCard>
  );
}

function DeleteConfirm({ title, onCancel, onConfirm }: { title: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
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
        <p className="text-sm font-bold text-strong mb-1">{title}</p>
        <p className="text-[11px] text-soft mb-4">این عمل قابل بازگشت نیست.</p>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button>
          <button type="button" onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">حذف</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
