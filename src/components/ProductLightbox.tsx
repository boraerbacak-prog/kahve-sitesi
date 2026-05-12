"use client";

import Image from "next/image";
import { useEffect } from "react";

type Props = {
  image: string;
  title: string;
  onClose: () => void;
};

export default function ProductLightbox({ image, title, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition z-10"
        aria-label="Kapat"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain"
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
      </div>
      <p className="absolute bottom-6 text-white/70 text-sm font-medium">{title}</p>
    </div>
  );
}
