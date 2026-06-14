import Link from "next/link";
import Image from "next/image";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  author: string;
}

export default function AkademiSection({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="section-copper relative bg-page/95 py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/celsus/demleme/demleme2.png" alt="" fill className="object-cover opacity-15" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f2ed]/80 via-[#f5f2ed]/50 to-[#f5f2ed]/80" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow">Güncel</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mt-3 mb-4">
            <span className="animate-copper">Akademi</span>
          </h2>
          <p className="text-body text-base sm:text-lg leading-relaxed">
            Kahve kültürü, demleme teknikleri ve sektör trendleri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white border border-border overflow-hidden hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              {post.imageUrl && (
                <div className="relative h-48 bg-page-hover overflow-hidden">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-base font-bold text-heading mb-2 leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-body leading-relaxed">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted">{post.author}</span>
                  <span className="text-xs text-primary font-medium">Devamını Oku →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/akademi"
            className="inline-flex items-center gap-2 text-white px-10 py-5 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110 hover:scale-105"
            style={{
              background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))",
              backgroundSize: "200% auto",
              animation: "copper-shimmer 3s linear infinite",
            }}
          >
            Tüm Yazıları Gör →
          </Link>
        </div>
      </div>
    </section>
  );
}
