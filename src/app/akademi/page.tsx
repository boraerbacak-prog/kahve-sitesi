import Image from "next/image";

const posts = [
  {
    image: "/products/Gemini_Generated_Image_g74yvng74yvng74y.png",
    title: "Kahve Çekirdeği Seçim Rehberi",
    excerpt: "Arabica vs Robusta, tek köken vs harman. Kahve çekirdeği seçerken bilmeniz gereken her şey.",
  },
  {
    image: "/products/Gemini_Generated_Image_v621nbv621nbv621.png",
    title: "Evde Mükemmel Filtre Kahve Nasıl Yapılır?",
    excerpt: "V60, Chemex veya French Press... Evde barista kalitesinde filtre kahve hazırlamanın püf noktaları.",
  },
  {
    image: "/products/Gemini_Generated_Image_dvivc9dvivc9dviv.png",
    title: "Specialty Coffee Nedir?",
    excerpt: "Specialty coffee sınıflandırması, puanlama sistemi ve neden diğer kahvelerden farklı olduğu.",
  },
  {
    image: "/products/Gemini_Generated_Image_c7t8k5c7t8k5c7t8.png",
    title: "Kavrum Profilleri ve Lezzete Etkisi",
    excerpt: "Açık, orta ve koyu kavrum arasındaki farklar. Hangi kavrum profili hangi demleme yöntemi için uygun?",
  },
  {
    image: "/products/Gemini_Generated_Image_u229vnu229vnu229.png",
    title: "Dünyanın En İyi Kahve Bölgeleri",
    excerpt: "Etiyopya'dan Kolombiya'ya, dünyanın dört bir yanındaki özel kahve bölgelerini keşfedin.",
  },
  {
    image: "/products/Gemini_Generated_Image_445e1s445e1s445e.png",
    title: "Cold Brew Rehberi: Soğuk Kahve Sevenler İçin",
    excerpt: "Evde cold brew yapmanın 3 farklı yöntemi. Hangi çekirdekler soğuk demleme için daha uygun?",
  },
];

export default function AkademiPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Güncel</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">Akademi</h1>
        <p className="text-[#4a4a4a] max-w-lg mx-auto">
          Kahve kültürü, demleme teknikleri ve sektör trendleri.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.title} className="group bg-white border border-[#e5e0d8] overflow-hidden hover:border-[#C4724B]/30 hover:shadow-lg transition-all cursor-pointer">
            <div className="relative h-52 bg-[#f8f6f3] overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-2 leading-snug">{post.title}</h2>
              <p className="text-sm text-[#4a4a4a] leading-relaxed">{post.excerpt}</p>
              <span className="inline-block mt-4 text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium group-hover:gap-2 transition-all">
                Devamını Oku →
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
