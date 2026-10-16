"use client";

import { useState, useEffect } from "react";
import {
  Users, Plus, ShieldCheck, Lock, Database, LogOut, ChevronLeft,
  Fingerprint, Download, Sun, Moon, Trash2, Pencil,
} from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { Sheet } from "@/components/shared/sheet";
import { useApp } from "@/lib/store";
import { toPersian } from "@/lib/persian";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_LABELS: Record<string, { label: string; tone: string }> = {
  admin: { label: "مدیر", tone: "bg-violet-500/15 text-violet-500 dark:text-violet-300" },
  editor: { label: "ویرایشگر", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  viewer: { label: "مشاهده‌گر", tone: "bg-slate-500/15 text-slate-500 dark:text-slate-400" },
};

const ROLE_PERMISSIONS: Record<string, string> = {
  admin: "دسترسی کامل: ویرایش، مدیریت اعضا و پشتیبان‌گیری",
  editor: "امکان ثبت و ویرایش مدارک و تماس‌های مشترک",
  viewer: "فقط مشاهده اطلاعات در مواقع ضروری",
};

interface MemberFormState {
  fullName: string;
  phone: string;
  relation: string;
  role: "admin" | "editor" | "viewer";
  avatarInitials: string;
}

const EMPTY_FORM: MemberFormState = {
  fullName: "",
  phone: "",
  relation: "",
  role: "viewer",
  avatarInitials: "",
};

export function FamilyScreen() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberFormState>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const members = useApp((s) => s.members);
  const family = useApp((s) => s.family);
  const theme = useApp((s) => s.theme);
  const toggleTheme = useApp((s) => s.toggleTheme);
  const addMember = useApp((s) => s.addMember);
  const updateMember = useApp((s) => s.updateMember);
  const removeMember = useApp((s) => s.removeMember);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setSheetOpen(true);
  };

  useEffect(() => {
    const handler = () => setSheetOpen(true);
    window.addEventListener("rooz-fab-add", handler);
    return () => window.removeEventListener("rooz-fab-add", handler);
  }, []);

  const openEdit = (id: string) => {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setForm({
      fullName: m.fullName,
      phone: m.phone,
      relation: m.relation,
      role: m.role,
      avatarInitials: m.avatarInitials,
    });
    setEditingId(id);
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!form.fullName.trim()) return;
    const initials = form.avatarInitials.trim() || form.fullName.split(" ").map((s) => s[0]).join(" ").slice(0, 3);
    if (editingId) {
      updateMember(editingId, {
        fullName: form.fullName.trim(),
        phone: form.phone,
        relation: form.relation,
        role: form.role,
        avatarInitials: initials,
      });
    } else {
      addMember({
        fullName: form.fullName.trim(),
        phone: form.phone,
        relation: form.relation,
        role: form.role,
        avatarInitials: initials,
        status: "active",
        lastActiveJalali: "همین حالا",
      });
    }
    setSheetOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="خانواده و امنیت"
        icon={<Users className="w-5 h-5 text-white" />}
        trailing={
          <button
            type="button"
            onClick={openAdd}
            aria-label="دعوت عضو جدید"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      {/* Family header card */}
      <div className="px-4 -mt-3 mb-4">
        <div className="bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-transparent border border-violet-500/20 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] text-soft">پرونده خانواده</p>
              <p className="text-base font-bold text-strong">{family.title}</p>
            </div>
            <div className="text-left">
              <p className="text-[11px] text-soft">کد دعوت</p>
              <p className="text-sm font-bold text-violet-500 dark:text-violet-300 fa-num">{family.inviteCode}</p>
            </div>
          </div>
          <div className="flex -space-x-2 space-x-reverse">
            {members.map((m) => (
              <div
                key={m.id}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-white"
                title={m.fullName}
              >
                {m.avatarInitials}
              </div>
            ))}
            <button
              type="button"
              onClick={openAdd}
              className="w-8 h-8 rounded-full border-2 border-dashed border-violet-500/50 text-violet-500 dark:text-violet-300 flex items-center justify-center"
              aria-label="افزودن عضو"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Members list */}
      <section className="px-4 mb-5">
        <SectionTitle
          title="اعضای خانواده"
          action={<span className="text-[11px] text-soft fa-num">{members.length} نفر</span>}
        />
        <div className="space-y-2.5">
          {members.map((m) => {
            const role = ROLE_LABELS[m.role];
            return (
              <AppCard key={m.id} className="!p-3.5">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-sm font-bold shadow-glow">
                      {m.avatarInitials}
                    </div>
                    {m.isCurrentUser && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-strong truncate">{m.fullName}</p>
                      {m.isCurrentUser && (
                        <span className="text-[10px] text-soft">(شما)</span>
                      )}
                    </div>
                    <p className="text-[11px] text-soft truncate">
                      {m.relation} · {m.lastActiveJalali}
                    </p>
                    <p className="text-[11px] text-soft mt-0.5">{ROLE_PERMISSIONS[m.role]}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${role.tone}`}>{role.label}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(m.id)}
                        aria-label="ویرایش"
                        className="w-7 h-7 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 dark:text-violet-300 flex items-center justify-center transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      {!m.isCurrentUser && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(m.id)}
                          aria-label="حذف"
                          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </AppCard>
            );
          })}
        </div>
      </section>

      {/* Security settings */}
      <section className="px-4 mb-5">
        <SectionTitle
          title="امنیت، پشتیبان‌گیری و حریم خصوصی"
          icon={<ShieldCheck className="w-4 h-4" />}
        />
        <div className="space-y-2.5">
          {/* Theme toggle */}
          <AppCard className="!p-3.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center gap-3"
            >
              <span className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-strong">حالت {theme === "dark" ? "شب" : "روز"}</p>
                <p className="text-[11px] text-soft">تغییر ظاهر برنامه به روز یا شب</p>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-violet-500" : "bg-slate-300"}`}>
                <motion.div
                  animate={{ x: theme === "dark" ? 0 : 20 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                />
              </div>
            </button>
          </AppCard>

          <AppCard className="!p-3.5">
            <button type="button" className="w-full flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <Download className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-strong">پشتیبان رمزگذاری‌شده</p>
                <p className="text-[11px] text-soft">
                  آخرین فایل: <span className="fa-num">۱۴۰۵/۰۷/۱۰</span> · آفلاین
                </p>
              </div>
              <ChevronLeft className="w-4 h-4 text-soft" />
            </button>
          </AppCard>

          <AppCard className="!p-3.5">
            <button type="button" className="w-full flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
                <Fingerprint className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-strong">قفل برنامه</p>
                <p className="text-[11px] text-soft">اثر انگشت / پین · فعال</p>
              </div>
              <span className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold">فعال</span>
            </button>
          </AppCard>

          <AppCard className="!p-3.5">
            <button type="button" className="w-full flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Database className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-strong">فضای ذخیره‌سازی محلی</p>
                <p className="text-[11px] text-soft fa-num">۴۸ مگابایت · ۱۲ فایل کش‌شده</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-soft" />
            </button>
          </AppCard>

          <AppCard className="!p-3.5 border-red-500/30 bg-red-500/5">
            <button type="button" className="w-full flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <LogOut className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-red-500 dark:text-red-400">خروج امن</p>
                <p className="text-[11px] text-soft">پاک‌سازی داده‌های محلی</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-red-500" />
            </button>
          </AppCard>
        </div>
      </section>

      <div className="px-4 pb-4">
        <div className="rounded-xl px-3 py-2.5 text-[11px] text-soft flex items-start gap-2 bg-violet-500/5 border border-violet-500/15">
          <Lock className="w-4 h-4 text-violet-500 dark:text-violet-300 mt-0.5 shrink-0" />
          <span>اطلاعات شخصی فقط برای شما و مدیر خانواده قابل مشاهده است. فایل‌های پشتیبان با AES-256 رمزگذاری می‌شوند.</span>
        </div>
      </div>

      {/* Add/Edit member sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? "ویرایش عضو" : "افزودن عضو جدید"}
        subtitle="عضو جدید به پرونده خانواده اضافه می‌شود"
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
              disabled={!form.fullName.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shadow-glow disabled:opacity-40 transition-opacity"
            >
              ذخیره
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-soft mb-1.5">نام کامل</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="مثلاً: مریم احمدی"
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-soft mb-1.5">نسبت</label>
            <input
              type="text"
              value={form.relation}
              onChange={(e) => setForm({ ...form, relation: e.target.value })}
              placeholder="مثلاً: همسر، پسر، مادر..."
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-soft mb-1.5">شماره موبایل</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0912..."
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-soft mb-1.5">نقش در خانواده</label>
            <div className="grid grid-cols-3 gap-2">
              {(["admin", "editor", "viewer"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    form.role === r
                      ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white border-transparent"
                      : "surface-card text-strong border-transparent"
                  }`}
                >
                  {ROLE_LABELS[r].label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-soft mt-2">{ROLE_PERMISSIONS[form.role]}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-soft mb-1.5">حروف اختصاری (اختیاری)</label>
            <input
              type="text"
              maxLength={3}
              value={form.avatarInitials}
              onChange={(e) => setForm({ ...form, avatarInitials: e.target.value })}
              placeholder="مثلاً: م ا"
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>
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
              <p className="text-sm font-bold text-strong mb-1">حذف عضو؟</p>
              <p className="text-[11px] text-soft mb-4">این عضو از پرونده خانواده حذف می‌شود.</p>
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
                    removeMember(deleteConfirmId);
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
