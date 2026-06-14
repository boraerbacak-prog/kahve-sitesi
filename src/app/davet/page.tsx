"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DavetPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<{ referralCode: string; pendingCount: number; rewardedCount: number; inviteUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session) {
      fetch("/api/davet/kod").then(r => r.json()).then(d => { if (d.referralCode) setData(d); }).catch(() => {});
    }
  }, [session]);

  const copyCode = () => {
    if (data?.referralCode) {
      navigator.clipboard.writeText(data.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-amber-700 mb-4">Arkadaşlarını davet etmek için giriş yap.</p>
          <Link href="/giris" className="bg-primary text-white px-6 py-3 rounded-lg">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-screen bg-page flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-page">
      <section className="relative bg-[#2c1810] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Rostello</span>
          <h1 className="text-4xl font-bold text-white mt-3 mb-4">Arkadaşını Davet Et</h1>
          <p className="text-[#a39080] max-w-xl mx-auto">
            Davet ettiğin her arkadaşın ilk alışverişinde 100 TL Çekirdek Kredi kazan. Arkadaşına da %10 indirim!
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 -mt-10 mb-12">
        <div className="bg-white rounded-xl border border-amber-100 p-8 shadow-lg">
          <div className="text-center mb-8">
            <p className="text-sm text-amber-600 mb-2">Senin Davet Kodun</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-bold tracking-widest text-amber-900">{data.referralCode}</span>
              <button onClick={copyCode}
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium transition">
                {copied ? "Kopyalandı! ✓" : "Kopyala"}
              </button>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-amber-700 text-center break-all">
              Davet linkin: <a href={data.inviteUrl} className="text-primary underline" target="_blank">{data.inviteUrl}</a>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{data.rewardedCount}</p>
              <p className="text-xs text-green-600">Arkadaşın katıldı</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-700">{data.pendingCount}</p>
              <p className="text-xs text-amber-600">Bekleyen</p>
            </div>
          </div>

          <div className="border-t border-amber-100 pt-6">
            <h3 className="font-bold text-amber-900 mb-3">Nasıl Çalışır?</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-3">
                <span className="text-primary font-bold shrink-0">1</span>
                <p>Davet kodunu veya linkini arkadaşınla paylaş.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold shrink-0">2</span>
                <p>Arkadaşın kodunla kaydolup ilk alışverişini yapsın.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold shrink-0">3</span>
                <p>100 TL Çekirdek Kredi hesabına eklenir! Arkadaşın da %10 indirim kazanır.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
