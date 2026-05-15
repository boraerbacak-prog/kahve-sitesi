import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function deleteAction(id: string): Promise<void> {
  "use server";
  const session = await auth();
  if (!session?.user) return;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "admin") return;
  await prisma.stockNotification.delete({ where: { id } });
}

export default async function AdminStockNotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "admin") redirect("/");

  const notifications = await prisma.stockNotification.findMany({
    include: { product: { select: { id: true, name: true, slug: true, stock: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <h1 className="text-3xl font-bold text-amber-900 mb-2">Stok Bildirim Talepleri</h1>
      <p className="text-sm text-gray-500 mb-6">Toplam {notifications.length} talep</p>

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-amber-50 text-left">
              <th className="px-4 py-3 font-semibold text-amber-900">E-posta</th>
              <th className="px-4 py-3 font-semibold text-amber-900">Ürün</th>
              <th className="px-4 py-3 font-semibold text-amber-900">Stok Durumu</th>
              <th className="px-4 py-3 font-semibold text-amber-900">Bildirim</th>
              <th className="px-4 py-3 font-semibold text-amber-900">Tarih</th>
              <th className="px-4 py-3 font-semibold text-amber-900">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id} className="border-t border-amber-50 hover:bg-amber-50/50">
                <td className="px-4 py-3 text-gray-700">{n.email}</td>
                <td className="px-4 py-3">
                  <span className="text-gray-700">{n.product.name}</span>
                  <span className="text-xs text-gray-400 block">/{n.product.slug}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${n.product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {n.product.stock > 0 ? "Stokta" : "Tükendi"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${n.notified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {n.notified ? "Bildirildi" : "Bekliyor"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(n.createdAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-3">
                  <form action={async () => { "use server"; await deleteAction(n.id); }}>
                    <button className="text-xs text-red-500 hover:underline" onClick={async (e) => { if (!confirm("Emin misiniz?")) e.preventDefault(); }}>
                      Sil
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {notifications.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Henüz stok bildirim talebi yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
