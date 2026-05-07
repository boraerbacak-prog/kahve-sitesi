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
      content: "Merhaba! ☕ Ben Kahveci'nin AI Baristasıyım. Size hangi kahveyi önerebilirim? Damak tadınızı anlatın, size en uygun kahveyi bulayım!",
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="text-6xl block mb-4">🤖☕</span>
        <h1 className="text-3xl font-bold text-amber-900">AI Barista</h1>
        <p className="text-amber-600 mt-2">Kahve uzmanı yapay zekamıza istediğinizi sorun</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-amber-600 text-white rounded-br-md"
                    : "bg-amber-50 text-amber-900 rounded-bl-md"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-amber-50 rounded-2xl rounded-bl-md px-4 py-3">
                <p className="text-amber-600">☕ Düşünüyor...</p>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-amber-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Kahve tercihlerinizi anlatın..."
              className="flex-1 border border-amber-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-amber-300 text-white px-6 py-2 rounded-full font-medium transition"
            >
              Gönder
            </button>
          </div>
          {!session && (
            <p className="text-xs text-amber-500 mt-2 text-center">
              Sohbet geçmişi için giriş yapın. Giriş yapmadan da kullanabilirsiniz.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
