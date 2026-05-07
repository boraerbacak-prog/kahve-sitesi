import Link from "next/link";

const posts = [
  {
    emoji: "🫘", title: "Kahve Çekirdeği Seçim Rehberi",
    cat: "Rehber", date: "15 Nisan 2026",
    excerpt: "Arabica vs Robusta, tek köken vs harman. Kahve çekirdeği seçerken bilmeniz gereken her şey.",
  },
  {
    emoji: "☕", title: "Evde Mükemmel Filtre Kahve Nasıl Yapılır?",
    cat: "Demleme", date: "8 Nisan 2026",
    excerpt: "V60, Chemex veya French Press... Evde barista kalitesinde filtre kahve hazırlamanın püf noktaları.",
  },
  {
    emoji: "🏆", title: "Specialty Coffee Nedir?",
    cat: "Kahve Kültürü", date: "1 Nisan 2026",
    excerpt: "Specialty coffee sınıflandırması, puanlama sistemi ve neden diğer kahvelerden farklı olduğu.",
  },
  {
    emoji: "🔥", title: "Kavrum Profilleri ve Lezzete Etkisi",
    cat: "Teknik", date: "25 Mart 2026",
    excerpt: "Açık, orta ve koyu kavrum arasındaki farklar. Hangi kavrum profili hangi demleme yöntemi için uygun?",
  },
  {
    emoji: "🌍", title: "Dünyanın En İyi Kahve Bölgeleri",
    cat: "Kültür", date: "18 Mart 2026",
    excerpt: "Etiyopya'dan Kolombiya'ya, dünyanın dört bir yanındaki özel kahve bölgelerini keşfedin.",
  },
  {
    emoji: "🧊", title: "Cold Brew Rehberi: Soğuk Kahve Sevenler İçin",
    cat: "Demleme", date: "10 Mart 2026",
    excerpt: "Evde cold brew yapmanın 3 farklı yöntemi. Hangi çekirdekler soğuk demleme için daha uygun?",
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Güncel</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">Blog</h1>
        <p className="text-[#4a4a4a] max-w-lg mx-auto">
          Kahve kültürü, demleme teknikleri ve sektör trendleri.
        </p>
      </div>

      <div className="space-y-px bg-[#e5e0d8]">
        {posts.map((post) => (
          <div key={post.title} className="bg-white p-8 sm:p-10 flex flex-col sm:flex-row gap-6 items-start">
            <span className="text-5xl shrink-0">{post.emoji}</span>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#C4724B] font-medium">{post.cat}</span>
                <span className="text-xs text-[#8c8c8c]">{post.date}</span>
              </div>
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">{post.title}</h2>
              <p className="text-sm text-[#4a4a4a] leading-relaxed">{post.excerpt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
