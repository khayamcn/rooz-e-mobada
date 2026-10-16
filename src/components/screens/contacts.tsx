"use client";

import { useState, useEffect } from "react";
import { Phone, Plus, BookOpen, Clock, ChevronLeft, Trash2, Pencil } from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { Sheet } from "@/components/shared/sheet";
import { useApp, useActiveMember, useVisibleContacts } from "@/lib/store";
import { toPersian, persianPhone } from "@/lib/persian";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "contacts" | "guides";

const GUIDE_CATEGORIES: Record<string, { label: string; emoji: string; color: string }> = {
  first_aid: { label: "کمک‌های اولیه", emoji: "🩹", color: "bg-red-500/10" },
  earthquake: { label: "زلزله", emoji: "🌍", color: "bg-amber-500/10" },
  fire: { label: "آتش‌سوزی", emoji: "🔥", color: "bg-red-500/10" },
  home_utilities: { label: "شیرهای اصلی منزل", emoji: "🚰", color: "bg-violet-500/10" },
};

interface ContactFormState {
  name: string;
  relationOrRole: string;
  phonePrimary: string;
  phoneSecondary: string;
  address: string;
  medicalOrUrgentNote: string;
  isPrivate: boolean;
  iconLabel: string;
}

const EMPTY_FORM: ContactFormState = {
  name: "",
  relationOrRole: "",
  phonePrimary: "",
  phoneSecondary: "",
  address: "",
  medicalOrUrgentNote: "",
  isPrivate: false,
  iconLabel: "👤",
};

const ICON_OPTIONS = ["👤", "👨", "👩", "🧔", "👵", "👴", "🩺", "🏥", "🚓", "🚒", "🧑‍⚕️", "👨‍⚕️"];

