"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleAdd = async () => {
    if (!session) {
      router.push("/giris");
      return;
    }
    await fetch("/api/sepet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    router.refresh();
  };

  return (
    <button
      onClick={handleAdd}
      className="mt-6 w-full bg-amber-600 hover:bg-amber-500 text-white py-3 px-6 rounded-full font-semibold transition"
    >
      Sepete Ekle
    </button>
  );
}
