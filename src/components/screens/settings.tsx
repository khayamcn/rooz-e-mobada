"use client";

import { useRef, useState } from "react";
import {
  Database,
  Download,
  FileLock2,
  Lock,
  Moon,
  Palette,
  ShieldAlert,
  Sun,
  Upload,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import type { ColorTheme } from "@/lib/types";

const COLOR_THEMES: { id: ColorTheme; label: string; from: string; to: string }[] = [
  { id: "violet", label: "بنفش", from: "#A78BFA", to: "#7C3AED" },
  { id: "emerald", label: "سبز", from: "#6EE7B7", to: "#059669" },
  { id: "rose", label: "قرمز", from: "#FDA4AF", to: "#E11D48" },
  { id: "blue", label: "آبی", from: "#93C5FD", to: "#2563EB" },
];

export function SettingsScreen() {
  const appVersion = useApp((s) => s.appVersion);
  const theme = useApp((s) => s.theme);
  const colorTheme = useApp((s) => s.colorTheme);
  const setTheme = useApp((s) => s.setTheme);
  const toggleTheme = useApp((s) => s.toggleTheme);
  const setColorTheme = useApp((s) => s.setColorTheme);
  const exportBackup = useApp((s) => s.exportBackup);
  const importBackup = useApp((s) => s.importBackup);
  const deactivate = useApp((s) => s.deactivate);
  const lastBackupAt = useApp((s) => s.lastBackupAt);

  const [passphrase, setPassphrase] = useState("");
  const [restorePass, setRestorePass] = useState("");
  const [restoreData, setRestoreData] = useState("");
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!passphrase.trim()) return;
    const encrypted = exportBackup(passphrase.trim());
    // Trigger download
    const blob = new Blob([encrypted], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rooz-mobada-backup-${new Date().toISOString().slice(0, 10)}.enc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRestoreData(String(reader.result));
    };
    reader.readAsText(file);
  };

  const handleRestore = () => {
    if (!restoreData.trim() || !restorePass.trim()) return;
    const ok = importBackup(restoreData.trim(), restorePass.trim());
    if (ok) {
      setRestoreData("");
      setRestorePass("");
      alert("بازیابی با موفقیت انجام شد.");
    } else {
      alert("بازیابی ناموفق بود. رمز عبور یا فایل را بررسی کنید.");
    }
  };

  const handleDeactivate = () => {
    if (confirmDeactivate) {
      deactivate();
      setConfirmDeactivate(false);
    } else {
      setConfirmDeactivate(true);
      setTimeout(() => setConfirmDeactivate(false), 4000);
    }
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader title="تنظیمات" subtitle="پیکربندی برنامه" />

      <div className="px-4 -mt-4 space-y-5">
        {/* Version */}
        <AppCard asDiv className="!p-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl brand-gradient text-white flex items-center justify-center">
            <Database size={20} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-strong">روز مبادا</div>
            <div className="text-[11px] text-soft">نسخه {appVersion}</div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full brand-bg-soft text-brand-text">
            آفلاین
          </span>
        </AppCard>

        {/* Appearance */}
        <div>
          <SectionTitle icon={<Palette size={14} />} label="ظاهر" />
          <AppCard asDiv className="!p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon size={18} className="text-violet-500" />
                ) : (
                  <Sun size={18} className="text-amber-500" />
                )}
                <span className="text-sm text-strong">
                  {theme === "dark" ? "حالت شب" : "حالت روز"}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  theme === "dark" ? "brand-gradient" : "bg-slate-200 dark:bg-slate-700"
                }`}
                aria-label="تغییر حالت"
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                    theme === "dark" ? "left-0.5" : "right-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-soft">رنگ主题 برنامه</div>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_THEMES.map((c) => {
                  const isActive = colorTheme === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorTheme(c.id)}
                      className={`flex flex-col items-center gap-1 py-2 rounded-lg pressable ${
                        isActive ? "brand-bg-soft" : "surface-input"
                      }`}
                      aria-label={c.label}
                    >
                      <span
                        className="h-8 w-8 rounded-full"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`,
                        }}
                      />
                      <span
                        className={`text-[10px] ${
                          isActive ? "text-brand-text font-bold" : "text-soft"
                        }`}
                      >
                        {c.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </AppCard>
        </div>

        {/* Backup */}
        <div>
          <SectionTitle
            icon={<FileLock2 size={14} />}
            label="پشتیبان‌گیری رمزنگاری‌شده"
          />
          <AppCard asDiv className="!p-4 space-y-3">
            <p className="text-[11px] text-soft leading-relaxed">
              با یک رمز عبور دلخواه، از تمام اطلاعات خود یک نسخه پشتیبان رمزنگاری‌شده بسازید.
              این رمز را در جای امن نگه دارید — بدون آن بازیابی امکان‌پذیر نیست.
            </p>
            <Field label="رمز عبور پشتیبان">
              <input
                type="password"
                dir="ltr"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="رمز عبور دلخواه"
                className="text-right"
              />
            </Field>
            <button
              type="button"
              onClick={handleExport}
              disabled={!passphrase.trim()}
              className="w-full h-10 rounded-full brand-gradient text-white text-xs font-bold pressable shadow-glow flex items-center justify-center gap-2"
            >
              <Download size={14} /> خروجی فایل پشتیبان
            </button>
            {lastBackupAt && (
              <p className="text-[10px] text-faint text-center">
                آخرین پشتیبان: {new Date(lastBackupAt).toLocaleString("fa-IR")}
              </p>
            )}
          </AppCard>
        </div>

        {/* Restore */}
        <div>
          <SectionTitle icon={<Upload size={14} />} label="بازیابی از فایل" />
          <AppCard asDiv className="!p-4 space-y-3">
            <p className="text-[11px] text-soft leading-relaxed">
              فایل پشتیبان (.enc) را انتخاب کنید و رمز عبور مربوط به آن را وارد کنید.
              اطلاعات فعلی با اطلاعات فایل جایگزین خواهد شد.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".enc,text/plain"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-10 rounded-full surface-input text-strong text-xs font-bold pressable flex items-center justify-center gap-2"
            >
              <Upload size={14} /> انتخاب فایل
            </button>
            {restoreData && (
              <div className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">
                فایل انتخاب شد ({restoreData.length} کاراکتر)
              </div>
            )}
            <Field label="رمز عبور فایل پشتیبان">
              <input
                type="password"
                dir="ltr"
                value={restorePass}
                onChange={(e) => setRestorePass(e.target.value)}
                placeholder="رمز عبور"
                className="text-right"
              />
            </Field>
            <button
              type="button"
              onClick={handleRestore}
              disabled={!restoreData.trim() || !restorePass.trim()}
              className="w-full h-10 rounded-full surface-input text-strong text-xs font-bold pressable flex items-center justify-center gap-2"
            >
              <Lock size={14} /> بازیابی اطلاعات
            </button>
          </AppCard>
        </div>

        {/* Danger zone */}
        <div>
          <SectionTitle icon={<ShieldAlert size={14} />} label="منطقه خطر" />
          <AppCard asDiv className="!p-4 border border-red-200/40 dark:border-red-900/30">
            <p className="text-[11px] text-soft leading-relaxed mb-3">
              با غیرفعال‌سازی، تمام اطلاعات محلی پاک شده و برنامه به حالت اولیه برمی‌گردد.
              این عمل قابل بازگشت نیست.
            </p>
            <button
              type="button"
              onClick={handleDeactivate}
              className={`w-full h-10 rounded-full text-xs font-bold pressable flex items-center justify-center gap-2 ${
                confirmDeactivate
                  ? "bg-red-600 text-white"
                  : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300"
              }`}
            >
              <ShieldAlert size={14} />
              {confirmDeactivate ? "مجدداً بزنید برای تأیید نهایی" : "غیرفعال‌سازی برنامه"}
            </button>
          </AppCard>
        </div>

        <div className="h-2" />
      </div>
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
