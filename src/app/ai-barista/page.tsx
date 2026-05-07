"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Bana kahve öner",
  "Hangi kahve sütlü içecekler için uygun?",
  "Abonelik paketlerini anlat",
  "V60 nasıl demlenir?",
  "Kurumsal alım yapmak istiyorum",
  "Siparişim ne zaman gelir?",
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
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#C4724B] underline hover:text-[#B0603A] transition"
        >
          {match[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function AIBaristaPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Merhaba! ☕ Ben **Rostello'nun Baş Baristası**.\n\nSize nasıl yardımcı olabilirim? Damak tadınıza uygun bir kahve önerebilir, demleme tüyoları verebilir veya abonelik paketlerimiz hakkında bilgi paylaşabilirim.\n\n**Başlamak için:** Kahveyi nasıl içmeyi seviyorsunuz? Sütlü mü, yoksa sade mi tercih edersiniz?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, threadId }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (data.threadId) setThreadId(data.threadId);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Bağlantı hatası. Lütfen tekrar dene." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

        <div className="flex-1 bg-white border border-[#e5e0d8] flex flex-col">
          {/* Chat header */}
          <div className="bg-[#1a1a1a] px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C4724B] flex items-center justify-center text-white font-bold text-sm">
              RB
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Rostello Baş Barista</h2>
              <p className="text-white/50 text-xs">Çevrimiçi • Hemen yanıt verir</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: "55vh" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-[#C4724B] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                    RB
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-5 py-3 ${
                    msg.role === "user"
                      ? "bg-[#f8f6f3] text-[#1a1a1a] border border-[#e5e0d8]"
                      : "bg-[#1a1a1a] text-white"
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap [&_a]:text-[#C4724B] [&_a]:underline [&_strong]:font-semibold [&_strong]:text-[#E8C4A0]">
                    {formatContent(msg.content)}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C4724B] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  RB
                </div>
                <div className="bg-[#1a1a1a] px-5 py-3">
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
          {messages.length <= 2 && (
            <div className="px-6 pb-2">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-xs border border-[#e5e0d8] px-3 py-1.5 text-[#4a4a4a] hover:border-[#C4724B] hover:text-[#C4724B] transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-[#e5e0d8] p-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Kahve tercihlerinizi anlatın..."
                className="flex-1 border border-[#e5e0d8] px-5 py-3 text-sm focus:outline-none focus:border-[#C4724B] text-[#1a1a1a] bg-white"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="bg-[#C4724B] hover:bg-[#B0603A] disabled:bg-[#E8C4A0] text-white px-8 py-3 text-sm font-medium tracking-wide uppercase transition"
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
