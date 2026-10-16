"use client";

import { useState, useEffect } from "react";
import {
  Cloud, Folder, FileText, Image as ImageIcon, File, Trash2, Pencil,
  Download, ChevronLeft, Plus, FolderPlus, Search, HardDrive, MoreVertical,
  Eye, RefreshCw, Lock, Unlock, Clock, X, Upload, History,
} from "lucide-react";
import { ScreenHeader } from "@/components/shared/screen-header";
import { AppCard, SectionTitle } from "@/components/shared/ui";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { Sheet } from "@/components/shared/sheet";
import { useApp } from "@/lib/store";
import { toPersian } from "@/lib/persian";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CloudFile, CloudFolder } from "@/lib/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return toPersian(bytes) + " بایت";
  if (bytes < 1024 * 1024) return toPersian((bytes / 1024).toFixed(1)) + " کیلوبایت";
  if (bytes < 1024 * 1024 * 1024) return toPersian((bytes / 1024 / 1024).toFixed(1)) + " مگابایت";
  return toPersian((bytes / 1024 / 1024 / 1024).toFixed(2)) + " گیگابایت";
}

function fileIcon(mimeType: string): typeof File {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return FileText;
  if (mimeType.startsWith("audio/")) return FileText;
  if (mimeType === "application/pdf") return FileText;
  return File;
}