export function ContactsScreen() {
  const [tab, setTab] = useState<Tab>("contacts");
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContactFormState>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const contacts = useVisibleContacts();
  const activeMember = useActiveMember();
  const addContact = useApp((s) => s.addContact);
  const updateContact = useApp((s) => s.updateContact);
  const removeContact = useApp((s) => s.removeContact);
  const guides = useApp((s) => s.guides);

  useEffect(() => {
    const handler = () => {
      setForm(EMPTY_FORM);
      setEditingId(null);
      setSheetOpen(true);
    };
    window.addEventListener("rooz-fab-add", handler);
    return () => window.removeEventListener("rooz-fab-add", handler);
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setSheetOpen(true);
  };

  const openEdit = (id: string) => {
    const c = contacts.find((x) => x.id === id);
    if (!c) return;
    setForm({
      name: c.name,
      relationOrRole: c.relationOrRole,
      phonePrimary: c.phonePrimary,
      phoneSecondary: c.phoneSecondary ?? "",
      address: c.address ?? "",
      medicalOrUrgentNote: c.medicalOrUrgentNote ?? "",
      isPrivate: c.isPrivate,
      iconLabel: c.iconLabel,
    });
    setEditingId(id);
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.phonePrimary.trim()) return;
    if (editingId) {
      updateContact(editingId, {
        name: form.name.trim(),
        relationOrRole: form.relationOrRole,
        phonePrimary: form.phonePrimary,
        phoneSecondary: form.phoneSecondary || undefined,
        address: form.address || undefined,
        medicalOrUrgentNote: form.medicalOrUrgentNote || undefined,
        isPrivate: form.isPrivate,
        iconLabel: form.iconLabel,
      });
    } else {
      addContact({
        name: form.name.trim(),
        relationOrRole: form.relationOrRole,
        phonePrimary: form.phonePrimary,
        phoneSecondary: form.phoneSecondary || undefined,
        address: form.address || undefined,
        medicalOrUrgentNote: form.medicalOrUrgentNote || undefined,
        isPrivate: form.isPrivate,
        isSystemEmergency: false,
        iconLabel: form.iconLabel,
        priorityOrder: 100,
      });
    }
    setSheetOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const systemEmergency = contacts.filter((c) => c.isSystemEmergency);
  const familyContacts = contacts.filter((c) => !c.isSystemEmergency);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="تماس‌ها و راهنماها"
        subtitle={activeMember ? `پرونده ${activeMember.fullName}` : undefined}
        icon={<Phone className="w-5 h-5 text-white" />}
        trailing={
          tab === "contacts" ? (
            <button
              type="button"
              onClick={openAdd}
              aria-label="ثبت تماس جدید"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          ) : undefined
        }
      />

      {/* Tab switcher */}
      <div className="px-4 -mt-3 mb-4">
        <div className="surface-card rounded-xl p-1 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setTab("contacts")}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === "contacts"
                ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-glow"
                : "text-soft"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            تماس‌ها
          </button>
          <button
            type="button"
            onClick={() => setTab("guides")}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === "guides"
                ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-glow"
                : "text-soft"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            راهنماهای آفلاین
          </button>
        </div>
      </div>

      {tab === "guides" && (
        <section className="px-4 mb-4">
          <div className="rounded-xl px-3 py-2 text-[11px] text-emerald-500 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>۱۰۰٪ در دسترس بدون اینترنت — روی دستگاه ذخیره شده</span>
          </div>
          <SectionTitle title="راهنماهای حیاتی" />
          <div className="space-y-2.5">
            {guides.map((g) => {
              const cat = GUIDE_CATEGORIES[g.category];
              const isExpanded = expandedGuideId === g.id;
              return (
                <AppCard key={g.id} className="!p-0 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedGuideId(isExpanded ? null : g.id)}
                    className="w-full text-right p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${cat.color}`}>{cat.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-strong leading-snug">{g.title}</p>
                          <p className="text-[11px] text-soft mt-0.5 line-clamp-2">{g.summary}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-soft">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span className="fa-num">{toPersian(g.readingTimeMinutes)} دقیقه مطالعه</span>
                            </span>
                            {g.isPinned && (
                              <span className="inline-flex items-center gap-1 text-violet-500 dark:text-violet-300 font-semibold">
                                📌 پین‌شده
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronLeft className={`w-4 h-4 text-soft shrink-0 transition-transform ${isExpanded ? "-rotate-90" : ""}`} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 animate-slide-up">
                      <div className="border-t border-violet-500/10 pt-3">
                        <p className="text-[11px] font-bold text-violet-500 dark:text-violet-300 mb-2">گام‌به‌گام:</p>
                        <ol className="space-y-2">
                          {g.steps.map((step, idx) => (
                            <li key={idx} className="flex gap-2.5 text-[12px] text-strong leading-relaxed">
                              <span className="shrink-0 w-5 h-5 rounded-full bg-violet-500/15 text-violet-500 dark:text-violet-300 text-[10px] font-bold flex items-center justify-center fa-num">
                                {toPersian(idx + 1)}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </AppCard>
              );
            })}
          </div>
        </section>
      )}

      {tab === "contacts" && (
        <>
          <section className="px-4 mb-5">
            <SectionTitle title="مراکز اضطراری" />
            <div className="grid grid-cols-3 gap-2">
              {systemEmergency.map((c) => (
                <a
                  key={c.id}
                  href={`tel:${c.phonePrimary}`}
                  className="bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl p-3 text-center active:scale-95 transition-transform shadow-glow"
                >
                  <div className="text-2xl mb-1">{c.iconLabel}</div>
                  <div className="text-xs font-bold">{c.name}</div>
                  <div className="text-[11px] opacity-90 fa-num">{persianPhone(c.phonePrimary)}</div>
                </a>
              ))}
            </div>
          </section>

          <section className="px-4 mb-5">
            <SectionTitle
              title="تماس‌های خانواده"
              action={<span className="text-[11px] text-soft fa-num">{toPersian(familyContacts.length)} نفر</span>}
            />
            <div className="space-y-2.5">
              {familyContacts.length === 0 && (
                <div className="text-center py-6 text-soft text-sm">
                  هنوز تماسی ثبت نشده است.
                </div>
              )}
              {familyContacts.map((c) => (
                <AppCard key={c.id} className="!p-3.5">
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <span className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center text-xl shrink-0">{c.iconLabel}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-strong truncate">{c.name}</p>
                          <p className="text-[11px] text-soft truncate">{c.relationOrRole}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {c.isPrivate && (
                            <span className="px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-500 dark:text-violet-300 text-[10px] font-semibold">
                              شخصی
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => openEdit(c.id)}
                            aria-label="ویرایش"
                            className="w-7 h-7 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 dark:text-violet-300 flex items-center justify-center transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(c.id)}
                            aria-label="حذف"
                            className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1 text-[11px] text-strong font-medium fa-num">{persianPhone(c.phonePrimary)}</div>
                      {c.phoneSecondary && (
                        <div className="text-[11px] text-soft fa-num mt-0.5">{persianPhone(c.phoneSecondary)}</div>
                      )}
                      {c.address && (
                        <div className="text-[11px] text-soft mt-1 flex items-start gap-1">
                          <span>📍</span>
                          <span>{c.address}</span>
                        </div>
                      )}
                      {c.medicalOrUrgentNote && (
                        <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 text-[11px] text-amber-600 dark:text-amber-300 flex items-start gap-1.5">
                          <span>⚠️</span>
                          <span>{c.medicalOrUrgentNote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${c.phonePrimary}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-br from-violet-500 to-purple-600 text-white py-2 rounded-lg text-xs font-semibold active:scale-95 transition-transform"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      تماس مستقیم
                    </a>
                    <button
                      type="button"
                      className="px-3 inline-flex items-center justify-center gap-1.5 surface-card text-strong text-xs font-semibold"
                    >
                      کپی شماره
                    </button>
                  </div>
                </AppCard>
              ))}
            </div>
          </section>

          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={openAdd}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-violet-500/40 text-violet-500 dark:text-violet-300 hover:bg-violet-500/5 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              افزودن تماس جدید
            </button>
          </div>
        </>
      )}

      {/* Add/Edit sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? "ویرایش تماس" : "افزودن تماس جدید"}
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
              disabled={!form.name.trim() || !form.phonePrimary.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shadow-glow disabled:opacity-40 transition-opacity"
            >
              ذخیره
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-soft mb-2">آیکون</label>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setForm({ ...form, iconLabel: ic })}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                    form.iconLabel === ic
                      ? "bg-violet-500/20 ring-2 ring-violet-500"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-violet-500/10"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-soft mb-1.5">نام</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثلاً: دکتر علی محمدی"
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-soft mb-1.5">نسبت یا نقش</label>
            <input
              type="text"
              value={form.relationOrRole}
              onChange={(e) => setForm({ ...form, relationOrRole: e.target.value })}
              placeholder="مثلاً: متخصص قلب، پدر، همسر..."
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-soft mb-1.5">شماره اصلی</label>
              <input
                type="tel"
                value={form.phonePrimary}
                onChange={(e) => setForm({ ...form, phonePrimary: e.target.value })}
                placeholder="0912..."
                className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-soft mb-1.5">شماره ثانویه</label>
              <input
                type="tel"
                value={form.phoneSecondary}
                onChange={(e) => setForm({ ...form, phoneSecondary: e.target.value })}
                placeholder="(اختیاری)"
                className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 fa-num"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-soft mb-1.5">آدرس (اختیاری)</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="مثلاً: مطب خیابان ولیعصر..."
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-soft mb-1.5">یادداشت پزشکی یا اضطراری</label>
            <textarea
              value={form.medicalOrUrgentNote}
              onChange={(e) => setForm({ ...form, medicalOrUrgentNote: e.target.value })}
              placeholder="مثلاً: داروهای مصرفی پدر، کلید یدک..."
              rows={2}
              className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPrivate}
              onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
              className="w-4 h-4 rounded accent-violet-500"
            />
            <span className="text-xs text-soft">این تماس خصوصی است</span>
          </label>
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
              <p className="text-sm font-bold text-strong mb-1">حذف تماس؟</p>
              <p className="text-[11px] text-soft mb-4">این عمل قابل بازگشت نیست.</p>
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
                    removeContact(deleteConfirmId);
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
