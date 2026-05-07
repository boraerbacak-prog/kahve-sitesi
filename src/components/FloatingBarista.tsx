"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Msg { role: "user" | "assistant"; content: string; }

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
    if (m) return <a key={i} href={m[2]} className="text-[#C4724B] underline hover:text-[#B0603A] transition">{m[1]}</a>;
    return <span key={i}>{part}</span>;
  });
}

export default function FloatingBarista() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Merhaba! ☕ Size nasıl yardımcı olabilirim?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMsgs((p) => [...p, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const r = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg }) });
      const d = await r.json();
      setMsgs((p) => [...p, { role: "assistant", content: d.reply }]);
    } catch {
      setMsgs((p) => [...p, { role: "assistant", content: "Bağlantı hatası." }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-28 right-6 z-50 w-[28rem] max-w-[calc(100vw-3rem)] bg-white border border-[#e5e0d8] shadow-2xl flex flex-col" style={{ maxHeight: "600px" }}>
          <div className="bg-[#1a1a1a] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C4724B] flex items-center justify-center text-white font-bold text-sm">RB</div>
              <div>
                <div className="text-white font-semibold text-sm">Rostello Baş Barista</div>
                <div className="text-white/50 text-[10px]">Çevrimiçi</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white text-xl leading-none">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "250px", maxHeight: "350px" }}>
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#C4724B] flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-1 mr-2">RB</div>
                )}
                <div className={`max-w-[80%] px-4 py-2.5 ${m.role === "user" ? "bg-[#f8f6f3] border border-[#e5e0d8]" : "bg-[#1a1a1a] text-white"}`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap [&_a]:text-[#C4724B] [&_a]:underline [&_strong]:text-[#E8C4A0]">{fmt(m.content)}</div>
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-[#8c8c8c] ml-9">Yazıyor...</div>}
            <div ref={bottomRef} />
          </div>
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} disabled={loading}
                  className="text-[11px] border border-[#e5e0d8] px-2.5 py-1.5 text-[#4a4a4a] hover:border-[#C4724B] hover:text-[#C4724B] hover:bg-[#fdf8f4] transition disabled:opacity-40 rounded-sm"
                >{s}</button>
              ))}
            </div>
          </div>
          <div className="border-t border-[#e5e0d8] p-3 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Ya da sorunuzu yazın..." className="flex-1 border border-[#e5e0d8] px-3 py-2.5 text-sm focus:outline-none focus:border-[#C4724B]" disabled={loading} />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="bg-[#C4724B] hover:bg-[#B0603A] disabled:bg-[#E8C4A0] text-white px-5 py-2.5 text-sm font-medium uppercase transition">Gönder</button>
          </div>
          <div className="bg-[#f8f6f3] px-4 py-2 text-center border-t border-[#e5e0d8]">
            <Link href="/ai-barista" className="text-xs text-[#C4724B] hover:underline font-medium">Tam ekran Baş Barista →</Link>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[#C4724B] hover:bg-[#B0603A] text-white shadow-2xl flex items-center justify-center transition hover:scale-110 active:scale-95">
        {open ? (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <div className="relative">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
        )}
      </button>
    </>
  );
}
