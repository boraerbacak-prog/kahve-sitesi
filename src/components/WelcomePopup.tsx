"use client";

import { useEffect, useRef, useState } from "react";

export default function WelcomePopup() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("welcome-seen");
    if (!seen) {
      setVisible(true);
      sessionStorage.setItem("welcome-seen", "1");
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/celsus/ses/Paper_Filter_Mornings.mp3" loop preload="auto" />

      {visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl max-w-md w-[90%] p-8 shadow-2xl animate-fade-in">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#8B7355] hover:text-[#C4724B] transition-colors"
              aria-label="Kapat"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="w-12 h-1 bg-gradient-to-r from-[#C4724B] to-[#D4A574] rounded-full mb-6" />
            <h2 className="text-2xl font-bold text-[#2c1810] mb-3">Hoş Geldiniz</h2>
            <p className="text-[#6B5B4E] leading-relaxed text-sm">
              Kahve yolculuğunuza hoş geldiniz. Her yudumda taze kavrumun
              eşsiz lezzetini keşfedin. Size en uygun kahveyi bulmak için
              hazır mısınız?
            </p>
          </div>
        </div>
      )}
    </>
  );
}
