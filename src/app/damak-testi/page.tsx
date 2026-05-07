import Link from "next/link";

export default function DamakTestiPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Keşif</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">Damak Testi</h1>
        <p className="text-[#4a4a4a] max-w-lg mx-auto">
          Birkaç soruyla kahve profilini keşfet. Sevdiğin tatları bul, sana en uygun kahveyi önerelim.
        </p>
      </div>

      <div className="bg-white border border-[#e5e0d8] p-8 sm:p-12 text-center">
        <span className="text-6xl block mb-6">👅</span>
        <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">Çok Yakında</h2>
        <p className="text-[#4a4a4a] mb-8 max-w-md mx-auto">
          Damak testi şu anda geliştirme aşamasındadır. Yakında kahve profilinizi oluşturabileceksiniz.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#C4724B] hover:bg-[#B0603A] text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
