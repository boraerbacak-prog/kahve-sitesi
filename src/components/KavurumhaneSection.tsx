import Link from "next/link";
import Image from "next/image";

interface KavurumhaneInfo {
  title: string;
  description: string;
  address: string;
}

export default function KavurumhaneSection({ info }: { info: KavurumhaneInfo | null }) {
  return (
    <section className="relative bg-page/95 py-24 sm:py-32 overflow-hidden border-t border-primary/5">
      <div className="absolute inset-0">
        <Image src="/celsus/demleme/demleme2.png" alt="" fill className="object-cover opacity-15" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f2ed]/80 via-[#f5f2ed]/50 to-[#f5f2ed]/80" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="eyebrow">Kavurumhane</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mt-3 mb-4 leading-tight">
              {info?.title || "Bizi Ziyaret Edin"}
            </h2>
            <p className="text-body text-base sm:text-lg leading-relaxed mb-8">
              {info?.description || "Rostello'nun kalbinde, çekirdekten fincana uzanan yolculuğa tanıklık edin."}
            </p>
            <div className="space-y-4 text-body">
              <div className="flex items-start gap-3">
                <span className="text-primary mt-0.5 shrink-0 text-lg">📍</span>
                <div>
                  <p className="font-medium text-heading">{info?.title || "Rostello"}</p>
                  <p className="text-sm text-muted">{info?.address || "Moda, Bostancı Başı Cad. No:42, 34710 Kadıköy / İstanbul"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary mt-0.5 shrink-0 text-lg">🕐</span>
                <div>
                  <p className="font-medium text-heading">Çalışma Saatleri</p>
                  <p className="text-sm text-muted">Hafta içi: 08:00 – 19:00 / Cmt: 10:00 – 18:00</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/kavurma-dukkani"
                className="inline-flex items-center gap-2 text-white px-10 py-5 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110 hover:scale-105"
                style={{
                  background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))",
                  backgroundSize: "200% auto",
                  animation: "copper-shimmer 3s linear infinite",
                }}
              >
                Detaylı Bilgi →
              </Link>
            </div>
          </div>
          <div className="aspect-[4/3] bg-page-alt border border-border overflow-hidden relative">
            <Image
              src="/celsus/demleme/demleme2.png"
              alt={info?.title || "Kavurumhane"}
              fill
              className="object-cover opacity-30"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                  <span className="text-white text-xl">🗺</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Rostello Kavurum Evi</p>
                  <p className="text-white/70 text-xs">Haritada Gör</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
