"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, ImageIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersian } from "@/lib/persian";

export interface UploadedImage {
  name: string;
  size: number;
  type: string;
  dataUrl: string; // base64 preview
}

interface ImageUploaderProps {
  value?: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
  label?: string;
  hint?: string;
}

/**
 * ImageUploader — accepts an image file, shows preview thumbnail, and lets
 * the user remove it. Uses URL.createObjectURL for preview (no upload).
 *
 * Stored images live in the local state/store only — they would be queued
 * for upload to Supabase Storage by the file_transfer_queue in a real
 * backend scenario.
 */
export function ImageUploader({
  value,
  onChange,
  label = "بارگذاری تصویر مدرک",
  hint = "PNG یا JPG، حداکثر ۱۰ مگابایت",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setError(null);

    // Validate
    if (!file.type.startsWith("image/")) {
      setError("فقط فایل تصویری مجاز است.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("حجم فایل نباید بیش از ۱۰ مگابایت باشد.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
      });
    };
    reader.onerror = () => setError("خطا در خواندن فایل. دوباره تلاش کنید.");
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "w-full rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-2 text-center transition-all",
            dragOver
              ? "border-violet-500 bg-violet-500/5"
              : "border-slate-300 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-500/5"
          )}
        >
          <span className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-violet-500" />
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            برای انتخاب فایل ضربه بزنید
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {hint}
          </span>
        </button>
      ) : (
        <div className="rounded-2xl surface-card p-3 flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
            <img
              src={value.dataUrl}
              alt={value.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                تصویر آماده ذخیره‌سازی
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {value.name}
            </p>
            <p className="text-[10px] text-slate-400 fa-num">
              {formatSize(value.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="حذف تصویر"
            className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-[11px] text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5">
          {error}
        </p>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return toPersian(bytes) + " بایت";
  if (bytes < 1024 * 1024) return toPersian((bytes / 1024).toFixed(1)) + " کیلوبایت";
  return toPersian((bytes / 1024 / 1024).toFixed(2)) + " مگابایت";
}
