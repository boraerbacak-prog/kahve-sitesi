import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import BildirimBell from "./BildirimBell";

const roleLabels: Record<string, string> = { admin: "Admin", editor: "Editör", customer: "Müşteri" };

const editorLinks: { label: string; href: string; desc: string }[] = [
  { label: "Kahveler", href: "/admin/urunler", desc: "Ekle, düzenle, sil" },
  { label: "Kavurma Takvimi", href: "/admin/kavrum-takvimi", desc: "Kavrum planı, evre takibi" },
  { label: "İmza Ürünler", href: "/admin/imza-urunler", desc: "Tişört, termos, aksesuar" },
  { label: "Ekipmanlar", href: "/admin/ekipmanlar", desc: "Tamper, kettle, ekipman" },
  { label: "Blog", href: "/admin/blog", desc: "Yazı ekle, düzenle" },
  { label: "Sayfalar", href: "/admin/sayfalar", desc: "Özel sayfalar" },
  { label: "Menüler", href: "/admin/menuler", desc: "Header/footer navigasyon" },
  { label: "Ana Sayfa", href: "/admin/homepage", desc: "Blokları düzenle" },
  { label: "Sohbetler", href: "/admin/mesajlar", desc: "İletişim & AI sohbetleri" },
  { label: "Barista Rapor", href: "/admin/barista-rapor", desc: "AI analizi" },
  { label: "Damak Testi", href: "/admin/damak-testi", desc: "Test sonuçları" },
  { label: "Film Şeridi", href: "/admin/film-reel", desc: "Ürün görsel şeridi" },
  { label: "Kurumsal", href: "/admin/b2b", desc: "B2B sayfa içeriği" },
  { label: "Atölyeler", href: "/admin/atolye", desc: "Workshop yönetimi" },
  { label: "Kavurumhane", href: "/admin/kavurumhane", desc: "Kavurumhane sayfası" },
  { label: "Stok Geçmişi", href: "/admin/stok-gecmisi", desc: "Stok & fiyat değişim kayıtları" },
  { label: "Yorumlar", href: "/admin/yorumlar", desc: "Ürün yorumlarını onayla" },
  { label: "Kategoriler", href: "/admin/kategoriler", desc: "Blog kategorileri & etiketler" },
];

const adminLinks: { label: string; href: string; desc: string }[] = [
  { label: "Siparişler", href: "/admin/siparisler", desc: "Görüntüle, yönet, Excel" },
  { label: "Kullanıcılar", href: "/admin/kullanicilar", desc: "Üyeleri yönet, oluştur" },
  { label: "Abonelikler", href: "/admin/abonelik", desc: "Tüm abonelikler" },
  { label: "E-Posta Aboneleri", href: "/admin/aboneler", desc: "Abone listesi" },
  { label: "Stok Bildirim", href: "/admin/stok-bildirim", desc: "Stok talep yönetimi" },
  { label: "Çekirdek Kredi", href: "/admin/sadakat", desc: "Puan yönetimi" },
  { label: "Cüzdan", href: "/admin/cuzdan", desc: "Yükleme talepleri, işlemler, CSV" },
  { label: "Kuponlar", href: "/admin/kupon", desc: "İndirim kuponları" },
  { label: "Tema", href: "/admin/tema", desc: "Renkler, yazılar" },
  { label: "Toplu E-Posta", href: "/admin/e-posta", desc: "Abonelere mail gönder" },
  { label: "İade", href: "/admin/iade", desc: "İade talepleri" },
  { label: "Şubeler", href: "/admin/subeler", desc: "Mağaza yönetimi" },
  { label: "Tedarikçiler", href: "/admin/tedarikciler", desc: "Tedarikçi yönetimi" },
  { label: "Tedarik Sip.", href: "/admin/tedarik-siparisleri", desc: "Toplu alım siparişleri" },
  { label: "Detaylı Rapor", href: "/admin/detayli-rapor", desc: "Ciro, ürün, stok, yorum, mesaj" },
  { label: "Koruma", href: "/admin/koruma", desc: "IP engelleme, güvenlik" },
];

