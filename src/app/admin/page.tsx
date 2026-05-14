import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "admin") redirect("/");

  const [productCount, orderCount, userCount, subCount, activeSubCount, chatCount, pageCount, blockCount, subscriberCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.userSubscription.count(),
    prisma.userSubscription.count({ where: { status: "active" } }),
    prisma.chatThread.count(),
    prisma.customPage.count(),
    prisma.homepageBlock.count(),
    prisma.subscriber.count(),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5, include: { user: true }, orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-amber-900">Admin Paneli</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-amber-600">{session.user.name} · {new Date().toLocaleDateString("tr-TR")}</p>
          <LogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
        {[
          { label: "Ürünler", count: productCount, href: "/admin/urunler", color: "amber" },
          { label: "Siparişler", count: orderCount, href: "/admin/siparisler", color: "blue" },
          { label: "Kullanıcılar", count: userCount, href: "/admin/kullanicilar", color: "green" },
          { label: "Abonelik", count: subCount, sub: `${activeSubCount} aktif`, href: "/admin/abonelik", color: "purple" },
          { label: "Sohbetler", count: chatCount, href: "/admin/mesajlar", color: "pink" },
          { label: "Sayfalar", count: pageCount, href: "/admin/sayfalar", color: "indigo" },
          { label: "Barista Rapor", count: "📊", href: "/admin/barista-rapor", color: "orange" },
          { label: "Ana Sayfa", count: blockCount, href: "/admin/homepage", color: "teal" },
          { label: "E-Posta Aboneleri", count: subscriberCount, href: "/admin/aboneler", color: "rose" },
        ].map((s) => (
          <Link key={s.href} href={s.href} className={`bg-white rounded-xl border border-${s.color}-100 p-5 hover:shadow-md transition`}>
            <p className={`text-xs text-${s.color}-600 uppercase tracking-wide`}>{s.label}</p>
            <p className={`text-2xl font-bold text-${s.color}-900`}>{s.count}</p>
            {"sub" in s && <p className={`text-xs text-${s.color}-500 mt-0.5`}>{s.sub}</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">Yönetim</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Ürünler", href: "/admin/urunler", desc: "Ekle, düzenle, sil" },
              { label: "Siparişler", href: "/admin/siparisler", desc: "Görüntüle, yönet" },
              { label: "Abonelikler", href: "/admin/abonelik", desc: "Tüm abonelikler" },
              { label: "Kullanıcılar", href: "/admin/kullanicilar", desc: "Üyeleri yönet" },
              { label: "E-Posta Aboneleri", href: "/admin/aboneler", desc: `${subscriberCount} abone` },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="border border-amber-100 p-4 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition">
                <p className="font-semibold text-amber-900 text-sm">{item.label}</p>
                <p className="text-xs text-amber-600 mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">Site Yapısı</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Menüler", href: "/admin/menuler", desc: "Navigasyon düzenle" },
              { label: "Sayfalar", href: "/admin/sayfalar", desc: "Özel sayfalar" },
              { label: "Tema", href: "/admin/tema", desc: "Renkler, yazılar" },
              { label: "Ana Sayfa", href: "/admin/homepage", desc: "Blokları düzenle" },
              { label: "Barista Rapor", href: "/admin/barista-rapor", desc: "AI analizi" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="border border-amber-100 p-4 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition">
                <p className="font-semibold text-amber-900 text-sm">{item.label}</p>
                <p className="text-xs text-amber-600 mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-900">Son Siparişler</h2>
          <Link href="/admin/siparisler" className="text-sm text-amber-600 hover:underline">Tümü →</Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-amber-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{o.user.name || "İsimsiz"}</p>
                  <p className="text-xs text-gray-500">{o.total.toLocaleString("tr-TR")}₺ · {new Date(o.createdAt).toLocaleDateString("tr-TR")}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  o.status === "delivered" ? "bg-green-100 text-green-700" :
                  o.status === "shipped" ? "bg-blue-100 text-blue-700" :
                  o.status === "confirmed" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-600"
                }`}>{o.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Henüz sipariş yok</p>
        )}
      </div>
    </div>
  );
}
