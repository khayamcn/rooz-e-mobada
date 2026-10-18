"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Camera, ImagePlus, Upload, X } from "lucide-react";

interface ImageUploaderProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
}

async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Downscale large images to keep storage small (~max 800px)
async function compressImage(dataUrl: string, maxDim = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    try {
      const raw = await readFileAsDataURL(file);
      const compressed = await compressImage(raw);
      onChange(compressed);
    } catch {
      // ignore
    }
  };

  const onCamera = (e: ChangeEvent<HTMLInputElement>) => {
    void handleFile(e.target.files?.[0]);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const onGallery = (e: ChangeEvent<HTMLInputElement>) => {
    void handleFile(e.target.files?.[0]);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    void handleFile(e.dataTransfer.files?.[0]);
  };

  if (value) {
    return (
      <div className="relative rounded-card overflow-hidden border border-violet-200/40">
        <img src={value} alt={label || "preview"} className="w-full max-h-64 object-contain bg-slate-100 dark:bg-slate-800" />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          aria-label="حذف تصویر"
          className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center pressable"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`rounded-card border-2 border-dashed p-4 flex flex-col items-center gap-2 transition-colors ${
        dragOver ? "border-violet-400 bg-violet-50/40 dark:bg-violet-900/10" : "border-violet-200/60"
      }`}
    >
      <div className="h-12 w-12 rounded-full brand-bg-soft text-brand-text flex items-center justify-center">
        <Upload size={20} />
      </div>
      {label && <p className="text-xs text-soft text-center">{label}</p>}
      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg brand-gradient text-white text-xs font-medium pressable"
        >
          <Camera size={14} /> دوربین
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg surface-input text-strong text-xs font-medium pressable"
        >
          <ImagePlus size={14} /> گالری
        </button>
      </div>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onCamera}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={onGallery}
        className="hidden"
      />
    </div>
  );
}
