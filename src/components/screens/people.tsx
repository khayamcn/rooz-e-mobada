"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard } from "@/components/shared/ui";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { ImageUploader, type UploadedImage } from "@/components/shared/image-uploader";
import { Sheet } from "@/components/shared/sheet";
import {
  Plus, Pencil, Trash2, ChevronLeft, Users, Phone, CreditCard, FileText, Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PersonProfile } from "./person-profile";
import type { Person } from "@/lib/types";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const RELATIONS = ["پدر", "مادر", "همسر", "پسر", "دختر", "برادر", "خواهر", "خودم", "سایر"];

export function PeopleScreen() {
  const people = useApp((s) => s.people);
  const addPerson = useApp((s) => s.addPerson);
  const updatePerson = useApp((s) => s.updatePerson);
  const removePerson = useApp((s) => s.removePerson);
  const bankCards = useApp((s) => s.bankCards);
  const documents = useApp((s) => s.documents);
  const bills = useApp((s) => s.bills);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "", relation: "", customRelation: "", phone: "", nationalId: "",
    birthDateJalali: "", bloodType: "", notes: "", avatarDataUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setForm({ fullName: "", relation: "", customRelation: "", phone: "", nationalId: "", birthDateJalali: "", bloodType: "", notes: "", avatarDataUrl: "" });
    setErrors({});
  };

  useEffect(() => {
    const handler = () => { resetForm(); setEditingId(null); setSheetOpen(true); };
    window.addEventListener("rooz-fab-add", handler);
    return () => window.removeEventListener("rooz-fab-add", handler);
  }, []);

  const openAdd = () => { resetForm(); setEditingId(null); setSheetOpen(true); };

  const openEdit = (person: Person) => {
    const isStandard = RELATIONS.includes(person.relation);
    setForm({
      fullName: person.fullName, relation: isStandard ? person.relation : "سایر",
      customRelation: isStandard ? "" : person.relation, phone: person.phone,
      nationalId: person.nationalId ?? "", birthDateJalali: person.birthDateJalali ?? "",
      bloodType: person.bloodType ?? "", notes: person.notes ?? "", avatarDataUrl: person.avatarDataUrl ?? "",
    });
    setErrors({}); setEditingId(person.id); setSheetOpen(true);
  };

  const normalizePhone = (input: string): string => {
    let c = input.replace(/[^\d+]/g, "");
    if (c.startsWith("+98")) c = "0" + c.slice(3);
    else if (c.startsWith("0098")) c = "0" + c.slice(4);
    else if (c.startsWith("98") && c.length === 12) c = "0" + c.slice(2);
    return c.slice(0, 11);
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = "نام الزامی است";
    if (form.phone) { const n = normalizePhone(form.phone); if (!/^09\d{9}$/.test(n)) next.phone = "شماره موبایل باید 11 رقم و با 09 شروع شود"; }
    if (form.nationalId && form.nationalId.replace(/\D/g, "").length !== 10) next.nationalId = "کد ملی باید 10 رقم باشد";
    if (form.relation === "سایر" && !form.customRelation.trim()) next.customRelation = "نسبت را وارد کنید";
    setErrors(next); return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const finalRelation = form.relation === "سایر" ? form.customRelation.trim() : form.relation;
    const data = {
      fullName: form.fullName.trim(), relation: finalRelation || "—", phone: normalizePhone(form.phone),
      nationalId: form.nationalId.replace(/\D/g, "") || undefined, birthDateJalali: form.birthDateJalali || undefined,
      bloodType: form.bloodType || undefined, notes: form.notes || undefined, avatarDataUrl: form.avatarDataUrl || undefined,
      avatarColor: "violet",
    };
    if (editingId) { updatePerson(editingId, data); if (selectedPerson && selectedPerson.id === editingId) setSelectedPerson({ ...selectedPerson, ...data }); }
    else addPerson(data);
    setSheetOpen(false);
  };

  if (selectedPerson) {
    return <PersonProfile person={selectedPerson} onBack={() => setSelectedPerson(null)} onEdit={() => openEdit(selectedPerson)} />;
  }

  return (
    <div className="flex flex-col bg-page min-h-full">
      <ScreenHeader title="افراد" subtitle={`${people.length} نفر`} icon={<Users className="w-5 h-5 text-white" />}
        trailing={<button type="button" onClick={openAdd} className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"><Plus className="w-5 h-5 text-white" /></button>}
      />
      <div className="px-4 pt-4 pb-4">
        {people.length === 0 ? (
          <AppCard className="!p-8 text-center" onClick={openAdd}>
            <div className="w-16 h-16 mx-auto rounded-2xl brand-gradient flex items-center justify-center mb-3"><Plus className="w-8 h-8 text-white" /></div>
            <p className="text-base font-bold text-strong">اولین فرد را اضافه کنید</p>
            <p className="text-xs text-soft mt-1">برای مدیریت مدارک و اطلاعات افراد</p>
          </AppCard>
        ) : (
          <div className="space-y-3">
            {people.map((person, i) => {
              const personCards = bankCards.filter((c) => c.personId === person.id).length;
              const personDocs = documents.filter((d) => d.personId === person.id).length;
              const personBills = bills.filter((b) => b.personId === person.id).length;
              return (
                <motion.div key={person.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <AppCard asDiv onClick={() => setSelectedPerson(person)} className="!p-4">
                    {/* Big avatar + name */}
                    <div className="flex items-center gap-3 mb-3">
                      <ProfileAvatar name={person.fullName} avatarDataUrl={person.avatarDataUrl} size="xl" />
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-strong truncate">{person.fullName}</p>
                        <p className="text-sm text-soft">{person.relation}</p>
                        {person.phone && <p className="text-xs text-soft mt-0.5" dir="ltr">{person.phone}</p>}
                      </div>
                    </div>
                    {/* Stats row */}
                    <div className="flex items-center gap-3 mb-3 text-xs text-soft">
                      {personCards > 0 && <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {personCards} کارت</span>}
                      {personDocs > 0 && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {personDocs} سند</span>}
                      {personBills > 0 && <span className="flex items-center gap-1"><Receipt className="w-3 h-3" /> {personBills} قبض</span>}
                    </div>
                    {/* Action icons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                      {person.phone && (
                        <a href={`tel:${person.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors hover:bg-emerald-500/20">
                          <Phone className="w-3.5 h-3.5" /> تماس
                        </a>
                      )}
                      <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(person); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg brand-bg-soft brand-text text-xs font-bold transition-colors hover:opacity-80">
                        <Pencil className="w-3.5 h-3.5" /> ویرایش
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(person.id); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold transition-colors hover:bg-red-500/20">
                        <Trash2 className="w-3.5 h-3.5" /> حذف
                      </button>
                      <span className="mr-auto text-soft"><ChevronLeft className="w-4 h-4" /></span>
                    </div>
                  </AppCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit sheet */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editingId ? "ویرایش فرد" : "افزودن فرد جدید"}
        footer={<><button type="button" onClick={() => setSheetOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button><button type="button" onClick={handleSave} className="flex-1 py-2.5 rounded-xl brand-gradient text-white text-sm font-bold">ذخیره</button></>}
      >
        <div className="space-y-4">
          <div className="flex justify-center"><ProfileAvatar name={form.fullName || "فرد جدید"} avatarDataUrl={form.avatarDataUrl} size="xl" ring /></div>
          <ImageUploader value={form.avatarDataUrl ? { name: "avatar", size: 0, type: "image/jpeg", dataUrl: form.avatarDataUrl } : null} onChange={(img: UploadedImage | null) => setForm({ ...form, avatarDataUrl: img?.dataUrl ?? "" })} label="عکس پروفایل" />
          <Field label="نام کامل" error={errors.fullName}><input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="مثلاً: علی رضایی" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40" /></Field>
          <Field label="نسبت" error={errors.relation}>
            <select value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40">
              <option value="">انتخاب نسبت...</option>{RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          {form.relation === "سایر" && <Field label="نسبت دلخواه" error={errors.customRelation}><input type="text" value={form.customRelation} onChange={(e) => setForm({ ...form, customRelation: e.target.value })} placeholder="مثلاً: دایی، عمه..." className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40" /></Field>}
          <Field label="شماره موبایل (11 رقم لاتین)" error={errors.phone}>
            <input type="tel" inputMode="numeric" dir="ltr" value={form.phone} onChange={(e) => { let v = e.target.value.replace(/[^\d+]/g, ""); if (v.startsWith("+98")) v = "0" + v.slice(3); else if (v.startsWith("0098")) v = "0" + v.slice(4); if (v.length > 11) v = v.slice(0, 11); setForm({ ...form, phone: v }); }} placeholder="09123456789" maxLength={11} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left" />
            <p className="text-[10px] text-soft mt-1">+98 به‌صورت خودکار به 0 تبدیل می‌شود</p>
          </Field>
          <Field label="کد ملی (10 رقم لاتین)" error={errors.nationalId}>
            <input type="text" inputMode="numeric" dir="ltr" value={form.nationalId} onChange={(e) => { let v = e.target.value.replace(/\D/g, ""); if (v.length > 10) v = v.slice(0, 10); setForm({ ...form, nationalId: v }); }} placeholder="0012345678" maxLength={10} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="تاریخ تولد (شمسی)"><input type="text" value={form.birthDateJalali} onChange={(e) => setForm({ ...form, birthDateJalali: e.target.value })} placeholder="1400/01/01" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40" /></Field>
            <Field label="گروه خونی"><select value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong focus:outline-none focus:ring-2 focus:ring-violet-500/40"><option value="">انتخاب...</option>{BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}</select></Field>
          </div>
          <Field label="یادداشت"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="هر توضیح اضافی..." rows={2} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none" /></Field>
        </div>
      </Sheet>

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmId(null)} className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="surface-card rounded-2xl p-5 max-w-xs w-full text-center">
              <div className="w-12 h-12 rounded-xl bg-red-500/15 mx-auto mb-3 flex items-center justify-center"><Trash2 className="w-6 h-6 text-red-500" /></div>
              <p className="text-sm font-bold text-strong mb-1">حذف فرد؟</p><p className="text-[11px] text-soft mb-4">تمام اطلاعات این فرد پاک می‌شود.</p>
              <div className="flex gap-2"><button type="button" onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button><button type="button" onClick={() => { removePerson(deleteConfirmId); setDeleteConfirmId(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold">حذف</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (<div><label className="block text-xs font-semibold text-soft mb-1.5">{label}</label>{children}{error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}</div>);
}
