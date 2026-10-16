"use client";

import { useState } from "react";
import {
  RefreshCw, ChevronRight, AlertTriangle, CheckCircle2, Cloud,
  Smartphone, XCircle, Clock,
} from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { useApp } from "@/lib/store";
import { motion } from "framer-motion";

type ResolutionChoice = "local" | "server" | null;

const OP_STATUS_LABELS: Record<string, { label: string; tone: string; icon: typeof CheckCircle2 }> = {
  in_progress: { label: "در حال ارسال", tone: "bg-amber-500/15 text-amber-600 dark:text-amber-300", icon: RefreshCw },
  failed: { label: "متوقف — خطای شبکه", tone: "bg-red-500/15 text-red-500 dark:text-red-300", icon: XCircle },
};

export function SyncScreen() {
  const [choice, setChoice] = useState<ResolutionChoice>(null);
  const [resolving, setResolving] = useState(false);

  const syncMeta = useApp((s) => s.syncMeta);
  const operations = useApp((s) => s.operations);
  const conflict = useApp((s) => s.conflict);
  const resolveConflict = useApp((s) => s.resolveConflict);

  const handleConfirm = () => {
    if (!choice) return;
    setResolving(true);
    setTimeout(() => {
      resolveConflict(choice);
      setResolving(false);
      setChoice(null);
    }, 1200);
  };

  const isResolved = !!conflict.resolvedAs;

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="مرکز همگام‌سازی"
        icon={<RefreshCw className="w-5 h-5 text-white" />}
        statusPill={{
          label: syncMeta.connectionStatus === "online" ? "آنلاین" : "آفلاین",
          tone: syncMeta.connectionStatus === "online" ? "online" : "offline",
        }}
        trailing={
          <button
            type="button"
            aria-label="بازگشت"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        }
      />

      {/* Sync status summary */}
      <section className="px-4 -mt-3 mb-4">
        <AppCard className="!p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-pulse-soft ${
                  syncMeta.connectionStatus === "online" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span className="text-sm font-bold text-strong">
                وضعیت: {syncMeta.connectionStatus === "online" ? "آنلاین" : "آفلاین"}
              </span>
            </div>
            <span className="text-[11px] text-soft">
              سرور: {syncMeta.serverReachable ? "متصل" : "غیرقابل دسترسی"}
            </span>
          </div>

          <div className="rounded-xl px-3 py-2 text-[11px] text-soft mb-3 bg-violet-500/5 border border-violet-500/15">
            آخرین همگام‌سازی موفق:{" "}
            <span className="text-strong font-bold fa-num">
              {syncMeta.lastSuccessfulSyncJalali} ساعت {syncMeta.lastSuccessfulSyncTime}
            </span>
          </div>

          <button
            type="button"
            disabled={syncMeta.connectionStatus === "offline"}
            className={`w-full py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-all ${
              syncMeta.connectionStatus === "online"
                ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white active:scale-95 shadow-glow"
                : "bg-slate-100 dark:bg-slate-800 text-soft cursor-not-allowed"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            همگام‌سازی دستی اکنون
          </button>
          {syncMeta.connectionStatus === "offline" && (
            <p className="text-[10px] text-soft text-center mt-2">
              برای همگام‌سازی دستی، ابتدا به اینترنت متصل شوید.
            </p>
          )}
        </AppCard>
      </section>

      {/* Conflict resolution */}
      {!isResolved && syncMeta.conflictsCount > 0 && (
        <section className="px-4 mb-5">
          <SectionTitle
            icon={<AlertTriangle className="w-4 h-4" />}
            title="تعارض نیازمند بررسی"
            tone="alert"
            action={<span className="text-[11px] font-bold text-red-500 dark:text-red-400 fa-num">{syncMeta.conflictsCount} مورد</span>}
          />
          <AppCard className="!p-3.5 border-red-500/30">
            <p className="text-[11px] text-soft mb-1">
              این رکورد هم‌زمان در گوشی شما و گوشی «مریم» تغییر کرده است. کدام نسخه حفظ شود؟
            </p>
            <p className="text-sm font-bold text-strong mb-3">{conflict.entityLabel}</p>

            <button
              type="button"
              onClick={() => setChoice("local")}
              className={`w-full text-right rounded-xl border-2 p-3 mb-2 transition-all ${
                choice === "local" ? "border-violet-500 bg-violet-500/5" : "border-slate-200 dark:border-slate-700 surface-card"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-500 dark:text-violet-300">
                  <Smartphone className="w-3.5 h-3.5" />
                  نسخه این دستگاه
                </span>
                <span className="text-[10px] text-soft fa-num">{conflict.localVersion.timestampJalali}</span>
              </div>
              <p className="text-[10px] text-soft mb-2">ثبت {conflict.localVersion.author}</p>
              <div className="space-y-1">
                {conflict.localVersion.fields.map((f) => (
                  <div key={f.label} className="flex items-center justify-between text-[11px]">
                    <span className="text-soft">{f.label}: </span>
                    <span className="text-strong font-semibold fa-num">{f.value}</span>
                  </div>
                ))}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setChoice("server")}
              className={`w-full text-right rounded-xl border-2 p-3 mb-3 transition-all ${
                choice === "server" ? "border-violet-500 bg-violet-500/5" : "border-slate-200 dark:border-slate-700 surface-card"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-500 dark:text-violet-300">
                  <Cloud className="w-3.5 h-3.5" />
                  نسخه سرور
                </span>
                <span className="text-[10px] text-soft fa-num">{conflict.serverVersion.timestampJalali}</span>
              </div>
              <p className="text-[10px] text-soft mb-2">ثبت {conflict.serverVersion.author}</p>
              <div className="space-y-1">
                {conflict.serverVersion.fields.map((f) => (
                  <div key={f.label} className="flex items-center justify-between text-[11px]">
                    <span className="text-soft">{f.label}: </span>
                    <span className="text-strong font-semibold fa-num">{f.value}</span>
                  </div>
                ))}
              </div>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!choice || resolving}
              className={`w-full py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-all ${
                choice && !resolving
                  ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white active:scale-95 shadow-glow"
                  : "bg-slate-100 dark:bg-slate-800 text-soft cursor-not-allowed"
              }`}
            >
              {resolving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  در حال اعمال...
                </>
              ) : choice === "local" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  حفظ نسخه این دستگاه
                </>
              ) : choice === "server" ? (
                <>
                  <Cloud className="w-4 h-4" />
                  حفظ نسخه سرور
                </>
              ) : (
                "یک نسخه را انتخاب کنید"
              )}
            </button>
          </AppCard>
        </section>
      )}

      {isResolved && (
        <section className="px-4 mb-5">
          <AppCard className="!p-4 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-strong">تعارض حل شد</p>
                <p className="text-[11px] text-soft">
                  نسخه {conflict.resolvedAs === "local" ? "این دستگاه" : "سرور"} حفظ شد.
                </p>
              </div>
            </div>
          </AppCard>
        </section>
      )}

      {/* Outbox queue */}
      <section className="px-4 mb-5">
        <SectionTitle
          icon={<Clock className="w-4 h-4" />}
          title="صف عملیات در انتظار ارسال"
          action={<span className="text-[11px] text-soft fa-num">{syncMeta.pendingOperationsCount} مورد</span>}
        />
        <div className="space-y-2.5">
          {operations.map((op) => {
            const st = OP_STATUS_LABELS[op.status];
            const StatusIcon = st.icon;
            const isSpinning = op.status === "in_progress";
            return (
              <AppCard key={op.id} className="!p-3.5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${st.tone}`}>
                      <StatusIcon className={`w-4.5 h-4.5 ${isSpinning ? "animate-spin" : ""}`} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-strong leading-snug">{op.entityLabel}</p>
                      <p className="text-[11px] text-soft mt-0.5 fa-num">{op.createdAtJalali}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold ${st.tone}`}>
                    {st.label}
                  </span>
                </div>
                {op.lastErrorFa && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5 text-[11px] text-red-500 dark:text-red-300 flex items-start gap-1.5">
                    <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{op.lastErrorFa}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 text-[10px] text-soft">
                  <span>عملیات: <span className="font-semibold text-strong">{op.operationType === "INSERT" ? "افزودن" : op.operationType === "UPDATE" ? "ویرایش" : "حذف"}</span></span>
                  <span className="fa-num">تلاش {op.retryCount} از ۵</span>
                </div>
              </AppCard>
            );
          })}
        </div>
      </section>

      {/* Sync log */}
      <section className="px-4 mb-5">
        <SectionTitle title="گزارش همگام‌سازی اخیر" />
        <AppCard className="!p-3.5">
          <ul className="space-y-2 text-[11px]">
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-strong">همگام‌سازی موفق</span>
              </span>
              <span className="text-soft fa-num">امروز ۱۴:۲۰</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-strong">افزودن مدرک جدید</span>
              </span>
              <span className="text-soft fa-num">دیروز ۱۹:۴۵</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-strong">خطای شبکه (تلاش مجدد)</span>
              </span>
              <span className="text-soft fa-num">دیروز ۱۳:۱۲</span>
            </li>
          </ul>
        </AppCard>
      </section>

      <div className="px-4 pb-4">
        <div className="rounded-xl px-3 py-2.5 text-[11px] text-soft flex items-start gap-2 bg-violet-500/5 border border-violet-500/15">
          <RefreshCw className="w-4 h-4 text-violet-500 dark:text-violet-300 mt-0.5 shrink-0" />
          <span>تغییرات ابتدا روی دستگاه ذخیره می‌شوند. پس از اتصال اینترنت، صف عملیات به‌صورت خودکار با تأخیر تصاعدی ارسال می‌شود.</span>
        </div>
      </div>
    </div>
  );
}
