"use client";

import { useState } from "react";
import {
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Smartphone,
  XCircle,
  Clock,
} from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import {
  conflictRecord,
  syncMetadata,
  syncOperations,
} from "@/lib/mock-data";

type ResolutionChoice = "local" | "server" | null;

const OP_STATUS_LABELS: Record<
  string,
  { label: string; tone: string; icon: typeof CheckCircle2 }
> = {
  in_progress: {
    label: "در حال ارسال",
    tone: "bg-waiting/10 text-waiting",
    icon: RefreshCw,
  },
  failed: {
    label: "متوقف — خطای شبکه",
    tone: "bg-alert/10 text-alert",
    icon: XCircle,
  },
};

export function SyncScreen() {
  const [choice, setChoice] = useState<ResolutionChoice>(null);
  const [resolving, setResolving] = useState(false);

  const handleConfirm = () => {
    if (!choice) return;
    setResolving(true);
    setTimeout(() => {
      setResolving(false);
      setChoice(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="وضعیت همگام‌سازی"
        icon={<RefreshCw className="w-5 h-5 text-white" />}
        statusPill={{
          label:
            syncMetadata.connectionStatus === "online"
              ? "آنلاین"
              : "آفلاین",
          tone: syncMetadata.connectionStatus === "online" ? "online" : "offline",
        }}
        trailing={
          <button
            type="button"
            aria-label="بازگشت"
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        }
      />

      {/* Sync status summary */}
      <section className="px-4 -mt-2 mb-4">
        <AppCard className="!p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  syncMetadata.connectionStatus === "online"
                    ? "bg-success"
                    : "bg-waiting"
                } animate-pulse-soft`}
              />
              <span className="text-sm font-bold text-text-strong">
                وضعیت اتصال:{" "}
                {syncMetadata.connectionStatus === "online"
                  ? "آنلاین"
                  : "آفلاین"}
              </span>
            </div>
            <span className="text-[11px] text-text-muted">
              سرور:{" "}
              {syncMetadata.serverReachable ? "متصل" : "غیرقابل دسترسی"}
            </span>
          </div>

          <div className="bg-surface-muted rounded-xl px-3 py-2 text-[11px] text-text-muted mb-3">
            آخرین همگام‌سازی موفق:{" "}
            <span className="text-text-strong font-bold fa-num">
              {syncMetadata.lastSuccessfulSyncJalali} ساعت{" "}
              {syncMetadata.lastSuccessfulSyncTime}
            </span>
          </div>

          <button
            type="button"
            disabled={syncMetadata.connectionStatus === "offline"}
            className={`w-full py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-all ${
              syncMetadata.connectionStatus === "online"
                ? "bg-navy-blue text-white active:scale-95"
                : "bg-surface-muted text-text-muted cursor-not-allowed"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            همگام‌سازی دستی اکنون
          </button>
          {syncMetadata.connectionStatus === "offline" && (
            <p className="text-[10px] text-text-muted text-center mt-2">
              برای همگام‌سازی دستی، ابتدا به اینترنت متصل شوید.
            </p>
          )}
        </AppCard>
      </section>

      {/* Conflict resolution */}
      {syncMetadata.conflictsCount > 0 && (
        <section className="px-4 mb-5">
          <SectionTitle
            icon={<AlertTriangle className="w-4 h-4" />}
            title="تعارض نیازمند بررسی شما"
            tone="alert"
            action={
              <span className="text-[11px] font-bold text-alert fa-num">
                {syncMetadata.conflictsCount} مورد
              </span>
            }
          />
          <AppCard className="!p-3.5 border-alert/30">
            <p className="text-[11px] text-text-muted mb-1">
              این رکورد هم‌زمان در گوشی شما و گوشی «مریم» تغییر کرده است. کدام
              نسخه حفظ شود؟
            </p>
            <p className="text-sm font-bold text-text-strong mb-3">
              {conflictRecord.entityLabel}
            </p>

            {/* Local version */}
            <button
              type="button"
              onClick={() => setChoice("local")}
              className={`w-full text-right rounded-xl border-2 p-3 mb-2 transition-all ${
                choice === "local"
                  ? "border-navy-blue bg-navy-blue/5"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-navy-blue">
                  <Smartphone className="w-3.5 h-3.5" />
                  نسخه این دستگاه
                </span>
                <span className="text-[10px] text-text-muted fa-num">
                  {conflictRecord.localVersion.timestampJalali}
                </span>
              </div>
              <p className="text-[10px] text-text-muted mb-2">
                ثبت {conflictRecord.localVersion.author}
              </p>
              <div className="space-y-1">
                {conflictRecord.localVersion.fields.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="text-text-muted">{f.label}: </span>
                    <span className="text-text-strong font-semibold fa-num">
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </button>

            {/* Server version */}
            <button
              type="button"
              onClick={() => setChoice("server")}
              className={`w-full text-right rounded-xl border-2 p-3 mb-3 transition-all ${
                choice === "server"
                  ? "border-navy-blue bg-navy-blue/5"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-navy-blue">
                  <Cloud className="w-3.5 h-3.5" />
                  نسخه سرور
                </span>
                <span className="text-[10px] text-text-muted fa-num">
                  {conflictRecord.serverVersion.timestampJalali}
                </span>
              </div>
              <p className="text-[10px] text-text-muted mb-2">
                ثبت {conflictRecord.serverVersion.author}
              </p>
              <div className="space-y-1">
                {conflictRecord.serverVersion.fields.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="text-text-muted">{f.label}: </span>
                    <span className="text-text-strong font-semibold fa-num">
                      {f.value}
                    </span>
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
                  ? "bg-navy text-white active:scale-95"
                  : "bg-surface-muted text-text-muted cursor-not-allowed"
              }`}
            >
              {resolving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  در حال اعمال تصمیم...
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

      {/* Outbox queue */}
      <section className="px-4 mb-5">
        <SectionTitle
          icon={<Clock className="w-4 h-4" />}
          title="صف عملیات در انتظار ارسال"
          action={
            <span className="text-[11px] text-text-muted fa-num">
              {syncMetadata.pendingOperationsCount} مورد
            </span>
          }
        />
        <div className="space-y-2.5">
          {syncOperations.map((op) => {
            const st = OP_STATUS_LABELS[op.status];
            const StatusIcon = st.icon;
            const isSpinning = op.status === "in_progress";
            return (
              <AppCard key={op.id} className="!p-3.5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${st.tone}`}
                    >
                      <StatusIcon
                        className={`w-4.5 h-4.5 ${isSpinning ? "animate-spin" : ""}`}
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-strong leading-snug">
                        {op.entityLabel}
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5 fa-num">
                        {op.createdAtJalali}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold ${st.tone}`}
                  >
                    {st.label}
                  </span>
                </div>
                {op.lastErrorFa && (
                  <div className="bg-alert-soft border border-alert/20 rounded-lg px-2.5 py-1.5 text-[11px] text-alert flex items-start gap-1.5">
                    <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{op.lastErrorFa}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
                  <span>
                    نوع عملیات:{" "}
                    <span className="font-semibold text-text-strong">
                      {op.operationType === "INSERT"
                        ? "افزودن"
                        : op.operationType === "UPDATE"
                        ? "ویرایش"
                        : "حذف"}
                    </span>
                  </span>
                  <span className="fa-num">
                    تلاش {op.retryCount} از ۵
                  </span>
                </div>
              </AppCard>
            );
          })}
        </div>
      </section>

      {/* Sync log preview */}
      <section className="px-4 mb-5">
        <SectionTitle title="گزارش همگام‌سازی اخیر" />
        <AppCard className="!p-3.5">
          <ul className="space-y-2 text-[11px]">
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>همگام‌سازی موفق</span>
              </span>
              <span className="text-text-muted fa-num">امروز ۱۴:۲۰</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>افزودن مدرک جدید</span>
              </span>
              <span className="text-text-muted fa-num">دیروز ۱۹:۴۵</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-alert" />
                <span>خطای شبکه (تلاش مجدد)</span>
              </span>
              <span className="text-text-muted fa-num">دیروز ۱۳:۱۲</span>
            </li>
          </ul>
        </AppCard>
      </section>

      {/* Info note */}
      <div className="px-4 pb-4">
        <div className="bg-navy-blue/5 border border-navy-blue/20 rounded-xl px-3 py-2.5 text-[11px] text-text-muted flex items-start gap-2">
          <RefreshCw className="w-4 h-4 text-navy-blue mt-0.5 shrink-0" />
          <span>
            تغییرات شما همیشه ابتدا روی دستگاه ذخیره می‌شوند. پس از اتصال اینترنت،
            صف عملیات به‌صورت خودکار با تأخیر تصاعدی ارسال می‌شود.
          </span>
        </div>
      </div>
    </div>
  );
}
