import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#e5e0d8] bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 pb-12 border-b border-[#e5e0d8]">
          <div className="col-span-2 md:col-span-1">
            <span className="text-lg font-bold tracking-tight text-[#1a1a1a]">
              <span className="text-[#C4724B]">✦</span> Rostello
            </span>
            <p className="text-sm text-[#8c8c8c] mt-3 leading-relaxed max-w-xs">
              En taze özel kahve çekirdekleri, özenle kavrulur.
            </p>
          </div>
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-[#8c8c8c] font-medium mb-4">Markamız</h3>
            <div className="flex flex-col gap-2.5">
              <Link href="/hikaye" className="text-sm text-[#4a4a4a] hover:text-[#C4724B] transition">Hikayemiz</Link>
              <Link href="/akademi" className="text-sm text-[#4a4a4a] hover:text-[#C4724B] transition">Akademi</Link>
              <Link href="/b2b" className="text-sm text-[#4a4a4a] hover:text-[#C4724B] transition">Kurumsal</Link>
              <Link href="/magazalar" className="text-sm text-[#4a4a4a] hover:text-[#C4724B] transition">Mağazalar</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-[#8c8c8c] font-medium mb-4">Öğren</h3>
            <div className="flex flex-col gap-2.5">
              <Link href="/demleme" className="text-sm text-[#4a4a4a] hover:text-[#C4724B] transition">Demleme Rehberi</Link>
              <Link href="/akademi" className="text-sm text-[#4a4a4a] hover:text-[#C4724B] transition">Akademi</Link>
              <Link href="/ai-barista" className="text-sm text-[#4a4a4a] hover:text-[#C4724B] transition">Dijital Barista</Link>
              <Link href="/abonelik" className="text-sm text-[#4a4a4a] hover:text-[#C4724B] transition">Abonelik</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-[#8c8c8c] font-medium mb-4">Kişisel Verilerin Korunması</h3>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-sm text-[#4a4a4a] hover:text-[#C4724B] transition">KVKK ve Gizlilik Politikası</a>
              <a href="#" className="text-sm text-[#4a4a4a] hover:text-[#C4724B] transition">Aydınlatma Metni</a>
              <a href="#" className="text-sm text-[#4a4a4a] hover:text-[#C4724B] transition">Çerez Politikası</a>
              <a href="#" className="text-sm text-[#4a4a4a] hover:text-[#C4724B] transition">KVKK Başvuru Formu</a>
            </div>
          </div>
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase text-[#8c8c8c] font-medium mb-4">İletişim</h3>
            <div className="flex flex-col gap-2.5 text-sm text-[#4a4a4a]">
              <a href="mailto:info@rostello.com" className="hover:text-[#C4724B] transition">info@rostello.com</a>
              <a href="https://instagram.com/rostello" target="_blank" rel="noopener noreferrer" className="hover:text-[#C4724B] transition">Instagram</a>
              <a href="#" className="hover:text-[#C4724B] transition">Twitter</a>
              <a href="#" className="hover:text-[#C4724B] transition">Facebook</a>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-[#8c8c8c] pt-6">
          &copy; {new Date().getFullYear()} Rostello. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
