import Image from "next/image";
import Link from "next/link";

export default function StoryPage() {
  return (
    <div>
      <section className="relative h-[60vh] bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10" />
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <span className="text-[200px]">🔥</span>
        </div>
        <div className="relative z-20 text-center px-6 max-w-2xl">
          <span className="text-xs tracking-[0.2em] uppercase text-[#c8a77b] font-medium">Hikayemiz</span>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mt-4 leading-tight">
            Ateş, Matematik<br />ve Ruh
          </h1>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-white p-8 sm:p-12 md:p-16 border border-[#e5e0d8]">
          <div className="prose prose-lg max-w-none">
            <div className="flex items-center justify-center mb-12">
              <Image src="/logo.png" alt="Rostello" width={80} height={80} className="rounded-full" />
            </div>

            <p className="text-lg leading-relaxed text-[#1a1a1a] mb-8 font-medium">
              Burası bizim için sadece bir kavurma atölyesi değil; evrenin o kadim matematiği ile ruhun sanatını aynı paydada buluşturduğumuz bir merkezdir.
            </p>

            <p className="text-[#4a4a4a] leading-relaxed mb-8">
              Biz, hayatın karmaşasını en yalın haliyle ifade etmek için yola çıktık. Bir tarafta hayatın içinden gelen, her bir ikramı bir "hâl dili" olarak kabul eden o sarsılmaz görgü; diğer tarafta ise kainatın değişmez geometrisini satır satır kodlayan bir yazılım zekası... Bu iki dünyayı, Rostello çatısı altında birleştirdik.
            </p>

            <h2 className="text-2xl font-bold text-[#1a1a1a] mt-12 mb-6">Toprak Başkasının, Terbiye Bizim</h2>

            <p className="text-[#4a4a4a] leading-relaxed mb-8">
              Dünyanın en uzak köşelerinden, o toprakların hikâyesini taşıyan ham çekirdekleri seçiyoruz. Onlar birer cevher olarak gelir; ancak o çekirdeği terbiye eden, ona asıl kimliğini ve o unutulmaz damağı veren bizim bu topraklara has nezaketimiz ve titizliğimizdir. Rostello, ismini aldığı o soylu ateşin hiddetini, yazılımın o dingin sükûnetiyle dengelediğimiz yerdir. Kavurma kazanının kapağı açıldığında yayılan o ilk koku, aslında bir algoritmanın değil, bir tutkunun sonucudur. O anın buğusu, matematiğin ve sanatın en samimi kucaklaşmasıdır.
            </p>

            <div className="my-16 bg-[#f8f6f3] p-12 text-center border border-[#e5e0d8]">
              <span className="text-6xl block mb-4">☕</span>
              <p className="text-lg italic text-[#6b4c3b] font-medium">
                "Kahvenin tadı damağınızda kalıcıysa, bizim hikâyemiz de tamamlanmış demektir."
              </p>
            </div>

            <h2 className="text-2xl font-bold text-[#1a1a1a] mt-12 mb-6">Hızın İçinde Derin Bir Es</h2>

            <p className="text-[#4a4a4a] leading-relaxed mb-8">
              Biliyoruz; hayat çok hızlı ve bazen çok yorucu. Sosyal medyada, o yoğun stresin ortasında bir an durup kahve kokusuna sığındığınızı gördüğümüzde, yaptığımız işin hayattaki karşılığını buluyoruz. Sizin koku ve tat hafızanızda bıraktığımız o küçücük, kalıcı iz; bizim için tüm yazılımlardan daha gerçektir. Biz, sadece görünür olmayı değil, o eşsiz koku ve tat anlarında sizinle sessizce buluşmayı, hayatın tadını birlikte kalıcılaştırmayı amaçlıyoruz.
            </p>

            <h2 className="text-2xl font-bold text-[#1a1a1a] mt-12 mb-6">Tasarlanmış Bir Tutku, Kodlanmış Bir Ruh</h2>

            <p className="text-[#4a4a4a] leading-relaxed mb-8">
              Zaman geçse de gelişmekten ve her damağa dokunma arzusundan vazgeçmiyoruz. Rostello bünyesindeki Archi-C sistemini, teknolojinin soğukluğuyla değil, kusursuzluğa duyduğumuz o kadim sadakatle tasarladık. En iyi hizmeti kapınıza bir veri hızıyla değil, bir misafirperverlik vakarıyla taşıyoruz. Çünkü kahvenin tadı damağınızda kalıcıysa, bizim hikâyemiz de tamamlanmış demektir.
            </p>

            <div className="mt-16 pt-8 border-t border-[#e5e0d8] text-center">
              <Link
                href="/urunler"
                className="inline-block bg-[#1a1a1a] hover:bg-[#333] text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition"
              >
                Kahveleri Keşfet
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
                <span className="text-lg font-bold">Rostello</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Özel kahve çekirdekleri, usta ellerde kavrulur.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#c8a77b]">Alışveriş</h4>
              <div className="flex flex-col gap-3">
                <Link href="/urunler" className="text-sm text-white/60 hover:text-white transition">Tüm Kahveler</Link>
                <Link href="/urunler?kat=filtre-kahve" className="text-sm text-white/60 hover:text-white transition">Filtre Kahve</Link>
                <Link href="/urunler?kat=espresso" className="text-sm text-white/60 hover:text-white transition">Espresso</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#c8a77b]">Keşfet</h4>
              <div className="flex flex-col gap-3">
                <Link href="/hikaye" className="text-sm text-white/60 hover:text-white transition">Hikayemiz</Link>
                <Link href="/ai-barista" className="text-sm text-white/60 hover:text-white transition">AI Barista</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#c8a77b]">İletişim</h4>
              <div className="flex flex-col gap-3 text-sm text-white/60">
                <p>info@rostello.com</p>
                <div className="flex gap-4 mt-2">
                  <a href="#" className="hover:text-[#c8a77b] transition">Instagram</a>
                  <a href="#" className="hover:text-[#c8a77b] transition">Twitter</a>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-white/30 mt-8">
            © 2025 Rostello. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
