"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, kgTo250g } from "@/lib/price";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  roastLevel: string;
  body: string;
  acidity: string;
  flavorNotes: string;
  origin: string;
  region: string;
  segment: string;
  category: { name: string };
}

type Answer = string | null;

const steps = [
  {
    id: "how",
    question: "Kahvenizi nasıl içmeyi seversiniz?",
    emoji: "☕",
    options: [
      { value: "sutlu", label: "Sütlü (Latte, Cappuccino)", emoji: "🥛" },
      { value: "sade", label: "Sade / Siyah", emoji: "⚫" },
      { value: "soguk", label: "Soğuk (Cold Brew, Iced)", emoji: "🧊" },
      { value: "any", label: "Fark etmez, hepsini severim", emoji: "🤷" },
    ],
  },
  {
    id: "equipment",
    question: "Hangi ekipmanı kullanıyorsunuz?",
    emoji: "⚙️",
    options: [
      { value: "v60", label: "V60 / Pour Over", emoji: "☕" },
      { value: "french-press", label: "French Press", emoji: "🫖" },
      { value: "espresso", label: "Espresso Makinesi", emoji: "⚡" },
      { value: "moka", label: "Moka Pot", emoji: "🏺" },
      { value: "aeropress", label: "Aeropress", emoji: "💉" },
      { value: "filter", label: "Filtre Kahve Makinesi", emoji: "🔌" },
      { value: "cezve", label: "Cezve", emoji: "🥣" },
      { value: "cold-brew", label: "Soğuk Demleme", emoji: "🧊" },
    ],
  },
  {
    id: "flavor",
    question: "Hangi lezzet profili size daha yakın?",
    emoji: "🌿",
    options: [
      { value: "fruity", label: "Meyvemsi & Çiçeksi", desc: "Parlak, hafif, asiditeli", emoji: "🌸" },
      { value: "sweet", label: "Tatlı & Dengeli", desc: "Karamel, çikolata, fındık", emoji: "🍫" },
      { value: "bold", label: "Dolgun & Sert", desc: "Koyu kavrum, bitter, yoğun", emoji: "🔥" },
      { value: "any", label: "Kararsızım, her şeyi denerim", emoji: "🧪" },
    ],
  },
  {
    id: "roast",
    question: "Kavrum tercihiniz nedir?",
    emoji: "🫘",
    options: [
      { value: "light", label: "Hafif Kavrum", desc: "Daha asiditeli, meyvemsi", emoji: "🟤" },
      { value: "medium", label: "Orta Kavrum", desc: "Dengeli, yumuşak", emoji: "🟢" },
      { value: "dark", label: "Koyu Kavrum", desc: "Yoğun, bitter, dolgun", emoji: "⚫" },
      { value: "any", label: "Fark etmez", emoji: "🤷" },
    ],
  },
];

function matchProducts(products: Product[], answers: Record<string, Answer>): Product[] {
  return products.filter((p) => {
    const roast = p.roastLevel || "";
    const body = (p.body || "").toLowerCase();
    const acidity = (p.acidity || "").toLowerCase();
    let notes: string[] = [];
    try { notes = JSON.parse(p.flavorNotes || "[]").map((n: string) => n.toLowerCase()); } catch {}

    const hasBody = body.length > 0;
    const hasAcidity = acidity.length > 0;

    if (answers.how === "sutlu") {
      if (roast === "light") return false;
    }
    if (answers.how === "soguk") {
      if (roast === "light") return false;
    }

    if (answers.roast && answers.roast !== "any") {
      if (roast !== answers.roast) return false;
    }

    if (answers.flavor === "fruity") {
      if (hasAcidity && acidity !== "high" && roast !== "light") return false;
      if (!hasAcidity && roast !== "light") return false;
    }
    if (answers.flavor === "sweet") {
      if (hasBody && body !== "medium" && body !== "full") {
        if (!notes.some(n => ["karamel","çikolata","fındık","badem"].includes(n))) {
          if (roast === "light") return false;
        }
      }
    }
    if (answers.flavor === "bold") {
      if (roast !== "dark") {
        if (hasBody && body !== "full") return false;
      }
    }

    if (answers.equipment === "v60" && roast === "dark") {
      if (hasBody && body !== "medium") return false;
    }
    if (answers.equipment === "espresso" && roast === "light") return false;
    if (answers.equipment === "french-press" && roast === "light") return false;
    if (answers.equipment === "moka" && roast === "light") return false;
    if (answers.equipment === "cezve" && roast === "light") return false;

    return true;
  });
}

