"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

const FREQ_MAP: Record<string, string> = {
  "7": "weekly",
  "14": "biweekly",
  "21": "monthly",
};

const BREW_LABELS: Record<string, string> = {
  filtre: "Filtre",
  espresso: "Espresso",
  turk: "Türk Kahvesi",
  karma: "Karma",
};

const FLAVOR_LABELS: Record<string, string> = {
  meyvemsi: "Meyvemsi",
  dengeli: "Dengeli",
  cikolata: "Çikolata",
};

const ROAST_LABELS: Record<string, string> = {
  acik: "Zarif",
  orta: "İdeal",
  koyu: "Karakterli",
};

const FREQ_LABELS: Record<string, string> = {
  "7": "Haftada Bir (7 gün)",
  "14": "2 Haftada Bir (14 gün)",
  "21": "3 Haftada Bir (21 gün)",
};

function ProfileContent() {
  const { data: session } = useSession();
  const params = useSearchParams();
  const cups = params.get("cups") || "2";
  const brew = params.get("brew") || "filtre";
  const flavor = params.get("flavor") || "dengeli";
  const roast = params.get("roast") || "orta";
  const freq = params.get("freq") || "14";
  const planId = params.get("plan");
  const kf = params.get("kf");
  const ke = params.get("ke");
  const kt = params.get("kt");
  const isKarma = brew === "karma";
  const karmaFiltre = kf || "0";
  const karmaEspresso = ke || "0";
  const karmaTurk = kt || "0";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const createSubscription = async () => {
    if (!planId) {
      setError("Plan bilgisi eksik. Lütfen abonelik sayfasından tekrar deneyin.");
      return false;
    }
    const res = await fetch("/api/abonelik/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        flavorProfile: flavor,
        roastPreference: roast,
        deliveryFrequency: FREQ_MAP[freq] || "biweekly",
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Abonelik oluşturulamadı");
      return false;
    }
    return true;
  };

  const handleRegisterAndSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const kayitRes = await fetch("/api/auth/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!kayitRes.ok) {
        const data = await kayitRes.json();
        setError(data.error || "Kayıt başarısız");
        setLoading(false);
        return;
      }

      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!loginRes?.ok) {
        setError("Giriş yapılamadı. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }

      const ok = await createSubscription();
      if (!ok) { setLoading(false); return; }

      setSuccess(true);
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  };

  const handleSubscribe = async () => {
    setError("");
    setLoading(true);
    const ok = await createSubscription();
    if (!ok) { setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-heading mb-3">Planınız Başlatıldı</h1>
          <p className="text-sm text-body/70 mb-6">Aboneliğiniz oluşturuldu. Hesabınızdan yönetebilirsiniz.</p>
          <Link href="/hesabim" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 text-sm font-semibold tracking-wide uppercase transition">Hesabıma Git →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <section className="py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs tracking-[0.2em] uppercase text-primary font-semibold">Planını Tamamla</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-heading mt-3 mb-3">Planını Tamamla</h1>
            <p className="text-sm text-body/70">Seçimlerine göre kişisel kahve planın hazır.</p>
          </div>

          {!planId && (
            <div className="bg-red-50 border border-red-200 p-6 text-center mb-8">
              <p className="text-sm text-red-700">Plan bilgisi eksik. Lütfen abonelik sayfasından seçim yapıp tekrar deneyin.</p>
              <Link href="/abonelik" className="text-sm text-primary hover:underline mt-2 inline-block">Abonelik Sayfasına Git →</Link>
            </div>
          )}

          <div className="bg-card border border-border p-6 sm:p-8 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold mb-4">Plan Özeti</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted">Günlük Fincan</span>
                <span className="text-sm font-semibold text-heading">{cups} fincan</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted">Demleme Yöntemi</span>
                <span className="text-sm font-semibold text-heading">{isKarma ? `Karma (F:${karmaFiltre} E:${karmaEspresso} T:${karmaTurk})` : BREW_LABELS[brew] || brew}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted">Lezzet Profili</span>
                <span className="text-sm font-semibold text-heading">{FLAVOR_LABELS[flavor] || flavor}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted">Kavrum Tercihi</span>
                <span className="text-sm font-semibold text-heading">{ROAST_LABELS[roast] || roast}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-muted">Teslimat Sıklığı</span>
                <span className="text-sm font-semibold text-heading">{FREQ_LABELS[freq] || `${freq} günde bir`}</span>
              </div>
            </div>
          </div>

          {session?.user ? (
            <div className="bg-card border border-border p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold mb-4">Aboneliğini Başlat</div>
              <p className="text-sm text-body/70 mb-4">
                Hesabınla ({session.user.email}) planını başlatabilirsin.
              </p>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 mb-4">{error}</p>}
              <button onClick={handleSubscribe} disabled={loading || !planId} className="w-full bg-primary hover:bg-primary-hover text-white px-6 py-3 text-sm font-semibold tracking-wide uppercase transition disabled:opacity-50">
                {loading ? "Başlatılıyor..." : "Planı Başlat →"}
              </button>
            </div>
          ) : (
            <div className="bg-card border border-border p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold mb-4">Hesap Bilgileri</div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 mb-4">{error}</p>}
              <form onSubmit={handleRegisterAndSubscribe} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-heading uppercase tracking-wide mb-1">Ad Soyad</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-border px-4 py-2.5 text-sm bg-page focus:outline-none focus:border-primary transition" placeholder="Adınız ve soyadınız" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-heading uppercase tracking-wide mb-1">E-posta</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-border px-4 py-2.5 text-sm bg-page focus:outline-none focus:border-primary transition" placeholder="ornek@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-heading uppercase tracking-wide mb-1">Şifre</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-border px-4 py-2.5 text-sm bg-page focus:outline-none focus:border-primary transition" placeholder="En az 6 karakter" minLength={6} />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={loading || !planId} className="w-full bg-primary hover:bg-primary-hover text-white px-6 py-3 text-sm font-semibold tracking-wide uppercase transition disabled:opacity-50">
                    {loading ? "Oluşturuluyor..." : "Profil Oluştur ve Planı Başlat →"}
                  </button>
                </div>
              </form>
              <p className="text-xs text-muted text-center mt-4">Zaten hesabınız var mı? <Link href="/giris" className="text-primary hover:underline">Giriş yapın</Link></p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ProfilOlusturPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-sm text-muted">Yükleniyor...</div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
