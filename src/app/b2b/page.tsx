"use client";

export default function B2BPage() {
  return (
    <div className="bg-page">
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/8 via-transparent to-primary/5" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-primary-light/8 via-primary/3 to-transparent blur-3xl" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Kurumsal</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-heading mt-4 mb-6 leading-tight">
            İşletmeniz İçin Özel <span className="text-primary">Kahve Çözümleri</span>
          </h1>
          <p className="text-body max-w-2xl mx-auto text-lg leading-relaxed">
            Kafeniz, oteliniz, restoranınız veya ofisiniz için; kalite kontrol, özel reçete, eğitim ve danışmanlıkla desteklenmiş eksiksiz bir kahve ortağı.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border">
            <div className="bg-white p-10 text-center">
              <span className="text-4xl block mb-5">🔄</span>
              <h3 className="text-xl font-bold text-heading mb-3">Kahve Aboneliği</h3>
              <p className="text-lg text-body leading-relaxed">
                Kesintisiz ve düzenli tedarik. Her sevkiyatta taze kavrum, esnek paketleme seçenekleri ve ücretsiz kargo.
              </p>
            </div>
            <div className="bg-white p-10 text-center">
              <span className="text-4xl block mb-5">🫘</span>
              <h3 className="text-xl font-bold text-heading mb-3">Özel Çekirdek</h3>
              <p className="text-lg text-body leading-relaxed">
                İşletmenizin konseptine ve damak tadına özel tasarlanmış tek köken (Single Origin) veya imza harman (Blend) seçenekleri.
              </p>
            </div>
            <div className="bg-white p-10 text-center">
              <span className="text-4xl block mb-5">⚙️</span>
              <h3 className="text-xl font-bold text-heading mb-3">Ekipman Tedariği</h3>
              <p className="text-lg text-body leading-relaxed">
                Profesyonel espresso makinelerinden endüstriyel öğütücülere kadar işletmenizin hacmine en uygun komple ekipman çözümleri.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Farkımız</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-heading mt-3">Neden Rostello?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white border border-border p-8">
              <h3 className="text-xl font-bold text-heading mb-2">🏆 SCAA Kalite Standartları</h3>
              <p className="text-lg text-body leading-relaxed">
                Her kavrum partisinde uluslararası cupping (tadım) testi. Misafirlerinize her fincanda ödün vermeyen, tutarlı bir lezzet sunma garantisi.
              </p>
            </div>
            <div className="bg-white border border-border p-8">
              <h3 className="text-xl font-bold text-heading mb-2">🎓 Reçete ve Barista Eğitimi</h3>
              <p className="text-lg text-body leading-relaxed">
                Ekibinize özel pratik barista eğitimleri, menü tasarımı, doğru sunum için standart reçeteler ve demleme rehberliği.
              </p>
            </div>
            <div className="bg-white border border-border p-8">
              <h3 className="text-xl font-bold text-heading mb-2">🔒 Sabit Fiyat ve Koruma</h3>
              <p className="text-lg text-body leading-relaxed">
                Düzenli kurumsal siparişlerinizde yıl boyu sabit fiyat garantisi. Maliyetlerinizi ve bütçenizi tamamen öngörülebilir kılın.
              </p>
            </div>
            <div className="bg-white border border-border p-8">
              <h3 className="text-xl font-bold text-heading mb-2">🤖 Dijital Barista Desteği</h3>
              <p className="text-lg text-body leading-relaxed">
                Reçete kayıplarını veya anlık teknik soruları çözen, ekibinizin 7/24 erişebileceği yapay zeka destekli kahve asistanı.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Süreç</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-heading mt-3">Nasıl Çalışır?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-heading text-white flex items-center justify-center mx-auto mb-5 text-base font-bold">01</div>
              <h3 className="text-xl font-bold text-heading mb-2">Talep</h3>
              <p className="text-lg text-body leading-relaxed">
                Formu doldurun; işletmenizin hacmini, ekipman durumunu ve kahve ihtiyaçlarını analiz edelim.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-heading text-white flex items-center justify-center mx-auto mb-5 text-base font-bold">02</div>
              <h3 className="text-xl font-bold text-heading mb-2">Reçete ve Teklif</h3>
              <p className="text-lg text-body leading-relaxed">
                Sizin için en doğru çekirdek profilini, kavrum reçetesini ve kurumsal fiyat teklifini hazırlayalım.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-heading text-white flex items-center justify-center mx-auto mb-5 text-base font-bold">03</div>
              <h3 className="text-xl font-bold text-heading mb-2">Entegrasyon</h3>
              <p className="text-lg text-body leading-relaxed">
                İlk teslimatla birlikte barista eğitimlerini ve ekipman kurulumunu tamamlayıp kusursuz döngüyü başlatalım.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-28">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">İletişim</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-heading mt-3 mb-3">Bizimle Çalışmak İster misiniz?</h2>
            <p className="text-body text-lg max-w-md mx-auto">Formu doldurun, işletmeniz için en doğru kahve profilini ve kurumsal teklifimizi en kısa sürede iletelim.</p>
          </div>
          <div className="border border-border p-8 sm:p-10">
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heading uppercase tracking-wide mb-1">Ad Soyad</label>
                  <input type="text" className="w-full border border-border px-4 py-3 text-base bg-white focus:outline-none focus:border-primary transition" placeholder="Ad Soyad" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading uppercase tracking-wide mb-1">Firma Adı</label>
                  <input type="text" className="w-full border border-border px-4 py-3 text-base bg-white focus:outline-none focus:border-primary transition" placeholder="Firma adı" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heading uppercase tracking-wide mb-1">E-posta / Telefon</label>
                  <input type="text" className="w-full border border-border px-4 py-3 text-base bg-white focus:outline-none focus:border-primary transition" placeholder="ornek@firma.com / 05XX XXX XX XX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading uppercase tracking-wide mb-1">Hizmet Türü</label>
                  <select className="w-full border border-border px-4 py-3 text-base bg-white focus:outline-none focus:border-primary transition text-heading">
                    <option value="">Seçiniz</option>
                    <option>Abonelik</option>
                    <option>Özel Çekirdek</option>
                    <option>Ekipman</option>
                    <option>Hepsi</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-heading uppercase tracking-wide mb-1">Mesajınız</label>
                <textarea rows={3} className="w-full border border-border px-4 py-3 text-base bg-white focus:outline-none focus:border-primary transition resize-none" placeholder="İhtiyaçlarınızı kısaca anlatın." />
              </div>
              <div className="text-center pt-3">
                <button type="submit" className="inline-flex items-center gap-2 text-white px-12 py-4 text-base font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110" style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))", backgroundSize: "200% auto", animation: "copper-shimmer 3s linear infinite" }}>
                  Kurumsal Teklif Al
                </button>
              </div>
              <p className="text-sm text-disclaimer text-center">Paylaştığınız bilgiler yalnızca işletmenize özel teklif hazırlamak için kullanılır.</p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
