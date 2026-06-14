"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SifirlaPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Şifreler eşleşmiyor"); return; }
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalı"); return; }

    const res = await fetch(`/api/auth/sifre-sifirla/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) setDone(true);
    else setError(data.error || "Bir hata oluştu");
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-heading mb-2 text-center">Yeni Şifre</h1>
        {done ? (
          <div className="bg-white border border-border p-8 text-center">
            <span className="text-4xl block mb-4">✅</span>
            <p className="text-sm text-body mb-4">Şifreniz başarıyla güncellendi.</p>
            <a href="/giris" className="text-primary hover:underline text-sm">Giriş Yap</a>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white border border-border p-8 space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Yeni şifre"
              className="w-full border border-border p-3 rounded-lg text-sm focus:outline-none focus:border-primary" />
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Şifre tekrar"
              className="w-full border border-border p-3 rounded-lg text-sm focus:outline-none focus:border-primary" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium text-sm transition">
              Kaydet
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
