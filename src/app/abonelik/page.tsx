import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import PlanCalculator from "@/components/PlanCalculator";

export default async function AbonelikPage() {
  const session = await auth();
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const priceAgg = await prisma.product.aggregate({
    _min: { price: true },
    _max: { price: true },
    where: { published: true, status: "active" },
  });
  const minKgPrice = priceAgg._min.price ?? 450;
  const maxKgPrice = priceAgg._max.price ?? 700;

  return (
    <div className="min-h-screen bg-page">
      <section className="section-copper relative bg-page py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-[url('/celsus/demleme/demleme2.png')] bg-cover bg-center opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-page/90 via-page/60 to-page/90" />
        </div>
          <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-heading mb-5 leading-tight text-center">
              Kişisel Kahve <span className="text-primary">Planları</span>
            </h1>
            <p className="text-base sm:text-lg text-body/70 max-w-2xl mx-auto leading-relaxed text-center">
              Klasik aboneliklerden farklı olarak; planınız tüketim alışkanlıklarınıza,
              demleme yönteminize ve Kavrum Takvimi&apos;ne göre algoritmayla şekillenir.
            </p>
          </div>

          <div className="mt-10">
            <div className="text-xs tracking-[0.15em] uppercase text-primary font-semibold mb-4">Tüketimine Göre Planını Hesapla</div>
            <PlanCalculator sessionUser={!!session?.user} minKgPrice={minKgPrice} maxKgPrice={maxKgPrice} planId={plan?.id || null} />
          </div>

          <div className="mt-10 text-center">
            <span className="inline-flex items-center gap-2 border-2 border-primary/50 text-primary px-8 py-3 text-sm font-bold tracking-wider uppercase">
              Nasıl Çalışır? ↓
            </span>
          </div>
        </div>
      </section>

      <section className="section-copper bg-card/50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[0.2em] uppercase text-primary font-semibold">Neden Rostello Planı?</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-heading mt-3">
              Algoritma ve <span className="text-primary">Zanaatin Uyumu</span>
            </h2>
          </div>

          <div className="space-y-1">
            <div className="bg-card border border-border p-6 sm:p-7 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-5">
                <span className="text-2xl font-bold text-primary leading-none shrink-0 mt-0.5">01</span>
                <div>
                  <h3 className="text-sm font-bold text-heading uppercase tracking-wider">Kesintisiz Akış</h3>
                  <p className="text-sm text-muted mt-1.5 leading-relaxed max-w-2xl">Stok takibi biter. Sistem tüketim hızınızı analiz eder, evde kahve birikmesi veya kahvesiz kalma riskini tamamen ortadan kaldırır.</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border p-6 sm:p-7 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-5">
                <span className="text-2xl font-bold text-primary leading-none shrink-0 mt-0.5">02</span>
                <div>
                  <h3 className="text-sm font-bold text-heading uppercase tracking-wider">Zaman Ayarlı Teslimat</h3>
                  <p className="text-sm text-muted mt-1.5 leading-relaxed max-w-2xl">Hasatlar gaz salınımını (degas) kargoda tamamlar; kutuyu açtığınız an lezzetin zirve dönemi başlar. Evde dinlendirmeye gerek kalmaz.</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border p-6 sm:p-7 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-5">
                <span className="text-2xl font-bold text-primary leading-none shrink-0 mt-0.5">03</span>
                <div>
                  <h3 className="text-sm font-bold text-heading uppercase tracking-wider">Reçete Sadakati</h3>
                  <p className="text-sm text-muted mt-1.5 leading-relaxed max-w-2xl">Stello, demleme yönteminizi ve damak profilinizi analiz ederek ekipmanınıza en uygun gurme hasatları eşleştirir. Mevsimler değişse bile lezzet karakteriniz aynı kalır.</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border p-6 sm:p-7 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-5">
                <span className="text-2xl font-bold text-primary leading-none shrink-0 mt-0.5">04</span>
                <div>
                  <h3 className="text-sm font-bold text-heading uppercase tracking-wider">Bilişsel Konfor</h3>
                  <p className="text-sm text-muted mt-1.5 leading-relaxed max-w-2xl">Seçim yorgunluğuna son. Veri analitiği onlarca köken arasından en doğru eşleşmeyi yapar; siz tek tıkla planınızı erteleyin, dondurun veya güncelleyin.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="döngü" className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="text-[10px] tracking-[0.2em] uppercase text-body/50 font-semibold">Bir Döngü Nasıl İşler?</span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-heading mt-2 mb-2">
              V60 Tutkunları İçin <span className="text-primary">14 Günlük Rutin</span>
            </h2>
            <p className="text-sm text-body/50 max-w-xl mx-auto leading-relaxed">
              Günde ortalama <strong className="text-heading">2 fincan</strong> tüketen bir kahvesever için
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <div className="p-4">
              <span className="text-lg font-bold text-primary/60 block mb-1">1</span>
              <h3 className="text-[11px] font-semibold text-heading/70 uppercase tracking-wider mb-1">Profilleme</h3>
              <p className="text-sm text-body/50 leading-relaxed">Stello, aradığınız asidite ve gövde beklentisine uygun mikro-lotu seçer.</p>
            </div>
            <div className="p-4">
              <span className="text-lg font-bold text-primary/60 block mb-1">2</span>
              <h3 className="text-[11px] font-semibold text-heading/70 uppercase tracking-wider mb-1">Rezerve</h3>
              <p className="text-sm text-body/50 leading-relaxed">500 gramlık valfli özel paketiniz 2 haftalık tüketiminiz için ayrılır.</p>
            </div>
            <div className="p-4">
              <span className="text-lg font-bold text-primary/60 block mb-1">3</span>
              <h3 className="text-[11px] font-semibold text-heading/70 uppercase tracking-wider mb-1">Kavrum</h3>
              <p className="text-sm text-body/50 leading-relaxed">Çekirdek kavrum takvimiyle eşleşir ve ideal gaz salınım gününde yola çıkar.</p>
            </div>
            <div className="p-4">
              <span className="text-lg font-bold text-primary/60 block mb-1">4</span>
              <h3 className="text-[11px] font-semibold text-heading/70 uppercase tracking-wider mb-1">Teslimat</h3>
              <p className="text-sm text-body/50 leading-relaxed">14. günde, aromasının en yüksek olduğu o tam saniyede kapınızda olur.</p>
            </div>
            <div className="p-4">
              <span className="text-lg font-bold text-primary/60 block mb-1">5</span>
              <h3 className="text-[11px] font-semibold text-heading/70 uppercase tracking-wider mb-1">Avantaj</h3>
              <p className="text-sm text-body/50 leading-relaxed">Teslimat tamamlandığı an %5 Çekirdek Kredi cüzdanınıza aktarılır.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="text-[10px] tracking-[0.2em] uppercase text-body/50 font-semibold">Kavrum Takvimi</span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-heading mt-2 mb-2">
              <span className="text-primary">Zamanlanmış</span> Lezzet
            </h2>
            <p className="text-sm text-body/50 max-w-2xl mx-auto leading-relaxed">
              Her çekirdeğin lezzet zirvesi (Peak Phase) farklıdır. Planınız, kahvenin kimyasına göre kronometrik olarak zamanlanır.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-4">
              <div className="text-base mb-1 opacity-50">📦</div>
              <h3 className="text-[11px] font-semibold text-heading/70 uppercase tracking-wider mb-1">Reçeteli Kavrum</h3>
              <p className="text-sm text-body/50 leading-relaxed">Tercihleriniz tamamen adınıza özel kavrulur. Her pakete hassas kavrum tarihi ve benzersiz lot numarası işlenir.</p>
            </div>
            <div className="p-4">
              <div className="text-base mb-1 opacity-50">⚙️</div>
              <h3 className="text-[11px] font-semibold text-heading/70 uppercase tracking-wider mb-1">Dinamik Hesaplama</h3>
              <p className="text-sm text-body/50 leading-relaxed">Çekirdeğin kökenine ve işleme yöntemine göre ideal gaz salınım süresi yazılımsal olarak hesaplanır.</p>
            </div>
            <div className="p-4">
              <div className="text-base mb-1 opacity-50">🚚</div>
              <h3 className="text-[11px] font-semibold text-heading/70 uppercase tracking-wider mb-1">İçime Hazır Teslimat</h3>
              <p className="text-sm text-body/50 leading-relaxed">Kahve, zirve lezzetine kargoda ulaşır. Kutuyu açtığınız an bekletmeden doğrudan demlemeye hazırdır.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="text-[10px] tracking-[0.2em] uppercase text-body/50 font-semibold">Çekirdek Cüzdan</span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-heading mt-2 mb-2">
              Her Alışverişte <span className="text-primary">Çekirdek Kredi</span>
            </h2>
            <p className="text-sm text-body/50 max-w-2xl mx-auto leading-relaxed">
              Plan kapsamındaki her siparişiniz, sonraki kahve keşiflerinizi finanse eder.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-primary/60 mb-1">%5</div>
              <h3 className="text-[11px] font-semibold text-heading/70 uppercase tracking-wider mb-1">İade</h3>
              <p className="text-sm text-body/50 leading-relaxed">Planlı her sipariş tutarının %5&apos;i dijital cüzdanınıza anında aktarılır. Tek seferlik alımlarda bu oran %2&apos;dir.</p>
            </div>
            <div className="p-4 text-center">
              <svg className="w-6 h-6 text-primary/50 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
              <h3 className="text-[11px] font-semibold text-heading/70 uppercase tracking-wider mb-1">Nitelikli Seçki</h3>
              <p className="text-sm text-body/50 leading-relaxed">Krediler yalnızca yeni mikro-lot çekirdek keşiflerinde geçerlidir; aksesuar grubunda kullanılamaz.</p>
            </div>
            <div className="p-4 text-center">
              <svg className="w-6 h-6 text-primary/50 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
              <h3 className="text-[11px] font-semibold text-heading/70 uppercase tracking-wider mb-1">Süresiz Özgürlük</h3>
              <p className="text-sm text-body/50 leading-relaxed">Son kullanma tarihi yoktur. Planınız aktif olduğu sürece dilediğiniz an harcayabilirsiniz.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-page py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm text-body/70 mb-8 max-w-xl mx-auto leading-relaxed">
            Profilinizi oluşturun, en doğru çekirdeği Stello seçsin. Zamanı takvim yönlendirirken, size sadece kusursuz fincanın tadını çıkarmak kalsın.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link
              href="/profil-olustur"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 text-sm font-semibold tracking-wide uppercase transition"
            >
              Kişisel Planını Oluştur →
            </Link>
          </div>
          <p className="text-sm text-body/50">Dilediğiniz an durdurun veya iptal edin.</p>
        </div>
      </section>

      <section className="bg-page border-t border-border py-8">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-primary/60 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
              <div>
                <h3 className="text-sm font-bold text-heading">Ofisiniz veya İşletmeniz İçin mi?</h3>
                <p className="text-sm text-body/60 mt-0.5">Kurumsal kahve planlarımızla, iş yerinizdeki tüketim hızını ve nitelikli kahve deneyimini premium çözümlerle yönetiyoruz.</p>
              </div>
            </div>
            <div className="relative shrink-0">
              <Link
                href="/b2b"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-primary border border-primary/50 px-5 py-2.5 hover:bg-primary hover:text-white hover:border-primary transition"
              >
                Kurumsal Planları İnceleyin →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
