"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminTemaPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => { if (d.settings) setSettings(d.settings); });
  }, []);

  const update = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings, group: "theme" }),
    });
    setSaving(false);
  };

  const defaults = {
    primary_color: "#C4724B",
    secondary_color: "#1a1a1a",
    accent_color: "#B0603A",
    bg_color: "#f8f6f3",
    text_color: "#1a1a1a",
    text_muted: "#8c8c8c",
    border_color: "#e5e0d8",
    font_heading: "Geist",
    font_body: "Geist",
    site_title: "Rostello - Özel Kahve",
    site_description: "En taze özel kahve çekirdekleri, özenle kavrulur.",
    header_bg: "white",
    header_sticky: "true",
    footer_text: "© 2026 Rostello. Tüm hakları saklıdır.",
    button_radius: "0",
    button_style: "solid",
  };

  const allKeys = { ...defaults, ...settings };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Tema Ayarları</h1>

      <div className="bg-white rounded-xl border border-amber-100 p-6 space-y-6">
        <section>
          <h2 className="text-lg font-bold text-amber-900 mb-3">Renkler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              ["primary_color", "Ana Renk", "#C4724B"],
              ["secondary_color", "İkincil Renk", "#1a1a1a"],
              ["accent_color", "Vurgu Rengi", "#B0603A"],
              ["bg_color", "Arka Plan", "#f8f6f3"],
              ["text_color", "Yazı Rengi", "#1a1a1a"],
              ["text_muted", "Soluk Yazı", "#8c8c8c"],
              ["border_color", "Kenarlık", "#e5e0d8"],
              ["header_bg", "Header Arka Plan", "white"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs text-gray-600 mb-1">{label}</label>
                <div className="flex gap-2">
                  <input type="color" value={allKeys[key] || defaults[key as keyof typeof defaults]}
                    onChange={e => update(key, e.target.value)} className="w-10 h-10 p-0.5 border rounded cursor-pointer" />
                  <input type="text" value={allKeys[key] || ""}
                    onChange={e => update(key, e.target.value)}
                    className="flex-1 border border-amber-200 p-2 rounded text-sm focus:outline-none focus:border-amber-500" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-amber-100" />

        <section>
          <h2 className="text-lg font-bold text-amber-900 mb-3">Yazı Tipleri</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Başlık Fontu</label>
              <select value={allKeys.font_heading} onChange={e => update("font_heading", e.target.value)}
                className="w-full border border-amber-200 p-2.5 rounded text-sm">
                <option value="Geist">Geist</option>
                <option value="Inter">Inter</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Lora">Lora</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Gövde Fontu</label>
              <select value={allKeys.font_body} onChange={e => update("font_body", e.target.value)}
                className="w-full border border-amber-200 p-2.5 rounded text-sm">
                <option value="Geist">Geist</option>
                <option value="Inter">Inter</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Lora">Lora</option>
              </select>
            </div>
          </div>
        </section>

        <hr className="border-amber-100" />

        <section>
          <h2 className="text-lg font-bold text-amber-900 mb-3">Site Bilgileri</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Site Başlığı</label>
              <input type="text" value={allKeys.site_title} onChange={e => update("site_title", e.target.value)}
                className="w-full border border-amber-200 p-2.5 rounded text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Site Açıklaması</label>
              <input type="text" value={allKeys.site_description} onChange={e => update("site_description", e.target.value)}
                className="w-full border border-amber-200 p-2.5 rounded text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Footer Metni</label>
              <input type="text" value={allKeys.footer_text} onChange={e => update("footer_text", e.target.value)}
                className="w-full border border-amber-200 p-2.5 rounded text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Buton Stili</label>
                <select value={allKeys.button_style} onChange={e => update("button_style", e.target.value)}
                  className="w-full border border-amber-200 p-2.5 rounded text-sm">
                  <option value="solid">Dolu</option>
                  <option value="outline">Çerçeve</option>
                  <option value="ghost">Ghost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Buton Köşe</label>
                <select value={allKeys.button_radius} onChange={e => update("button_radius", e.target.value)}
                  className="w-full border border-amber-200 p-2.5 rounded text-sm">
                  <option value="0">Keskin</option>
                  <option value="4">Hafif Yuvarlak</option>
                  <option value="8">Yuvarlak</option>
                  <option value="9999">Tam Yuvarlak</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <button onClick={save} disabled={saving}
          className="bg-amber-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-amber-500 transition disabled:opacity-50"
        >{saving ? "Kaydediliyor..." : "Ayarları Kaydet"}</button>
      </div>
    </div>
  );
}
