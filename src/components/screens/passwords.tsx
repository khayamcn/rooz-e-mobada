"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard } from "@/components/shared/ui";
import { CopyChip } from "@/components/shared/copyable-field";
import { Sheet } from "@/components/shared/sheet";
import { toPersian } from "@/lib/persian";
import {
  Plus, Pencil, Trash2, KeyRound, Eye, EyeOff, Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Credential } from "@/lib/types";

export function PasswordsScreen() {
  const credentials = useApp((s) => s.credentials);
  const people = useApp((s) => s.people);
  const addCredential = useApp((s) => s.addCredential);
  const updateCredential = useApp((s) => s.updateCredential);
  const removeCredential = useApp((s) => s.removeCredential);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({
    personId: "",
    serviceName: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  });

  const openAdd = () => {
    setForm({
      personId: people[0]?.id ?? "",
      serviceName: "",
      username: "",
      password: "",
      url: "",
      notes: "",
    });
    setEditingId(null);
    setSheetOpen(true);
  };

  useEffect(() => {
    const handler = () => {
      setForm({
        personId: people[0]?.id ?? "",
        serviceName: "",
        username: "",
        password: "",
        url: "",
        notes: "",
      });
      setEditingId(null);
      setSheetOpen(true);
    };
    window.addEventListener("rooz-fab-add", handler);
    return () => window.removeEventListener("rooz-fab-add", handler);
  }, [people]);

  const openEdit = (cr: Credential) => {
    setForm({
      personId: cr.personId,
      serviceName: cr.serviceName,
      username: cr.username,
      password: cr.password,
      url: cr.url ?? "",
      notes: cr.notes ?? "",
    });
    setEditingId(cr.id);
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!form.serviceName.trim() || !form.personId) return;
    const data = {
      personId: form.personId,
      serviceName: form.serviceName.trim(),
      username: form.username.trim(),
      password: form.password,
      url: form.url.trim() || undefined,
      notes: form.notes || undefined,
      isPrivate: true,
    };
    if (editingId) {
      updateCredential(editingId, data);
    } else {
      addCredential(data);
    }
    setSheetOpen(false);
  };

  const getPersonName = (id: string) => people.find((p) => p.id === id)?.fullName ?? "—";

  return (
    <div className="flex flex-col bg-page min-h-full">
      <ScreenHeader
        title="رمزها و نام‌های کاربری"
        subtitle={`${toPersian(credentials.length)} مورد`}
        icon={<KeyRound className="w-5 h-5 text-white" />}
        trailing={
          <button
            type="button"
            onClick={openAdd}
            disabled={people.length === 0}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-40"
            aria-label="افزودن رمز"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      {people.length === 0 ? (
        <div className="px-4 mt-8">
          <AppCard className="!p-6 text-center">
            <p className="text-sm text-soft">برای افزودن رمز، ابتدا یک فرد ثبت کنید.</p>
          </AppCard>
        </div>
      ) : (
        <div className="px-4 -mt-3 mb-4">
          {credentials.length === 0 ? (
            <AppCard className="!p-6 text-center" onClick={openAdd}>
              <Plus className="w-8 h-8 mx-auto mb-2 brand-text" />
              <p className="text-sm font-bold text-strong">افزودن اولین رمز</p>
              <p className="text-[11px] text-soft mt-1">نام کاربری و گذرواژه سایت‌ها</p>
            </AppCard>
          ) : (
            <div className="space-y-2">
              {credentials.map((cr, i) => (
                <CredentialCard
                  key={cr.id}
                  credential={cr}
                  personName={getPersonName(cr.personId)}
                  onEdit={() => openEdit(cr)}
                  onDelete={() => setDeleteConfirmId(cr.id)}
                  delay={i * 0.05}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? "ویرایش رمز" : "افزودن رمز جدید"}
        footer={
          <>
            <button type="button" onClick={() => setSheetOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button>
            <button type="button" onClick={handleSave} disabled={!form.serviceName.trim() || !form.personId} className="flex-1 py-2.5 rounded-xl brand-gradient text-white text-sm font-bold shadow-glow disabled:opacity-40">ذخیره</button>
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
          <Field label="نام سایت یا نرم‌افزار">
            <input type="text" value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} placeholder="مثلاً: اینستاگرام، گوگل، تلگرام..." className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
          </Field>
          <Field label="آدرس سایت (اختیاری)">
            <input type="url" dir="ltr" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://example.com" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left" />
          </Field>
          <Field label="نام کاربری">
            <input type="text" dir="ltr" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left" />
          </Field>
          <Field label="گذرواژه">
            <input type="text" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 text-left" />
          </Field>
          <Field label="یادداشت">
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="مثلاً: سؤال امنیتی..." rows={2} className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none" />
          </Field>
        </div>
      </Sheet>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmId(null)} className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="surface-card rounded-3xl p-5 max-w-xs w-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 mx-auto mb-3 flex items-center justify-center"><Trash2 className="w-6 h-6 text-red-500" /></div>
              <p className="text-sm font-bold text-strong mb-1">حذف رمز؟</p>
              <p className="text-[11px] text-soft mb-4">این عمل قابل بازگشت نیست.</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button>
                <button type="button" onClick={() => { removeCredential(deleteConfirmId); setDeleteConfirmId(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">حذف</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CredentialCard({ credential, personName, onEdit, onDelete, delay }: {
  credential: Credential;
  personName: string;
  onEdit: () => void;
  onDelete: () => void;
  delay: number;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <AppCard className="!p-3">
        <div className="flex items-start gap-2 mb-2">
          <span className="w-9 h-9 rounded-lg brand-bg-soft flex items-center justify-center text-base shrink-0">🔐</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-strong truncate">{credential.serviceName}</p>
            {credential.url && (
              <a href={credential.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-soft truncate flex items-center gap-0.5" dir="ltr">
                <Globe className="w-2.5 h-2.5" />
                {credential.url}
              </a>
            )}
            <p className="text-[9px] text-soft">{personName}</p>
          </div>
          <div className="flex gap-1">
            <button type="button" onClick={onEdit} className="w-7 h-7 rounded-lg brand-bg-soft brand-text flex items-center justify-center" aria-label="ویرایش"><Pencil className="w-3 h-3" /></button>
            <button type="button" onClick={onDelete} className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center" aria-label="حذف"><Trash2 className="w-3 h-3" /></button>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-soft w-14 shrink-0">نام کاربری</span>
            <span className="text-[11px] text-strong font-mono truncate flex-1" dir="ltr">{credential.username}</span>
            <CopyChip value={credential.username} label="نام کاربری" size="sm" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-soft w-14 shrink-0">گذرواژه</span>
            <span className="text-[11px] text-strong font-mono flex-1 truncate" dir="ltr">{showPassword ? credential.password : "••••••••"}</span>
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="shrink-0 w-7 h-7 rounded-lg brand-bg-soft brand-text flex items-center justify-center" aria-label="نمایش/پنهان">
              {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
            <CopyChip value={credential.password} label="گذرواژه" size="sm" />
          </div>
        </div>
      </AppCard>
    </motion.div>
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
