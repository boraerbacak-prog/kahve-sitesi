"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  threadId: string | null;
  loading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const STORAGE_KEY = "rostello_chat_messages";
const THREAD_KEY = "rostello_chat_thread";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function ChatProvider({ children }: { children: ReactNode }) {
  function ilkMesaj(): string {
    const h = new Date().getHours();
    const selam = h < 12 ? "Günaydın!" : h < 18 ? "Tünaydın!" : "İyi akşamlar!";
    return `${selam} Ben Stello, Rostello'nun dijital baristasıyım. ☕ Sana en iyi kahveyi bulmak için buradayım. Şu anki bardağında ne içmek istersin?`;
  }

  const saved = loadFromStorage<ChatMessage[] | null>(STORAGE_KEY, null);
  const [messages, setMessages] = useState<ChatMessage[]>(
    saved && saved.length > 0 ? saved : [{ role: "assistant" as const, content: ilkMesaj() }]
  );
  const [threadId, setThreadId] = useState<string | null>(
    loadFromStorage<string | null>(THREAD_KEY, null)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    saveToStorage(STORAGE_KEY, messages);
  }, [messages]);

  useEffect(() => {
    saveToStorage(THREAD_KEY, threadId);
  }, [threadId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, threadId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (data.threadId) setThreadId(data.threadId);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply || data.error || "Bir hata oluştu." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Bağlantı hatası. Lütfen tekrar dene." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, threadId]);

  const clearHistory = useCallback(() => {
    setMessages([{ role: "assistant", content: ilkMesaj() }]);
    setThreadId(null);
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(THREAD_KEY); } catch {}
  }, []);

  return (
    <ChatContext.Provider value={{ messages, threadId, loading, sendMessage, clearHistory }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}