"use client";

import {
  Users,
  Plus,
  ShieldCheck,
  Lock,
  Database,
  LogOut,
  ChevronLeft,
  Fingerprint,
  Download,
} from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { family } from "@/lib/mock-data";

const ROLE_LABELS: Record<string, { label: string; tone: string }> = {
  admin: { label: "مدیر خانواده", tone: "bg-navy-blue/10 text-navy-blue" },
  editor: { label: "ویرایشگر", tone: "bg-success/10 text-success" },
  viewer: { label: "مشاهده‌گر", tone: "bg-surface-muted text-text-muted" },
};

const ROLE_PERMISSIONS: Record<string, string> = {
  admin: "دسترسی کامل: ویرایش، مدیریت اعضا و پشتیبان‌گیری",
  editor: "امکان ثبت و ویرایش مدارک و تماس‌های مشترک",
  viewer: "فقط مشاهده اطلاعات در مواقع ضروری (بدون ویرایش)",
};

export function FamilyScreen() {
  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="پرونده خانواده رضایی"
        icon={<Users className="w-5 h-5 text-white" />}
        trailing={
          <button
            type="button"
            aria-label="امنیت و حساب"
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
          >
            <ShieldCheck className="w-5 h-5 text-white" />
          </button>
        }
      />

      {/* Family header card */}
      <div className="px-4 -mt-2 mb-4">
        <div className="bg-navy-gradient text-white rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] text-white/70">پرونده خانواده</p>
              <p className="text-base font-bold">{family.title}</p>
            </div>
            <div className="text-left">
              <p className="text-[11px] text-white/70">کد دعوت</p>
              <p className="text-sm font-bold fa-num">{family.inviteCode}</p>
            </div>
          </div>
          <div className="flex -space-x-2 space-x-reverse">
            {family.members.map((m) => (
              <div
                key={m.id}
                className="w-8 h-8 rounded-full bg-white/15 border-2 border-navy flex items-center justify-center text-[10px] font-bold"
                title={m.fullName}
              >
                {m.avatarInitials}
              </div>
            ))}
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-white/10 border-2 border-navy flex items-center justify-center text-white"
              aria-label="دعوت عضو جدید"
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
          action={
            <span className="text-[11px] text-text-muted fa-num">
              {family.members.length} نفر
            </span>
          }
        />
        <div className="space-y-2.5">
          {family.members.map((m) => {
            const role = ROLE_LABELS[m.role];
            return (
              <AppCard key={m.id} className="!p-3.5">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-navy-blue/10 flex items-center justify-center text-navy-blue text-sm font-bold">
                      {m.avatarInitials}
                    </div>
                    {m.isCurrentUser && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-text-strong truncate">
                        {m.fullName}
                      </p>
                      {m.isCurrentUser && (
                        <span className="text-[10px] text-text-muted">(شما)</span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted truncate">
                      {m.relation} · {m.lastActiveJalali}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {ROLE_PERMISSIONS[m.role]}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold ${role.tone}`}
                  >
                    {role.label}
                  </span>
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
          <AppCard className="!p-3.5 hover:bg-surface-muted/40">
            <button type="button" className="w-full text-right">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0">
                  <Download className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-strong">
                    تهیه و بازیابی پشتیبان رمزگذاری‌شده
                  </p>
                  <p className="text-[11px] text-text-muted">
                    آخرین فایل پشتیبان:{" "}
                    <span className="fa-num">۱۴۰۵/۰۷/۱۰</span> · آفلاین
                  </p>
                </div>
                <ChevronLeft className="w-4 h-4 text-text-muted" />
              </div>
            </button>
          </AppCard>

          <AppCard className="!p-3.5 hover:bg-surface-muted/40">
            <button type="button" className="w-full text-right">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-navy-blue/10 flex items-center justify-center text-navy-blue shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-strong">
                    قفل برنامه و امنیت دستگاه
                  </p>
                  <p className="text-[11px] text-text-muted">
                    اثر انگشت / پین · وضعیت: فعال
                  </p>
                </div>
                <span className="px-2 py-1 rounded-md bg-success/10 text-success text-[10px] font-bold">
                  فعال
                </span>
              </div>
            </button>
          </AppCard>

          <AppCard className="!p-3.5 hover:bg-surface-muted/40">
            <button type="button" className="w-full text-right">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-waiting/10 flex items-center justify-center text-waiting shrink-0">
                  <Database className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-strong">
                    مدیریت فضای ذخیره‌سازی محلی
                  </p>
                  <p className="text-[11px] text-text-muted fa-num">
                    ۴۸ مگابایت استفاده شده · ۱۲ فایل کش‌شده
                  </p>
                </div>
                <ChevronLeft className="w-4 h-4 text-text-muted" />
              </div>
            </button>
          </AppCard>

          <AppCard className="!p-3.5 hover:bg-alert-soft/40 border-alert/30">
            <button type="button" className="w-full text-right">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-alert/10 flex items-center justify-center text-alert shrink-0">
                  <LogOut className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-alert">
                    خروج امن و پاک‌سازی داده‌های محلی
                  </p>
                  <p className="text-[11px] text-text-muted">
                    تمام اطلاعات از این دستگاه پاک می‌شود
                  </p>
                </div>
                <ChevronLeft className="w-4 h-4 text-alert" />
              </div>
            </button>
          </AppCard>
        </div>
      </section>

      {/* Privacy note */}
      <div className="px-4 pb-4">
        <div className="bg-navy-blue/5 border border-navy-blue/20 rounded-xl px-3 py-2.5 text-[11px] text-text-muted flex items-start gap-2">
          <Lock className="w-4 h-4 text-navy-blue mt-0.5 shrink-0" />
          <span>
            اطلاعات شخصی (با نشانگر «شخصی») فقط برای شما و مدیر خانواده قابل
            مشاهده است. فایل‌های پشتیبان با الگوریتم AES-256 رمزگذاری می‌شوند.
          </span>
        </div>
      </div>
    </div>
  );
}
