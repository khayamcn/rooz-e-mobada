"use client";

import { useState, useRef } from "react";
import {
  Settings as SettingsIcon, Download, Upload, Moon, Sun, Lock, Database,
  LogOut, ChevronLeft, Palette, ShieldCheck, AlertTriangle, Check,
} from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { useApp } from "@/lib/store";
import { toPersian } from "@/lib/persian";
import { motion } from "framer-motion";
import type { ColorTheme, ScreenId } from "@/lib/types";

const COLOR_THEMES: { id: ColorTheme; label: string; colors: string[] }[] = [
  { id: "violet", label: "بنفش", colors: ["#8b5cf6", "#7c3aed", "#6d28d9"] },
  { id: "emerald", label: "سبز", colors: ["#10b981", "#059669", "#047857"] },
  { id: "rose", label: "قرمز", colors: ["#f43f5e", "#e11d48", "#be123c"] },
  { id: "blue", label: "آبی", colors: ["#3b82f6", "#2563eb", "#1d4ed8"] },
];

interface SettingsScreenProps {
  onNavigate: (id: ScreenId) => void;
}

export function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const theme = useApp((s) => s.theme);
  const colorTheme = useApp((s) => s.colorTheme);
  const toggleTheme = useApp((s) => s.toggleTheme);
  const setColorTheme = useApp((s) => s.setColorTheme);
  const appVersion = useApp((s) => s.appVersion);
  const exportBackup = useApp((s) => s.exportBackup);
  const importBackup = useApp((s) => s.importBackup);
  const lastBackupAt = useApp((s) => s.lastBackupAt);
  const deactivate = useApp((s) => s.deactivate);

  const [passphrase, setPassphrase] = useState("");
  const [importPassphrase, setImportPassphrase] = useState("");
  const [importResult, setImportResult] = useState<"success" | "error" | null>(null);
  const [importData, setImportData] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);

  const handleExport = () => {
    if (passphrase.length < 4) {
      alert("رمز عبور بکاپ باید حداقل ۴ کاراکتر باشد.");
      return;
    }
    const encrypted = exportBackup(passphrase);
    const blob = new Blob([encrypted], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rooz-backup-${new Date().toISOString().slice(0, 10)}.enc`;
    a.click();
    URL.revokeObjectURL(url);
    alert("بکاپ رمزنگاری‌شده ساخته شد.");
  };

  const handleImportFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImportData(reader.result as string);
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importData || importPassphrase.length < 4) return;
    const ok = importBackup(importData, importPassphrase);
    setImportResult(ok ? "success" : "error");
    setTimeout(() => setImportResult(null), 3000);
    if (ok) {
      setImportData("");
      setImportPassphrase("");
    }
  };

  return (
    <div className="flex flex-col bg-page min-h-full">
      <ScreenHeader
        title="تنظیمات"
        icon={<SettingsIcon className="w-5 h-5 text-white" />}
        statusPill={{ label: `v${appVersion}`, tone: "info" }}
      />

      <div className="px-4 -mt-3 mb-4">
        <AppCard className="!p-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center text-white shadow-glow shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-strong">روز مبادا</p>
              <p className="text-[11px] text-soft fa-num">نسخه {toPersian(appVersion)} · آفلاین</p>
            </div>
          </div>
        </AppCard>
      </div>

      {/* Appearance: day/night + color theme */}
      <section className="px-4 mb-4">
        <SectionTitle title="ظاهر" icon={<Palette className="w-4 h-4" />} />
        <AppCard className="!p-3.5 mb-2">
          <button type="button" onClick={toggleTheme} className="w-full flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </span>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm font-bold text-strong">حالت {theme === "dark" ? "شب" : "روز"}</p>
              <p className="text-[11px] text-soft">تغییر پس‌زمینه برنامه</p>
            </div>
            <div className={`relative w-11 h-6 rounded-full transition-colors ${theme === "dark" ? "brand-gradient" : "bg-slate-300"}`}>
              <motion.div
                animate={{ x: theme === "dark" ? 0 : 20 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
              />
            </div>
          </button>
        </AppCard>

        {/* Color theme picker */}
        <AppCard className="!p-3.5">
          <p className="text-xs font-bold text-soft mb-2.5">قالب رنگی</p>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_THEMES.map((ct) => (
              <button
                key={ct.id}
                type="button"
                onClick={() => setColorTheme(ct.id)}
                className={`relative py-3 rounded-xl border-2 transition-all ${
                  colorTheme === ct.id
                    ? "border-transparent shadow-glow"
                    : "border-transparent surface-card"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${ct.colors[0]}, ${ct.colors[2]})`,
                }}
                aria-label={ct.label}
              >
                {colorTheme === ct.id && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  </span>
                )}
                <span className="absolute bottom-1 left-0 right-0 text-[9px] font-bold text-white drop-shadow">
                  {ct.label}
                </span>
              </button>
            ))}
          </div>
        </AppCard>
      </section>

      {/* Backup with encryption */}
      <section className="px-4 mb-4">
        <SectionTitle title="پشتیبان‌گیری رمزنگاری‌شده" icon={<Database className="w-4 h-4" />} />
        <AppCard className="!p-4">
          <div className="flex items-start gap-2 mb-3 p-2 rounded-lg brand-bg-soft border border-slate-200/50 dark:border-white/5">
            <Lock className="w-4 h-4 brand-text mt-0.5 shrink-0" />
            <p className="text-[10px] text-soft leading-relaxed">
              بکاپ با رمز عبور شما رمزنگاری می‌شود. بدون رمز عبور صحیح، بازیابی غیرممکن است.
            </p>
          </div>
          <label className="block text-xs font-semibold text-soft mb-1.5">رمز عبور بکاپ</label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="حداقل ۴ کاراکتر"
            className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 mb-3"
          />
          <button
            type="button"
            onClick={handleExport}
            disabled={passphrase.length < 4}
            className="w-full py-2.5 rounded-xl brand-gradient text-white text-sm font-bold shadow-glow disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            ساخت فایل بکاپ
          </button>
          {lastBackupAt && (
            <p className="text-[10px] text-soft mt-2 fa-num">آخرین بکاپ: {lastBackupAt}</p>
          )}
        </AppCard>
      </section>

      {/* Restore */}
      <section className="px-4 mb-4">
        <SectionTitle title="بازیابی از بکاپ" />
        <AppCard className="!p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".enc,.txt"
            className="sr-only"
            onChange={(e) => handleImportFile(e.target.files?.[0] ?? undefined)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl surface-input text-sm font-bold text-strong mb-3 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {importData ? "فایل انتخاب شد ✓" : "انتخاب فایل بکاپ"}
          </button>
          {importData && (
            <>
              <label className="block text-xs font-semibold text-soft mb-1.5">رمز عبور بکاپ</label>
              <input
                type="password"
                value={importPassphrase}
                onChange={(e) => setImportPassphrase(e.target.value)}
                placeholder="رمز عبور"
                className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 mb-3"
              />
              <button
                type="button"
                onClick={handleImport}
                disabled={importPassphrase.length < 4}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-glow disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4" />
                بازیابی اطلاعات
              </button>
            </>
          )}
          {importResult && (
            <div className={`mt-3 rounded-xl px-3 py-2 text-[11px] ${importResult === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" : "bg-red-500/10 text-red-500"}`}>
              {importResult === "success" ? "✓ بازیابی موفق" : "✗ رمز عبور اشتباه یا فایل نامعتبر"}
            </div>
          )}
        </AppCard>
      </section>

      {/* Deactivate */}
      <section className="px-4 mb-4">
        <AppCard className="!p-3.5 border-red-500/30 bg-red-500/5" onClick={() => setDeactivateConfirm(true)}>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <LogOut className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm font-bold text-red-500 dark:text-red-400">غیرفعال‌سازی برنامه</p>
              <p className="text-[11px] text-soft">نیاز به توکن جدید برای فعال‌سازی مجدد</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-red-500" />
          </div>
        </AppCard>
      </section>

      <div className="px-4 pb-4">
        <p className="text-[10px] text-soft text-center fa-num">
          روز مبادا v{toPersian(appVersion)} · نسخه آفلاین
        </p>
      </div>

      {/* Deactivate confirmation */}
      {deactivateConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setDeactivateConfirm(false)}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="surface-card rounded-3xl p-5 max-w-xs w-full text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 mx-auto mb-3 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-bold text-strong mb-1">غیرفعال‌سازی؟</p>
            <p className="text-[11px] text-soft mb-4">برنامه قفل می‌شود. اطلاعات شما پاک نمی‌شود.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeactivateConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  deactivate();
                  setDeactivateConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
              >
                غیرفعال کن
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
