"use client";

import { useState, FormEvent } from "react";

export default function FreshnessNotifyButton({
  productId,
  productName,
  compact,
}: {
  productId: string;
  productName: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/freshness-bildirim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productId }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Bildirim kaydınız alındı! Zirve döneminde size haber vereceğiz.");
      } else {
        setStatus("error");
        setMessage("Bir hata oluştu, lütfen tekrar deneyin.");
      }
    } catch {
      setStatus("error");
      setMessage("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  }

  const isLoading = status === "loading";

  if (status === "success") {
    const msg = <span className={compact ? "text-[10px] text-green-600" : "text-xs text-green-600"}>{message}</span>;
    return compact ? <div className="relative">{msg}</div> : <div className="mt-3">{msg}</div>;
  }

  if (status === "error") {
    const msg = <span className={compact ? "text-[10px] text-red-600" : "text-xs text-red-600"}>{message}</span>;
    return compact ? <div className="relative">{msg}</div> : <div className="mt-3">{msg}</div>;
  }

  if (compact) {
    return (
      <div className="relative">
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="text-[10px] text-primary hover:underline font-medium">
            🔔 Tazelik Bildirimi Al
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz"
              required
              className="text-[10px] px-1.5 py-1 border border-border bg-white w-36 outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="text-[10px] px-2 py-1 bg-primary text-white font-medium hover:bg-primary-hover transition disabled:opacity-50"
            >
              {isLoading ? "..." : "Kaydet"}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="text-xs text-primary hover:underline font-medium">
          🔔 Bu kahve için tazelik bildirimi al
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            required
            className="text-xs px-2 py-1.5 border border-border bg-white w-48 outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="text-xs px-3 py-1.5 bg-primary text-white font-medium hover:bg-primary-hover transition disabled:opacity-50"
          >
            {isLoading ? "..." : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setEmail(""); }}
            className="text-xs text-muted hover:text-heading"
          >
            İptal
          </button>
        </form>
      )}
    </div>
  );
}