export function CloudScreen() {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"files" | "trash" | "activity">("files");
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [fileMenuId, setFileMenuId] = useState<string | null>(null);

  const folders = useApp((s) => s.folders);
  const files = useApp((s) => s.files);
  const activityLog = useApp((s) => s.activityLog);
  const quota = useApp((s) => s.quota);
  const addFolder = useApp((s) => s.addFolder);
  const uploadFile = useApp((s) => s.uploadFile);
  const removeFile = useApp((s) => s.removeFile);
  const restoreFile = useApp((s) => s.restoreFile);
  const permanentDeleteFile = useApp((s) => s.permanentDeleteFile);
  const toggleOfflineAvailable = useApp((s) => s.toggleOfflineAvailable);
  const toggleFilePrivate = useApp((s) => s.toggleFilePrivate);
  const clearTrash = useApp((s) => s.clearTrash);
  const currentUser = useApp((s) => s.currentUser);

  useEffect(() => {
    const handler = () => setUploadSheetOpen(true);
    window.addEventListener("rooz-fab-add", handler);
    return () => window.removeEventListener("rooz-fab-add", handler);
  }, []);

  const visibleFolders = folders.filter((f) => f.parentId === currentFolder);
  const visibleFiles = files.filter(
    (f) => f.folderId === currentFolder && !f.deletedAt && (search ? f.name.includes(search) : true)
  );
  const trashedFiles = files.filter((f) => f.deletedAt);
  const usedPercent = Math.round((quota.usedBytes / quota.totalBytes) * 100);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder(newFolderName.trim(), currentFolder);
    setNewFolderName("");
    setFolderSheetOpen(false);
  };

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="فضای ابری خانواده"
        subtitle={currentUser?.displayName ? `ورود: ${currentUser.displayName}` : undefined}
        icon={<Cloud className="w-5 h-5 text-white" />}
        statusPill={{ label: "خصوصی", tone: "info" }}
        trailing={
          <button
            type="button"
            onClick={() => setFolderSheetOpen(true)}
            aria-label="پوشه جدید"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <FolderPlus className="w-5 h-5 text-white" />
          </button>
        }
      />

      {/* Storage quota card */}
      <div className="px-4 -mt-3 mb-4">
        <AppCard className="!p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-violet-500 dark:text-violet-300" />
              <span className="text-xs font-bold text-strong">فضای مصرفی</span>
            </div>
            <span className="text-[11px] text-soft fa-num">
              {formatBytes(quota.usedBytes)} / {formatBytes(quota.totalBytes)}
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usedPercent}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
              className={cn(
                "h-full rounded-full",
                usedPercent < 70 ? "bg-gradient-to-r from-violet-500 to-fuchsia-600" : "bg-gradient-to-r from-amber-500 to-red-500"
              )}
            />
          </div>
          <p className="text-[10px] text-soft mt-1.5 fa-num">{toPersian(usedPercent)}٪ از سهمیه استفاده شده</p>
        </AppCard>
      </div>

      {/* View tabs */}
      <div className="px-4 -mt-2 mb-4">
        <div className="surface-card rounded-xl p-1 grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setView("files")}
            className={cn(
              "py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
              view === "files" ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-glow" : "text-soft"
            )}
          >
            <Folder className="w-3.5 h-3.5" />
            فایل‌ها
          </button>
          <button
            type="button"
            onClick={() => setView("trash")}
            className={cn(
              "py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
              view === "trash" ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-glow" : "text-soft"
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
            سطل بازیافت
          </button>
          <button
            type="button"
            onClick={() => setView("activity")}
            className={cn(
              "py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
              view === "activity" ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-glow" : "text-soft"
            )}
          >
            <History className="w-3.5 h-3.5" />
            فعالیت‌ها
          </button>
        </div>
      </div>

      {/* Files view */}
      {view === "files" && (
        <>
          {/* Breadcrumb */}
          {currentFolder && (
            <div className="px-4 mb-2 flex items-center gap-1 text-[11px] text-soft">
              <button type="button" onClick={() => setCurrentFolder(null)} className="hover:text-violet-500 dark:hover:text-violet-300">
                خانه
              </button>
              <ChevronLeft className="w-3 h-3" />
              <span className="text-strong font-semibold">
                {folders.find((f) => f.id === currentFolder)?.name}
              </span>
            </div>
          )}

          {/* Search */}
          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جست‌وجوی فایل..."
                className="w-full surface-input rounded-xl pr-10 pl-4 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
          </div>

          {/* Folders */}
          {visibleFolders.length > 0 && (
            <section className="px-4 mb-4">
              <SectionTitle title="پوشه‌ها" icon={<Folder className="w-4 h-4" />} />
              <div className="grid grid-cols-2 gap-2">
                {visibleFolders.map((f) => (
                  <AppCard key={f.id} onClick={() => setCurrentFolder(f.id)} className="!p-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 dark:text-violet-300 shrink-0">
                        <Folder className="w-5 h-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-strong truncate">{f.name}</p>
                        <p className="text-[10px] text-soft">{f.isPrivate ? "خصوصی" : "مشترک"}</p>
                      </div>
                    </div>
                  </AppCard>
                ))}
              </div>
            </section>
          )}

          {/* Files */}
          <section className="px-4 mb-5">
            <SectionTitle
              title="فایل‌ها"
              icon={<FileText className="w-4 h-4" />}
              action={<span className="text-[11px] text-soft fa-num">{toPersian(visibleFiles.length)} مورد</span>}
            />
            {visibleFiles.length === 0 ? (
              <AppCard className="!p-6 text-center">
                <Cloud className="w-12 h-12 text-soft mx-auto mb-2" />
                <p className="text-sm text-soft mb-3">هنوز فایلی بارگذاری نشده است.</p>
                <button
                  type="button"
                  onClick={() => setUploadSheetOpen(true)}
                  className="text-xs font-bold text-violet-500 dark:text-violet-300"
                >
                  بارگذاری اولین فایل +
                </button>
              </AppCard>
            ) : (
              <div className="space-y-2">
                {visibleFiles.map((f) => {
                  const Icon = fileIcon(f.mimeType);
                  return (
                    <AppCard key={f.id} className="!p-3" asDiv onClick={() => setSelectedFile(f)}>
                      <div className="flex items-center gap-3">
                        {f.mimeType.startsWith("image/") && f.dataUrl ? (
                          <img src={f.dataUrl} alt={f.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        ) : (
                          <span className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 dark:text-violet-300 shrink-0">
                            <Icon className="w-5 h-5" />
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-strong truncate">{f.name}</p>
                            {f.isPrivate && <Lock className="w-3 h-3 text-amber-500" />}
                            {f.isOfflineAvailable && <Download className="w-3 h-3 text-emerald-500" />}
                          </div>
                          <p className="text-[10px] text-soft fa-num">
                            {formatBytes(f.sizeBytes)} · {f.ownerName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileMenuId(fileMenuId === f.id ? null : f.id);
                          }}
                          className="w-8 h-8 rounded-lg hover:bg-violet-500/10 text-soft flex items-center justify-center transition-colors"
                          aria-label="منو"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quick menu */}
                      <AnimatePresence>
                        {fileMenuId === f.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-t border-slate-200/60 dark:border-slate-700 mt-2 pt-2"
                          >
                            <div className="grid grid-cols-4 gap-1">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggleOfflineAvailable(f.id); setFileMenuId(null); }}
                                className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-violet-500/10 text-soft hover:text-violet-500"
                              >
                                <Download className="w-4 h-4" />
                                <span className="text-[9px]">{f.isOfflineAvailable ? "آفلاین ✓" : "آفلاین"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggleFilePrivate(f.id); setFileMenuId(null); }}
                                className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-violet-500/10 text-soft hover:text-violet-500"
                              >
                                {f.isPrivate ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                <span className="text-[9px]">{f.isPrivate ? "عمومی" : "خصوصی"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedFile(f); setFileMenuId(null); }}
                                className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-violet-500/10 text-soft hover:text-violet-500"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-[9px]">پیش‌نمایش</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeFile(f.id); setFileMenuId(null); }}
                                className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-red-500/10 text-soft hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-[9px]">حذف</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </AppCard>
                  );
                })}
              </div>
            )}
          </section>

          {/* Upload button */}
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => setUploadSheetOpen(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-violet-500/40 text-violet-500 dark:text-violet-300 hover:bg-violet-500/5 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
            >
              <Upload className="w-4 h-4" />
              بارگذاری فایل جدید
            </button>
          </div>
        </>
      )}

      {/* Trash view */}
      {view === "trash" && (
        <section className="px-4 mb-5">
          <SectionTitle
            title="سطل بازیافت"
            icon={<Trash2 className="w-4 h-4" />}
            action={
              trashedFiles.length > 0 ? (
                <button
                  type="button"
                  onClick={clearTrash}
                  className="text-[11px] font-semibold text-red-500 dark:text-red-400"
                >
                  خالی کردن سطل
                </button>
              ) : undefined
            }
          />
          {trashedFiles.length === 0 ? (
            <AppCard className="!p-6 text-center">
              <Trash2 className="w-12 h-12 text-soft mx-auto mb-2" />
              <p className="text-sm text-soft">سطل بازیافت خالی است.</p>
              <p className="text-[10px] text-soft mt-1">فایل‌های حذف‌شده به مدت ۳۰ روز در اینجا قابل بازیابی هستند.</p>
            </AppCard>
          ) : (
            <div className="space-y-2">
              {trashedFiles.map((f) => (
                <AppCard key={f.id} className="!p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-500 shrink-0">
                      <File className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-strong truncate">{f.name}</p>
                      <p className="text-[10px] text-soft">حذف در: {f.deletedAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => restoreFile(f.id)}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
                    >
                      بازیابی
                    </button>
                    <button
                      type="button"
                      onClick={() => permanentDeleteFile(f.id)}
                      className="flex-1 py-1.5 rounded-lg bg-red-500/15 text-red-500 text-xs font-bold hover:bg-red-500/25 transition-colors"
                    >
                      حذف دائمی
                    </button>
                  </div>
                </AppCard>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Activity view */}
      {view === "activity" && (
        <section className="px-4 mb-5">
          <SectionTitle title="تاریخچه فعالیت‌ها" icon={<History className="w-4 h-4" />} />
          {activityLog.length === 0 ? (
            <AppCard className="!p-6 text-center">
              <Clock className="w-12 h-12 text-soft mx-auto mb-2" />
              <p className="text-sm text-soft">هنوز فعالیتی ثبت نشده است.</p>
            </AppCard>
          ) : (
            <div className="space-y-2">
              {activityLog.map((log) => (
                <AppCard key={log.id} className="!p-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500 dark:text-violet-300 shrink-0">
                      <ActivityIcon action={log.action} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-strong">{log.details}</p>
                      <p className="text-[10px] text-soft mt-0.5">{log.actorName} · {log.timestamp}</p>
                    </div>
                  </div>
                </AppCard>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Create folder sheet */}
      <Sheet
        open={folderSheetOpen}
        onClose={() => setFolderSheetOpen(false)}
        title="ایجاد پوشه جدید"
        footer={
          <>
            <button type="button" onClick={() => setFolderSheetOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button>
            <button type="button" onClick={handleCreateFolder} disabled={!newFolderName.trim()} className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shadow-glow disabled:opacity-40">ایجاد</button>
          </>
        }
      >
        <div>
          <label className="block text-xs font-semibold text-soft mb-1.5">نام پوشه</label>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="مثلاً: مدارک پزشکی"
            className="w-full surface-input rounded-xl px-3 py-2.5 text-sm text-strong placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>
      </Sheet>

      {/* Upload file sheet */}
      <UploadSheet
        open={uploadSheetOpen}
        onClose={() => setUploadSheetOpen(false)}
        onUpload={(file) => {
          uploadFile({ ...file, folderId: currentFolder });
          setUploadSheetOpen(false);
        }}
      />

      {/* File detail sheet */}
      <Sheet
        open={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        title={selectedFile?.name || "جزئیات فایل"}
        subtitle={selectedFile ? formatBytes(selectedFile.sizeBytes) : undefined}
      >
        {selectedFile && (
          <div className="space-y-3">
            {selectedFile.mimeType.startsWith("image/") && selectedFile.dataUrl && (
              <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={selectedFile.dataUrl} alt={selectedFile.name} className="w-full h-48 object-contain" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-soft">نوع فایل: </span>
                <span className="text-strong font-medium">{selectedFile.mimeType}</span>
              </div>
              <div>
                <span className="text-soft">حجم: </span>
                <span className="text-strong font-medium fa-num">{formatBytes(selectedFile.sizeBytes)}</span>
              </div>
              <div>
                <span className="text-soft">بارگذار: </span>
                <span className="text-strong font-medium">{selectedFile.ownerName}</span>
              </div>
              <div>
                <span className="text-soft">تاریخ: </span>
                <span className="text-strong font-medium fa-num">{selectedFile.createdAt}</span>
              </div>
              <div>
                <span className="text-soft">وضعیت: </span>
                <span className={`font-bold ${selectedFile.isPrivate ? "text-amber-500" : "text-emerald-500"}`}>
                  {selectedFile.isPrivate ? "خصوصی" : "مشترک"}
                </span>
              </div>
              <div>
                <span className="text-soft">آفلاین: </span>
                <span className={`font-bold ${selectedFile.isOfflineAvailable ? "text-emerald-500" : "text-soft"}`}>
                  {selectedFile.isOfflineAvailable ? "بله" : "خیر"}
                </span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => toggleOfflineAvailable(selectedFile.id)}
                className="flex-1 py-2 rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-300 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {selectedFile.isOfflineAvailable ? "حذف از آفلاین" : "دسترسی آفلاین"}
              </button>
              <button
                type="button"
                onClick={() => toggleFilePrivate(selectedFile.id)}
                className="flex-1 py-2 rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-300 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {selectedFile.isPrivate ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {selectedFile.isPrivate ? "عمومی کن" : "خصوصی کن"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                removeFile(selectedFile.id);
                setSelectedFile(null);
              }}
              className="w-full py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              انتقال به سطل بازیافت
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function ActivityIcon({ action }: { action: string }) {
  switch (action) {
    case "upload": return <Upload className="w-4 h-4" />;
    case "rename": return <Pencil className="w-4 h-4" />;
    case "move": return <Folder className="w-4 h-4" />;
    case "delete": return <Trash2 className="w-4 h-4" />;
    case "restore": return <RefreshCw className="w-4 h-4" />;
    case "download": return <Download className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
}

function UploadSheet({ open, onClose, onUpload }: {
  open: boolean;
  onClose: () => void;
  onUpload: (file: { name: string; mimeType: string; sizeBytes: number; dataUrl?: string }) => void;
}) {
  const [file, setFile] = useState<{ name: string; mimeType: string; sizeBytes: number; dataUrl?: string } | null>(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      alert("حجم فایل نباید بیش از ۱۰ مگابایت باشد (نسخه دمو).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFile({
        name: f.name,
        mimeType: f.type || "application/octet-stream",
        sizeBytes: f.size,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(f);
  };

  return (
    <Sheet
      open={open}
      onClose={() => { setFile(null); onClose(); }}
      title="بارگذاری فایل جدید"
      subtitle="عکس، PDF، Word، Excel تا ۱۰ مگابایت"
      footer={
        <>
          <button type="button" onClick={() => { setFile(null); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold">انصراف</button>
          <button
            type="button"
            onClick={() => file && onUpload(file)}
            disabled={!file}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold shadow-glow disabled:opacity-40"
          >
            بارگذاری
          </button>
        </>
      }
    >
      <input
        type="file"
        id="cloud-upload-input"
        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,audio/*,video/*,.zip,.txt"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
      />
      {!file ? (
        <button
          type="button"
          onClick={() => document.getElementById("cloud-upload-input")?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-violet-500/40 p-6 flex flex-col items-center gap-2 text-center hover:bg-violet-500/5 transition-colors"
        >
          <span className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-violet-500 dark:text-violet-300" />
          </span>
          <span className="text-sm font-semibold text-strong">انتخاب فایل</span>
          <span className="text-[11px] text-soft">حداکثر ۱۰ مگابایت</span>
        </button>
      ) : (
        <AppCard className="!p-3">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 dark:text-violet-300 shrink-0">
              <File className="w-6 h-6" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-strong truncate">{file.name}</p>
              <p className="text-[11px] text-soft fa-num">{formatBytes(file.sizeBytes)} · {file.mimeType}</p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </AppCard>
      )}
    </Sheet>
  );
}
