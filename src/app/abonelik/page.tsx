"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  packageCount: number;
  packageSize: number;
  hasDiscovery: boolean;
  hasSpecialty: boolean;
  hasPriority: boolean;
  discountPercent: number;
}

const equipments = [
  { value: "", label: "Seçmedim" },
  { value: "v60", label: "V60 / Pour Over" },
  { value: "french-press", label: "French Press" },
  { value: "espresso", label: "Espresso Makinesi" },
  { value: "moka", label: "Moka Pot" },
  { value: "aeropress", label: "Aeropress" },
  { value: "cezve", label: "Cezve" },
  { value: "filter", label: "Filtre Kahve Makinesi" },
  { value: "cold-brew", label: "Soğuk Demleme" },
];

const grinds = [
  { value: "", label: "Çekirdek (öğütülmemiş)" },
  { value: "fine", label: "İnce (Espresso için)" },
  { value: "medium-fine", label: "Orta-İnce (Moka, Aeropress)" },
  { value: "medium", label: "Orta (V60, Filtre)" },
  { value: "coarse", label: "Kalın (French Press, Cold Brew)" },
];

const flavorProfiles = [
  { value: "", label: "Kararsızım / Fark etmez" },
  { value: "fruity", label: "Meyvemsi & Çiçeksi" },
  { value: "sweet", label: "Tatlı & Dengeli (Karamel, Çikolata)" },
  { value: "bold", label: "Dolgun & Sert (Koyu kavrum)" },
];

const frequencies = [
  { value: "monthly", label: "Ayda 1" },
  { value: "biweekly", label: "2 haftada 1" },
  { value: "weekly", label: "Haftada 1" },
];

function AbonelikContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState<"plans" | "configure" | "confirm">("plans");
  const [equipment, setEquipment] = useState(searchParams.get("equipment") || "");
  const [grindSetting, setGrindSetting] = useState("");
  const [flavorProfile, setFlavorProfile] = useState(searchParams.get("flavor") || "");
  const [frequency, setFrequency] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/abonelik/plans")
      .then((r) => r.json())
      .then((d) => { if (d.plans) setPlans(d.plans); });
  }, []);

  const startSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    setStep("configure");
  };

  const handleSubmit = async () => {
    if (!session) {
      signIn();
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/abonelik/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          equipment: equipment || null,
          grindSetting: grindSetting || null,
          flavorProfile: flavorProfile || null,
          deliveryFrequency: frequency,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setStep("confirm");
      }
    } catch {
      setMessage("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const selected = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      {step === "plans" && (
        <>
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Abonelik</span>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">Kahve Aboneliği</h1>
            <p className="text-[#4a4a4a] max-w-2xl mx-auto">
              Her ay taze kavrulmuş kahveler kapınızda. Damak tadınıza ve ekipmanınıza özel, kişiselleştirilmiş kahve deneyimi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e5e0d8] max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white p-8 flex flex-col relative ${plan.name === "Keyif" ? "ring-2 ring-[#C4724B]" : ""}`}
              >
                {plan.name === "Keyif" && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C4724B] text-white text-[10px] tracking-wider uppercase px-4 py-1 font-medium">
                    En Popüler
                  </span>
                )}
                <span className="text-4xl mb-4">
                  {plan.name === "Başlangıç" ? "🌱" : plan.name === "Keyif" ? "☕" : "🏆"}
                </span>
                <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">{plan.name}</h2>
                <p className="text-sm text-[#4a4a4a] mb-6 flex-1">{plan.description}</p>
                <div className="mb-8">
                  <span className="text-3xl font-bold text-[#1a1a1a]">{plan.price} ₺</span>
                  <span className="text-sm text-[#8c8c8c]"> / ay</span>
                </div>
                <ul className="mb-8 space-y-3">
                  <li className="text-sm text-[#4a4a4a] flex items-start gap-2">
                    <span className="text-[#C4724B] mt-0.5 shrink-0">✓</span>
                    {plan.packageCount} paket ({plan.packageSize}g)
                  </li>
                  <li className="text-sm text-[#4a4a4a] flex items-start gap-2">
                    <span className="text-[#C4724B] mt-0.5 shrink-0">✓</span>
                    {plan.name === "Başlangıç" ? "Sabit seçim" : plan.hasDiscovery ? "1 tanıdık + keşif" : "Sabit seçim"}
                  </li>
                  <li className="text-sm text-[#4a4a4a] flex items-start gap-2">
                    <span className="text-[#C4724B] mt-0.5 shrink-0">✓</span>
                    Ücretsiz kargo
                  </li>
                  {plan.hasDiscovery && (
                    <li className="text-sm text-[#4a4a4a] flex items-start gap-2">
                      <span className="text-[#C4724B] mt-0.5 shrink-0">✓</span>
                      Her ay farklı çekirdek
                    </li>
                  )}
                  {plan.hasSpecialty && (
                    <li className="text-sm text-[#4a4a4a] flex items-start gap-2">
                      <span className="text-[#C4724B] mt-0.5 shrink-0">✓</span>
                      Specialty seçkiler
                    </li>
                  )}
                  {plan.hasPriority && (
                    <li className="text-sm text-[#4a4a4a] flex items-start gap-2">
                      <span className="text-[#C4724B] mt-0.5 shrink-0">✓</span>
                      Öncelikli müşteri desteği
                    </li>
                  )}
                  <li className="text-sm text-[#4a4a4a] flex items-start gap-2">
                    <span className="text-[#C4724B] mt-0.5 shrink-0">✓</span>
                    Dilediğin zaman iptal
                  </li>
                </ul>
                <button
                  onClick={() => startSubscribe(plan.id)}
                  className={`w-full py-4 text-sm font-medium tracking-wide uppercase transition mt-auto ${
                    plan.name === "Keyif"
                      ? "bg-[#C4724B] hover:bg-[#B0603A] text-white"
                      : "bg-[#1a1a1a] hover:bg-[#333] text-white"
                  }`}
                >
                  {plan.name === "Başlangıç" ? "Başla" : plan.name === "Keyif" ? "Abone Ol" : "Gurme Ol"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {step === "configure" && selected && (
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setStep("plans")}
            className="inline-flex items-center gap-1 text-sm text-[#C4724B] hover:text-[#B0603A] transition mb-8"
          >
            ← Planlara Dön
          </button>

          <div className="text-center mb-10">
            <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Abonelik</span>
            <h1 className="text-3xl font-bold text-[#1a1a1a] mt-3 mb-2">{selected.name} Paketini Kişiselleştir</h1>
            <p className="text-[#4a4a4a] text-sm">{selected.price} ₺/ay · {selected.packageCount} paket (250g)</p>
          </div>

          <div className="bg-white border border-[#e5e0d8] p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Hangi ekipmanı kullanıyorsunuz?</label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full border border-[#e5e0d8] p-3 text-sm bg-white focus:border-[#C4724B] outline-none"
              >
                {equipments.map((eq) => (
                  <option key={eq.value} value={eq.value}>{eq.label}</option>
                ))}
              </select>
              <p className="text-xs text-[#8c8c8c] mt-1">Ekipmanınıza göre öğütme derecesi ve kahve profili otomatik ayarlanır.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Öğütme tercihi</label>
              <select
                value={grindSetting}
                onChange={(e) => setGrindSetting(e.target.value)}
                className="w-full border border-[#e5e0d8] p-3 text-sm bg-white focus:border-[#C4724B] outline-none"
              >
                {grinds.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Lezzet profili tercihiniz</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {flavorProfiles.map((fp) => (
                  <button
                    key={fp.value}
                    onClick={() => setFlavorProfile(fp.value)}
                    className={`p-3 text-sm text-left border transition ${
                      flavorProfile === fp.value
                        ? "border-[#C4724B] bg-[#fdf8f4] text-[#C4724B]"
                        : "border-[#e5e0d8] text-[#4a4a4a] hover:border-[#C4724B]"
                    }`}
                  >
                    {fp.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Teslimat sıklığı</label>
              <div className="grid grid-cols-3 gap-2">
                {frequencies.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFrequency(f.value)}
                    className={`p-3 text-sm text-center border transition ${
                      frequency === f.value
                        ? "border-[#C4724B] bg-[#fdf8f4] text-[#C4724B]"
                        : "border-[#e5e0d8] text-[#4a4a4a] hover:border-[#C4724B]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {message && (
            <p className="text-sm text-red-600 mt-4 text-center">{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#1a1a1a] hover:bg-[#333] disabled:bg-[#8c8c8c] text-white py-4 text-sm font-medium tracking-wide uppercase transition mt-6"
          >
            {loading ? "Oluşturuluyor..." : session ? "Aboneliği Başlat" : "Giriş Yap ve Abone Ol"}
          </button>
        </div>
      )}

      {step === "confirm" && (
        <div className="max-w-xl mx-auto text-center">
          <span className="text-6xl block mb-6">🎉</span>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-4">Aboneliğin Oluşturuldu!</h1>
          <p className="text-[#4a4a4a] mb-8">
            {selected?.name} paketiniz aktif. İlk teslimatınız yakında yola çıkıyor.
            Aboneliğini AI Barista üzerinden yönetebilirsin.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/abonelik/yonetim"
              className="bg-[#1a1a1a] hover:bg-[#333] text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition"
            >
              Aboneliğimi Yönet
            </Link>
            <Link
              href="/ai-barista"
              className="border border-[#C4724B] text-[#C4724B] hover:bg-[#C4724B] hover:text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition"
            >
              AI Barista ile Konuş
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AbonelikPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f6f3] flex items-center justify-center">
        <span className="text-6xl animate-pulse">☕</span>
      </div>
    }>
      <AbonelikContent />
    </Suspense>
  );
}
