import Link from "next/link";
import Image from "next/image";

const posts = [
  { src: "/atolye-bg.jpg", alt: "Rostello atölye", likes: 234 },
  { src: "/atolye-3.jpg", alt: "Taze kavrum", likes: 189 },
  { src: "/atolye-4.jpg", alt: "Kahve keyfi", likes: 312 },
  { src: "/celsus/demleme/demleme2.png", alt: "Demleme anı", likes: 156 },
  { src: "/atolye-bg.jpg", alt: "Çekirdek seçimi", likes: 278 },
  { src: "/atolye-3.jpg", alt: "Barista eğitimi", likes: 145 },
];

export default function InstagramFeed() {
  return (
    <section className="relative bg-[#f5f2ed] py-16 sm:py-20 border-t border-primary/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="eyebrow">@Rostello</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mt-3 mb-4">
            Bizi <span className="animate-copper">Takip Edin</span>
          </h2>
          <p className="text-body text-base sm:text-lg leading-relaxed">
            Her gün taze kavrum, demleme ipuçları ve kahve kültürü içeriklerimizi Instagram&rsquo;da paylaşıyoruz.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 max-w-5xl mx-auto mb-8">
          {posts.map((post, i) => (
            <div key={i} className="relative aspect-square bg-[#e5e0d8] overflow-hidden group cursor-pointer">
              <Image
                src={post.src}
                alt={post.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  ❤️ {post.likes}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="https://instagram.com/rostellocoffee"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white px-10 py-5 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110 hover:scale-105"
            style={{
              background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))",
              backgroundSize: "200% auto",
              animation: "copper-shimmer 3s linear infinite",
            }}
          >
            Daha Fazlası İçin →
          </Link>
        </div>
      </div>
    </section>
  );
}
