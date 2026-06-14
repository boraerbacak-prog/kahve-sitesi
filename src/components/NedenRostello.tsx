"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

const values = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "Bilgiyle Kavrulur",
    desc: "Her çekirdek kökenine, işleme yöntemine ve rakımına göre özel kavrulur. Standart değil, bilimsel bir yaklaşım.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Zirve Anında İçilir",
    desc: "Dinamik Kavrum Takvimi sayesinde her kahvenin hangi gün en iyi halde olduğunu bilir ve o gün içmenizi sağlarız.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: "Dünyadan Seçilir",
    desc: "Etiyopya&rsquo;dan Kolombiya&rsquo;ya, dünyanın en iyi çekirdeklerini özenle seçer, her birinin en doğru zamanda size ulaşmasını sağlarız.",
  },
];

export default function NedenRostello() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#f5f2ed] py-20 sm:py-28 overflow-hidden border-t border-primary/5"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f5] via-[#f5f2ed]/30 to-[#f5f2ed]/70" />
      </div>

      <div
        className="relative max-w-7xl mx-auto px-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
        }}
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow">Neden Rostello?</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mt-3 mb-4">
            Neden <span className="animate-copper">Rostello</span>?
          </h2>
          <p className="text-body text-base sm:text-lg leading-relaxed">
            Kahve sadece bir içecek değil, bir deneyim. Rostello&rsquo;yu farklı kılan üç temel değer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {values.map((v, i) => (
            <div
              key={i}
              className="bg-white border border-[#e5e0d8] p-8 text-left group hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="text-primary/60 group-hover:text-primary transition-colors duration-300 mb-4">
                {v.icon}
              </div>
              <h3 className="text-lg font-bold text-heading mb-3">{v.title}</h3>
              <p className="text-sm text-body leading-relaxed flex-1">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/hikaye"
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-primary border border-primary px-8 py-4 hover:bg-primary hover:text-white transition-all duration-300"
          >
            Hikayemizi Keşfet →
          </Link>
        </div>
      </div>
    </section>
  );
}
