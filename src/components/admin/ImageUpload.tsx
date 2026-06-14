"use client";
import { useState, useRef } from "react";

interface ImageUploadProps {
  currentUrl: string;
  onUpload: (url: string) => void;
}

export default function ImageUpload({ currentUrl, onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.url) {
      onUpload(data.url);
      setPreview(data.url);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {preview && (
          <img src={preview} alt="" className="w-16 h-16 object-cover rounded-lg border border-amber-200" />
        )}
        <label className="cursor-pointer bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-700 hover:bg-amber-100 transition-colors">
          {uploading ? "Yükleniyor..." : "Görsel Seç"}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
        {currentUrl && (
          <button
            type="button"
            onClick={() => { onUpload(""); setPreview(""); if (inputRef.current) inputRef.current.value = ""; }}
            className="text-xs text-red-500 hover:underline"
          >
            Kaldır
          </button>
        )}
      </div>
      <div>
        <input
          type="text"
          value={currentUrl}
          onChange={e => { onUpload(e.target.value); setPreview(e.target.value); }}
          className="w-full border border-amber-200 p-2 rounded-lg text-xs text-gray-500 focus:outline-none focus:border-amber-500"
          placeholder="veya görsel URL'sini manuel gir"
        />
      </div>
    </div>
  );
}
