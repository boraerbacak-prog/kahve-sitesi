"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useChat } from "@/lib/chat-context";

interface SubscriptionInfo {
  id: string;
  status: string;
  planName: string;
  planPrice: number;
}

const suggestions = [
  "Bana kahve öner",
  "Damak Testi Yap",
  "Hangi kahve sütlü içecekler için uygun?",
  "Abonelik paketlerini anlat",
  "V60 nasıl demlenir?",
  "Ürünleri Keşfet",
  "Ekipman önerir misin?",
  "Meyvemsi kahve var mı?",
];

function handleBaristaNav(href: string) {
  if (typeof window !== "undefined" && href.startsWith("/")) {
    localStorage.setItem("rostello_from_barista", "1");
  }
}

function formatContent(content: string) {
  const text = content.replace(/__OPTIONS__:.*$/, "");
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return boldParts.map((part, i) => {
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return <strong key={i} className="text-primary-glow font-semibold">{boldMatch[1]}</strong>;
    }
    const linkParts = part.split(/(\[[^\]]+\]\([^)]+\))/g);
    return linkParts.map((sub, j) => {
      const linkMatch = sub.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        return <a key={`${i}-${j}`} href={linkMatch[2]} onClick={() => handleBaristaNav(linkMatch[2])} className="text-primary-glow underline hover:text-primary-glow transition">{linkMatch[1]}</a>;
      }
      return <span key={`${i}-${j}`}>{sub}</span>;
    });
  });
}

function getOptions(content: string): string[] {
  const m = content.match(/__OPTIONS__:(.+)$/);
  if (!m) return [];
  return m[1].split("|").map(s => s.trim()).filter(Boolean);
}

function AIBaristaContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { messages, loading, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const autoSent = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (autoSent.current || loading || messages.length > 1) return;
    const quizParam = searchParams?.get("quiz");
    if (!quizParam) return;

    try {
      const answers = JSON.parse(decodeURIComponent(quizParam));
      if (!answers.q1) return;
      autoSent.current = true;

      const labels: Record<string, string> = {
        memnun: "Evet, denemiş ve memnun kalmıştım",
        yeni: "Hayır, ilk defa deneyeceğim",
        begenmemis: "Evet ama hiç beğenmemiştim",
        cezve: "Cezve", "filtre-makine": "Filtre kahve makinesi",
        v60: "V60 gibi elle demleme", aeropress: "Aeropress",
        "moka-pot": "Moka Pot", espresso: "Espresso",
        "otomatik-espresso": "Otomatik espresso makinesi",
        ciceksi: "Çiçeksi", "tatli-meyve": "Tatlı meyveler",
        mayhos: "Mayhoş meyveler", yemis: "Yemişler",
        cikolata: "Çikolatamsı", baharat: "Baharatsı",
        acik: "Yeni tatlara açığım", "orta-acik": "Orta derecede açığım",
        aromatik: "Aromatik profilli kahveler severim", kapali: "Klasik tatlardan şaşmam",
        sulu: "Çok suluydu", aci: "Çok acıydı",
        hafif: "Çok hafifti", sert: "Çok sertti", sikici: "Çok sıkıcıydı",
      };

      const answerLines = [
        `- Daha önce deneyim: ${labels[answers.q1] || answers.q1}`,
        `- Demleme yöntemi: ${labels[answers.q2] || answers.q2}`,
        `- Lezzet profili: ${labels[answers.q3] || answers.q3}`,
        `- Yeni tatlara açıklık: ${labels[answers.q4] || answers.q4}`,
      ];
      if (answers.q5) {
        answerLines.push(`- Beğenmeme sebebi: ${labels[answers.q5] || answers.q5}`);
      }

      const quizMessage = `Kahve testimden geliyorum! İşte cevaplarım:\n${answerLines.join("\n")}\n\nBana en uygun kahveleri önerebilir misin?`;
      sendMessage(quizMessage);
    } catch {
      // Invalid quiz param, ignore
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (autoSent.current || loading || messages.length > 1) return;
    const source = searchParams?.get("source");
    if (source !== "kahve-kesfet") return;
    try {
      const stored = localStorage.getItem("kahve-test-answers");
      if (!stored) return;
      autoSent.current = true;
      localStorage.removeItem("kahve-test-answers");
      const answers = JSON.parse(stored);
      const map: Record<string, string> = {
        ekipman: "Ekipman", sutlu: "Süt/Sade", lezzet: "Lezzet Profili", fincan: "Günlük Fincan",
      };
      const lines = Object.entries(answers).map(([k, v]) => `- ${map[k] || k}: ${v}`);
      const msg = `Kahveni Keşfet testimden geliyorum! Cevaplarım:\n${lines.join("\n")}\n\nBana en uygun kahveyi önerebilir misin?`;
      sendMessage(msg);
    } catch {}
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/abonelik/my")
      .then((r) => r.json())
      .then((d) => {
        const active = d.subscriptions?.find((s: any) => s.status === "active" || s.status === "paused");
        if (active) {
          setSubInfo({
            id: active.id,
            status: active.status,
            planName: active.plan.name,
            planPrice: active.plan.price,
          });
        }
      })
      .catch(() => {});
  }, [session]);

  const handleSubAction = useCallback(async (action: string) => {
    if (!subInfo || actionLoading) return;
    setActionLoading(true);
    try {
      if (action === "pause") {
        await fetch("/api/abonelik/pause", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId: subInfo.id, pause: true }),
        });
        setSubInfo((prev) => prev ? { ...prev, status: "paused" } : null);
        sendMessage("Aboneliğimi duraklat");
      } else if (action === "resume") {
        await fetch("/api/abonelik/pause", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId: subInfo.id, pause: false }),
        });
        setSubInfo((prev) => prev ? { ...prev, status: "active" } : null);
        sendMessage("Aboneliğimi yeniden aktifleştir");
      } else if (action === "cancel") {
        if (!confirm("Aboneliğini iptal etmek istediğine emin misin?")) return;
        await fetch("/api/abonelik/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId: subInfo.id }),
        });
        setSubInfo(null);
        sendMessage("Aboneliğimi iptal et");
      }
    } catch {
      // Error handled by chat context
    } finally {
      setActionLoading(false);
    }
  }, [subInfo, actionLoading, sendMessage]);

  return (
    <div className="h-[calc(100dvh-112px)] lg:h-[calc(100dvh-144px)] bg-page-hover flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0"
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))" }}>
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/20">
            <Image src="/celsus/dijital-barista/barista d.png" alt="Barista" width={72} height={72} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">Stello Barista</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              <span className="text-white/70 text-xs truncate">Çevrimiçi</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 bg-page-hover">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted text-sm py-12">
              <p className="mb-6">Size nasıl yardımcı olabilirim?</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 shadow-sm border border-white/10">
                    <Image src="/celsus/dijital-barista/barista d.png" alt="Barista" width={64} height={64} className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap [&_a]:text-primary-glow [&_a]:underline [&_strong]:font-semibold [&_strong]:text-primary-glow px-5 py-3"
                  style={{
                    maxWidth: "75%",
                    borderRadius: msg.role === "user" ? "20px 4px 20px 20px" : "4px 20px 20px 20px",
                    background: msg.role === "user"
                      ? "var(--color-card)"
                      : "linear-gradient(135deg, var(--color-heading), #2c2c2c)",
                    color: msg.role === "user" ? "var(--color-heading)" : "var(--color-card)",
                    boxShadow: msg.role === "user"
                      ? "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
                      : "0 2px 8px rgba(0,0,0,0.15)",
                    border: msg.role === "user" ? "1px solid #e5e0d8" : "none",
                  }}
                >
                  {formatContent(msg.content)}
                </div>
              </div>
              {msg.role === "assistant" && getOptions(msg.content).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5 ml-11">
                  {getOptions(msg.content).map((opt) => (
                    <button key={opt} onClick={() => handleSend(opt)} disabled={loading}
                        className="text-[11px] border border-primary-light/40 bg-white px-2.5 py-1.5 text-body hover:border-primary hover:text-primary hover:bg-[#fdf8f4] transition hover:-translate-y-0.5 hover:scale-[1.03] disabled:opacity-40 rounded-full"
                    >{opt}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm border border-white/10">
                <Image src="/celsus/dijital-barista/barista d.png" alt="Barista" width={64} height={64} className="w-full h-full object-cover" />
              </div>
              <div className="px-5 py-3" style={{ borderRadius: "4px 20px 20px 20px", background: "linear-gradient(135deg, var(--color-heading), #2c2c2c)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Subscription Actions */}
        {subInfo && (
          <div className="border-t border-border px-4 sm:px-6 py-2.5 bg-white shrink-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs tracking-[0.2em] uppercase text-muted font-medium">
                {subInfo.planName} ({subInfo.planPrice}₺/ay):
              </span>
              {subInfo.status === "active" && (
                <>
                  <button onClick={() => handleSubAction("pause")} disabled={actionLoading}
                      className="text-xs border border-primary-light/40 text-primary px-3 py-1 hover:bg-[#fdf8f4] transition hover:-translate-y-0.5 disabled:opacity-40 rounded-full">
                    Duraklat
                  </button>
                  <button onClick={() => handleSubAction("cancel")} disabled={actionLoading}
                    className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition disabled:opacity-40 rounded-full">
                    İptal Et
                  </button>
                </>
              )}
              {subInfo.status === "paused" && (
                <button onClick={() => handleSubAction("resume")} disabled={actionLoading}
                  className="text-xs border border-green-400 text-green-600 px-3 py-1 hover:bg-green-50 transition disabled:opacity-40 rounded-full">
                  Devam Ettir
                </button>
              )}
              <Link href="/abonelik/yonetim" className="text-xs text-primary hover:underline ml-auto">
                Detaylı Yönet
              </Link>
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="border-t border-border px-4 sm:px-6 py-2.5 bg-page-hover shrink-0">
          <div className="flex flex-wrap gap-1.5 max-w-3xl mx-auto">
            {suggestions.map((s) => (
              s === "Ürünleri Keşfet" ? (
                <Link key={s} href="/urunler?from=barista" onClick={() => handleBaristaNav("/urunler")}
                  className="text-[11px] border border-primary-light/30 bg-white px-2.5 py-1.5 text-body hover:border-primary hover:text-primary hover:bg-[#fdf8f4] transition hover:-translate-y-0.5 hover:scale-[1.03] rounded-full font-medium"
                >{s}</Link>
              ) : (
                <button key={s} onClick={() => handleSend(s)} disabled={loading}
                  className="text-[11px] border border-primary-light/30 bg-white px-2.5 py-1.5 text-body hover:border-primary hover:text-primary hover:bg-[#fdf8f4] transition hover:-translate-y-0.5 hover:scale-[1.03] disabled:opacity-40 rounded-full"
                >{s}</button>
              )
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 sm:px-6 py-4 bg-white shrink-0">
          <div className="flex gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Kahve tercihlerinizi anlatın..."
              className="flex-1 border border-border px-5 py-3 text-sm focus:outline-none focus:border-primary text-heading bg-white rounded-full"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="text-white px-8 py-3 text-sm font-medium uppercase transition-all duration-500 hover:brightness-110 hover:scale-[1.03] active:scale-95 disabled:opacity-40 rounded-full shrink-0"
              style={{
                background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-glow), var(--color-primary))",
                backgroundSize: "200% auto",
                animation: "copper-shimmer 3s linear infinite",
              }}
            >
              Gönder
            </button>
          </div>
          {!session && (
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted">
              <span>Sohbet geçmişi için</span>
              <Link href="/giris" className="text-primary hover:underline hover:-translate-y-0.5 inline-block transition">giriş yapın</Link>
              <span>veya</span>
              <Link href="/kayit" className="text-primary hover:underline hover:-translate-y-0.5 inline-block transition">kaydolun</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIBaristaPage() {
  return (
    <>
      <style>{`footer { display: none !important; }`}</style>
      <Suspense fallback={<div className="max-w-4xl mx-auto px-6 py-24 text-center text-muted">Yükleniyor...</div>}>
        <AIBaristaContent />
      </Suspense>
    </>
  );
}
