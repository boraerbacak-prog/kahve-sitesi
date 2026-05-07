"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/sepet")
        .then((r) => r.json())
        .then((d) => setItems(d.items))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  const removeItem = async (itemId: string) => {
    await fetch("/api/sepet", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-2xl text-amber-700 mb-4">Sepetiniz boş</p>
        <Link href="/giris" className="text-amber-800 underline">Giriş yapın</Link>
      </div>
    );
  }

  if (loading) return <div className="text-center py-16 text-amber-600">Yükleniyor...</div>;

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">Sepetim</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-amber-700 mb-4">Sepetiniz boş</p>
          <Link href="/urunler" className="bg-amber-600 text-white px-6 py-3 rounded-full">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-amber-100 p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center text-2xl">
                ☕
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">{item.product.name}</h3>
                <p className="text-sm text-amber-600">{item.quantity} x {item.product.price.toFixed(2)} ₺</p>
              </div>
              <p className="font-bold text-amber-900">{(item.product.price * item.quantity).toFixed(2)} ₺</p>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Sil
              </button>
            </div>
          ))}

          <div className="bg-white rounded-xl border border-amber-100 p-6 mt-6">
            <div className="flex justify-between text-lg font-bold text-amber-900">
              <span>Toplam</span>
              <span>{total.toFixed(2)} ₺</span>
            </div>
            <Link
              href="/odeme"
              className="mt-4 block w-full bg-amber-600 hover:bg-amber-500 text-white text-center py-3 rounded-full font-semibold transition"
            >
              Ödemeye Geç
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
