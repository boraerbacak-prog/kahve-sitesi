"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Msg { role: "user" | "assistant"; content: string; }

const suggestions = [
  "Bana kahve öner",
  "Sütlü kahve önerir misin?",
  "Abonelik paketlerini anlat",
  "Kahveni Bul testini yap",
];

function fmt(content: string) {
  const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const m = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (m) return <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-[#C4724B] underline hover:text-[#B0603A] transition text-xs">{m[1]}</a>;
    return <span key={i} className="text-xs">{part}</span>;
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
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white border border-[#e5e0d8] shadow-2xl flex flex-col" style={{ maxHeight: "500px" }}>
          <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#C4724B] flex items-center justify-center text-white font-bold text-[10px]">RB</div>
              <span className="text-white text-xs font-semibold">Baş Barista</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white text-lg leading-none">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: "200px", maxHeight: "320px" }}>
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 ${m.role === "user" ? "bg-[#f8f6f3] border border-[#e5e0d8]" : "bg-[#1a1a1a] text-white"}`}>
                  <div className="leading-relaxed [&_a]:text-[#C4724B] [&_a]:underline">{fmt(m.content)}</div>
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-[#8c8c8c]">Yazıyor...</div>}
            <div ref={bottomRef} />
          </div>
          {msgs.length <= 2 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} disabled={loading}
                  className="text-[10px] border border-[#e5e0d8] px-2 py-1 text-[#4a4a4a] hover:border-[#C4724B] hover:text-[#C4724B] transition disabled:opacity-40"
                >{s}</button>
              ))}
            </div>
          )}
          <div className="border-t border-[#e5e0d8] p-3 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Sorunuzu yazın..." className="flex-1 border border-[#e5e0d8] px-3 py-2 text-xs focus:outline-none focus:border-[#C4724B]" disabled={loading} />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="bg-[#C4724B] hover:bg-[#B0603A] disabled:bg-[#E8C4A0] text-white px-4 py-2 text-xs font-medium uppercase transition">Gönder</button>
          </div>
          <div className="bg-[#f8f6f3] px-3 py-1.5 text-center">
            <Link href="/ai-barista" className="text-[10px] text-[#C4724B] hover:underline">Tam ekran Barista →</Link>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#C4724B] hover:bg-[#B0603A] text-white shadow-xl flex items-center justify-center transition hover:scale-105">
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>
    </>
  );
}
