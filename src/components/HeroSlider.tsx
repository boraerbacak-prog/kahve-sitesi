"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const slides = [
  {
    video: "/hero-video.mp4",
    bg: "/atolye-6.jpg",
    title: "Doğru Kahve. Doğru Zaman. Size Özel.",
    subtitle: "21 seçili çekirdek, Dinamik Kavrum Takvimi ve AI destekli önerilerle kahvenizi en ideal döneminde keşfedin.",
    cta: "Kahveleri Keşfet",
    href: "/urunler",
  },
  {
    video: "/kavrum-video.mp4",
    bg: "/atolye-3.jpg",
    title: "Altın İçim Dönemindeki Kahveler",
    subtitle: "Her çekirdek aynı hızda gelişmez. Rostello Dinamik Kavrum Takvimi, kahvenin karakterini en canlı ve dengeli şekilde sunduğu dönemi takip eder.",
    cta: "Kavrum Takvimini İncele",
    href: "/kavrum-takvimi",
  },
  {
    video: "/kesfet-video.mp4",
    bg: "/atolye-4.jpg",
    title: "Stello AI Barista",
    subtitle: "Damak tadınızı öğrenir, ekipmanınızı tanır ve size en uygun kahveyi ve demleme yöntemini önerir.",
    cta: "Stello ile Başla",
    href: "/ai-barista",
  },
];

const SCROLL_THRESHOLD = 80;

export default function HeroSlider() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [heroDone, setHeroDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lockedRef = useRef(false);
  const doneRef = useRef(false);
  const idxRef = useRef(0);
  const spacerRef = useRef<HTMLDivElement>(null);
  const accumRef = useRef(0);

  const advance = useCallback(() => {
    if (lockedRef.current || doneRef.current) return;
    lockedRef.current = true;

    if (idxRef.current < slides.length - 1) {
      idxRef.current += 1;
      setActiveIdx(idxRef.current);
      setTimeout(() => { lockedRef.current = false; }, 800);
    } else {
      doneRef.current = true;
      setHeroDone(true);
      lockedRef.current = false;
    }
  }, []);

  const goBack = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;

    if (doneRef.current) {
      doneRef.current = false;
      setHeroDone(false);
      setHidden(false);
      idxRef.current = slides.length - 1;
      setActiveIdx(idxRef.current);
      setTimeout(() => { lockedRef.current = false; }, 100);
      const spacer = spacerRef.current;
      if (spacer) {
        const startY = window.scrollY;
        const targetY = spacer.offsetTop;
        const distance = startY - targetY;
        const duration = 600;
        const startTime = performance.now();
        function step(time: number) {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          window.scrollTo(0, startY - distance * progress);
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
      return;
    }

    if (idxRef.current > 0) {
      idxRef.current -= 1;
      setActiveIdx(idxRef.current);
      setTimeout(() => { lockedRef.current = false; }, 800);
    } else {
      lockedRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!heroDone) return;
    const spacer = spacerRef.current;
    if (!spacer) return;
    const next = spacer.nextElementSibling as HTMLElement | null;
    if (!next) return;

    setHidden(true);

    const startY = window.scrollY;
    const targetY = next.offsetTop;
    const distance = targetY - startY;
    const duration = 800;
    const startTime = performance.now();

    function step(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + distance * progress);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [heroDone]);

  useEffect(() => {
    const handler = (e: WheelEvent) => {
      if (doneRef.current) {
        if (e.deltaY > 0) return;
        if (window.scrollY > 10) return;
        e.preventDefault();
        accumRef.current += e.deltaY;
        if (accumRef.current < -SCROLL_THRESHOLD) {
          accumRef.current = 0;
          goBack();
        }
        return;
      }

      e.preventDefault();
      accumRef.current += e.deltaY;

      if (accumRef.current > SCROLL_THRESHOLD) {
        accumRef.current = 0;
        advance();
      } else if (accumRef.current < -SCROLL_THRESHOLD) {
        accumRef.current = 0;
        goBack();
      }
    };
    window.addEventListener("wheel", handler, { passive: false });
    return () => window.removeEventListener("wheel", handler);
  }, [advance, goBack]);

  useEffect(() => {
    let startY = 0;
    const touchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const touchEnd = (e: TouchEvent) => {
      const diff = startY - e.changedTouches[0].clientY;
      if (diff > 50) {
        if (doneRef.current) return;
        advance();
      } else if (diff < -50) {
        if (doneRef.current && window.scrollY > 10) return;
        goBack();
      }
    };
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchend", touchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchend", touchEnd);
    };
  }, [advance, goBack]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        if (doneRef.current) return;
        e.preventDefault();
        advance();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (doneRef.current && window.scrollY > 10) return;
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, goBack]);

  const slide = slides[activeIdx];

  return (
    <>
      {!hidden && (
          <div
            id="hero-slider"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100vh",
              zIndex: 50,
              backgroundColor: "#1a0f0a",
            }}
          >
          {slide.video ? (
            <div className="absolute inset-0 overflow-hidden">
              <video key={slide.video} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src={slide.video} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${slide.bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/10 pointer-events-none" />

          <div className="relative z-10 w-full h-full flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-2xl lg:max-w-3xl">
                <h1
                  style={{ color: "#ffffff" }}
                  className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[0.85] mb-4 lg:mb-5"
                >
                  {slide.title}
                </h1>
                <p
                  style={{ color: "rgba(255,255,255,0.8)" }}
                  className="text-base sm:text-lg lg:text-xl max-w-xl leading-relaxed"
                >
                  {slide.subtitle}
                </p>
                <div className="mt-8 lg:mt-10">
                  <Link
                    href={slide.href}
                    className="inline-flex items-center gap-2 text-white px-8 py-4 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110 hover:scale-105"
                    style={{
                      background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))",
                      backgroundSize: "200% auto",
                      animation: "copper-shimmer 3s linear infinite",
                    }}
                  >
                    {slide.cta} <span className="text-lg">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (doneRef.current) {
                    doneRef.current = false;
                    setHeroDone(false);
                    setHidden(false);
                  }
                  idxRef.current = i;
                  setActiveIdx(i);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i === activeIdx ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
            <span
              style={{ color: "rgba(255,255,255,0.6)" }}
              className="text-[11px] tracking-[0.3em] uppercase"
            >
              Kaydır
            </span>
            <svg
              className="w-5 h-5 animate-bounce"
              style={{ color: "rgba(255,255,255,0.6)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      )}

      <div ref={spacerRef} style={{ height: "100vh" }} />
    </>
  );
}
