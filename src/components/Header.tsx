"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/lib/cart-context";

interface MenuItemType { id: string; label: string; href: string; children?: MenuItemType[]; }

export default function Header() {
  const { data: session } = useSession();
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [bannerClosed, setBannerClosed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);

  useEffect(() => {
    fetch("/api/public/menus?group=header").then(r => r.json()).then(d => {
      if (d.items) setMenuItems(d.items);
    });
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); } };
    window.addEventListener("keydown", handler);
    if (searchRef.current) searchRef.current.focus();
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      window.location.href = `/urunler?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
    <header className="bg-white sticky top-0 z-[60] border-b border-border">
      {!bannerClosed && (
        <div className="bg-primary text-white text-xs text-center py-1.5 px-4 flex items-center justify-center gap-2">
          <span><strong>1.000₺</strong> üzeri alışverişlerde <strong>ücretsiz kargo</strong></span>
          <button onClick={() => setBannerClosed(true)} className="text-white/40 hover:text-white transition ml-1" aria-label="Kapat">X</button>
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
            {menuItems.map(item => (
              item.children && item.children.length > 0 ? (
                <div key={item.id} className="relative" onMouseEnter={() => setDropdown(item.label)} onMouseLeave={() => setDropdown(null)}>
                  <Link href={item.href} className="px-3 py-2 text-sm font-medium text-heading hover:text-primary transition tracking-wide uppercase rounded hover:bg-page-hover hover:-translate-y-0.5">
                    {item.label}
                  </Link>
                  {dropdown === item.label && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-border shadow-lg min-w-[180px] py-2">
                      {item.children.map(child => (
                        <Link key={child.id} href={child.href} className="block px-5 py-2.5 text-sm text-heading hover:text-primary hover:bg-page-hover transition">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.id} href={item.href} className="px-3 py-2 text-sm font-medium text-heading hover:text-primary transition tracking-wide uppercase rounded hover:bg-page-hover hover:-translate-y-0.5">
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={openCart} className="p-2 text-heading hover:text-primary transition hover:scale-110 relative" aria-label="Sepet">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {count}
                </span>
              )}
            </button>

            <button onClick={() => setSearchOpen(true)} className="hidden lg:flex p-2 text-heading hover:text-primary transition hover:scale-110" aria-label="Ara">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            <div className="hidden lg:flex items-center gap-2 ml-2">
                {session ? (
                  <>
                    <Link href="/hesabim" className="text-xs font-medium text-heading border border-heading px-4 py-2 hover:bg-heading hover:text-white transition uppercase tracking-wider">Hesabım</Link>
                  </>
                ) : (
                <>
                  <Link href="/giris" className="text-xs font-medium text-heading border border-heading px-4 py-2 hover:bg-heading hover:text-white transition uppercase tracking-wider">Giriş</Link>
                  <Link href="/kayit" className="text-xs font-medium text-white bg-primary hover:bg-primary-hover px-4 py-2 transition hover:-translate-y-0.5 hover:shadow-lg uppercase tracking-wider">Üye Ol</Link>
                </>
              )}
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-heading">
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

        {menuOpen && (
          <div className="lg:hidden pb-6 border-t border-border pt-6">
            <div className="flex flex-col gap-3">
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const q = fd.get("q")?.toString().trim(); if (q) { setMenuOpen(false); window.location.href = `/urunler?q=${encodeURIComponent(q)}`; } }} className="flex items-center border border-border mb-2">
                <input type="text" name="q" placeholder="Ara..." className="flex-1 px-3 py-2.5 text-sm text-body placeholder-[#b0b0b0] focus:outline-none bg-transparent" />
                <button type="submit" className="px-3 text-muted hover:text-primary transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
              </form>

              {menuItems.map(item => (
                item.children && item.children.length > 0 ? (
                  <div key={item.id}>
                    <button onClick={() => setMobileSubmenu(mobileSubmenu === item.label ? null : item.label)} className="text-sm font-medium text-heading hover:text-primary transition block py-2 w-full text-left">
                      {item.label} {mobileSubmenu === item.label ? "−" : "+"}
                    </button>
                    {mobileSubmenu === item.label && (
                      <div className="pl-4 flex flex-col gap-1 mb-2">
                        {item.children.map(child => (
                          <Link key={child.id} href={child.href} className="text-sm text-muted hover:text-primary transition block py-1.5" onClick={() => setMenuOpen(false)}>{child.label}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link key={item.id} href={item.href} className="text-sm font-medium text-heading hover:text-primary transition hover:-translate-y-0.5 block py-2" onClick={() => setMenuOpen(false)}>{item.label}</Link>
                )
              ))}

              <div className="border-t border-border pt-4 mt-2 flex flex-col gap-2">
                <button onClick={() => { openCart(); setMenuOpen(false); }} className="text-sm font-medium text-heading hover:text-primary transition block py-2 w-full text-left">Sepet {count > 0 ? `(${count})` : ""}</button>
                {session ? (
                  <Link href="/hesabim" className="block w-full text-center border border-heading text-heading text-sm font-medium py-3 transition" onClick={() => setMenuOpen(false)}>Hesabım</Link>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/giris" className="flex-1 text-center border border-heading text-heading text-sm font-medium py-3 transition" onClick={() => setMenuOpen(false)}>Giriş</Link>
                    <Link href="/kayit" className="flex-1 text-center bg-primary text-white text-sm font-medium py-3 transition hover:-translate-y-0.5 hover:shadow-lg" onClick={() => setMenuOpen(false)}>Üye Ol</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>

      {searchOpen && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[100] flex flex-col animate-fade-in">
          <div className="border-b border-border">
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex items-center h-28 lg:h-32">
                <form onSubmit={handleSearch} className="flex-1 flex items-center gap-4">
                  <svg className="w-6 h-6 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input ref={searchRef} type="text" name="q" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Ne aramıştınız?" className="flex-1 text-2xl lg:text-3xl text-heading placeholder-[#c8c8c8] focus:outline-none bg-transparent py-4 font-light tracking-wide" />
                  <button type="submit" className="px-6 py-3 text-sm font-medium text-white bg-primary hover:bg-primary-hover transition uppercase tracking-wider">Ara</button>
                  <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="p-3 text-muted hover:text-heading transition hover:bg-page-hover rounded-full" aria-label="Kapat">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="max-w-5xl mx-auto px-6 py-16">
              {searchQuery.trim() ? (
                <div className="text-center py-24">
                  <p className="text-lg text-muted font-light">Aramak için <span className="text-primary font-medium">Enter</span>'a basın</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div>
                    <h3 className="text-xs tracking-[0.2em] uppercase text-primary font-medium mb-8">Kategoriler</h3>
                    <div className="space-y-1">
                      {[
                        { label: "Tüm Kahveler", href: "/urunler" },
                        { label: "Filtre Kahve", href: "/urunler?kat=filtre-kahve" },
                        { label: "Espresso", href: "/urunler?kat=espresso" },
                        { label: "Tadım Paketi", href: "/urunler?kat=tadim-paketi" },
                        { label: "Ekipmanlar", href: "/ekipmanlar" },
                        { label: "İmza Ürünler", href: "/imza-urunler" },
                      ].map((cat) => (
                        <Link key={cat.label} href={cat.href} onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="block py-3 text-lg text-heading hover:text-primary transition border-b border-border/50 hover:border-primary/30 group">
                          <span className="flex items-center justify-between">{cat.label}<span className="text-xs text-placeholder group-hover:text-primary transition">→</span></span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs tracking-[0.2em] uppercase text-primary font-medium mb-8">Önerilenler</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Ethiopia Sidamo G2", tag: "Filtre Kahve", href: "/urunler/ethiopia-sidamo-g2" },
                        { label: "Colombia Supremo 18 SC", tag: "Filtre Kahve", href: "/urunler/colombia-supremo-18-sc" },
                        { label: "Standart Tadım Paketi", tag: "3 Çekirdek", href: "/urunler/standart-tadim-paketi" },
                      ].map((item) => (
                        <Link key={item.label} href={item.href} onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="flex items-center justify-between p-4 bg-white border border-border hover:border-primary/40 hover:shadow-sm transition group">
                          <div>
                            <p className="text-sm font-medium text-heading group-hover:text-primary transition">{item.label}</p>
                            <p className="text-xs text-placeholder mt-0.5">{item.tag}</p>
                          </div>
                          <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
