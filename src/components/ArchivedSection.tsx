import { prisma } from "@/lib/prisma";

export default async function ArchivedSection() {
  const products = await prisma.product.findMany({
    where: {
      published: true,
      OR: [
        { status: "archived" },
        { stock: 0, status: { not: "coming_soon" } },
      ],
    },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });

  if (products.length === 0) return null;

  return (
    <section className="relative py-16 sm:py-20 border-t border-border/50 bg-page">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="eyebrow">Arşiv</span>
          <h2 className="text-xl sm:text-2xl font-bold text-heading mt-3 mb-3">
            Sezonu <span className="text-primary">Tamamlananlar</span>
          </h2>
          <p className="text-sm text-body/70 leading-relaxed">
            Nitelikli kahve tarımsal bir üründür. Her hasat mevsimi tazelenir, yenilenir.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {products.map((p) => (
            <div key={p.id}
              className="flex items-center gap-4 px-5 py-4 bg-white border border-border/50 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-lg text-muted/40">⛔</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-heading">{p.name}</p>
                <p className="text-[11px] text-muted/60">{p.origin || p.category?.name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-muted/50 font-semibold">Tükendi</span>
                {p.updatedAt && (
                  <p className="text-[10px] text-muted/40 mt-0.5">
                    {p.updatedAt.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted/50 italic mt-6 max-w-lg mx-auto leading-relaxed">
          Bir kahvenin hikayesi hasatla başlar, bir fincanla bitmez. Yeni sezonda yeniden kavuşmak dileğiyle.
        </p>
      </div>
    </section>
  );
}
