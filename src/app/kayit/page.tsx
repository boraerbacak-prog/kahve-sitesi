"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [inviter, setInviter] = useState("");
  const [referralInput, setReferralInput] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "";

  useEffect(() => {
    if (ref) {
      setInviter("Bir arkadaşın seni davet etti! İlk alışverişinde %10 indirim kazan.");
    }
  }, [ref]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const finalRef = ref || referralInput.trim() || undefined;

    const res = await fetch("/api/auth/kayit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, ref: finalRef }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Bir hata oluştu");
      return;
    }

    router.push("/giris");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-amber-900 text-center mb-8">Kayıt Ol</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8 space-y-4">
        {inviter && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 text-center">
            {inviter}
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-amber-800 mb-1">Ad Soyad</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-800 mb-1">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-800 mb-1">Referans Kodu (isteğe bağlı)</label>
          <input
            type="text"
            value={referralInput}
            onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
            placeholder="ROST-XXXXXX"
            className="w-full border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
            disabled={!!ref}
          />
          {ref && <p className="text-xs text-green-600 mt-1">Kod URL'den alındı</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-800 mb-1">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-lg font-semibold transition"
        >
          Kayıt Ol
        </button>

        <p className="text-center text-sm text-amber-600">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="text-amber-800 font-medium hover:underline">
            Giriş Yap
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
