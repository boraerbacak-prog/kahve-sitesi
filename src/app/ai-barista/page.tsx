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
  "Hangi kahve sütlü içecekler için uygun?",
  "Kahveni Bul testini yap",
  "Abonelik paketlerini anlat",
  "V60 nasıl demlenir?",
  "Kurumsal alım yapmak istiyorum",
  "Siparişim ne zaman gelir?",
  "Ekipman önerir misin?",
];

function formatContent(content: string) {
  const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      return (
        <a
          key={i}
          href={match[2]}
          className="text-[#E8C4A0] underline hover:text-[#f0dcc0] transition"
        >
          {match[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
        `- Daha önce Rostello deneyimi: ${labels[answers.q1] || answers.q1}`,
        `- Demleme yöntemi: ${labels[answers.q2] || answers.q2}`,
        `- Lezzet profili: ${labels[answers.q3] || answers.q3}`,
        `- Yeni tatlara açıklık: ${labels[answers.q4] || answers.q4}`,
      ];
      if (answers.q5) {
        answerLines.push(`- Beğenmeme sebebi: ${labels[answers.q5] || answers.q5}`);
      }

      const quizMessage = `Kahve testimden geliyorum! İşte cevaplarım:\n${answerLines.join("\n")}\n\nBana en uygun Rostello kahvelerini önerebilir misin?`;
      sendMessage(quizMessage);
    } catch {
      // Invalid quiz param, ignore
    }
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
    <div className="min-h-screen bg-[#f8f6f3] flex flex-col">
      <div className="max-w-5xl mx-auto px-6 py-12 flex-1 flex flex-col">
        <div className="text-center mb-8">
          <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Dijital Barista</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mt-2 mb-2">
            Rostello ile <span className="text-[#C4724B]">Kahve Keşfi</span>
          </h1>
          <p className="text-[#8c8c8c] text-sm max-w-xl mx-auto">
            Baş Baristanıza istediğiniz soruyu sorun — ürün önerisi, demleme rehberi, abonelik ve daha fazlası.
          </p>
        </div>

        <div className="flex-1 bg-white border border-[#e5e0d8] flex flex-col overflow-hidden" style={{ borderRadius: "16px" }}>
          {/* Chat header */}
          <div className="px-6 py-4 flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #C4724B, #B0603A)" }}>
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/20">
              <Image src="/celsus/dijital-barista/barista d.png" alt="Barista" width={80} height={80} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Rostello Baş Barista</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-white/70 text-xs">Çevrimiçi • Hemen yanıt verir</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#faf8f6]" style={{ maxHeight: "55vh" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 shadow-sm border border-white/10">
                    <Image src="/celsus/dijital-barista/barista d.png" alt="Barista" width={64} height={64} className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap [&_a]:text-[#E8C4A0] [&_a]:underline [&_strong]:font-semibold [&_strong]:text-[#E8C4A0] px-5 py-3"
                  style={{
                    maxWidth: "75%",
                    borderRadius: msg.role === "user" ? "20px 4px 20px 20px" : "4px 20px 20px 20px",
                    background: msg.role === "user"
                      ? "#fff"
                      : "linear-gradient(135deg, #1a1a1a, #2c2c2c)",
                    color: msg.role === "user" ? "#1a1a1a" : "#fff",
                    boxShadow: msg.role === "user"
                      ? "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
                      : "0 2px 8px rgba(0,0,0,0.15)",
                    border: msg.role === "user" ? "1px solid #e5e0d8" : "none",
                  }}
                >
                  {formatContent(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm border border-white/10">
                  <Image src="/celsus/dijital-barista/barista d.png" alt="Barista" width={64} height={64} className="w-full h-full object-cover" />
                </div>
                <div className="px-5 py-3" style={{ borderRadius: "4px 20px 20px 20px", background: "linear-gradient(135deg, #1a1a1a, #2c2c2c)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#C4724B] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-[#C4724B] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-[#C4724B] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div className="px-6 pb-2 bg-[#faf8f6]">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  disabled={loading}
                  className="text-xs border border-[#D4A574]/30 bg-white px-3 py-1.5 text-[#4a4a4a] hover:border-[#C4724B] hover:text-[#C4724B] hover:bg-[#fdf8f4] transition disabled:opacity-40 rounded-full"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Subscription Actions */}
          {subInfo && (
            <div className="px-6 pb-3 border-t border-[#e5e0d8] pt-3 bg-[#faf8f6]">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#8c8c8c] font-medium">
                  {subInfo.planName} ({subInfo.planPrice}₺/ay):
                </span>
                {subInfo.status === "active" && (
                  <>
                    <button
                      onClick={() => handleSubAction("pause")}
                      disabled={actionLoading}
                      className="text-xs border border-[#D4A574]/40 text-[#C4724B] px-3 py-1 hover:bg-[#fdf8f4] transition disabled:opacity-40 rounded-full"
                    >
                      Duraklat
                    </button>
                    <button
                      onClick={() => handleSubAction("cancel")}
                      disabled={actionLoading}
                      className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition disabled:opacity-40 rounded-full"
                    >
                      İptal Et
                    </button>
                  </>
                )}
                {subInfo.status === "paused" && (
                  <button
                    onClick={() => handleSubAction("resume")}
                    disabled={actionLoading}
                    className="text-xs border border-green-400 text-green-600 px-3 py-1 hover:bg-green-50 transition disabled:opacity-40 rounded-full"
                  >
                    Devam Ettir
                  </button>
                )}
                <Link
                  href="/abonelik/yonetim"
                  className="text-xs text-[#C4724B] hover:underline ml-auto"
                >
                  Detaylı Yönet →
                </Link>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-[#e5e0d8] p-6 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Kahve tercihlerinizi anlatın..."
                className="flex-1 border border-[#e5e0d8] px-5 py-3 text-sm focus:outline-none focus:border-[#C4724B] text-[#1a1a1a] bg-white rounded-full"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="text-white px-8 py-3 text-sm font-medium uppercase transition-all duration-500 hover:brightness-110 disabled:opacity-40 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #C4724B, #E8C4A0, #C4724B)",
                  backgroundSize: "200% auto",
                  animation: "copper-shimmer 3s linear infinite",
                }}
              >
                Gönder
              </button>
            </div>
            {!session && (
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-[#8c8c8c]">
                <span>Sohbet geçmişi için</span>
                <Link href="/giris" className="text-[#C4724B] hover:underline">giriş yapın</Link>
                <span>veya</span>
                <Link href="/kayit" className="text-[#C4724B] hover:underline">kaydolun</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIBaristaPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-6 py-24 text-center text-[#8c8c8c]">Yükleniyor...</div>}>
      <AIBaristaContent />
    </Suspense>
  );
}
