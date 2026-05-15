"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OutOfStockNotifier({ productId, productName }: { productId: string; productName: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch("/api/stok-bildirim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), productId, productName }),
      });
      setSent(true);
    } catch {}
  };

  const router = useRouter();

  return (
    <div className="mt-6 p-6 bg-[#fef6f5] border border-red-200">
      <p className="text-sm font-semibold text-red-700 mb-1">Bu ürün şu an tükendi.</p>
      <p className="text-xs text-red-600 mb-4">Stoklara girdiğimizde haber verelim.</p>

      {sent ? (
        <p className="text-sm text-green-700 font-medium">Teşekkürler! Stoklara girince size bildireceğiz.</p>
      ) : (
        <form onSubmit={handleNotify} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            className="flex-1 border border-red-300 px-3 py-2 text-sm focus:outline-none focus:border-red-500"
            required
          />
          <button type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition"
          >
            Haber Ver
          </button>
        </form>
      )}

      <div className="mt-3 pt-3 border-t border-red-100">
        <button
          onClick={() => router.push("/ai-barista")}
          className="text-xs text-red-600 hover:underline"
        >
          Stello Barista&apos;ya sor → hangi alternatif kahveyi önereceğini öğrenin
        </button>
      </div>
    </div>
  );
}
