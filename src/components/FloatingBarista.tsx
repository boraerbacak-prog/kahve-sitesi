"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useChat } from "@/lib/chat-context";

const suggestions = [
  "Bana kahve öner",
  "Sütlü kahve önerir misin?",
  "Meyvemsi kahve var mı?",
  "Abonelik paketlerini anlat",
  "Kahveni Bul testini yap",
  "V60 nasıl demlenir?",
  "İade yapabilir miyim?",
  "Specialty coffee nedir?",
];

function fmt(content: string) {
  const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const m = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (m) return <a key={i} href={m[2]} className="text-[#E8C4A0] underline hover:text-[#f0dcc0] transition">{m[1]}</a>;
    return <span key={i}>{part}</span>;
  });
}

export default function FloatingBarista() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, loading, sendMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");
    await sendMessage(msg);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-28 right-6 z-50 w-[28rem] max-w-[calc(100vw-3rem)] bg-white border border-[#e5e0d8] shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "600px", borderRadius: "16px 16px 12px 12px" }}>
          <div className="px-5 py-4 flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, #C4724B, #B0603A)",
            }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/20">
                <Image src="/celsus/dijital-barista/barista d.png" alt="Barista" width={80} height={80} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Rostello Baş Barista</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-white/70 text-[10px]">Çevrimiçi - Hemen yanıt verir</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-xl leading-none transition">&times;</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf8f6]" style={{ minHeight: "250px", maxHeight: "350px" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-1 mr-2 shadow-sm border border-white/10">
                    <Image src="/celsus/dijital-barista/barista d.png" alt="Barista" width={56} height={56} className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap [&_a]:text-[#E8C4A0] [&_a]:underline [&_strong]:text-[#E8C4A0] px-4 py-2.5"
                  style={{
                    maxWidth: "80%",
                    borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    background: m.role === "user"
                      ? "#fff"
                      : "linear-gradient(135deg, #1a1a1a, #2c2c2c)",
                    color: m.role === "user" ? "#1a1a1a" : "#fff",
                    boxShadow: m.role === "user"
                      ? "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
                      : "0 2px 8px rgba(0,0,0,0.15)",
                    border: m.role === "user" ? "1px solid #e5e0d8" : "none",
                  }}
                >
                  {fmt(m.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-1 mr-2 shadow-sm border border-white/10">
                  <Image src="/celsus/dijital-barista/barista d.png" alt="Barista" width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <div className="px-4 py-3" style={{ borderRadius: "4px 16px 16px 16px", background: "linear-gradient(135deg, #1a1a1a, #2c2c2c)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
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

          <div className="px-4 pb-2 bg-[#faf8f6]">
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} disabled={loading}
                  className="text-[11px] border border-[#D4A574]/30 bg-white px-2.5 py-1.5 text-[#4a4a4a] hover:border-[#C4724B] hover:text-[#C4724B] hover:bg-[#fdf8f4] transition disabled:opacity-40 rounded-full"
                >{s}</button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#e5e0d8] p-3 bg-white flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Sorunuzu yazın..." className="flex-1 border border-[#e5e0d8] px-3 py-2.5 text-sm focus:outline-none focus:border-[#C4724B] rounded-full" disabled={loading} />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="text-white px-5 py-2.5 text-sm font-medium uppercase transition-all duration-500 hover:brightness-110 disabled:opacity-40 rounded-full"
              style={{
                background: "linear-gradient(90deg, #C4724B, #E8C4A0, #C4724B)",
                backgroundSize: "200% auto",
                animation: "copper-shimmer 3s linear infinite",
              }}>
              Gönder
            </button>
          </div>

          <div className="bg-[#f8f6f3] px-4 py-2.5 text-center border-t border-[#e5e0d8]">
            <Link href="/ai-barista" className="text-xs text-[#C4724B] hover:underline font-medium">Tam ekran Baş Barista →</Link>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #C4724B, #B0603A)",
          boxShadow: "0 4px 20px rgba(196, 114, 75, 0.4)",
        }}>
        {open ? (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <div className="relative w-full h-full">
            <Image src="/celsus/dijital-barista/barista d.png" alt="Barista" fill className="object-cover" />
            <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
        )}
      </button>
    </>
  );
}