export default function KahveniBulPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const select = (value: string) => {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);

    if (isLast) {
      setResults(matchProducts(products, newAnswers));
      setStep(step + 1);
    } else {
      setStep(step + 1);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setResults([]);
  };

  const progress = Math.round((step / steps.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f3] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-6 animate-pulse">☕</span>
          <p className="text-[#4a4a4a]">Hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f3] flex flex-col">
      {/* Quiz */}
      <section className="flex-1 flex items-start justify-center px-6 pt-10">
        {step < steps.length ? (
          <div className="w-full max-w-xl">
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-1 bg-[#e5e0d8]">
                <div className="h-full bg-[#C4724B] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-[#8c8c8c] font-medium">{step + 1}/{steps.length}</span>
            </div>

            {/* Question card */}
            <div className="bg-white border border-[#e5e0d8] p-6 sm:p-8">
              <div className="text-center mb-6">
                <span className="text-4xl block mb-2">{current.emoji}</span>
                <h2 className="text-xl font-bold text-[#1a1a1a]">{current.question}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {current.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => select(opt.value)}
                    className="flex items-center gap-3 p-3.5 border border-[#e5e0d8] text-left hover:border-[#C4724B] hover:bg-[#fdf8f4] transition hover:-translate-y-0.5 hover:shadow-sm group"
                  >
                    <span className="text-2xl shrink-0">{opt.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1a1a1a] group-hover:text-[#C4724B] transition leading-tight">
                        {opt.label}
                      </p>
                      {"desc" in opt && opt.desc && (
                        <p className="text-xs text-[#8c8c8c] mt-0.5 leading-tight">{opt.desc}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Results */
          <div>
            <div className="bg-white border border-[#e5e0d8] p-8 sm:p-12 text-center mb-8">
              <span className="text-6xl block mb-4">🎉</span>
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Testin Tamamlandı!</h2>
              <p className="text-[#4a4a4a] text-sm">
                {results.length > 0
                  ? `Sana en uygun ${results.length} kahve${results.length > 1 ? "yi" : "y"} bulduk.`
                  : "Kriterlerine tam uyan bulamadık ama bunlara göz atmanı öneririm:"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {(results.length > 0 ? results : products).slice(0, 6).map((p) => {
                let notes: string[] = [];
                try { notes = JSON.parse(p.flavorNotes || "[]"); } catch { notes = []; }
                return (
                  <Link
                    key={p.id}
                    href={`/urunler/${p.slug}`}
                    className="bg-white border border-[#e5e0d8] p-6 hover:border-[#C4724B] transition hover:-translate-y-1 hover:shadow-md group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[#1a1a1a] group-hover:text-[#C4724B] transition">
                        {p.name}
                      </h3>
                      <span className="text-sm font-bold text-[#C4724B]">
                        {formatPrice(kgTo250g(p.price))}₺
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#8c8c8c] mb-2">
                      <span>{p.origin || p.region || "Menşei bilinmiyor"}</span>
                      <span>·</span>
                      <span>{p.roastLevel === "light" ? "Hafif" : p.roastLevel === "medium" ? "Orta" : "Koyu"} Kavrum</span>
                    </div>
                    {notes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {notes.slice(0, 3).map((n: string) => (
                          <span key={n} className="text-xs uppercase tracking-wider text-[#C4724B] border border-[#C4724B]/20 px-2 py-0.5">
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={restart}
                className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Testi Tekrarla
              </button>
              <Link
                href="/urunler"
                className="border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Tüm Ürünler
              </Link>
              <Link
                href={`/abonelik?equipment=${answers.equipment || ""}&flavor=${answers.flavor || ""}&roast=${answers.roast || ""}`}
                className="bg-[#C4724B] hover:bg-[#B0603A] text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Abone Ol 🎯
              </Link>
              <Link
                href="/ai-barista"
                className="border border-[#C4724B] text-[#C4724B] hover:bg-[#C4724B] hover:text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Baş Barista ile Konuş
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
