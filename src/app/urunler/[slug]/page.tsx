import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AddToCartButton from "./AddToCartButton";

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, reviews: { include: { user: true } } },
  });

  if (!product || !product.published) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center">
          <span className="text-8xl">☕</span>
        </div>

        <div>
          <span className="text-sm text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
            {product.category.name}
          </span>
          <h1 className="text-3xl font-bold text-amber-900 mt-4">{product.name}</h1>
          <p className="text-2xl font-bold text-amber-900 mt-4">{product.price.toFixed(2)} ₺</p>

          {product.origin && (
            <p className="text-amber-700 mt-2">🌍 Menşe: {product.origin}</p>
          )}
          {product.roastLevel && (
            <p className="text-amber-700">🔥 Kavrum: {product.roastLevel === "light" ? "Hafif" : product.roastLevel === "medium" ? "Orta" : "Koyu"}</p>
          )}
          {product.weight && <p className="text-amber-700">⚖️ {product.weight}g</p>}

          <p className="text-amber-700 mt-4 leading-relaxed">{product.description}</p>

          <AddToCartButton productId={product.id} />

          {product.reviews.length > 0 && (
            <div className="mt-8 border-t border-amber-100 pt-6">
              <h3 className="font-semibold text-amber-900 mb-4">Değerlendirmeler</h3>
              {product.reviews.map((review) => (
                <div key={review.id} className="mb-3">
                  <p className="text-sm text-amber-600">{review.user.name || "İsimsiz"}</p>
                  <p className="text-amber-800">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                  {review.comment && <p className="text-amber-700 text-sm">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
