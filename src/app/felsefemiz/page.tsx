import Link from "next/link";
import Image from "next/image";

const pillars = [
  {
    title: "Köken",
    desc: "Her çekirdek bir coğrafyanın hikayesini taşır. Dünyanın en iyi üreticilerinden özenle seçiyor, her birinin eşsiz karakterini koruyoruz.",
  },
  {
    title: "Zaman",
    desc: "Nitelikli kahve, kavrulduğu an değil doğru zamanda içildiğinde gerçek potansiyeline ulaşır. Dinamik takvimimiz her çekirdeğin zirve anını belirler.",
  },
  {
    title: "Bilgi",
    desc: "Her çekirdek kökenine, rakımına ve işleme yöntemine göre bilimsel bir yaklaşımla kavrulur. Standart değil, hassasiyet.",
  },
  {
    title: "Tazelik",
    desc: "Sipariş anında kavrulur, özel paketlenir ve en taze halde kapınıza ulaşır. Tazelik rozetlerimizle kahvenizin dönemini her an görürsünüz.",
  },
];

export default function FelsefemizPage() {
  return (
    <div>
      <section className="relative bg-heading py-32 sm:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 z-10" />
        <div className="absolute inset-0 opacity-10">
          <Image src="/celsus/demleme/demleme2.png" alt="" fill className="object-cover" />
        </div>
        <div className="relative z-20 max-w-3xl mx-auto px-6 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-[#c8a77b] font-medium">Özümüz</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4 mb-6 leading-tight">
            Felsefemiz
          </h1>
          <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
            Kahveyi bir ritüel olarak görüyor, tarladan fincana her aşamada özen ve bilgiyle ilerliyoruz.
            Amacımız en iyi kahveyi değil, herkes için en doğru kahveyi sunmak.
          </p>
        </div>
      </section>

      <section className="bg-[#f5f2ed] py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {pillars.map((p, i) => (
              <div
                key={i}
                className="bg-white border border-[#e5e0d8] p-8 text-center group hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-10 h-px bg-primary/30 mx-auto mb-5 group-hover:w-16 transition-all duration-500" />
                <h3 className="text-lg font-bold text-heading mb-3">{p.title}</h3>
                <p className="text-sm text-body leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/hikaye"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-primary border border-primary px-8 py-4 hover:bg-primary hover:text-white transition-all duration-300"
            >
              Hikayemizi Keşfet →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Markamız</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mt-3">Rostello</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <h3 className="text-sm tracking-[0.2em] uppercase text-heading font-semibold mb-6">Markamız</h3>
              <div className="flex flex-col gap-3">
                <Link href="/hikaye" className="text-sm text-body hover:text-primary transition">Hikayemiz</Link>
                <Link href="/akademi" className="text-sm text-body hover:text-primary transition">Akademi</Link>
                <Link href="/b2b" className="text-sm text-body hover:text-primary transition">Kurumsal</Link>
                <Link href="/kavurma-dukkani" className="text-sm text-body hover:text-primary transition">Mağazalar</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm tracking-[0.2em] uppercase text-heading font-semibold mb-6">Öğren</h3>
              <div className="flex flex-col gap-3">
                <Link href="/demleme" className="text-sm text-body hover:text-primary transition">Demleme Rehberi</Link>
                <Link href="/akademi" className="text-sm text-body hover:text-primary transition">Akademi</Link>
                <Link href="/b2b" className="text-sm text-body hover:text-primary transition">Kurumsal Satış</Link>
                <Link href="/kavurma-dukkani" className="text-sm text-body hover:text-primary transition">Kavurumhane</Link>
                <Link href="/damak-testi" className="text-sm text-body hover:text-primary transition">Damak Testi</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm tracking-[0.2em] uppercase text-heading font-semibold mb-6">Kişisel Verilerin Korunması</h3>
              <div className="flex flex-col gap-3">
                <Link href="/kvkk" className="text-sm text-body hover:text-primary transition">KVKK ve Gizlilik Politikası</Link>
                <Link href="/kvkk/aydinlatma-metni" className="text-sm text-body hover:text-primary transition">Aydınlatma Metni</Link>
                <Link href="/kvkk/cerez-politikasi" className="text-sm text-body hover:text-primary transition">Çerez Politikası</Link>
                <Link href="/kvkk/basvuru-formu" className="text-sm text-body hover:text-primary transition">KVKK Başvuru Formu</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm tracking-[0.2em] uppercase text-heading font-semibold mb-6">İletişim</h3>
              <div className="flex flex-col gap-3 text-sm text-body">
                <a href="tel:+908504607676" className="hover:text-primary transition font-semibold">0850 460 76 76</a>
                <a href="mailto:info@rostello.com" className="hover:text-primary transition">info@rostello.com</a>
                <span className="text-sm text-muted">Hafta İçi 10:00 - 19:00</span>
              </div>
              <div className="mt-6">
                <h4 className="text-sm tracking-[0.2em] uppercase text-muted font-medium mb-3">Sosyal Medya</h4>
                <div className="flex gap-3">
                  <a href="https://instagram.com/rostello" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition" aria-label="Instagram">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="https://x.com/rostello" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition" aria-label="X">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://facebook.com/rostello" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition" aria-label="Facebook">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://youtube.com/@rostello" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition" aria-label="YouTube">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
