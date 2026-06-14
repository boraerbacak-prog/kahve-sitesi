import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AkademiPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-heading mb-4">Akademi</h1>
        <p className="text-body max-w-lg mx-auto">
          Kahve kültürü, demleme teknikleri ve sektör trendleri.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all block">
            {post.imageUrl && (
              <div className="relative h-52 bg-page-hover overflow-hidden">
                <Image src={post.imageUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-lg font-bold text-heading mb-2 leading-snug">{post.title}</h2>
              <p className="text-sm text-body leading-relaxed">{post.excerpt}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted">{post.author}</span>
                <span className="text-xs text-primary font-medium">Devamını Oku →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-24 text-muted">
          <p className="text-lg">Henüz yazı eklenmemiş.</p>
        </div>
      )}
    </div>
  );
}
