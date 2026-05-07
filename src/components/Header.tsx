"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-[#e5e0d8] bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#1a1a1a]">
            <span className="text-[#c8a77b]">✦</span> Rostello
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            <Link href="/" className="text-sm font-medium text-[#1a1a1a] hover:text-[#c8a77b] transition tracking-wide uppercase">
              Ana Sayfa
            </Link>
            <Link href="/urunler" className="text-sm font-medium text-[#1a1a1a] hover:text-[#c8a77b] transition tracking-wide uppercase">
              Kahveler
            </Link>
            <Link href="/ai-barista" className="text-sm font-medium text-[#1a1a1a] hover:text-[#c8a77b] transition tracking-wide uppercase">
              AI Barista
            </Link>
            <Link href="/hikaye" className="text-sm font-medium text-[#1a1a1a] hover:text-[#c8a77b] transition tracking-wide uppercase">
              Hikayemiz
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/sepet" className="text-[#1a1a1a] hover:text-[#c8a77b] transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </Link>
            {session ? (
              <Link href="/admin" className="text-sm font-medium text-[#1a1a1a] hover:text-[#c8a77b] transition">
                Panel
              </Link>
            ) : (
              <Link href="/giris" className="text-sm font-medium text-[#1a1a1a] hover:text-[#c8a77b] transition">
                Giriş
              </Link>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-[#1a1a1a]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-6 border-t border-[#e5e0d8] pt-6">
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-sm font-medium text-[#1a1a1a]" onClick={() => setMenuOpen(false)}>Ana Sayfa</Link>
              <Link href="/urunler" className="text-sm font-medium text-[#1a1a1a]" onClick={() => setMenuOpen(false)}>Kahveler</Link>
              <Link href="/ai-barista" className="text-sm font-medium text-[#1a1a1a]" onClick={() => setMenuOpen(false)}>AI Barista</Link>
              <Link href="/sepet" className="text-sm font-medium text-[#1a1a1a]" onClick={() => setMenuOpen(false)}>Sepet</Link>
              {session ? (
                <Link href="/admin" className="text-sm font-medium text-[#1a1a1a]" onClick={() => setMenuOpen(false)}>Panel</Link>
              ) : (
                <Link href="/giris" className="text-sm font-medium text-[#1a1a1a]" onClick={() => setMenuOpen(false)}>Giriş</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
