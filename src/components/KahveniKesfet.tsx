"use client";

import Image from "next/image";
import Link from "next/link";

export default function KahveniKesfet() {
  return (
    <section className="section-copper relative bg-[#f4efe8]/95 py-24 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="text-center lg:text-left max-w-md mx-auto lg:mx-0">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-3">Keşfet</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading leading-tight">
                <span className="animate-copper">Kahveni Bul</span>
              </h2>
              <p className="text-body text-base sm:text-lg leading-relaxed mt-5">
                Stello AI ile damak tadina en uygun kahveyi bul, kisisel receteni olustur.
              </p>
              <p className="text-body text-base sm:text-lg leading-relaxed mt-4">
                Sadece birkaç saniyede demleme aliskanliklarinizi ve sevdiginiz aromalari analiz edelim; sizin için en dogru kahve çekirdegini birlikte bulalim.
              </p>
              <Link
                href="/ai-barista"
                className="mt-8 inline-flex items-center gap-2 text-white px-10 py-5 text-sm sm:text-base font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110 hover:scale-105"
                style={{
                  background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))",
                  backgroundSize: "200% auto",
                  animation: "copper-shimmer 3s linear infinite",
                }}
              >
                Testi Baslat &rarr;
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] xl:w-[480px] xl:h-[480px] animate-slow-spin">
              <Image src="/sadece-cark.png" alt="" width={480} height={480} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
