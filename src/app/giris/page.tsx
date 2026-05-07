"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("E-posta veya şifre hatalı");
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-amber-900 text-center mb-8">Giriş Yap</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8 space-y-4">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
        )}

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
          <label className="block text-sm font-medium text-amber-800 mb-1">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-amber-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-lg font-semibold transition"
        >
          Giriş Yap
        </button>

        <p className="text-center text-sm text-amber-600">
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="text-amber-800 font-medium hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </form>
    </div>
  );
}
