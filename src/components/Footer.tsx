"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

interface MenuItemType { id: string; label: string; href: string; children?: MenuItemType[]; }

function InstagramIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  );
}

function YoutubeIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subError, setSubError] = useState("");
  const [footerMenus, setFooterMenus] = useState<MenuItemType[]>([]);

  useEffect(() => {
    fetch("/api/public/menus?group=footer").then(r => r.json()).then(d => {
      if (d.items) setFooterMenus(d.items);
    });
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setSubError("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      } else {
        setSubError(data.error || "Bir hata oluştu.");
      }
    } catch {
      setSubError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="border-t border-border bg-white mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 pb-12 border-b border-border">
          <div className="col-span-2 md:col-span-1">
            <div className="relative w-28 lg:w-44" style={{ aspectRatio: "1380/752" }}>
              <Image src="/logo.png" alt="Rostello" fill className="object-contain object-left" />
            </div>
            <p className="text-sm text-body/70 mt-3 leading-relaxed max-w-xs">
              En taze özel kahve çekirdekleri, özenle kavrulur.
            </p>
            <div className="mt-5">
              <h4 className="text-sm tracking-[0.2em] uppercase text-body/60 font-medium mb-2">E-Bülten</h4>
              {subscribed ? (
                <p className="text-xs text-primary font-medium">Abone olduğunuz için teşekkürler!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta adresiniz" className="flex-1 border border-border px-3 py-2 text-xs focus:outline-none focus:border-primary bg-white" disabled={subscribing} />
                  <button type="submit" disabled={subscribing || !email.trim()} className="bg-primary hover:bg-primary-hover text-white px-3 py-2 text-xs font-medium uppercase tracking-wider transition disabled:opacity-50">
                    {subscribing ? "..." : "→"}
                  </button>
                </form>
              )}
              {subError && <p className="text-xs text-red-500 mt-1">{subError}</p>}
            </div>
          </div>

          {footerMenus.map(menu => (
            <div key={menu.id}>
              <h3 className="text-sm tracking-[0.2em] uppercase text-body/60 font-medium mb-4">{menu.label}</h3>
              <div className="flex flex-col gap-2.5">
                {(menu.children || []).map(child => (
                  <Link key={child.id} href={child.href} className="text-sm text-body/60 hover:text-primary transition hover:-translate-y-0.5 block">{child.label}</Link>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-sm tracking-[0.2em] uppercase text-body/60 font-medium mb-4">İletişim</h3>
            <div className="flex flex-col gap-2.5 text-sm text-body/60">
              <a href="tel:+908504607676" className="hover:text-primary transition hover:-translate-y-0.5 block font-semibold text-body">0850 460 76 76</a>
              <a href="mailto:info@rostello.com" className="hover:text-primary transition hover:-translate-y-0.5 block">info@rostello.com</a>
              <span className="text-sm text-body/50 mt-1">Hafta İçi 10:00 - 19:00</span>
            </div>
            <div className="mt-5">
              <h4 className="text-sm tracking-[0.2em] uppercase text-body/60 font-medium mb-3">Sosyal Medya</h4>
              <div className="flex gap-3">
                <a href="https://instagram.com/rostello" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-body/50 hover:bg-primary hover:text-white hover:border-primary transition hover:-translate-y-0.5" aria-label="Instagram"><InstagramIcon /></a>
                <a href="https://x.com/rostello" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-body/50 hover:bg-primary hover:text-white hover:border-primary transition hover:-translate-y-0.5" aria-label="X"><XIcon /></a>
                <a href="https://facebook.com/rostello" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-body/50 hover:bg-primary hover:text-white hover:border-primary transition hover:-translate-y-0.5" aria-label="Facebook"><FacebookIcon /></a>
                <a href="https://youtube.com/@rostello" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-body/50 hover:bg-primary hover:text-white hover:border-primary transition hover:-translate-y-0.5" aria-label="YouTube"><YoutubeIcon /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          <p className="text-xs text-body/50">&copy; {new Date().getFullYear()} Rostello. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <Link href="/hikaye" className="text-xs text-body/50 hover:text-primary transition">Hakkımızda</Link>
            <Link href="/sss" className="text-xs text-body/50 hover:text-primary transition">S.S.S.</Link>
            <Link href="/iletisim" className="text-xs text-body/50 hover:text-primary transition">İletişim</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
