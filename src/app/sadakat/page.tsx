import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings, getTier } from "@/lib/loyalty";
import { redirect } from "next/navigation";

export default async function SadakatPage() {
  const session = await auth();
  const settings = await getSettings();

  let userLoyalty = null;
  let transactions = [];
  let tierInfo = { tier: "bronze", discountPct: 0, shippingThreshold: 990 };

  if (session?.user?.id) {
    const l = await prisma.userLoyalty.findUnique({ where: { userId: session.user.id } });
    if (l) {
      userLoyalty = l;
      tierInfo = getTier(l.totalSpent, settings);
      transactions = await prisma.loyaltyTransaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    } else {
      tierInfo = { tier: "bronze", discountPct: 0, shippingThreshold: 990 };
    }
  }

  const nextTier = tierInfo.tier === "bronze"
    ? { name: "Gümüş", needed: settings.silverMin - (userLoyalty?.totalSpent || 0) }
    : tierInfo.tier === "silver"
    ? { name: "Altın", needed: settings.goldMin - (userLoyalty?.totalSpent || 0) }
    : null;

  return (
    <div className="min-h-screen bg-[#f5f2ed]">
      {/* Hero */}
      <section className="relative bg-[#2c1810] py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C4724B]/10 via-transparent to-[#D4A574]/5" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Rostello</span>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">Sadakat Programı</h1>
          <p className="text-[#a39080] max-w-xl mx-auto">
            Her alışverişinde puan kazan, seviye atla, sana özel ayrıcalıklarla kahve keyfini katla.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-10">
        {userLoyalty ? (
          <>
            {/* Dashboard Card */}
            <div className="bg-white rounded-xl border border-amber-100 p-6 shadow-lg mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-amber-600 uppercase tracking-wide">Seviyen</p>
                  <p className={`text-2xl font-bold mt-1 capitalize ${
                    tierInfo.tier === "gold" ? "text-yellow-600" : tierInfo.tier === "silver" ? "text-gray-500" : "text-amber-700"
                  }`}>{tierInfo.tier}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-amber-600 uppercase tracking-wide">Puanın</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">{userLoyalty.points}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-amber-600 uppercase tracking-wide">Toplam Harcama</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">{userLoyalty.totalSpent.toLocaleString("tr-TR")} ₺</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-amber-600 uppercase tracking-wide">İndirim</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">%{tierInfo.discountPct}</p>
                </div>
              </div>

              {nextTier && (
                <div className="mt-4 pt-4 border-t border-amber-100">
                  <p className="text-sm text-amber-700">
                    {nextTier.name} seviyesine <strong>{nextTier.needed.toFixed(0)} ₺</strong> kaldı
                  </p>
                  <div className="w-full h-2 bg-amber-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#C4724B] rounded-full transition-all" style={{
                      width: `${
                        tierInfo.tier === "bronze"
                          ? Math.min((userLoyalty.totalSpent / settings.silverMin) * 100, 100)
                          : Math.min(((userLoyalty.totalSpent - settings.silverMin) / (settings.goldMin - settings.silverMin)) * 100, 100)
                      }%`
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Last Transactions */}
            <div className="bg-white rounded-xl border border-amber-100 p-6 shadow-lg mb-8">
              <h2 className="text-lg font-bold text-amber-900 mb-4">İşlem Geçmişi</h2>
              {transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-amber-50 text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${
                          tx.amount > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>{tx.amount > 0 ? "+" : ""}{tx.amount}</span>
                        <span className="text-gray-600 capitalize text-xs">{tx.type === "earn" ? "Kazanma" : tx.type === "redeem" ? "Kullanma" : tx.type === "welcome" ? "Hoş Geldin" : tx.type === "birthday" ? "Doğum Günü" : tx.type === "referral" ? "Referans" : tx.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString("tr-TR")}</span>
                        {tx.reference && <span className="text-xs text-gray-400 ml-2">#{tx.reference.slice(0, 8)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Henüz işlem yok. İlk alışverişini yap, puan kazanmaya başla!</p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* How It Works for Guests */}
            <div className="bg-white rounded-xl border border-amber-100 p-8 shadow-lg text-center mb-8">
              <span className="text-4xl">⭐</span>
              <h2 className="text-2xl font-bold text-amber-900 mt-4 mb-2">Kahve Severlere Özel</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">Her alışverişte puan kazan, seviye atla, ayrıcalıkları yakala. İlk adımda 500 puan hediye!</p>
              <Link href="/kayit" className="inline-block bg-[#C4724B] hover:bg-[#B0603A] text-white px-8 py-3 rounded-lg font-medium transition">
                Ücretsiz Katıl
              </Link>
            </div>
          </>
        )}

        {/* Tier Comparison */}
        <div className="bg-white rounded-xl border border-amber-100 p-8 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-amber-900 text-center mb-8">Seviye Avantajları</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { tier: "Bronz", color: "amber", range: `0 - ${settings.bronzeMax.toLocaleString("tr-TR")} ₺`, discount: "%0", ship: `${settings.bronzeShippingThreshold} ₺ üzeri`, puan: "×1 kazanç" },
              { tier: "Gümüş", color: "gray", range: `${settings.silverMin.toLocaleString("tr-TR")} - ${settings.silverMax.toLocaleString("tr-TR")} ₺`, discount: `%${settings.silverDiscountPct}`, ship: settings.silverShippingThreshold > 0 ? `${settings.silverShippingThreshold} ₺ üzeri` : "Bedava", puan: "×1.2 kazanç" },
              { tier: "Altın", color: "yellow", range: `${settings.goldMin.toLocaleString("tr-TR")} ₺+`, discount: `%${settings.goldDiscountPct}`, ship: settings.goldShippingThreshold === 0 ? "Bedava" : `${settings.goldShippingThreshold} ₺ üzeri`, puan: "×1.5 kazanç" },
            ].map((t) => (
              <div key={t.tier} className={`border border-${t.color}-100 rounded-xl p-6 text-center`}>
                <p className={`text-lg font-bold capitalize ${
                  t.tier === "Altın" ? "text-yellow-600" : t.tier === "Gümüş" ? "text-gray-500" : "text-amber-700"
                }`}>{t.tier}</p>
                <div className="space-y-2 mt-4 text-sm text-gray-600">
                  <p>Harcama: <strong>{t.range}</strong></p>
                  <p>İndirim: <strong className="text-green-700">{t.discount}</strong></p>
                  <p>Kargo: <strong>{t.ship}</strong></p>
                  <p>Puan: <strong>{t.puan}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { title: "Hoş Geldin Bonusu", desc: `Kaydolduğunda ${settings.welcomePoints} puan hediye. İlk siparişinde %${settings.welcomeDiscountPct} indirim.` },
            { title: "Doğum Günü Sürprizi", desc: `Doğum gününde ${settings.birthdayPoints} puan hediye.` },
            { title: "Arkadaşını Davet Et", desc: `Davet ettiğin her arkadaşına %${settings.referralFriendPct} indirim, sana ${settings.referralPoints} puan.` },
            { title: "Abonelik İndirimi", desc: `Abonelik paketlerinde %${settings.subscriptionDiscountPct} ekstra indirim.` },
          ].map((b) => (
            <div key={b.title} className="bg-white rounded-xl border border-amber-100 p-6 shadow-lg">
              <h3 className="font-bold text-amber-900 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-600">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!userLoyalty && (
          <div className="text-center mb-16">
            <p className="text-2xl font-bold text-amber-900 mb-4">Kahve keyfini katlamaya hazır mısın?</p>
            <Link href="/kayit"
              className="inline-flex items-center gap-2 text-white px-10 py-4 text-sm font-semibold tracking-wide uppercase transition-all duration-500 hover:brightness-110"
              style={{
                background: "linear-gradient(90deg, #C4724B, #E8C4A0, #C4724B)",
                backgroundSize: "200% auto",
                animation: "copper-shimmer 3s linear infinite",
              }}>
              Hemen Katıl, {settings.welcomePoints} Puan Kazan →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
