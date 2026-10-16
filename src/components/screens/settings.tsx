"use client";

import { useState, useRef } from "react";
import {
  Settings as SettingsIcon, Download, Upload, RefreshCw, Info, ShieldCheck,
  LogOut, Moon, Sun, Database, FileText, ChevronLeft, ExternalLink, Bell,
} from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { useApp } from "@/lib/store";
import { toPersian } from "@/lib/persian";
import { motion } from "framer-motion";
import type { ScreenId } from "@/components/bottom-nav";

interface SettingsScreenProps {
  onNavigate: (id: ScreenId) => void;
}

export function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const theme = useApp((s) => s.theme);
  const toggleTheme = useApp((s) => s.toggleTheme);
  const appVersion = useApp((s) => s.appVersion);
  const latestVersion = useApp((s) => s.latestVersion);
  const updateAvailable = useApp((s) => s.updateAvailable);
  const checkForUpdate = useApp((s) => s.checkForUpdate);
  const exportBackup = useApp((s) => s.exportBackup);
  const importBackup = useApp((s) => s.importBackup);
  const lastBackupAt = useApp((s) => s.lastBackupAt);
  const logout = useApp((s) => s.logout);

  const [checking, setChecking] = useState(false);
  const [importResult, setImportResult] = useState<"success" | "error" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rooz-e-mobada-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importBackup(reader.result as string);
      setImportResult(ok ? "success" : "error");
      setTimeout(() => setImportResult(null), 3000);
    };
    reader.readAsText(file);
  };

  const handleCheckUpdate = () => {
    setChecking(true);
    setTimeout(() => {
      checkForUpdate();
      setChecking(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="تنظیمات"
        icon={<SettingsIcon className="w-5 h-5 text-white" />}
        statusPill={{ label: `v${appVersion}`, tone: "info" }}
      />

      {/* App version card */}
      <div className="px-4 -mt-3 mb-4">
        <AppCard className="!p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-glow shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-strong">روز مبادا</p>
              <p className="text-[11px] text-soft fa-num">نسخه {toPersian(appVersion)} · نسخه نمایشی بازار</p>
            </div>
          </div>
          {updateAvailable && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 text-[11px] text-emerald-600 dark:text-emerald-300">
              ✓ نسخه جدید {toPersian(latestVersion)} در دسترس است.
            </div>
          )}
        </AppCard>
      </div>

      {/* Theme toggle */}
      <section className="px-4 mb-4">
        <SectionTitle title="ظاهر" />
        <AppCard className="!p-3.5">
          <button type="button" onClick={toggleTheme} className="w-full flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </span>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm font-bold text-strong">حالت {theme === "dark" ? "شب" : "روز"}</p>
              <p className="text-[11px] text-soft">تغییر ظاهر برنامه</p>
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
      </section>

      {/* Backup & restore */}
      <section className="px-4 mb-4">
        <SectionTitle title="پشتیبان‌گیری و بازیابی" icon={<Database className="w-4 h-4" />} />
        <div className="space-y-2.5">
          <AppCard className="!p-3.5" onClick={handleExport}>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <Download className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-strong">تهیه فایل پشتیبان</p>
                <p className="text-[11px] text-soft">
                  {lastBackupAt ? `آخرین بکاپ: ${lastBackupAt}` : "خروجی JSON با تمام اطلاعات"}
                </p>
              </div>
              <ChevronLeft className="w-4 h-4 text-soft" />
            </div>
          </AppCard>

          <AppCard className="!p-3.5" onClick={() => fileInputRef.current?.click()}>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
                <Upload className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-strong">بازیابی از فایل پشتیبان</p>
                <p className="text-[11px] text-soft">وارد کردن فایل JSON</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-soft" />
            </div>
          </AppCard>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={(e) => handleImport(e.target.files?.[0] ?? undefined)}
          />
          {importResult && (
            <div className={`rounded-xl px-3 py-2 text-[11px] ${importResult === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "bg-red-500/10 text-red-500"}`}>
              {importResult === "success" ? "✓ بازیابی با موفقیت انجام شد." : "✗ خطا در بازیابی فایل."}
            </div>
          )}
        </div>
      </section>

      {/* Update check */}
      <section className="px-4 mb-4">
        <SectionTitle title="بروزرسانی برنامه" icon={<RefreshCw className="w-4 h-4" />} />
        <AppCard className="!p-3.5">
          <button type="button" onClick={handleCheckUpdate} disabled={checking} className="w-full flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
              <RefreshCw className={`w-5 h-5 ${checking ? "animate-spin" : ""}`} />
            </span>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm font-bold text-strong">بررسی نسخه جدید</p>
              <p className="text-[11px] text-soft fa-num">
                {checking ? "در حال بررسی..." : `نسخه فعلی: ${toPersian(appVersion)}`}
              </p>
            </div>
            <ChevronLeft className="w-4 h-4 text-soft" />
          </button>
        </AppCard>
      </section>

      {/* Sync & connections */}
      <section className="px-4 mb-4">
        <SectionTitle title="همگام‌سازی" />
        <AppCard className="!p-3.5" onClick={() => onNavigate("sync")}>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm font-bold text-strong">مرکز همگام‌سازی</p>
              <p className="text-[11px] text-soft">وضعیت اتصال و حل تعارض</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-soft" />
          </div>
        </AppCard>
      </section>

      {/* About */}
      <section className="px-4 mb-4">
        <SectionTitle title="درباره برنامه" icon={<Info className="w-4 h-4" />} />
        <div className="space-y-2.5">
          <AppCard className="!p-3.5">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
                <FileText className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-strong">راهنمای استفاده</p>
                <p className="text-[11px] text-soft">آموزش کار با برنامه</p>
              </div>
              <ExternalLink className="w-4 h-4 text-soft" />
            </div>
          </AppCard>
          <AppCard className="!p-3.5">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-strong">حریم خصوصی و امنیت</p>
                <p className="text-[11px] text-soft">سیاست حفاظت از اطلاعات</p>
              </div>
              <ExternalLink className="w-4 h-4 text-soft" />
            </div>
          </AppCard>
          <AppCard className="!p-3.5">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Bell className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-strong">صفحه بازار</p>
                <p className="text-[11px] text-soft">نظرات و امتیاز در بازار اندروید</p>
              </div>
              <ExternalLink className="w-4 h-4 text-soft" />
            </div>
          </AppCard>
        </div>
      </section>

      {/* Logout */}
      <section className="px-4 mb-4">
        <AppCard className="!p-3.5 border-red-500/30 bg-red-500/5" onClick={logout}>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <LogOut className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm font-bold text-red-500 dark:text-red-400">خروج از حساب</p>
              <p className="text-[11px] text-soft">پاک‌سازی نشست و داده‌های محلی</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-red-500" />
          </div>
        </AppCard>
      </section>

      <div className="px-4 pb-4">
        <p className="text-[10px] text-soft text-center fa-num">
          روز مبادا v{toPersian(appVersion)} · ساخته‌شده برای خانواده‌های ایرانی
        </p>
      </div>
    </div>
  );
}
