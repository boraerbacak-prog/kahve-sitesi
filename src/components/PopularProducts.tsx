"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FreshnessStatus from "./FreshnessStatus";

interface Product {
  slug: string;
  name: string;
  price: number;
  origin: string | null;
  categoryName?: string | null;
  roastedAt?: string | null;
  process?: string | null;
  roastLevel?: string | null;
}

interface Props {
  products: Product[];
  heading?: string;
  headingHighlight?: string;
}

function getProductImage(slug: string): string {
  const map: Record<string, string> = {
    "ethiopia-sidamo-g2": "Gemini_Generated_Image_445e1s445e1s445e",
    "ethiopia-sidamo-g4": "Gemini_Generated_Image_c7t8k5c7t8k5c7t8",
    "ethiopia-lekempt-g4": "Gemini_Generated_Image_dvivc9dvivc9dviv",
    "guatemala-shb-18-sc": "Gemini_Generated_Image_g74yvng74yvng74y",
    "colombia-supremo-18-sc": "Gemini_Generated_Image_u229vnu229vnu229",
    "brasil-mogiana": "Gemini_Generated_Image_v621nbv621nbv621",
    "ethiopia-yirga-koke-honey-g1": "Gemini_Generated_Image_jwubysjwubysjwub",
    "colombia-la-roca-pink-bourbon": "Gemini_Generated_Image_vzulafvzulafvzul",
  };
  return map[slug] ? `/products/${map[slug]}.png` : "/products/rostello.png";
}

