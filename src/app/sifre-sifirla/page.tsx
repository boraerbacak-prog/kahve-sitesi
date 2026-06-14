"use client";
import { useState } from "react";
import Link from "next/link";

export default function SifreSifirlaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/auth/sifre-sifirla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-heading mb-2 text-center">Şifre Sıfırlama</h1>
        {sent ? (
          <div className="bg-white border border-border p-8 text-center">
            <span className="text-4xl block mb-4">📧</span>
            <p className="text-sm text-body">E-posta adresinize şifre sıfırlama bağlantısı gönderildi.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white border border-border p-8 space-y-4">
            <p className="text-sm text-body">E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="E-posta adresiniz"
              className="w-full border border-border p-3 rounded-lg text-sm focus:outline-none focus:border-primary" />
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-medium text-sm transition">
              Gönder
            </button>
            <Link href="/giris" className="block text-center text-xs text-muted hover:text-primary transition">Girişe Dön</Link>
          </form>
        )}
      </div>
    </div>
  );
}
