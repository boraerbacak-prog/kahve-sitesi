"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DEFAULT_AUDIO = "/celsus/ses/Paper_Filter_Mornings.mp3";

export default function SectionAudio({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const seen = sessionStorage.getItem("welcome-seen");
    if (!seen) {
      setShowWelcome(true);
      sessionStorage.setItem("welcome-seen", "1");
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const el = sectionRef.current;
    if (!audio || !el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          audio.muted = false;
          if (audio.paused) audio.play().catch(() => {});
        } else {
          audio.pause();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      audio.pause();
    };
  }, []);

  const handleDismiss = () => {
    setShowWelcome(false);
    const audio = audioRef.current;
    if (audio) {
      audio.muted = true;
      audio.currentTime = 0;
      audio.play().then(() => {
        setTimeout(() => { audio.muted = false; }, 200);
      }).catch(() => {});
    }
  };

  return (
    <>
      <div ref={sectionRef} className="absolute inset-0 pointer-events-none">
        <audio ref={audioRef} src={src || DEFAULT_AUDIO} loop playsInline autoPlay muted preload="auto" />
      </div>

      {mounted && showWelcome && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl max-w-md w-[90%] p-8 shadow-2xl animate-fade-in">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#8B7355] hover:text-primary transition-colors"
              aria-label="Kapat"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full mb-6" />
            <h2 className="text-2xl font-bold text-[#2c1810] mb-3">Hoş Geldiniz</h2>
            <p className="text-[#6B5B4E] leading-relaxed text-sm">
              Kahve yolculuğunuza hoş geldiniz. Her yudumda taze kavrumun
              eşsiz lezzetini keşfedin. Size en uygun kahveyi bulmak için
              hazır mısınız?
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
