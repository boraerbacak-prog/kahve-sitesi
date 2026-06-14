import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTransactionHistory, ensureUserLoyalty, getSettings } from "@/lib/loyalty";

const style = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
`;

export default async function SadakatPage() {
  const session = await auth();

  let userLoyalty: Record<string, any> | null = null;
  let transactions: any[] = [];
  let monthlyEarnedKurus = 0;
  let referralCode: string | null = null;
  let referralTotal = 0;
  let referralPending = 0;
  const settings = await getSettings();
  const capKurus = settings.monthlyCapKurus || 150000;
  const MONTHLY_CAP_TL = capKurus / 100;

  if (session?.user?.id) {
    try {
      const l = await ensureUserLoyalty(session.user.id);
      userLoyalty = l;
      transactions = await getTransactionHistory(session.user.id, 50);
      const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { referralCode: true } });
      referralCode = user?.referralCode || null;
      referralTotal = await prisma.referral.count({ where: { referrerId: session.user.id } });
      referralPending = await prisma.referral.count({ where: { referrerId: session.user.id, status: "pending" } });
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const monthlyTxns = await prisma.loyaltyTransaction.findMany({
        where: { userId: session.user.id, type: "earn", status: { in: ["pending", "available"] }, createdAt: { gte: thirtyDaysAgo } },
        select: { amount: true },
      });
      monthlyEarnedKurus = monthlyTxns.reduce((s, t) => s + t.amount, 0);
    } catch (e) {
      console.error("Çekirdek Kredi sayfası yüklenirken hata:", e);
    }
  }

  const availableTL = (userLoyalty?.points || 0) / 100;
  const pendingTL = (userLoyalty?.pendingPoints || 0) / 100;
  const monthlyPct = Math.min(100, Math.round((monthlyEarnedKurus / capKurus) * 100));
  const barColor = monthlyEarnedKurus >= capKurus * 0.8 ? "bg-red-500"
    : monthlyEarnedKurus >= capKurus * 0.5 ? "bg-amber-500" : "bg-primary";

  const typeLabel: Record<string, string> = {
    earn: "Kazanılan", redeem: "Kullanma",
    referral: "Referans", admin: "Admin",
  };

  return (
    <div className="min-h-screen bg-page">
      <style>{style}</style>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-800 via-amber-700 to-amber-800 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-amber-900/30" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(255,255,255,0.04) 0%, transparent 50%)`,
        }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-5 backdrop-blur-sm animate-fade-in-up">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mt-3 mb-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>Çekirdek Kredi</h1>
          <p className="text-[#a39080] max-w-xl mx-auto text-lg animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            Her kahve alışverişinde %5 kazan, biriktir, sonraki alışverişlerinde kullan.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 -mt-10">
        {userLoyalty ? (
          <>
            {/* Dashboard */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-lg mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center py-3">
                  <p className="text-xs text-muted uppercase tracking-wide">Kullanılabilir</p>
                  <p className="text-3xl font-bold text-heading mt-1">{availableTL.toFixed(2)} <span className="text-lg font-medium text-muted">TL</span></p>
                </div>
                <div className="text-center py-3">
                  <p className="text-xs text-muted uppercase tracking-wide">Bekleyen</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">{pendingTL.toFixed(2)} <span className="text-lg font-medium text-amber-400">TL</span></p>
                </div>
                <div className="text-center py-3">
                  <p className="text-xs text-muted uppercase tracking-wide">Toplam Harcama</p>
                  <p className="text-3xl font-bold text-heading mt-1">{userLoyalty.totalSpent.toLocaleString("tr-TR")} <span className="text-lg font-medium text-muted">TL</span></p>
                </div>
                <div className="text-center py-3">
                  <p className="text-xs text-muted uppercase tracking-wide">Kazanım Oranı</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-3xl font-bold text-primary">%5</span>
                    <span className="text-xs text-muted">her kahvede</span>
                  </div>
                </div>
              </div>

              {/* Monthly progress + Referral */}
              <div className="mt-5 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-page-hover rounded-lg p-4">
                  <p className="text-xs font-medium text-muted mb-2">Aylık Kazanım</p>
                  <div className="flex justify-between text-xs text-muted mb-1.5">
                    <span className="font-semibold text-heading">{(monthlyEarnedKurus / 100).toFixed(2)} TL</span>
                    <span>{MONTHLY_CAP_TL.toLocaleString("tr-TR")} TL &middot; %{monthlyPct || 0}</span>
                  </div>
                  <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${monthlyPct}%` }} />
                  </div>
                </div>

                {referralCode && (
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <p className="text-xs font-medium text-muted mb-2">Arkadaşını Getir</p>
                    <p className="text-xs text-body mb-2">Her arkadaşına 100 TL kredi, arkadaşına %10 indirim</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-bold text-primary bg-white px-3 py-1.5 rounded border border-primary/20 select-all">{referralCode}</code>
                      <span className="text-xs text-muted">{referralTotal} davet</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-lg mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-lg font-bold text-heading mb-4">Kredi Geçmişi</h2>
              {transactions.length > 0 ? (
                <div className="space-y-1">
                  {transactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-page-hover transition -mx-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          tx.amount > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {tx.amount > 0 ? "+" : "-"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-heading">
                            {typeLabel[tx.type] || tx.type}
                            {tx.status === "pending" && <span className="text-amber-500 text-xs ml-1.5 font-normal">(bekliyor)</span>}
                            {tx.status === "refunded" && <span className="text-red-500 text-xs ml-1.5 font-normal">(iade)</span>}
                          </p>
                          <p className="text-xs text-muted">{new Date(tx.createdAt).toLocaleDateString("tr-TR")}{tx.reference ? ` · #${tx.reference.slice(0, 8)}` : ""}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold font-mono ${tx.amount > 0 ? "text-green-700" : "text-red-700"}`}>
                        {tx.amount > 0 ? "+" : ""}{(tx.amount / 100).toFixed(2)} TL
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-page-hover rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted">Henüz işlem yok</p>
                  <p className="text-xs text-muted mt-1">İlk kahve alışverişini yap, Çekirdek Kredi kazanmaya başla!</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* CTA for non-logged-in */}
            <div className="bg-white border border-border rounded-xl p-8 shadow-lg text-center mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-heading mb-2">Kahve Severlere Özel</h2>
              <p className="text-body max-w-md mx-auto mb-6">
                Her kahve alışverişinde %5 Çekirdek Kredi kazan, biriktir, sonraki alışverişlerinde kullan.
              </p>
              <Link href="/kayit"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-primary-hover transition">
                Hesap Oluştur
              </Link>
            </div>
          </>
        )}

        {/* How it works */}
        <div className="bg-white border border-border rounded-xl p-8 shadow-lg mb-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-xl font-bold text-heading text-center mb-8">Çekirdek Kredi Nasıl Çalışır?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { num: "1", title: "Kahve Al, %5 Kazan", desc: "Her kahve alışverişinde ödediğin net tutarın %5'i otomatik olarak hesabına eklenir. Kredin teslimat onayıyla anında kullanıma hazır." },
              { num: "2", title: "Arkadaşını Getir", desc: "Davet ettiğin arkadaşın ilk alışverişinde 100 TL kredi kazan. Arkadaşına da %10 indirim." },
              { num: "3", title: "Çarpan Kampanyaları", desc: "Belirli dönemlerde seçili ürünlerde kazanma oranı %10'a (x2) kadar çıkarılabilir." },
            ].map((item) => (
              <div key={item.num} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">{item.num}</span>
                </div>
                <h3 className="font-semibold text-heading mb-2">{item.title}</h3>
                <p className="text-sm text-body leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <details className="bg-white border border-border rounded-xl shadow-lg mb-16 group animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <summary className="p-6 cursor-pointer list-none flex items-center justify-between">
            <h2 className="text-lg font-bold text-heading">Kullanım Şartları</h2>
            <svg className="w-5 h-5 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-6 pb-6 max-w-2xl mx-auto space-y-4 text-sm text-body">
            {[
              "Her kahve alışverişinde ödediğin net tutarın %5'i Çekirdek Kredi olarak hesabına eklenir. Çekirdek Kredi programı dışı (loyaltyExcluded) olarak işaretlenen ürünlerden, ekipmanlardan, imza ürünlerden ve abonelik ödemelerinden kredi kazanılmaz. İndirimli ürünlerde kredi; tüm indirimler, kuponlar ve kredi kullanımı düşüldükten sonra kalan net ödeme tutarı üzerinden hesaplanır.",
              "Kazanılan krediler yalnızca kahve ürünü alışverişlerinde kullanılabilir. Nakde çevrilemez, başka hesaba devredilemez.",
              "Bir siparişte en fazla, o siparişteki kahve ürünlerinin toplam tutarı kadar kredi kullanılabilir.",
              "Kazanılan krediler, sipariş sistemi üzerinde teslimat onaylandığı an anında kullanılabilir hale gelir. 14 günlük yasal süreç bilgilendirme amaçlıdır, kullanımda süre kısıtlaması yoktur.",
              "İptal, İade ve Eksi Bakiye Durumu: Siparişin iptal veya iade edilmesi durumunda, o siparişten kazanılan krediler hesaptan geri alınır. Eğer müşteri bu krediyi sonraki bir siparişte harcamışsa ve hesap bakiyesi yetersizse, üyelik hesabı eksi bakiyeye düşürülür. Hesap eksi bakiyedeyken yeni kredi kullanımı bloke edilir; yapılan ilk alışverişlerden kazanılan krediler önce bu eksi bakiyeyi kapatır.",
              "Kredi kullanılarak alınan bir ürün iade edilirse, harcanan kredi miktarı müşterinin üyelik hesabına iade edilir.",
              "Mahsup Hakkı: Kredilerini harcadıktan sonra ilk siparişini iade eden kullanıcılar için Rostello, harcanan kredi tutarının TL karşılığını, ödeme sağlayıcısı (İyzico/Havale) üzerinden yapılacak olan nakit para iadesi tutarından manuel olarak kesme (mahsup etme) hakkını saklı tutar.",
              "Kısmi iade durumlarında, iade sonrasında kalan sipariş tutarı bedava kargo eşiğinin altına düşerse, güncel kargo bedeli kesintisi yapılarak kalan tutar iade edilir. Tam iade süreçlerinde bu kural uygulanmaz.",
              "Arkadaşını Getir: Davet kodunla kaydolup ilk alışverişini yapan arkadaşına %10 indirim, sana 100 TL Çekirdek Kredi kazandırır. Kredi, arkadaşının siparişinin yasal iade süresi (14 gün) dolduktan sonra hesabına eklenir.",
              "Çarpan Kampanyaları: Belirli dönemlerde seçili ürünlerde kazanma oranı %10'a (x2) veya daha fazlasına çıkarılabilir. Değişiklikler kampanya sayfasında ve e-posta ile duyurulur. Kampanya kodları ve kredi birlikte kullanılabilir. Kısıtlama varsa kampanya sayfasında belirtilir.",
              "Aylık Kazanım Sınırı (Cap): Bir üyenin tek bir siparişte veya aynı ay içerisinde kazanabileceği maksimum Çekirdek Kredi tutarı 1.500 TL (150.000 kuruş) ile sınırlandırılmıştır. Bu sınırı aşan işlemler sistem tarafından otomatik olarak durdurulur. Rostello Çekirdek Kredi programı yalnızca bireysel tüketicilere özeldir. Ticari amaçlı toplu alımlar, kafe/restoran işletmeleri tarafından yapılan tedarik alışverişleri bu sistemden kredi kazanamaz.",
              "Çekirdek Kredi'nin son kullanma tarihi yoktur. Hesap silindiğinde veya suistimal (sahte hesap açarak puan toplama vb.) tespit edildiğinde Rostello, birikmiş kredileri silme ve hesabı kapatma yetkisine sahiptir.",
              "Tüm kredi hareketleri en yakın kuruşa yuvarlanarak geçmiş sayfasında listelenir.",
            ].map((text, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-primary font-bold shrink-0 mt-0.5">{i + 1}.</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </details>

        {!userLoyalty && (
          <div className="text-center mb-16">
            <p className="text-xl font-bold text-heading mb-4">Kahve keyfini katlamaya hazır mısın?</p>
            <Link href="/kayit"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-primary-hover transition">
              Hesap Oluştur
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
