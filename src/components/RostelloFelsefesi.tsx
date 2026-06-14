"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

const pillars = [
  {
    title: "Köken",
    desc: "Her çekirdek bir coğrafyanın hikayesini taşır. Dünyanın en iyi üreticilerinden özenle seçiyor, her birinin eşsiz karakterini koruyoruz.",
  },
  {
    title: "Zaman",
    desc: "Nitelikli kahve, kavrulduğu an değil doğru zamanda içildiğinde gerçek potansiyeline ulaşır. Dinamik takvimimiz her çekirdeğin zirve anını belirler.",
  },
  {
    title: "Bilgi",
    desc: "Her çekirdek kökenine, rakımına ve işleme yöntemine göre bilimsel bir yaklaşımla kavrulur. Standart değil, hassasiyet.",
  },
  {
    title: "Tazelik",
    desc: "Sipariş anında kavrulur, özel paketlenir ve en taze halde kapınıza ulaşır. Tazelik rozetlerimizle kahvenizin dönemini her an görürsünüz.",
  },
];

export default function RostelloFelsefesi() {
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
      id="felsefemiz"
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
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="eyebrow">Özümüz</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mt-3 mb-4">
            Felsefemiz
          </h2>
          <p className="text-body text-base sm:text-lg leading-relaxed">
            Kahveyi bir ritüel olarak görüyor, tarladan fincana her aşamada özen ve bilgiyle ilerliyoruz. 
            Amacımız en iyi kahveyi değil, herkes için en doğru kahveyi sunmak.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {pillars.map((p, i) => (
            <div
              key={i}
              className="bg-white border border-[#e5e0d8] p-8 text-center group hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-10 h-px bg-primary/30 mx-auto mb-5 group-hover:w-16 transition-all duration-500" />
              <h3 className="text-lg font-bold text-heading mb-3">{p.title}</h3>
              <p className="text-sm text-body leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
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
