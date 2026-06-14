"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: "Taze Kavrum, Kapında",
    desc: "Her sipariş anında kavrulur ve tazelik garantisiyle kargoya verilir. Dinlenme sürecini biz takip eder, sen en iyi zamanda içersin.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: "İndirim ve Ücretsiz Kargo",
    desc: "Tüm siparişlerde üyelere özel indirimler ve ücretsiz kargo. Her alışverişinde avantajlı fiyatlarla kahveni sipariş et.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Çekirdek Kredi",
    desc: "Her alışverişte ödediğin tutarın %5'i Çekirdek Kredi olarak hesabına yatırılır. Üyelere özel indirimler, ücretsiz kargo ve barista danışmanlığı da cabası.",
  },
];

export default function PeakDeliveryClub() {
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
      className="relative bg-[#f5f2ed] py-24 sm:py-32 overflow-hidden border-t border-primary/5"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f2ed]/80 via-[#f5f2ed]/50 to-[#f5f2ed]/80" />
      </div>

      <div
        className="relative max-w-7xl mx-auto px-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
        }}
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow">Üyelik</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mt-3 mb-4">
            Zirve <span className="animate-copper">Üyelik</span>
          </h2>
          <p className="text-body text-base sm:text-lg leading-relaxed">
            Kahvenin zirve anını yakalamak artık çok kolay. Üyelikle her ay en taze çekirdekler kapında, en doğru zamanda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white border border-[#e5e0d8] p-8 text-center group hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-heading mb-3">{f.title}</h3>
              <p className="text-sm text-body leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/abonelik"
            className="inline-flex items-center gap-2 text-white px-10 py-5 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110 hover:scale-105"
            style={{
              background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))",
              backgroundSize: "200% auto",
              animation: "copper-shimmer 3s linear infinite",
            }}
          >
            Üye Ol →
          </Link>
        </div>
      </div>
    </section>
  );
}
