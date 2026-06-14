import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function BlogDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } });
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-6 py-24">
      <Link href="/blog" className="text-sm text-primary hover:underline mb-8 inline-block">← Akademi</Link>
      {post.imageUrl && (
        <div className="relative h-72 sm:h-96 mb-8 rounded-xl overflow-hidden">
          <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
        </div>
      )}
      <h1 className="text-3xl sm:text-4xl font-bold text-heading mb-4">{post.title}</h1>
      <div className="flex items-center gap-4 text-sm text-muted mb-8 pb-8 border-b border-border">
        <span>{post.author}</span>
        <span>·</span>
        <span>{new Date(post.createdAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</span>
      </div>
      <div className="prose prose-sm max-w-none text-body leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
