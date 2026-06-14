"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface FilmItem { imageUrl: string; title?: string; subtitle?: string; }

export default function FilmReelSection() {
  const [items, setItems] = useState<FilmItem[]>([]);

  useEffect(() => {
    fetch("/api/public/filmreel").then(r => r.json()).then(d => {
      if (d.items && d.items.length > 0) setItems(d.items);
    });
  }, []);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div className="flex flex-col items-center shrink-0 z-10">
      <div style={{ width: "220px", height: "540px" }}>
        <div className="relative overflow-hidden" style={{ transform: "scale(1.2)", transformOrigin: "top left", width: "183px", height: "450px" }}>
          <div className="absolute inset-x-0 top-0 h-12 z-10 bg-gradient-to-b from-page to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-12 z-10 bg-gradient-to-t from-page to-transparent" />
          <div className="flex flex-col animate-scroll-down" style={{ animationDuration: "45s" }}>
            {doubled.map((item, i) => (
              <div key={i} className="w-[183px] h-[170px] shrink-0 relative" style={{ transform: "translateZ(0)" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary-light/10 z-10 pointer-events-none" />
                <Image src={item.imageUrl} alt="" width={183} height={170} className="w-full h-full object-contain p-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="text-center mt-3">
        <p className="text-xs tracking-[0.15em] uppercase text-primary font-semibold">Taze Kavurum</p>
        <p className="text-xs tracking-[0.1em] uppercase text-muted font-medium mt-0.5">Üstün Lezzet Deneyimi</p>
      </div>
    </div>
  );
}
