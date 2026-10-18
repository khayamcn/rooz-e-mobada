"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, X, Check, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersian } from "@/lib/persian";

interface MultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
}

/**
 * MultiImageUploader — supports adding multiple images via:
 *  - Camera (capture attribute)
 *  - Gallery picker (multiple)
 * Used for multi-page documents (passport, contracts, etc.)
 */
export function MultiImageUploader({
  images,
  onChange,
  label = "تصاویر مدرک",
  maxImages = 10,
}: MultiImageUploaderProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = maxImages - images.length;
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 10 * 1024 * 1024) return; // 10MB max
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onChange([...images, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-soft">
          {label}
          {images.length > 0 && (
            <span className="mr-1.5 brand-text fa-num">
              ({toPersian(images.length)} تصویر)
            </span>
          )}
        </label>
        {images.length < maxImages && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg brand-bg-soft brand-text text-[11px] font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <Camera className="w-3.5 h-3.5" />
              دوربین
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg brand-bg-soft brand-text text-[11px] font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              گالری
            </button>
          </div>
        )}
      </div>

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {images.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
          <FileImage className="w-8 h-8 mx-auto mb-2 text-soft" />
          <p className="text-[11px] text-soft">
            با دوربین یا گالری تصویر اضافه کنید
            <br />
            (برای مدارک چندصفحه‌ای)
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => setDragIndex(idx)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) reorder(dragIndex, idx);
                setDragIndex(null);
              }}
              className="relative aspect-square rounded-xl overflow-hidden surface-card group"
            >
              <img
                src={img}
                alt={`تصویر ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Page number badge */}
              <span className="absolute top-1 right-1 w-5 h-5 rounded-full brand-gradient text-white text-[10px] font-bold flex items-center justify-center fa-num">
                {toPersian(idx + 1)}
              </span>
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 left-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="حذف تصویر"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
