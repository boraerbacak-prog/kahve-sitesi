import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SadakatPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "admin") redirect("/");

  const [memberCount, totalPoints, totalSpent, settings] = await Promise.all([
    prisma.userLoyalty.count(),
    prisma.userLoyalty.aggregate({ _sum: { points: true } }),
    prisma.userLoyalty.aggregate({ _sum: { totalSpent: true } }),
    prisma.loyaltySettings.findUnique({ where: { id: "global" } }),
  ]);

  const tierCounts = await Promise.all([
    prisma.userLoyalty.count({ where: { tier: "bronze" } }),
    prisma.userLoyalty.count({ where: { tier: "silver" } }),
    prisma.userLoyalty.count({ where: { tier: "gold" } }),
  ]);

  const latestTxns = await prisma.loyaltyTransaction.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { loyalty: { include: { user: { select: { name: true, email: true } } } } },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-amber-900">Sadakat Sistemi</h1>
        <Link href="/admin/sadakat/ayarlar" className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
          Ayarlar & Altın Oranı
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-amber-100 p-5">
          <p className="text-xs text-amber-600 uppercase tracking-wide">Toplam Üye</p>
          <p className="text-2xl font-bold text-amber-900">{memberCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-5">
          <p className="text-xs text-amber-600 uppercase tracking-wide">Toplam Puan</p>
          <p className="text-2xl font-bold text-amber-900">{(totalPoints._sum.points || 0).toLocaleString("tr-TR")}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-5">
          <p className="text-xs text-amber-600 uppercase tracking-wide">Toplam Harcama</p>
          <p className="text-2xl font-bold text-amber-900">{(totalSpent._sum.totalSpent || 0).toLocaleString("tr-TR")} ₺</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-5">
          <p className="text-xs text-amber-600 uppercase tracking-wide">Kur Puan/₺</p>
          <p className="text-2xl font-bold text-amber-900">{settings?.pointsToLira?.toFixed(4) || "0.0500"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { tier: "Bronz", count: tierCounts[0], color: "amber", pct: settings?.bronzeDiscountPct || 0, ship: settings?.bronzeShippingThreshold || 990 },
          { tier: "Gümüş", count: tierCounts[1], color: "gray", pct: settings?.silverDiscountPct || 3, ship: settings?.silverShippingThreshold || 500 },
          { tier: "Altın", count: tierCounts[2], color: "yellow", pct: settings?.goldDiscountPct || 5, ship: settings?.goldShippingThreshold || 0 },
        ].map((t) => (
          <div key={t.tier} className={`bg-white rounded-xl border border-${t.color}-100 p-5`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-amber-900">{t.tier}</h3>
              <span className="text-sm text-amber-600">{t.count} üye</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>İndirim: <strong>%{t.pct}</strong></p>
              <p>Kargo eşiği: <strong>{t.ship === 0 ? "Bedava" : `${t.ship} ₺`}</strong></p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-amber-100 p-6">
        <h2 className="text-lg font-bold text-amber-900 mb-4">Son İşlemler</h2>
        {latestTxns.length > 0 ? (
          <div className="space-y-2">
            {latestTxns.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-amber-50 last:border-0 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${
                    tx.amount > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>{tx.amount > 0 ? "+" : ""}{tx.amount}</span>
                  <span className="text-gray-800">{tx.loyalty.user.name || tx.loyalty.user.email}</span>
                  <span className="text-gray-400 text-xs capitalize">{tx.type}</span>
                </div>
                <span className="text-gray-400 text-xs">{new Date(tx.createdAt).toLocaleDateString("tr-TR")}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Henüz işlem yok</p>
        )}
      </div>
    </div>
  );
}
