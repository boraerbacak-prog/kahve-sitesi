import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "admin") redirect("/");

  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const userCount = await prisma.user.count();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">Admin Paneli</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <p className="text-sm text-amber-600">Ürünler</p>
          <p className="text-3xl font-bold text-amber-900">{productCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <p className="text-sm text-amber-600">Siparişler</p>
          <p className="text-3xl font-bold text-amber-900">{orderCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <p className="text-sm text-amber-600">Kullanıcılar</p>
          <p className="text-3xl font-bold text-amber-900">{userCount}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/admin/urunler" className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-500 transition">
          Ürünleri Yönet
        </Link>
        <Link href="/admin/siparisler" className="bg-amber-100 text-amber-800 px-6 py-3 rounded-lg hover:bg-amber-200 transition">
          Siparişler
        </Link>
      </div>
    </div>
  );
}
