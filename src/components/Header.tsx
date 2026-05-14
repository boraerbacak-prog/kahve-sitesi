"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/lib/cart-context";

interface MenuItem {
  id: string; label: string; href: string; parentId: string | null;
  sortOrder: number; isVisible: boolean; icon: string | null;
  children?: MenuItem[];
}

export default function Header() {
  const { data: session } = useSession();
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/menus").then(r => r.json()).then(d => {
      if (d.items) setMenuItems(d.items.filter((i: MenuItem) => i.isVisible));
    });
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/urunler?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const [bannerClosed, setBannerClosed] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-[#e5e0d8]">
      {!bannerClosed && (
        <div className="bg-[#2c1810] text-white text-xs text-center py-2 px-4 flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
          <span><strong className="font-semibold">890₺</strong> üzeri alışverişlerde <strong className="font-semibold">ücretsiz kargo</strong></span>
          <button onClick={() => setBannerClosed(true)} className="ml-2 text-white/60 hover:text-white transition shrink-0" aria-label="Kapat">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-28 lg:h-36">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-28 lg:w-52" style={{ aspectRatio: "1380/752" }}>
              <Image src="/logo.png" alt="Rostello" fill className="object-contain object-left" />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 animate-fade-in">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setDropdown(item.label)}
                onMouseLeave={() => setDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-[#1a1a1a] hover:text-[#C4724B] transition tracking-wide uppercase rounded hover:bg-[#f8f6f3] hover:-translate-y-0.5"
                >
                  {item.label}
                </Link>
                {item.children && item.children.length > 0 && dropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e0d8] shadow-lg min-w-[200px] py-2">
                    {item.children.filter(c => c.isVisible).map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className="block px-5 py-2.5 text-sm text-[#1a1a1a] hover:text-[#C4724B] hover:bg-[#f8f6f3] transition hover:-translate-y-0.5"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">

            {/* Cart */}
            <button onClick={openCart} className="p-2 text-[#1a1a1a] hover:text-[#C4724B] transition hover:scale-110 relative" aria-label="Sepet">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#C4724B] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {count}
                </span>
              )}
            </button>

            {/* Login / Register - Desktop */}
            <div className="hidden lg:flex items-center gap-2 ml-2">
                {session ? (
                  <>
                    <Link
                      href="/hesabim"
                      className="text-xs font-medium text-[#1a1a1a] border border-[#1a1a1a] px-4 py-2 hover:bg-[#1a1a1a] hover:text-white transition uppercase tracking-wider"
                    >
                      Hesabım
                    </Link>
                  </>
                ) : (
                <>
                  <Link
                    href="/giris"
                    className="text-xs font-medium text-[#1a1a1a] border border-[#1a1a1a] px-4 py-2 hover:bg-[#1a1a1a] hover:text-white transition uppercase tracking-wider"
                  >
                    Giriş
                  </Link>
                  <Link
                    href="/kayit"
                    className="text-xs font-medium text-white bg-[#C4724B] hover:bg-[#B0603A] px-4 py-2 transition hover:-translate-y-0.5 hover:shadow-lg uppercase tracking-wider"
                  >
                    Üye Ol
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
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
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden pb-6 border-t border-[#e5e0d8] pt-6">
            <div className="flex flex-col gap-3">

              {menuItems.map((item) => (
                <div key={item.id}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-[#1a1a1a] hover:text-[#C4724B] transition hover:-translate-y-0.5 block py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <div className="pl-4 flex flex-col gap-1 mt-1 mb-2">
                      {item.children.filter(c => c.isVisible).map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className="text-sm text-[#8c8c8c] hover:text-[#C4724B] transition hover:-translate-y-0.5 block py-1"
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="border-t border-[#e5e0d8] pt-4 mt-2 flex flex-col gap-2">
                <button onClick={() => { openCart(); setMenuOpen(false); }} className="text-sm font-medium text-[#1a1a1a] hover:text-[#C4724B] transition block py-2 w-full text-left">
                  Sepet {count > 0 ? `(${count})` : ""}
                </button>
                {session ? (
                  <>
                    <Link href="/hesabim" className="block w-full text-center border border-[#1a1a1a] text-[#1a1a1a] text-sm font-medium py-3 transition" onClick={() => setMenuOpen(false)}>Hesabım</Link>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/giris" className="flex-1 text-center border border-[#1a1a1a] text-[#1a1a1a] text-sm font-medium py-3 transition" onClick={() => setMenuOpen(false)}>Giriş</Link>
                    <Link href="/kayit" className="flex-1 text-center bg-[#C4724B] text-white text-sm font-medium py-3 transition hover:-translate-y-0.5 hover:shadow-lg" onClick={() => setMenuOpen(false)}>Üye Ol</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
