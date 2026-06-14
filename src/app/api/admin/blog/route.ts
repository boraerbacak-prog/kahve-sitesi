import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    include: { category: true, tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });
  const postsWithTags = posts.map(p => ({
    ...p,
    tags: p.tags.map(pt => pt.tag),
  }));
  return NextResponse.json({ posts: postsWithTags });
}

export async function POST(req: Request) {
  const { tags, categoryId, ...data } = await req.json();
  const post = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || "",
      content: data.content || "",
      imageUrl: data.imageUrl || null,
      author: data.author || "Rostello",
      published: data.published || false,
      categoryId: categoryId || null,
      tags: tags?.length ? {
        create: tags.map((tagId: string) => ({ tagId })),
      } : undefined,
    },
    include: { category: true, tags: { include: { tag: true } } },
  });
  return NextResponse.json({ success: true, post });
}

export async function PUT(req: Request) {
  const { tags, categoryId, ...data } = await req.json();
  await prisma.blogPostTag.deleteMany({ where: { postId: data.id } });
  const post = await prisma.blogPost.update({
    where: { id: data.id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      imageUrl: data.imageUrl,
      author: data.author,
      published: data.published,
      categoryId: categoryId || null,
      tags: tags?.length ? {
        create: tags.map((tagId: string) => ({ tagId })),
      } : undefined,
    },
    include: { category: true, tags: { include: { tag: true } } },
  });
  return NextResponse.json({ success: true, post });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
