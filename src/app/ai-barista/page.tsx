"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIBaristaPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Merhaba! ☕ Ben Rostello'nun Dijital Baristasıyım. Size hangi kahveyi önerebilirim? Damak tadınızı anlatın, size en uygun kahveyi bulayım!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          threadId,
        }),
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
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Dijital Barista</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">Yapay Zeka ile Kahve Keşfi</h1>
        <p className="text-[#4a4a4a] max-w-lg mx-auto">
          Damak tadınıza en uygun kahveyi bulmak için kişisel baristanızla konuşun.
        </p>
      </div>

      <div className="bg-white border border-[#e5e0d8] overflow-hidden">
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-5 py-3 ${
                  msg.role === "user"
                    ? "bg-[#f8f6f3] text-[#1a1a1a] border border-[#e5e0d8]"
                    : "bg-[#1a1a1a] text-white"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
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
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-[#C4724B] hover:bg-[#B0603A] disabled:bg-[#E8C4A0] text-white px-8 py-3 text-sm font-medium tracking-wide uppercase transition"
            >
              Gönder
            </button>
          </div>
          {!session && (
            <p className="text-xs text-[#8c8c8c] mt-3 text-center">
              Sohbet geçmişi için giriş yapın. Giriş yapmadan da kullanabilirsiniz.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
