"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    options: [
      { value: "sutlu", label: "Sütlü (Latte, Cappuccino)" },
      { value: "sade", label: "Sade / Siyah" },
      { value: "soguk", label: "Soğuk (Cold Brew, Iced)" },
      { value: "any", label: "Fark etmez, hepsini severim" },
    ],
  },
  {
    id: "equipment",
    question: "Hangi ekipmanı kullanıyorsunuz?",
    options: [
      { value: "v60", label: "V60 / Pour Over" },
      { value: "french-press", label: "French Press" },
      { value: "espresso", label: "Espresso Makinesi" },
      { value: "moka", label: "Moka Pot" },
      { value: "aeropress", label: "Aeropress" },
      { value: "filter", label: "Filtre Kahve Makinesi" },
      { value: "cezve", label: "Cezve" },
      { value: "cold-brew", label: "Soğuk Demleme" },
      { value: "bilmiyorum", label: "Karar veremedim, Stello bana açıklasın" },
    ],
  },
  {
    id: "flavor",
    question: "Hangi lezzet profili size daha yakın?",
    options: [
      { value: "fruity", label: "Meyvemsi", desc: "Parlak & Canlı" },
      { value: "sweet", label: "Dengeli", desc: "Pürüzsüz & Klasik" },
      { value: "bold", label: "Çikolata", desc: "Yoğun & Güçlü" },
      { value: "any", label: "Kararsızım, her şeyi denerim" },
    ],
  },
  {
    id: "roast",
    question: "Nasıl bir doku istersiniz?",
    options: [
      { value: "light", label: "Zarif", desc: "Hafif, aromatik" },
      { value: "medium", label: "İdeal", desc: "Dengeli, tatlı" },
      { value: "dark", label: "Karakterli", desc: "Yoğun, tok" },
      { value: "any", label: "Fark etmez" },
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
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (results.length > 0 && !saved) {
      setSaved(true);
      fetch("/api/damak-testi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          how: answers.how, equipment: answers.equipment,
          flavor: answers.flavor, roast: answers.roast,
          results: results.map(p => p.slug),
        }),
      }).catch(() => {});
    }
  }, [results, answers, saved]);

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
    if (value === "bilmiyorum") {
      router.push("/ai-barista");
      return;
    }
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
      <div className="min-h-screen bg-page-hover flex items-center justify-center">
        <div className="text-center">
          <p className="text-body animate-pulse">Hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-hover flex flex-col">
      <section className="flex-1 flex items-start justify-center px-6 pt-10">
        {step < steps.length ? (
          <div className="w-full max-w-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-1 bg-border">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-muted font-medium">{step + 1}/{steps.length}</span>
            </div>

            <div className="bg-white border border-border p-6 sm:p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-heading">{current.question}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {current.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => select(opt.value)}
                    className="flex items-center gap-3 p-3.5 border border-border text-left hover:border-primary hover:bg-[#fdf8f4] transition hover:-translate-y-0.5 hover:shadow-sm group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-heading group-hover:text-primary transition leading-tight">
                        {opt.label}
                      </p>
                      {"desc" in opt && opt.desc && (
                        <p className="text-xs text-muted mt-0.5 leading-tight">{opt.desc}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white border border-border p-8 sm:p-12 text-center mb-8">
              <h2 className="text-2xl font-bold text-heading mb-2">Test Tamamlandı</h2>
              <p className="text-body text-sm">
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
                    className="bg-white border border-border p-6 hover:border-primary transition hover:-translate-y-1 hover:shadow-md group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-heading group-hover:text-primary transition">
                        {p.name}
                      </h3>
                      <span className="text-sm font-bold text-primary">
                        {formatPrice(kgTo250g(p.price))}₺
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted mb-2">
                      <span>{p.origin || p.region || "Menşei bilinmiyor"}</span>
                      <span>·</span>
                      <span>{p.roastLevel === "light" ? "Zarif" : p.roastLevel === "medium" ? "İdeal" : "Karakterli"} Kavrum</span>
                    </div>
                    {notes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {notes.slice(0, 3).map((n: string) => (
                          <span key={n} className="text-xs uppercase tracking-wider text-primary border border-primary/20 px-2 py-0.5">
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
                className="bg-heading hover:bg-[#2a2a2a] text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Testi Tekrarla
              </button>
              <Link
                href="/urunler"
                className="border border-heading text-heading hover:bg-heading hover:text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Tüm Ürünler
              </Link>
              <Link
                href={`/abonelik?equipment=${answers.equipment || ""}&flavor=${answers.flavor || ""}&roast=${answers.roast || ""}`}
                className="bg-primary hover:bg-primary-hover text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Abone Ol
              </Link>
              <Link
                href="/ai-barista"
                className="border border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-sm font-medium tracking-wide uppercase transition hover:-translate-y-0.5 hover:shadow-lg"
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
