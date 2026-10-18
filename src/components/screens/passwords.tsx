"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard } from "@/components/shared/ui";
import { Sheet } from "@/components/shared/sheet";
import { CopyableField, CopyChip } from "@/components/shared/copyable-field";
import type { Credential } from "@/lib/types";

interface FormState {
  id?: string;
  personId: string;
  serviceName: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  isPrivate: boolean;
}

const EMPTY_FORM: FormState = {
  personId: "",
  serviceName: "",
  username: "",
  password: "",
  url: "",
  notes: "",
  isPrivate: false,
};

export function PasswordsScreen() {
  const people = useApp((s) => s.people);
  const credentials = useApp((s) => s.credentials);
  const addCredential = useApp((s) => s.addCredential);
  const updateCredential = useApp((s) => s.updateCredential);
  const deleteCredential = useApp((s) => s.deleteCredential);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const personName = (id: string) =>
    people.find((p) => p.id === id)?.fullName || "نامشخص";

  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      personId: people[0]?.id || "",
    });
    setOpen(true);
  };

  const openEdit = (c: Credential) => {
    setForm({
      id: c.id,
      personId: c.personId,
      serviceName: c.serviceName,
      username: c.username,
      password: c.password,
      url: c.url || "",
      notes: c.notes || "",
      isPrivate: c.isPrivate,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.serviceName.trim() || !form.username.trim()) return;
    const personId = form.personId || people[0]?.id;
    if (!personId) return;
    const payload = {
      personId,
      serviceName: form.serviceName.trim(),
      username: form.username.trim(),
      password: form.password,
      url: form.url.trim() || undefined,
      notes: form.notes.trim() || undefined,
      isPrivate: form.isPrivate,
    };
    if (form.id) {
      updateCredential(form.id, payload);
    } else {
      addCredential(payload);
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("این رمز حذف شود؟")) deleteCredential(id);
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="رمزها"
        subtitle={`${credentials.length} رمز ثبت شده`}
        trailing={
          <button
            type="button"
            onClick={openAdd}
            className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center pressable"
            aria-label="افزودن رمز"
          >
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 -mt-4 space-y-3">
        {credentials.length === 0 && (
          <AppCard asDiv className="!p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl brand-bg-soft text-brand-text flex items-center justify-center mb-3">
              <KeyRound size={22} />
            </div>
            <p className="text-sm font-bold text-strong mb-1">
              رمزی ثبت نشده
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="text-xs text-brand-text pressable"
            >
              افزودن رمز
            </button>
          </AppCard>
        )}

        {credentials.map((c) => {
          const show = revealed[c.id];
          return (
            <AppCard key={c.id} asDiv className="!p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg brand-gradient text-white flex items-center justify-center shrink-0">
                  <KeyRound size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-strong truncate">
                    {c.serviceName}
                  </div>
                  <div className="text-[10px] text-soft truncate">
                    {personName(c.personId)}
                  </div>
                </div>
                {c.isPrivate && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 shrink-0">
                    خصوصی
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="surface-input rounded-card-sm p-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] text-soft">نام کاربری</div>
                    <div dir="ltr" className="text-xs font-mono text-strong truncate text-right">
                      {c.username}
                    </div>
                  </div>
                  <CopyChip value={c.username} size={28} label="کپی نام کاربری" />
                </div>
                <div className="surface-input rounded-card-sm p-2 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-soft">رمز عبور</div>
                    <div dir="ltr" className="text-xs font-mono text-strong truncate text-right">
                      {show ? c.password : "•".repeat(Math.min(12, c.password.length))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setRevealed((r) => ({ ...r, [c.id]: !r[c.id] }))
                      }
                      aria-label={show ? "مخفی کردن" : "نمایش رمز"}
                      className="h-7 w-7 rounded-lg surface-input text-strong flex items-center justify-center pressable"
                    >
                      {show ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <CopyChip value={c.password} size={28} label="کپی رمز" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="flex-1 h-8 rounded-lg surface-input text-strong flex items-center justify-center gap-1.5 text-[11px] font-medium pressable"
                >
                  <Pencil size={12} /> ویرایش
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
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

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "ویرایش رمز" : "افزودن رمز"}
        subtitle="اطلاعات حساب کاربری"
        footer={
          <button
            type="button"
            onClick={handleSave}
            disabled={!form.serviceName.trim() || !form.username.trim()}
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

          <Field label="نام سرویس">
            <input
              type="text"
              dir="rtl"
              value={form.serviceName}
              onChange={(e) =>
                setForm((f) => ({ ...f, serviceName: e.target.value }))
              }
              placeholder="مثلاً اینستاگرام، بانک اینترنتی"
            />
          </Field>

          <Field label="آدرس وب‌سایت (اختیاری)">
            <input
              type="text"
              dir="ltr"
              value={form.url}
              onChange={(e) =>
                setForm((f) => ({ ...f, url: e.target.value }))
              }
              placeholder="https://example.com"
              className="text-right font-mono"
            />
          </Field>

          <Field label="نام کاربری">
            <input
              type="text"
              dir="ltr"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              placeholder="نام کاربری"
              className="text-right font-mono"
            />
          </Field>

          <Field label="رمز عبور">
            <input
              type="text"
              dir="ltr"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="رمز عبور"
              className="text-right font-mono"
            />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPrivate}
              onChange={(e) =>
                setForm((f) => ({ ...f, isPrivate: e.target.checked }))
              }
              className="h-5 w-5 accent-violet-600"
            />
            <span className="text-sm text-strong">علامت‌گذاری به‌عنوان خصوصی</span>
          </label>

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
