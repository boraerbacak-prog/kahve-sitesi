import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "admin") redirect("/");

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-amber-900">Ürün Yönetimi</h1>
        <Link
          href="/admin/urunler/yeni"
          className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-500 transition"
        >
          Yeni Ürün
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-amber-50">
            <tr>
              <th className="text-left p-4 text-amber-800 font-medium">Ürün</th>
              <th className="text-left p-4 text-amber-800 font-medium">Kategori</th>
              <th className="text-left p-4 text-amber-800 font-medium">Fiyat</th>
              <th className="text-left p-4 text-amber-800 font-medium">Stok</th>
              <th className="text-left p-4 text-amber-800 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: { id: string; name: string; category: { name: string }; price: number; stock: number; published: boolean }) => (
              <tr key={p.id} className="border-t border-amber-100">
                <td className="p-4">
                  <Link href={`/admin/urunler/${p.id}`} className="text-amber-900 font-medium hover:text-amber-700">
                    {p.name}
                  </Link>
                </td>
                <td className="p-4 text-amber-700">{p.category.name}</td>
                <td className="p-4 text-amber-900">{p.price.toFixed(2)} ₺</td>
                <td className="p-4 text-amber-700">{p.stock}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.published ? "Yayında" : "Taslak"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