function tl(n: number): string {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role === "customer") redirect("/");

  const isAdmin = user.role === "admin";
  const safeCount = async (fn: () => Promise<number>) => { try { return await fn(); } catch { return 0; } };

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const [
    productCount, signatureCount, equipmentCount, orderCount, userCount,
    subCount, activeSubCount, chatCount, pageCount, blockCount,
    subscriberCount, stockNotifCount, loyaltyCount,
    returnCount, storeCount, supplierCount, purchaseOrderCount, blockedIpsCount,
    todayOrders, todayRevenue, pendingOrders,
    pendingReviews, unreadMessages, lowStockProducts, topProducts,
  ] = await Promise.all([
    safeCount(() => prisma.product.count()),
    safeCount(() => prisma.signatureProduct.count()),
    safeCount(() => prisma.equipment.count()),
    safeCount(() => prisma.order.count()),
    safeCount(() => prisma.user.count()),
    safeCount(() => prisma.userSubscription.count()),
    safeCount(() => prisma.userSubscription.count({ where: { status: "active" } })),
    safeCount(() => prisma.chatThread.count()),
    safeCount(() => prisma.customPage.count()),
    safeCount(() => prisma.homepageBlock.count()),
    safeCount(() => prisma.subscriber.count()),
    safeCount(() => prisma.stockNotification.count()),
    safeCount(() => prisma.userLoyalty.count()),
    safeCount(() => prisma.returnRequest.count()),
    safeCount(() => prisma.store.count()),
    safeCount(() => prisma.supplier.count()),
    safeCount(() => prisma.purchaseOrder.count()),
    safeCount(() => prisma.blockedIp.count()),
    isAdmin ? prisma.order.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }) : 0,
    isAdmin ? prisma.order.aggregate({ where: { createdAt: { gte: todayStart, lte: todayEnd }, status: { not: "cancelled" } }, _sum: { total: true } }) : { _sum: { total: 0 } },
    isAdmin ? prisma.order.count({ where: { status: { in: ["pending", "confirmed"] } } }) : 0,
    safeCount(() => prisma.review.count({ where: { approved: false } })),
    safeCount(() => prisma.contactMessage.count({ where: { isRead: false } })),
    isAdmin ? prisma.product.findMany({ where: { stock: { lte: 5 } }, select: { name: true, slug: true, stock: true }, orderBy: { stock: "asc" }, take: 10 }) : [],
    isAdmin ? prisma.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }) : [],
  ] as const);

  const topProductNames = topProducts.length > 0
    ? await prisma.product.findMany({ where: { id: { in: topProducts.map(t => t.productId) } }, select: { id: true, name: true } })
    : [];

  const recentOrders = await prisma.order.findMany({
    take: 5, include: { user: true }, orderBy: { createdAt: "desc" },
  });

  const salesData = isAdmin ? await prisma.order.findMany({
    where: { status: { not: "cancelled" } },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  }) : [];

  const totalRevenue = salesData.reduce((s, o) => s + o.total, 0);
  const monthlyMap: Record<string, number> = {};
  for (const o of salesData) {
    const key = o.createdAt.toISOString().slice(0, 7);
    monthlyMap[key] = (monthlyMap[key] || 0) + o.total;
  }
  const monthlyChart = Object.entries(monthlyMap).slice(-12);
  const maxRev = Math.max(...monthlyChart.map(([, v]) => v), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">Admin Paneli</h1>
          <p className="text-sm text-amber-600 mt-1">{session.user.name} · {roleLabels[user.role] || user.role}</p>
        </div>
        <div className="flex items-center gap-2">
          <BildirimBell />
          <LogoutButton />
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-4">
            <p className="text-xs text-green-700 uppercase tracking-wide font-medium">Bugünkü Ciro</p>
            <p className="text-2xl font-bold text-green-800">{tl((todayRevenue as any)._sum?.total || 0)}₺</p>
            <p className="text-xs text-green-600 mt-0.5">{todayOrders} sipariş</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-4">
            <p className="text-xs text-amber-700 uppercase tracking-wide font-medium">Bekleyen Sipariş</p>
            <p className="text-2xl font-bold text-amber-800">{pendingOrders}</p>
            <Link href="/admin/siparisler?filter=pending" className="text-xs text-amber-600 hover:underline mt-0.5 block">İşleme Al →</Link>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-4">
            <p className="text-xs text-red-700 uppercase tracking-wide font-medium">Azalan Stok</p>
            <p className="text-2xl font-bold text-red-800">{lowStockProducts.length}</p>
            <p className="text-xs text-red-600 mt-0.5">5 ve altı</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-700 uppercase tracking-wide font-medium">Onay Bekleyen</p>
            <p className="text-2xl font-bold text-blue-800">{pendingReviews}</p>
            <Link href="/admin/yorumlar" className="text-xs text-blue-600 hover:underline mt-0.5 block">Yorumlar →</Link>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-4">
            <p className="text-xs text-purple-700 uppercase tracking-wide font-medium">Okunmamış Mesaj</p>
            <p className="text-2xl font-bold text-purple-800">{unreadMessages}</p>
            <Link href="/admin/mesajlar" className="text-xs text-purple-600 hover:underline mt-0.5 block">Mesajlar →</Link>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 p-4">
            <p className="text-xs text-indigo-700 uppercase tracking-wide font-medium">Aylık Ciro</p>
            <p className="text-2xl font-bold text-indigo-800">{tl(totalRevenue)}₺</p>
            <p className="text-xs text-indigo-600 mt-0.5">{orderCount} sipariş</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
        {[
          { label: "Kahveler", count: productCount, href: "/admin/urunler", color: "amber" },
          { label: "İmza", count: signatureCount, href: "/admin/imza-urunler", color: "amber" },
          { label: "Ekipman", count: equipmentCount, href: "/admin/ekipmanlar", color: "amber" },
          ...(isAdmin ? [{ label: "Siparişler", count: orderCount, href: "/admin/siparisler", color: "blue" }] : []),
          ...(isAdmin ? [{ label: "Kullanıcılar", count: userCount, href: "/admin/kullanicilar", color: "green" }] : []),
          ...(isAdmin ? [{ label: "Abonelik", count: subCount, sub: `${activeSubCount} aktif`, href: "/admin/abonelik", color: "purple" }] : []),
          { label: "Sohbetler", count: chatCount, href: "/admin/mesajlar", color: "pink" },
          { label: "Sayfalar", count: pageCount, href: "/admin/sayfalar", color: "indigo" },
          { label: "Barista Rapor", count: "📊", href: "/admin/barista-rapor", color: "orange" },
          { label: "Ana Sayfa", count: blockCount, href: "/admin/homepage", color: "teal" },
          ...(isAdmin ? [{ label: "E-Posta Aboneleri", count: subscriberCount, href: "/admin/aboneler", color: "rose" }] : []),
          ...(isAdmin ? [{ label: "Stok Bildirim", count: stockNotifCount, href: "/admin/stok-bildirim", color: "red" }] : []),
          ...(isAdmin ? [{ label: "Çekirdek Kredi", count: loyaltyCount, href: "/admin/sadakat", color: "yellow" }] : []),
          { label: "Film Şeridi", count: "🎞️", href: "/admin/film-reel", color: "indigo" },
          { label: "Kurumsal", count: "🏢", href: "/admin/b2b", color: "purple" },
          { label: "Atölyeler", count: "🔧", href: "/admin/atolye", color: "teal" },
          { label: "Kavurumhane", count: "🏭", href: "/admin/kavurumhane", color: "orange" },
          ...(isAdmin ? [{ label: "İade", count: returnCount, href: "/admin/iade", color: "red" }] : []),
          ...(isAdmin ? [{ label: "Şubeler", count: storeCount, href: "/admin/subeler", color: "teal" }] : []),
          ...(isAdmin ? [{ label: "Tedarikçi", count: supplierCount, href: "/admin/tedarikciler", color: "blue" }] : []),
          ...(isAdmin ? [{ label: "Tedarik Sip.", count: purchaseOrderCount, href: "/admin/tedarik-siparisleri", color: "purple" }] : []),
          ...(isAdmin ? [{ label: "Detaylı Rapor", count: "📊", href: "/admin/detayli-rapor", color: "indigo" }] : []),
          ...(isAdmin ? [{ label: "Koruma", count: blockedIpsCount, href: "/admin/koruma", color: "red" }] : []),
        ].map((s) => (
          <Link key={s.href} href={s.href} className="bg-white rounded-xl border border-amber-100 p-5 hover:shadow-md transition">
            <p className="text-xs text-amber-600 uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold text-amber-900">{s.count}</p>
            {"sub" in s && <p className="text-xs text-amber-500 mt-0.5">{s.sub}</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* İçerik Yönetimi */}
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">İçerik Yönetimi</h2>
          <div className="grid grid-cols-2 gap-3">
            {editorLinks.map((item) => (
              <Link key={item.href} href={item.href} className="border border-amber-100 p-4 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition">
                <p className="font-semibold text-amber-900 text-sm">{item.label}</p>
                <p className="text-xs text-amber-600 mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Yönetim */}
        {isAdmin && (
          <div className="bg-white rounded-xl border border-amber-100 p-6">
            <h2 className="text-lg font-bold text-amber-900 mb-4">Yönetim</h2>
            <div className="grid grid-cols-2 gap-3">
              {adminLinks.map((item) => (
                <Link key={item.href} href={item.href} className="border border-amber-100 p-4 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition">
                  <p className="font-semibold text-amber-900 text-sm">{item.label}</p>
                  <p className="text-xs text-amber-600 mt-0.5">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Azalan Stok Alert */}
        {isAdmin && lowStockProducts.length > 0 && (
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <h2 className="text-lg font-bold text-red-800 mb-4">⚠️ Azalan Stoklar</h2>
            <div className="space-y-2">
              {lowStockProducts.map((p: any) => (
                <div key={p.slug} className="flex items-center justify-between text-sm">
                  <Link href={`/admin/urunler`} className="text-gray-700 hover:text-amber-600">{p.name}</Link>
                  <span className={`font-mono font-semibold ${p.stock === 0 ? "text-red-600" : "text-amber-700"}`}>
                    {p.stock} {p.stock === 0 ? "(tükendi)" : "stok"}
                  </span>
                </div>
              ))}
              <Link href="/admin/urunler" className="text-xs text-amber-600 hover:underline block mt-3">Tüm Ürünler →</Link>
            </div>
          </div>
        )}
      </div>

      {/* Satış Grafiği */}
      {isAdmin && monthlyChart.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">Aylık Satış Grafiği (Toplam: {tl(totalRevenue)}₺)</h2>
          <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2">
            {monthlyChart.map(([month, rev]) => (
              <div key={month} className="flex flex-col items-center gap-1 min-w-[40px]">
                <span className="text-[10px] text-gray-500 font-medium">{Math.round(rev / 1000)}b</span>
                <div className="w-8 bg-amber-500 rounded-t transition-all hover:bg-amber-600" style={{ height: `${(rev / maxRev) * 120}px` }} />
                <span className="text-[10px] text-gray-400">{month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* En Çok Satanlar + Son Siparişler */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {topProducts.length > 0 && (
            <div className="bg-white rounded-xl border border-amber-100 p-6">
              <h2 className="text-lg font-bold text-amber-900 mb-4">🔥 En Çok Satanlar</h2>
              <div className="space-y-3">
                {topProducts.map((item, i) => {
                  const product = topProductNames.find((p: any) => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex items-center justify-between py-2 border-b border-amber-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-amber-100 text-amber-700" : "bg-amber-50 text-amber-600"}`}>
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700">{product?.name || "—"}</span>
                      </div>
                      <span className="text-xs font-semibold text-amber-700">{item._sum.quantity} adet</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                      <p className="text-xs text-gray-500">{tl(o.total)}₺ · {new Date(o.createdAt).toLocaleDateString("tr-TR")}</p>
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
      )}
    </div>
  );
}
