import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.customPage.findUnique({ where: { slug, published: true } });
  if (!page) notFound();

  if (page.template === "full") {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-6 py-16" dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    );
  }

  if (page.template === "landing") {
    return (
      <div className="min-h-screen" dangerouslySetInnerHTML={{ __html: page.content }} />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-amber-900 mb-8">{page.title}</h1>
      <div
        className="prose prose-amber prose-headings:text-amber-900 prose-a:text-[#C4724B] max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
