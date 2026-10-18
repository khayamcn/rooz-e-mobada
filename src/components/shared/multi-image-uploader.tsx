"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Camera, ImagePlus, X } from "lucide-react";

interface MultiImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
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

async function compressImage(dataUrl: string, maxDim = 900): Promise<string> {
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
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function MultiImageUploader({
  value,
  onChange,
  label,
}: MultiImageUploaderProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const addFiles = async (files: FileList | undefined) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;
    const next = [...value];
    for (const f of arr) {
      try {
        const raw = await readFileAsDataURL(f);
        const c = await compressImage(raw);
        next.push(c);
      } catch {
        // skip
      }
    }
    onChange(next);
  };

  const onCamera = (e: ChangeEvent<HTMLInputElement>) => {
    void addFiles(e.target.files);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const onGallery = (e: ChangeEvent<HTMLInputElement>) => {
    void addFiles(e.target.files);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeAt = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {label && <p className="text-xs text-soft">{label}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg brand-gradient text-white text-xs font-medium pressable"
        >
          <Camera size={14} /> دوربین
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg surface-input text-strong text-xs font-medium pressable"
        >
          <ImagePlus size={14} /> گالری
        </button>
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
          multiple
          onChange={onGallery}
          className="hidden"
        />
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => setDraggingIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggingIdx !== null && draggingIdx !== idx) {
                  move(draggingIdx, idx);
                }
                setDraggingIdx(null);
              }}
              className="relative aspect-square rounded-card-sm overflow-hidden border border-violet-200/40 cursor-move"
            >
              <img
                src={url}
                alt={`صفحه ${idx + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-black/60 text-white">
                {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                aria-label="حذف"
                className="absolute bottom-1 left-1 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center pressable"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
