import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_URL || "https://rostello.com";

  const staticPages = [
    "", "/urunler", "/abonelik", "/blog", "/demleme", "/ekipmanlar", "/imza-urunler",
    "/hikaye", "/b2b", "/kavurma-dukkani", "/ai-barista", "/sadakat", "/sss", "/iletisim",
  ].map(path => ({ url: `${base}${path}`, lastModified: new Date() }));

  const products = await prisma.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
  const productPages = products.map(p => ({ url: `${base}/urunler/${p.slug}`, lastModified: p.updatedAt }));

  const posts = await prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
  const blogPages = posts.map(p => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt }));

  const demleme = await prisma.customPage.findMany({ where: { published: true, slug: { startsWith: "demleme" } }, select: { slug: true, updatedAt: true } });
  const demlemePages = demleme.map(p => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt }));

  return [...staticPages, ...productPages, ...blogPages, ...demlemePages];
}
