"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate } from "@/lib/excel";

interface TasteTest {
  id: string; name: string | null; email: string | null;
  how: string; equipment: string; flavor: string; roast: string;
  results: string; createdAt: string;
}

const howLabels: Record<string, string> = { sutlu: "Sütlü", sade: "Sade/Siyah", soguk: "Soğuk", any: "Fark Etmez" };
const equipLabels: Record<string, string> = {
  v60: "V60", "french-press": "French Press", espresso: "Espresso", moka: "Moka Pot",
  aeropress: "Aeropress", filter: "Filtre", cezve: "Cezve", "cold-brew": "Soğuk Demleme",
};
const flavorLabels: Record<string, string> = { fruity: "Meyvemsi", sweet: "Dengeli", bold: "Çikolata", any: "Kararsız" };
const roastLabels: Record<string, string> = { light: "Zarif", medium: "İdeal", dark: "Karakterli", any: "Fark Etmez" };

export default function DamakTestiRaporPage() {
  const [data, setData] = useState<{ results: TasteTest[]; total: number; stats: any }>({ results: [], total: 0, stats: null });

  useEffect(() => {
    fetch("/api/admin/damak-testi").then(r => r.json()).then(d => { if (d.results) setData(d); });
  }, []);

  const { results, total, stats } = data;

  const statBar = (items: { how?: string; equipment?: string; flavor?: string; roast?: string; _count: number }[], labelMap: Record<string, string>, total: number) => {
    const max = Math.max(...items.map(i => i._count), 1);
    return items.map(i => {
      const key = (i as any).how || (i as any).equipment || (i as any).flavor || (i as any).roast;
      const pct = total > 0 ? Math.round((i._count / total) * 100) : 0;
      return (
        <div key={key} className="flex items-center gap-3 text-sm">
          <span className="w-28 text-gray-600">{labelMap[key] || key}</span>
          <div className="flex-1 h-5 bg-amber-100 rounded overflow-hidden">
            <div className="h-full bg-amber-600 rounded transition-all" style={{ width: `${(i._count / max) * 100}%` }} />
          </div>
          <span className="w-16 text-right font-mono text-amber-700">{i._count}</span>
          <span className="w-10 text-right text-xs text-gray-400">%{pct}</span>
        </div>
      );
    });
  };

  const exportExcel = () => {
    const headers = ["Tarih", "Ad", "E-posta", "İçim Şekli", "Ekipman", "Lezzet", "Kavrum", "Önerilenler"];
    const rows = results.map(r => [
      trDate(r.createdAt), esc(r.name || "—"), esc(r.email || "—"),
      howLabels[r.how] || r.how, equipLabels[r.equipment] || r.equipment,
      flavorLabels[r.flavor] || r.flavor, roastLabels[r.roast] || r.roast,
      esc(r.results),
    ]);
    downloadXls(`damak-testi-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Damak Testi Sonuçları", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Damak Testi Raporu ({total})</h1>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500">Excel</button>
          <Link href="/admin" className="text-sm text-amber-600 hover:underline self-center">← Admin Panel</Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <h3 className="text-xs text-amber-600 uppercase tracking-wide mb-3">İçim Şekli</h3>
            <div className="space-y-2">{statBar(stats.how, howLabels, total)}</div>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <h3 className="text-xs text-amber-600 uppercase tracking-wide mb-3">Ekipman</h3>
            <div className="space-y-2">{statBar(stats.equipment, equipLabels, total)}</div>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <h3 className="text-xs text-amber-600 uppercase tracking-wide mb-3">Lezzet Profili</h3>
            <div className="space-y-2">{statBar(stats.flavor, flavorLabels, total)}</div>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <h3 className="text-xs text-amber-600 uppercase tracking-wide mb-3">Kavrum</h3>
            <div className="space-y-2">{statBar(stats.roast, roastLabels, total)}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-amber-50 border-b border-amber-100">
              <th className="text-left p-4 text-amber-800 font-medium">Tarih</th>
              <th className="text-left p-4 text-amber-800 font-medium">Ad</th>
              <th className="text-left p-4 text-amber-800 font-medium">E-posta</th>
              <th className="text-left p-4 text-amber-800 font-medium">İçim</th>
              <th className="text-left p-4 text-amber-800 font-medium">Ekipman</th>
              <th className="text-left p-4 text-amber-800 font-medium">Lezzet</th>
              <th className="text-left p-4 text-amber-800 font-medium">Kavrum</th>
              <th className="text-left p-4 text-amber-800 font-medium">Önerilen</th>
            </tr></thead>
            <tbody>
              {results.map(r => {
                let prodSlugs: string[] = [];
                try { prodSlugs = JSON.parse(r.results); } catch {}
                return (
                  <tr key={r.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                    <td className="p-4 text-xs text-gray-500">{trDate(r.createdAt)}</td>
                    <td className="p-4 font-medium text-gray-900">{r.name || "—"}</td>
                    <td className="p-4 text-xs text-gray-500">{r.email || "—"}</td>
                    <td className="p-4">{howLabels[r.how] || r.how}</td>
                    <td className="p-4">{equipLabels[r.equipment] || r.equipment}</td>
                    <td className="p-4">{flavorLabels[r.flavor] || r.flavor}</td>
                    <td className="p-4">{roastLabels[r.roast] || r.roast}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {prodSlugs.slice(0, 3).map(s => (
                          <Link key={s} href={`/urunler/${s}`} className="text-xs text-amber-600 hover:underline">/{s}</Link>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {results.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-gray-400">Henüz test sonucu yok</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
