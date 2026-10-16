"use client";

import { useState } from "react";
import {
  Users, Plus, ShieldCheck, Lock, Database, LogOut, ChevronLeft,
  Fingerprint, Download, Sun, Moon, Trash2, Pencil, RefreshCw, UserCog,
} from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { Sheet } from "@/components/shared/sheet";
import { ImageUploader, type UploadedImage } from "@/components/shared/image-uploader";
import { CopyChip } from "@/components/shared/copyable-field";
import { useApp } from "@/lib/store";
import { toPersian, persianPhone } from "@/lib/persian";
import { motion, AnimatePresence } from "framer-motion";
import type { ScreenId } from "@/components/bottom-nav";

const ROLE_LABELS: Record<string, { label: string; tone: string }> = {
  admin: { label: "سرپرست", tone: "bg-violet-500/15 text-violet-500 dark:text-violet-300" },
  editor: { label: "ویرایشگر", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  viewer: { label: "مشاهده‌گر", tone: "bg-slate-500/15 text-slate-500 dark:text-slate-400" },
};

const ROLE_PERMISSIONS: Record<string, string> = {
  admin: "مدیریت کامل: اعضا، نقش‌ها، تنظیمات، فایل‌ها و بکاپ‌گیری",
  editor: "بارگذاری، ویرایش و مدیریت فایل‌ها و مدارک مجاز",
  viewer: "فقط مشاهده و دانلود موارد مجاز — بدون تغییر یا حذف",
};

interface MemberFormState {
  fullName: string;
  phone: string;
  nationalId: string;
  relation: string;
  role: "admin" | "editor" | "viewer";
  avatarInitials: string;
  avatarDataUrl?: string;
}

const EMPTY_FORM: MemberFormState = {
  fullName: "",
  phone: "",
  nationalId: "",
  relation: "",
  role: "viewer",
  avatarInitials: "",
};

interface FamilyScreenProps {
  onNavigate?: (id: ScreenId) => void;
}

export function FamilyScreen({ onNavigate }: FamilyScreenProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberFormState>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [roleSheetId, setRoleSheetId] = useState<string | null>(null);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);

  const members = useApp((s) => s.members);
  const family = useApp((s) => s.family);
  const theme = useApp((s) => s.theme);
  const toggleTheme = useApp((s) => s.toggleTheme);
  const addMember = useApp((s) => s.addMember);
  const updateMember = useApp((s) => s.updateMember);
  const removeMember = useApp((s) => s.removeMember);
  const revokeMember = useApp((s) => s.revokeMember);
  const transferOwnership = useApp((s) => s.transferOwnership);
  const regenerateInviteCode = useApp((s) => s.regenerateInviteCode);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setSheetOpen(true);
  };

  const openEdit = (id: string) => {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setForm({
      fullName: m.fullName,
      phone: m.phone,
      nationalId: m.nationalId ?? "",
      relation: m.relation,
      role: m.role,
      avatarInitials: m.avatarInitials,
      avatarDataUrl: m.avatarDataUrl,
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
        nationalId: form.nationalId || undefined,
        relation: form.relation,
        role: form.role,
        avatarInitials: initials,
        avatarDataUrl: form.avatarDataUrl,
      });
    } else {
      addMember({
        fullName: form.fullName.trim(),
        phone: form.phone,
        nationalId: form.nationalId || undefined,
        relation: form.relation,
        role: form.role,
        avatarInitials: initials,
        avatarDataUrl: form.avatarDataUrl,
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
            <button
              type="button"
              onClick={() => setInviteSheetOpen(true)}
              className="text-left bg-violet-500/10 hover:bg-violet-500/20 transition-colors rounded-xl px-3 py-2"
            >
              <p className="text-[10px] text-soft">کد دعوت</p>
              <p className="text-sm font-bold text-violet-500 dark:text-violet-300 fa-num tracking-wider">
                {family.inviteCode}
              </p>
            </button>
          </div>
          <div className="flex -space-x-2 space-x-reverse">
            {members.map((m) => (
              <ProfileAvatar
                key={m.id}
                name={m.fullName}
                initials={m.avatarInitials}
                avatarDataUrl={m.avatarDataUrl}
                size="sm"
                ring
              />
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

      {/* Members list with profile photos */}
      <section className="px-4 mb-5">
        <SectionTitle
          title="اعضای خانواده"
          action={<span className="text-[11px] text-soft fa-num">{members.length} نفر</span>}
        />
        <div className="space-y-2.5">
          {members.map((m) => {
            const role = ROLE_LABELS[m.role];
            return (
              <AppCard key={m.id} className={`!p-3.5 ${m.status === "revoked" ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    name={m.fullName}
                    initials={m.avatarInitials}
                    avatarDataUrl={m.avatarDataUrl}
                    size="lg"
                    ring={m.isCurrentUser}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-strong truncate">{m.fullName}</p>
                      {m.isCurrentUser && <span className="text-[10px] text-soft">(شما)</span>}
                      {m.status === "revoked" && (
                        <span className="text-[10px] text-red-500 dark:text-red-400 font-semibold">(لغو شده)</span>
                      )}
                    </div>
                    <p className="text-[11px] text-soft truncate">
                      {m.relation} · {m.lastActiveJalali}
                    </p>
                    <p className="text-[11px] text-soft mt-0.5">{ROLE_PERMISSIONS[m.role]}</p>
                    {m.phone && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-soft fa-num">
                        <span dir="ltr">{persianPhone(m.phone)}</span>
                        <CopyChip value={m.phone} label="شماره موبایل" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${role.tone}`}>{role.label}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setRoleSheetId(m.id)}
                        aria-label="نقش"
                        className="w-7 h-7 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 dark:text-violet-300 flex items-center justify-center transition-colors"
                      >
                        <UserCog className="w-3 h-3" />
                      </button>
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
        <SectionTitle title="امنیت، پشتیبان‌گیری و حریم خصوصی" icon={<ShieldCheck className="w-4 h-4" />} />
        <div className="space-y-2.5">
          <AppCard className="!p-3.5">
            <button type="button" onClick={toggleTheme} className="w-full flex items-center gap-3">
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

          <AppCard className="!p-3.5" onClick={() => onNavigate?.("settings")}>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <Download className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-strong">پشتیبان‌گیری و بازیابی</p>
                <p className="text-[11px] text-soft">خروجی و بازیابی فایل پشتیبان رمزگذاری‌شده</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-soft" />
            </div>
          </AppCard>

          <AppCard className="!p-3.5" onClick={() => onNavigate?.("settings")}>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-strong">بررسی بروزرسانی</p>
                <p className="text-[11px] text-soft">نسخه فعلی: ۱.۲.۰ · آخرین نسخه: ۱.۲.۰</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-soft" />
            </div>
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
                <p className="text-sm font-bold text-red-500 dark:text-red-400">خروج امن از حساب</p>
                <p className="text-[11px] text-soft">پاک‌سازی داده‌های محلی و لغو نشست</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-red-500" />
            </button>
          </AppCard>
        </div>
      </section>

      <div className="px-4 pb-4">
        <div className="rounded-xl px-3 py-2.5 text-[11px] text-soft flex items-start gap-2 bg-violet-500/5 border border-violet-500/15">
          <Lock className="w-4 h-4 text-violet-500 dark:text-violet-300 mt-0.5 shrink-0" />
          <span>اطلاعات شخصی فقط برای شما و سرپرست خانواده قابل مشاهده است. فایل‌های پشتیبان با AES-256 رمزگذاری می‌شوند.</span>
        </div>
      </div>

      {/* Add/Edit member sheet with profile photo upload */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? "ویرایش عضو" : "افزودن عضو جدید"}
        subtitle="عکس پروفایل و اطلاعات عضو را وارد کنید"
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
          {/* Profile photo uploader */}
          <div className="flex justify-center">
            <div className="relative">
              <ProfileAvatar
                name={form.fullName || "عضو جدید"}
                initials={form.avatarInitials}
                avatarDataUrl={form.avatarDataUrl}
                size="xl"
                ring
              />
              {form.avatarDataUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, avatarDataUrl: undefined })}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
                  aria-label="حذف عکس"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <ImageUploader
            value={form.avatarDataUrl ? { name: "profile", size: 0, type: "image/jpeg", dataUrl: form.avatarDataUrl } : null}
            onChange={(img: UploadedImage | null) => setForm({ ...form, avatarDataUrl: img?.dataUrl })}
            label="عکس پروفایل"
            hint="PNG یا JPG"
          />

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
        </div>
      </Sheet>

      {/* Role management sheet */}
      <Sheet
        open={!!roleSheetId}
        onClose={() => setRoleSheetId(null)}
        title="مدیریت نقش عضو"
        subtitle={members.find((m) => m.id === roleSheetId)?.fullName}
        footer={
          <button
            type="button"
            onClick={() => setRoleSheetId(null)}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shadow-glow"
          >
            بستن
          </button>
        }
      >
        <div className="space-y-2">
          {(["admin", "editor", "viewer"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                if (roleSheetId) updateMember(roleSheetId, { role: r });
                setRoleSheetId(null);
              }}
              className="w-full p-3 rounded-xl surface-card text-right hover:shadow-glow transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-strong">{ROLE_LABELS[r].label}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${ROLE_LABELS[r].tone}`}>
                  {ROLE_LABELS[r].label}
                </span>
              </div>
              <p className="text-[11px] text-soft mt-1">{ROLE_PERMISSIONS[r]}</p>
            </button>
          ))}
          <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
          <button
            type="button"
            onClick={() => {
              if (roleSheetId) {
                transferOwnership(roleSheetId);
                setRoleSheetId(null);
              }
            }}
            className="w-full p-3 rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-300 text-right hover:bg-violet-500/20 transition-colors"
          >
            <p className="text-sm font-bold">انتقال سرپرستی</p>
            <p className="text-[11px] text-soft mt-0.5">این عضو سرپرست جدید خانواده می‌شود</p>
          </button>
          <button
            type="button"
            onClick={() => {
              if (roleSheetId) {
                revokeMember(roleSheetId);
                setRoleSheetId(null);
              }
            }}
            className="w-full p-3 rounded-xl bg-red-500/10 text-red-500 text-right hover:bg-red-500/20 transition-colors"
          >
            <p className="text-sm font-bold">لغو دسترسی</p>
            <p className="text-[11px] text-soft mt-0.5">کاربر دیگر نمی‌تواند وارد شود</p>
          </button>
        </div>
      </Sheet>

      {/* Invite code sheet */}
      <Sheet
        open={inviteSheetOpen}
        onClose={() => setInviteSheetOpen(false)}
        title="کد دعوت خانواده"
        subtitle="این کد را با اعضای خانواده به اشتراک بگذارید"
        footer={
          <button
            type="button"
            onClick={() => setInviteSheetOpen(false)}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shadow-glow"
          >
            بستن
          </button>
        }
      >
        <div className="text-center py-4">
          <p className="text-3xl font-bold tracking-[0.3em] text-violet-500 dark:text-violet-300 fa-num mb-3">
            {family.inviteCode}
          </p>
          <p className="text-[11px] text-soft mb-6">
            این کد ۷ روز معتبر است. اعضای جدید با وارد کردن این کد و تأیید OTP می‌توانند به خانواده بپیوندند.
          </p>
          <button
            type="button"
            onClick={() => regenerateInviteCode()}
            className="w-full py-2.5 rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-300 text-sm font-bold hover:bg-violet-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تولید کد جدید (ابطال کد قبلی)
          </button>
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
