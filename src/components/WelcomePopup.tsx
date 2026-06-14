"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function WelcomePopup() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem("welcome-seen");
    if (seen) {
      setVisible(false);
    } else {
      sessionStorage.setItem("welcome-seen", "1");
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
  };

  return (
    <>
      {visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
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

            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg">
                <Image src="/celsus/dijital-barista/barista d.png" alt="Stello" width={160} height={160} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-[#2c1810] mb-3 text-center">Rostello'ya Hoş Geldiniz</h2>
            <p className="text-[#6B5B4E] leading-relaxed text-sm mb-6 text-center">
              Stello Barista ile damak tadınıza uygun kahveleri keşfedin, Dinamik Kavrum Takvimi ile çekirdeklerin en iyi dönemini takip edin ve Çekirdek Cüzdanınızla size özel kahve deneyiminin avantajlarından yararlanın.
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/kayit" onClick={handleDismiss} className="block w-full text-center bg-primary hover:bg-primary-hover text-white py-3 text-sm font-medium transition">
                Ücretsiz Üye Ol
              </Link>
              <button onClick={handleDismiss} className="text-xs text-muted hover:text-heading transition">
                Şimdilik Atla
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