function VitrinCarousel({
  products,
  activeIndex,
  onSelect,
  onNext,
  onPrev,
}: {
  products: Product[];
  activeIndex: number;
  onSelect: (i: number) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const total = products.length;

  const getCardStyle = (index: number) => {
    const offset = ((index - activeIndex + total) % total);
    const isActive = offset === 0;
    const isLeft1 = offset === 1;
    const isRight1 = offset === total - 1;
    const isLeft2 = offset === 2;
    const isRight2 = offset === total - 2;
    const visible = offset <= 2 || offset >= total - 2;

    if (!visible) return { display: "none" as const };

    if (isActive) {
      return {
        zIndex: 20,
        transform: "translate(-50%, -50%) scale(1)",
        opacity: 1,
        width: "clamp(170px, 26vw, 280px)",
      };
    }
    if (isLeft1) {
      return {
        zIndex: 15,
        transform: "translate(calc(-50% - min(24vw, 260px)), -50%) scale(0.72)",
        opacity: 0.65,
        width: "clamp(130px, 18vw, 200px)",
      };
    }
    if (isRight1) {
      return {
        zIndex: 15,
        transform: "translate(calc(-50% + min(24vw, 260px)), -50%) scale(0.72)",
        opacity: 0.65,
        width: "clamp(130px, 18vw, 200px)",
      };
    }
    if (isLeft2) {
      return {
        zIndex: 10,
        transform: "translate(calc(-50% - min(44vw, 440px)), -50%) scale(0.48)",
        opacity: 0.25,
        width: "clamp(100px, 14vw, 160px)",
      };
    }
    if (isRight2) {
      return {
        zIndex: 10,
        transform: "translate(calc(-50% + min(44vw, 440px)), -50%) scale(0.48)",
        opacity: 0.25,
        width: "clamp(100px, 14vw, 160px)",
      };
    }
    return { display: "none" as const };
  };

  return (
    <div className="relative w-full" style={{ height: "clamp(240px, 42vh, 440px)" }}>
      {products.map((p, i) => {
        const style = getCardStyle(i);
        if (style.display === "none") return null;
        const isActive = i === activeIndex;

        return (
          <button
            key={p.slug}
            onClick={() => onSelect(i)}
            className="absolute left-1/2 top-1/2 cursor-pointer transition-all duration-700 ease-out"
            style={style as React.CSSProperties}
          >
            <div
              className={`bg-white overflow-hidden transition-all duration-700 ${
                isActive
              ? "shadow-2xl shadow-black/20 border border-primary/30"
              : "shadow-md border border-border hover:opacity-90"
              }`}
            >
              <div className="aspect-[4/5] bg-page-hover overflow-hidden relative">
                <Image
                  src={getProductImage(p.slug)}
                  alt={p.name}
                  width={280}
                  height={350}
                  className="w-full h-full object-cover transition-transform duration-1000"
                  style={{ transform: isActive ? "scale(1.08)" : "scale(1)" }}
                />
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
                )}
              </div>
            </div>
          </button>
        );
      })}

      {/* Left arrow — moved closer to center */}
      <button
        onClick={onPrev}
        className="absolute z-30 w-9 h-9 rounded-full bg-black/5 backdrop-blur-sm flex items-center justify-center text-heading hover:bg-black/10 transition-all border border-border"
        style={{ left: "clamp(60px, 10vw, 120px)", top: "50%", transform: "translateY(-50%)" }}
        aria-label="Geri"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {/* Right arrow — standard position */}
      <button
        onClick={onNext}
        className="absolute z-30 w-9 h-9 rounded-full bg-black/5 backdrop-blur-sm flex items-center justify-center text-heading hover:bg-black/10 transition-all border border-border"
        style={{ right: "clamp(60px, 10vw, 120px)", top: "50%", transform: "translateY(-50%)" }}
        aria-label="İleri"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default function PopularProducts({ products, heading = "En Çok", headingHighlight = "Tercih Edilenler" }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout>>(null);

  const next = () => {
    if (!isPlaying) return;
    setActiveIndex(i => (i + 1) % products.length);
  };
  const prev = () => setActiveIndex(i => (i - 1 + products.length) % products.length);

  const pauseWithResume = (fn: () => void) => {
    if (resumeRef.current) clearTimeout(resumeRef.current);
    setIsPlaying(false);
    fn();
    resumeRef.current = setTimeout(() => setIsPlaying(true), 10000);
  };

  const handleNext = () => {
    pauseWithResume(() => setActiveIndex(i => (i + 1) % products.length));
  };
  const handlePrev = () => {
    pauseWithResume(() => setActiveIndex(i => (i - 1 + products.length) % products.length));
  };
  const handleDotClick = (i: number) => {
    pauseWithResume(() => setActiveIndex(i));
  };

  useEffect(() => {
    if (!isPlaying || products.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setActiveIndex(i => (i + 1) % products.length);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, products.length]);

  useEffect(() => {
    return () => {
      if (resumeRef.current) clearTimeout(resumeRef.current);
    };
  }, []);

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

  if (products.length === 0) return null;

  const current = products[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="section-copper relative min-h-screen overflow-hidden bg-[#f7f5f0]/95"
    >
      {/* Background — sade tek renk */}
      <div className="absolute inset-0 bg-[#f7f5f0]/95" />

      <div
        className="relative z-10 min-h-screen flex flex-col justify-center px-6 pt-16 pb-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
        }}
      >
        <div className="text-center mb-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-heading">
            {heading} <span className="text-primary">{headingHighlight}</span>
          </h2>
        </div>

        <VitrinCarousel
          products={products}
          activeIndex={activeIndex}
          onSelect={handleDotClick}
          onNext={handleNext}
          onPrev={handlePrev}
        />

        <div
          className="text-center mt-1 transition-all duration-700"
          key={current.slug}
        >
          <span className="text-[10px] tracking-[0.25em] uppercase text-primary/80 font-medium">
            {current.origin || current.categoryName || "Özel Kavrum"}
          </span>
          <div className="flex justify-center mt-1 max-w-xs mx-auto">
            <FreshnessStatus
              origin={current.origin}
              process={current.process}
              roastLevel={current.roastLevel}
              roastedAt={current.roastedAt}
            />
          </div>
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-heading mt-1 leading-tight max-w-md mx-auto">
            {current.name}
          </h3>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-lg sm:text-xl font-bold text-heading">
              {current.price.toLocaleString("tr-TR")} ₺
            </span>
            <Link
              href={`/urunler/${current.slug}`}
              className="inline-flex items-center gap-2 text-white px-4 py-2 text-[10px] font-semibold tracking-wider uppercase transition-all duration-500 hover:brightness-110"
              style={{
                background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))",
                backgroundSize: "200% auto",
                animation: "copper-shimmer 3s linear infinite",
              }}
            >
              İncele →
            </Link>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 mt-3">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "bg-primary w-5" : "bg-black/20 w-1.5 hover:bg-black/30"
              }`}
              aria-label={`Ürün ${i + 1}`}
            />
          ))}
        </div>

        <div className="text-center mt-4">
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 text-white px-6 py-3 text-[11px] font-semibold tracking-wider uppercase transition-all duration-500 hover:brightness-110"
            style={{
              background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))",
              backgroundSize: "200% auto",
              animation: "copper-shimmer 3s linear infinite",
            }}
          >
            Tüm Kahveleri Keşfet →
          </Link>
        </div>
      </div>
    </section>
  );
}
