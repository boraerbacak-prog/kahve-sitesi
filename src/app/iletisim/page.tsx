"use client";
import { useState } from "react";

export default function IletisimPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/iletisim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) setSent(true);
    else setError(data.error || "Bir hata oluştu");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-heading mb-2">İletişim</h1>
      <p className="text-body mb-8">Sorularınız, önerileriniz veya iş birliği için bize ulaşın.</p>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-border p-6">
            <span className="text-lg block mb-1">📞</span>
            <h3 className="text-sm font-bold text-heading mb-1">Telefon</h3>
            <a href="tel:+908504607676" className="text-sm text-primary hover:underline">0850 460 76 76</a>
          </div>
          <div className="bg-white border border-border p-6">
            <span className="text-lg block mb-1">✉️</span>
            <h3 className="text-sm font-bold text-heading mb-1">E-posta</h3>
            <a href="mailto:info@rostello.com" className="text-sm text-primary hover:underline">info@rostello.com</a>
          </div>
          <div className="bg-white border border-border p-6">
            <span className="text-lg block mb-1">📍</span>
            <h3 className="text-sm font-bold text-heading mb-1">Adres</h3>
            <p className="text-sm text-body">Rostello Kavurum Evi, İstanbul</p>
          </div>
        </div>

        <div className="md:col-span-3">
          {sent ? (
            <div className="bg-white border border-border p-8 text-center">
              <span className="text-4xl block mb-4">✅</span>
              <h2 className="text-xl font-bold text-heading mb-2">Mesajınız Alındı</h2>
              <p className="text-body text-sm">En kısa sürede size dönüş yapacağız.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white border border-border p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1">Ad Soyad *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                    className="w-full border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">E-posta *</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                    className="w-full border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted mb-1">Telefon</label>
                  <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Konu *</label>
                  <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required
                    className="w-full border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Mesaj *</label>
                <textarea rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required
                  className="w-full border border-border p-2.5 rounded-lg text-sm focus:outline-none focus:border-primary" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit"
                className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-medium text-sm transition">
                Gönder
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
