import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function KavurmaDukkaniPage() {
  const info = await prisma.kavurumhaneInfo.findFirst();
  const workshops = await prisma.workshop.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  const processes = await prisma.kavurumhaneProcess.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  return (
    <div className="min-h-screen bg-page">
      <section className="relative bg-[#2c1810] py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/celsus/demleme/demleme2.png" alt="" fill className="object-cover opacity-10" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c1810]/95 via-[#2c1810]/80 to-[#2c1810]/60" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Rostello</span>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mt-4 mb-4">
            {info?.title || "Kavurumhane"}
          </h1>
          <p className="text-[#c8a77b] text-lg max-w-2xl mx-auto">
            {info?.description || "Çekirdekten fincana, taze kavrumun ve kahve kültürünün kalbine hoş geldiniz."}
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Konum</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-heading mt-3 mb-6">Bizi Ziyaret Edin</h2>
              <div className="space-y-4 text-body">
                <div className="flex items-start gap-3">
                  <span className="text-primary mt-0.5 shrink-0">📍</span>
                  <div>
                    <p className="font-medium text-heading">{info?.title || "Kavurma Dükkanı"}</p>
                    {info?.address ? (
                      <p className="text-sm">{info.address}</p>
                    ) : (
                      <>
                        <p className="text-sm">Moda, Bostancı Başı Cad. No:42</p>
                        <p className="text-sm">34710 Kadıköy / İstanbul</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary mt-0.5 shrink-0">🕐</span>
                  <div>
                    <p className="font-medium text-heading">Çalışma Saatleri</p>
                    <p className="text-sm">Hafta içi: 08:00 – 19:00</p>
                    <p className="text-sm">Cumartesi: 10:00 – 18:00</p>
                    <p className="text-sm">Pazar: Kapalı</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary mt-0.5 shrink-0">📞</span>
                  <div>
                    <p className="font-medium text-heading">İletişim</p>
                    <p className="text-sm">+90 (216) 555 12 34</p>
                    <p className="text-sm">info@rostello.com</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-6 bg-page-alt border border-border">
                <p className="text-sm text-body leading-relaxed">
                  Dükkanımızda taze kavrulmuş kahvelerimizi satın alabilir, uzman baristalarımız eşliğinde tadım yapabilir ve kahve ekipmanlarını deneyimleyebilirsiniz.
                </p>
              </div>
            </div>
            <div className="aspect-[4/3] bg-page-alt border border-border flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-2xl">🗺</span>
                </div>
                <p className="text-sm text-muted">Harita burada gösterilecek</p>
                <p className="text-xs text-placeholder mt-1">Google Maps Embed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {workshops.length > 0 && (
        <section className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Deneyim</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-heading mt-3 mb-4">Tadım Atölyesi</h2>
              <p className="text-muted max-w-2xl mx-auto">Uzman baristalarımız eşliğinde, farklı çekirdekleri ve demleme yöntemlerini keşfedin.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {workshops.map(w => (
                <div key={w.id} className="bg-page-hover border border-border p-8 text-center hover:border-primary/30 transition hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="text-lg font-bold text-heading mb-3">{w.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{w.description}</p>
                  {w.date && <span className="inline-block mt-4 text-xs tracking-wider uppercase text-primary font-medium">{w.date}</span>}
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/iletisim"
                className="inline-flex items-center gap-2 text-white px-10 py-5 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110"
                style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))", backgroundSize: "200% auto", animation: "copper-shimmer 3s linear infinite" }}>
                Rezervasyon Yap →
              </Link>
            </div>
          </div>
        </section>
      )}

      {processes.length > 0 && (
        <section className="bg-page-alt py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Süreç</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-heading mt-3 mb-12">Taze Kavurum</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
              {processes.map(p => (
                <div key={p.id} className="text-center">
                  <span className="text-4xl font-bold text-primary/30 block mb-3">{p.step}</span>
                  <h3 className="text-sm font-bold text-heading uppercase tracking-wide mb-2">{p.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
