"use client";

import { useState } from "react";
import {
  CreditCard,
  FileText,
  Pencil,
  Phone,
  Plus,
  Receipt,
  Trash2,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { Sheet } from "@/components/shared/sheet";
import { ImageUploader } from "@/components/shared/image-uploader";
import type { Person } from "@/lib/types";

const RELATIONS = [
  "پدر",
  "مادر",
  "همسر",
  "پسر",
  "دختر",
  "برادر",
  "خواهر",
  "خودم",
  "سایر",
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function normalizePhone(input: string): string {
  let v = (input || "").replace(/[^\d+]/g, "");
  if (v.startsWith("+98")) v = "0" + v.slice(3);
  else if (v.startsWith("0098")) v = "0" + v.slice(4);
  else if (v.startsWith("98") && v.length === 12) v = "0" + v.slice(2);
  v = v.replace(/[^0-9]/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  return v;
}

function normalizeNationalId(input: string): string {
  let v = (input || "").replace(/[^0-9]/g, "");
  if (v.length > 10) v = v.slice(0, 10);
  return v;
}

interface FormState {
  id?: string;
  fullName: string;
  relation: string;
  customRelation: string;
  phone: string;
  nationalId: string;
  birthDateJalali: string;
  bloodType: string;
  notes: string;
  avatarDataUrl?: string;
}

const EMPTY_FORM: FormState = {
  fullName: "",
  relation: "خودم",
  customRelation: "",
  phone: "",
  nationalId: "",
  birthDateJalali: "",
  bloodType: "",
  notes: "",
};

export function PeopleScreen() {
  const people = useApp((s) => s.people);
  const bankCards = useApp((s) => s.bankCards);
  const documents = useApp((s) => s.documents);
  const bills = useApp((s) => s.bills);
  const addPerson = useApp((s) => s.addPerson);
  const updatePerson = useApp((s) => s.updatePerson);
  const deletePerson = useApp((s) => s.deletePerson);
  const setActivePerson = useApp((s) => s.setActivePerson);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (p: Person) => {
    const isCustom = !RELATIONS.includes(p.relation);
    setForm({
      id: p.id,
      fullName: p.fullName,
      relation: isCustom ? "سایر" : p.relation,
      customRelation: isCustom ? p.relation : "",
      phone: p.phone,
      nationalId: p.nationalId || "",
      birthDateJalali: p.birthDateJalali || "",
      bloodType: p.bloodType || "",
      notes: p.notes || "",
      avatarDataUrl: p.avatarDataUrl,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.fullName.trim()) return;
    const relation =
      form.relation === "سایر" && form.customRelation.trim()
        ? form.customRelation.trim()
        : form.relation;
    const payload = {
      fullName: form.fullName.trim(),
      relation,
      phone: normalizePhone(form.phone),
      nationalId: normalizeNationalId(form.nationalId),
      birthDateJalali: form.birthDateJalali.trim() || undefined,
      bloodType: form.bloodType || undefined,
      notes: form.notes.trim() || undefined,
      avatarDataUrl: form.avatarDataUrl,
    };
    if (form.id) {
      updatePerson(form.id, payload);
    } else {
      addPerson(payload);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("این شخص و تمام اطلاعات مرتبط حذف شود؟")) {
      deletePerson(id);
    }
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="افراد"
        subtitle={`${people.length} نفر ثبت شده`}
        trailing={
          <button
            type="button"
            onClick={openAdd}
            className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center pressable"
            aria-label="افزودن شخص"
          >
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 -mt-4 space-y-3">
        {people.length === 0 && (
          <AppCard asDiv className="!p-6 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl brand-bg-soft text-brand-text flex items-center justify-center mb-3">
              <Users size={26} />
            </div>
            <p className="text-sm font-bold text-strong mb-1">
              هنوز شخصی ثبت نشده
            </p>
            <p className="text-xs text-soft mb-4">
              برای شروع، اعضای خانواده خود را اضافه کنید.
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full brand-gradient text-white text-xs font-bold pressable"
            >
              <Plus size={14} /> افزودن اولین شخص
            </button>
          </AppCard>
        )}

        {people.map((p) => {
          const cardCount = bankCards.filter((c) => c.personId === p.id).length;
          const docCount = documents.filter((d) => d.personId === p.id).length;
          const billCount = bills.filter((b) => b.personId === p.id).length;
          return (
            <AppCard
              key={p.id}
              asDiv
              className="!p-4"
            >
              <button
                type="button"
                onClick={() => setActivePerson(p.id)}
                className="w-full text-right flex items-center gap-3 mb-3"
              >
                <ProfileAvatar
                  name={p.fullName}
                  avatarDataUrl={p.avatarDataUrl}
                  size="xl"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-bold text-strong truncate">
                    {p.fullName}
                  </div>
                  <div className="text-xs text-soft truncate">
                    {p.relation}
                  </div>
                  {p.phone && (
                    <div
                      dir="ltr"
                      className="text-[11px] text-faint font-mono mt-0.5 truncate text-right"
                    >
                      {p.phone}
                    </div>
                  )}
                </div>
              </button>

              {/* Stats per person */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 surface-input rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                  <CreditCard size={12} className="text-violet-500" />
                  <span className="text-[10px] text-soft">کارت</span>
                  <span className="text-xs font-bold text-strong mr-auto">
                    {cardCount}
                  </span>
                </div>
                <div className="flex-1 surface-input rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                  <FileText size={12} className="text-emerald-500" />
                  <span className="text-[10px] text-soft">سند</span>
                  <span className="text-xs font-bold text-strong mr-auto">
                    {docCount}
                  </span>
                </div>
                <div className="flex-1 surface-input rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                  <Receipt size={12} className="text-amber-500" />
                  <span className="text-[10px] text-soft">قبض</span>
                  <span className="text-xs font-bold text-strong mr-auto">
                    {billCount}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {p.phone && (
                  <a
                    href={`tel:${p.phone}`}
                    className="flex-1 h-9 rounded-lg brand-bg-soft text-brand-text flex items-center justify-center gap-1.5 text-xs font-medium pressable"
                  >
                    <Phone size={14} /> تماس
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="flex-1 h-9 rounded-lg surface-input text-strong flex items-center justify-center gap-1.5 text-xs font-medium pressable"
                >
                  <Pencil size={14} /> ویرایش
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  aria-label="حذف"
                  className="h-9 w-9 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center pressable"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </AppCard>
          );
        })}
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "ویرایش شخص" : "افزودن شخص"}
        subtitle="اطلاعات شخص را وارد کنید"
        footer={
          <button
            type="button"
            onClick={handleSave}
            disabled={!form.fullName.trim()}
            className="w-full h-11 rounded-full brand-gradient text-white font-bold text-sm pressable shadow-glow"
          >
            ذخیره
          </button>
        }
      >
        <div className="space-y-4 py-2">
          <ImageUploader
            value={form.avatarDataUrl}
            onChange={(url) => setForm((f) => ({ ...f, avatarDataUrl: url }))}
            label="تصویر پروفایل"
          />

          <Field label="نام و نام خانوادگی">
            <input
              type="text"
              dir="rtl"
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              placeholder="مثلاً علی رضایی"
            />
          </Field>

          <Field label="نسبت">
            <select
              value={form.relation}
              onChange={(e) =>
                setForm((f) => ({ ...f, relation: e.target.value }))
              }
            >
              {RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {form.relation === "سایر" && (
              <input
                type="text"
                dir="rtl"
                value={form.customRelation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customRelation: e.target.value }))
                }
                placeholder="نسبت دلخواه"
                className="mt-2"
              />
            )}
          </Field>

          <Field label="شماره موبایل">
            <input
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: normalizePhone(e.target.value) }))
              }
              placeholder="09xxxxxxxxx"
              inputMode="numeric"
              maxLength={11}
              className="text-right font-mono"
            />
          </Field>

          <Field label="کد ملی">
            <input
              type="tel"
              dir="ltr"
              value={form.nationalId}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  nationalId: normalizeNationalId(e.target.value),
                }))
              }
              placeholder="کد ۱۰ رقمی"
              inputMode="numeric"
              maxLength={10}
              className="text-right font-mono"
            />
          </Field>

          <Field label="تاریخ تولد (شمسی)">
            <input
              type="text"
              dir="ltr"
              value={form.birthDateJalali}
              onChange={(e) =>
                setForm((f) => ({ ...f, birthDateJalali: e.target.value }))
              }
              placeholder="مثلاً 1370/01/15"
              className="text-right font-mono"
            />
          </Field>

          <Field label="گروه خونی">
            <select
              value={form.bloodType}
              onChange={(e) =>
                setForm((f) => ({ ...f, bloodType: e.target.value }))
              }
            >
              <option value="">نامشخص</option>
              {BLOOD_TYPES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>

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
