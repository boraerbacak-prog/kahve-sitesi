"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

const menuItems = [
  { label: "Dijital Barista", href: "/" },
  {
    label: "Kahve", href: "/urunler",
    children: [
      { label: "Tüm Kahveler", href: "/urunler" },
      { label: "İmza Ürünler", href: "/imza-urunler" },
      { label: "Ekipmanlar", href: "/ekipmanlar" },
    ],
  },
  { label: "Kahveni Bul", href: "/damak-testi" },
  { label: "Demleme Yöntemleri", href: "/demleme" },
  { label: "Abonelik", href: "/abonelik" },
  { label: "B2B", href: "/b2b" },
  { label: "Blog", href: "/blog" },
];

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);

  return (
    <header className="border-b border-[#e5e0d8] bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl font-bold tracking-tight text-[#1a1a1a]">
              <span className="text-[#C4724B]">✦</span> Rostello
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setDropdown(item.label)}
                onMouseLeave={() => setDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-[#1a1a1a] hover:text-[#C4724B] transition tracking-wide uppercase rounded hover:bg-[#f8f6f3]"
                >
                  {item.label}
                </Link>
                {item.children && dropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e0d8] shadow-lg min-w-[200px] py-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-5 py-2.5 text-sm text-[#1a1a1a] hover:text-[#C4724B] hover:bg-[#f8f6f3] transition"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/sepet" className="text-[#1a1a1a] hover:text-[#C4724B] transition p-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </Link>
            {session ? (
              <Link href="/admin" className="text-sm font-medium text-[#1a1a1a] hover:text-[#C4724B] transition px-3 py-2">
                Panel
              </Link>
            ) : (
              <Link href="/giris" className="text-sm font-medium text-[#1a1a1a] hover:text-[#C4724B] transition px-3 py-2">
                Giriş
              </Link>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-[#1a1a1a]">
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
          <div className="lg:hidden pb-6 border-t border-[#e5e0d8] pt-6">
            <div className="flex flex-col gap-3">
              {menuItems.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-[#1a1a1a] hover:text-[#C4724B] transition block py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-4 flex flex-col gap-1 mt-1 mb-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="text-sm text-[#8c8c8c] hover:text-[#C4724B] transition block py-1"
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="border-t border-[#e5e0d8] pt-3 mt-2">
                <Link href="/sepet" className="text-sm font-medium text-[#1a1a1a] block py-2" onClick={() => setMenuOpen(false)}>Sepet</Link>
                {session ? (
                  <Link href="/admin" className="text-sm font-medium text-[#1a1a1a] block py-2" onClick={() => setMenuOpen(false)}>Panel</Link>
                ) : (
                  <Link href="/giris" className="text-sm font-medium text-[#1a1a1a] block py-2" onClick={() => setMenuOpen(false)}>Giriş</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
