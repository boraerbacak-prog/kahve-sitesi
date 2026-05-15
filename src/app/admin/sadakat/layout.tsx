"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Dashboard", href: "/admin/sadakat" },
  { label: "Ayarlar & Altın Oranı", href: "/admin/sadakat/ayarlar" },
  { label: "Raporlar", href: "/admin/sadakat/rapor" },
];

export default function SadakatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="border-b border-[#e5e0d8] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 -mb-px">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`py-3 text-sm font-medium border-b-[3px] transition ${
                  pathname === tab.href
                    ? "text-[#C4724B] border-[#C4724B]"
                    : "text-[#8c8c8c] border-transparent hover:text-[#C4724B] hover:border-[#C4724B]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
