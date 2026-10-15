"use client";

import { useState } from "react";
import { Plus, FileText, Car, ShieldCheck } from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import {
  AppCard,
  SectionTitle,
  StatusBadge,
  FileAttachmentChip,
} from "@/components/shared/ui";
import { documents, vehicles } from "@/lib/mock-data";
import { toPersian } from "@/lib/persian";
import type { DocCategory } from "@/lib/types";

type FilterId = "all" | DocCategory;

const FILTERS: { id: FilterId; label: string; emoji?: string }[] = [
  { id: "all", label: "همه" },
  { id: "identity", label: "اسناد هویتی" },
  { id: "insurance", label: "بیمه‌نامه‌ها", emoji: "🔴" },
  { id: "vehicle", label: "خودروها", emoji: "🚗" },
  { id: "property", label: "املاک" },
  { id: "medical", label: "پزشکی" },
];

function expiryTone(days: number | null) {
  if (days === null) return null;
  if (days < 0) return "expired" as const;
  if (days <= 30) return "expiring" as const;
  return "valid" as const;
}

export function DocumentsScreen() {
  const [filter, setFilter] = useState<FilterId>("all");

  const filteredDocs =
    filter === "all"
      ? documents
      : filter === "vehicle"
      ? [] // vehicles are shown separately below
      : documents.filter((d) => d.category === filter);

  const showVehicles = filter === "all" || filter === "vehicle";

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="مدارک و دارایی‌ها"
        icon={<FileText className="w-5 h-5 text-white" />}
        trailing={
          <button
            type="button"
            aria-label="افزودن مدرک جدید"
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      {/* Counts summary */}
      <div className="px-4 -mt-2 mb-3">
        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white/80 flex items-center justify-between">
          <span>
            مجموع:{" "}
            <span className="fa-num font-semibold">
              {toPersian(documents.length + vehicles.length)}
            </span>{" "}
            مورد
          </span>
          <span className="fa-num">{toPersian(documents.length)} سند · {toPersian(vehicles.length)} خودرو</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${
                filter === f.id
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-text-strong border-slate-200 hover:border-navy-blue"
              }`}
            >
              {f.emoji && <span className="ml-1">{f.emoji}</span>}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles */}
      {showVehicles && (
        <section className="px-4 mb-5">
          <SectionTitle
            icon={<Car className="w-4 h-4" />}
            title="خودروها"
            action={
              <span className="text-[11px] text-text-muted fa-num">
                {toPersian(vehicles.length)} مورد
              </span>
            }
          />
          <div className="space-y-2.5">
            {vehicles.map((v) => {
              const expiryToneVal = expiryTone(v.thirdPartyDaysToExpiry);
              return (
                <AppCard key={v.id} className="!p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center text-lg shrink-0">
                        🚗
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-strong truncate">
                          {v.title}
                        </p>
                        <p className="text-[11px] text-text-muted fa-num">
                          پلاک: {toPersian(v.plate.twoDigits)} {v.plate.letter}{" "}
                          {toPersian(v.plate.threeDigits)} - ایران {toPersian(v.plate.iranCode)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      tone={
                        v.syncStatus === "pending"
                          ? "pending"
                          : v.syncStatus === "conflict"
                          ? "conflict"
                          : "synced"
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] mb-2.5">
                    <div>
                      <span className="text-text-muted">شماره شاسی: </span>
                      <span className="text-text-strong font-medium">
                        {v.chassis}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted">شرکت بیمه: </span>
                      <span className="text-text-strong font-medium">
                        {v.thirdPartyInsCompany}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted">کد یکتا: </span>
                      <span className="text-text-strong font-medium fa-num">
                        {v.thirdPartyInsCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted">بیمه بدنه: </span>
                      {v.bodyInsStatus === "valid" ? (
                        <span className="text-success font-medium">معتبر</span>
                      ) : v.bodyInsStatus === "none" ? (
                        <span className="text-text-muted">—</span>
                      ) : (
                        <span className="text-alert font-medium">منقضی</span>
                      )}
                    </div>
                  </div>

                  {/* Third-party expiry banner */}
                  <div
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-[11px] mb-2 ${
                      expiryToneVal === "expired"
                        ? "bg-alert-soft text-alert"
                        : expiryToneVal === "expiring"
                        ? "bg-alert-soft/70 text-alert"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    <span>بیمه شخص ثالث</span>
                    <span className="font-bold fa-num">
                      {expiryToneVal === "expired"
                        ? "منقضی"
                        : expiryToneVal === "expiring"
                        ? `${toPersian(v.thirdPartyDaysToExpiry)} روز تا انقضا`
                        : "معتبر"}
                      {" · "}
                      {v.thirdPartyExpiryJalali}
                    </span>
                  </div>

                  <FileAttachmentChip
                    status={v.attachmentStatus}
                    label="برگ سبز خودرو"
                  />
                </AppCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Documents */}
      {filteredDocs.length > 0 && (
        <section className="px-4 mb-5">
          <SectionTitle
            icon={<FileText className="w-4 h-4" />}
            title="اسناد و مدارک"
            action={
              <span className="text-[11px] text-text-muted fa-num">
                {toPersian(filteredDocs.length)} مورد
              </span>
            }
          />
          <div className="space-y-2.5">
            {filteredDocs.map((d) => {
              const tone = expiryTone(d.expiryDays);
              return (
                <AppCard key={d.id} className="!p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                          d.category === "insurance"
                            ? "bg-alert-soft"
                            : d.category === "identity"
                            ? "bg-navy-blue/10"
                            : d.category === "property"
                            ? "bg-success/10"
                            : d.category === "medical"
                            ? "bg-waiting/10"
                            : "bg-surface-muted"
                        }`}
                      >
                        {d.category === "insurance"
                          ? "🛡️"
                          : d.category === "identity"
                          ? "🪪"
                          : d.category === "property"
                          ? "🏠"
                          : d.category === "medical"
                          ? "🩺"
                          : "📄"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-strong truncate">
                          {d.title}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {d.isPrivate ? "شخصی · " : "مشترک · "}
                          {d.ownerName}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      tone={
                        d.syncStatus === "pending"
                          ? "pending"
                          : d.syncStatus === "conflict"
                          ? "conflict"
                          : "synced"
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] mb-2.5">
                    <div>
                      <span className="text-text-muted">شماره: </span>
                      <span className="text-text-strong font-medium fa-num">
                        {d.documentNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted">صادر: </span>
                      <span className="text-text-strong font-medium fa-num">
                        {d.issueJalali}
                      </span>
                    </div>
                    {d.expiryJalali && (
                      <div className="col-span-2">
                        <span className="text-text-muted">انقضا: </span>
                        <span
                          className={`font-bold fa-num ${
                            tone === "expired"
                              ? "text-alert"
                              : tone === "expiring"
                              ? "text-alert"
                              : "text-success"
                          }`}
                        >
                          {d.expiryJalali}
                          {tone === "valid" && " 🟢"}
                          {tone === "expiring" && " 🔴"}
                          {tone === "expired" && " ⛔"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-text-muted mb-2 flex items-start gap-1">
                    <span>📍</span>
                    <span>{d.physicalLocation}</span>
                  </div>

                  <FileAttachmentChip
                    status={d.attachmentStatus}
                    label={d.attachmentLabel}
                  />
                </AppCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state for filters with no results */}
      {filteredDocs.length === 0 && !showVehicles && (
        <div className="px-4 py-10 text-center text-text-muted text-sm">
          موردی در این دسته‌بندی وجود ندارد.
        </div>
      )}

      {/* Bottom helper */}
      <div className="px-4 pb-4">
        <div className="bg-navy-blue/5 border border-navy-blue/20 rounded-xl px-3 py-2.5 text-[11px] text-text-muted flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-navy-blue mt-0.5 shrink-0" />
          <span>
            اطلاعات متنی هر مدرک (شماره سند، کد یکتا، تاریخ اعتبار) حتی بدون
            دانلود فایل پیوست قابل مشاهده است.
          </span>
        </div>
      </div>
    </div>
  );
}
