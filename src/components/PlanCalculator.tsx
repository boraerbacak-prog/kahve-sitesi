"use client";

import { useState } from "react";
import Link from "next/link";

const BREW_GRAMS: Record<string, number> = {
  filtre: 15,
  espresso: 18,
  turk: 9,
  karma: 16,
};

const FLAVORS = [
  { value: "meyvemsi", label: "Meyvemsi", desc: "Parlak & Canlı", detail: "Narenciye ve çiçeksi notaların ön planda olduğu, asiditesi yüksek, çay gibi berrak bir fincan deneyimi." },
  { value: "dengeli", label: "Dengeli", desc: "Pürüzsüz & Klasik", detail: "Ne çok asidik ne çok acı; karamelin tatlılığı ve dengeli bir gövde ile gün boyu içime en uygun profil." },
  { value: "cikolata", label: "Çikolata", desc: "Yoğun & Güçlü", detail: "Kakao, fındık ve kavrulmuş notaların ağırlıkta olduğu; sütlü içimlere veya yoğun espressoya en çok yakışan gövdeli profil." },
];

const ROASTS = [
  { value: "acik", label: "Zarif", desc: "Hafif", detail: "Çekirdeğin orijinal aromalarını koruyan, meyvemsi ve aromatik bir içim." },
  { value: "orta", label: "İdeal", desc: "Orta", detail: "Hem filtrede hem espressoda mükemmel sonuç veren; tatlılığın ve gövdenin en dengeli buluşma noktası." },
  { value: "koyu", label: "Karakterli", desc: "Yoğun", detail: "Asiditeyi azaltıp gövdeyi yükselten; damakta kalıcı, yoğun ve tok bir fincan deneyimi." },
];

const BREWS = [
  { value: "filtre", label: "Filtre", icon: "⏳" },
  { value: "espresso", label: "Espresso", icon: "☕" },
  { value: "turk", label: "Türk", icon: "🫖" },
  { value: "karma", label: "Karma", icon: "⚖" },
];

const FREQ_OPTIONS = [
  { value: 7, label: "Haftada Bir", desc: "7 gün" },
  { value: 14, label: "2 Haftada Bir", desc: "14 gün" },
  { value: 21, label: "3 Haftada Bir", desc: "21 gün" },
];

export default function PlanCalculator({ sessionUser, minKgPrice, maxKgPrice, planId }: { sessionUser: boolean; minKgPrice: number; maxKgPrice: number; planId: string | null }) {
  const [cups, setCups] = useState(2);
  const [brew, setBrew] = useState("filtre");
  const [flavor, setFlavor] = useState("dengeli");
  const [roast, setRoast] = useState("orta");
  const [freqDays, setFreqDays] = useState(14);
  const [karmaCups, setKarmaCups] = useState({ filtre: 1, espresso: 1, turk: 1 });

  const isKarma = brew === "karma";
  const totalCups = isKarma ? karmaCups.filtre + karmaCups.espresso + karmaCups.turk : cups;
  const gPerCup = BREW_GRAMS[brew] || 15;
  const dailyG = isKarma
    ? karmaCups.filtre * 15 + karmaCups.espresso * 18 + karmaCups.turk * 9
    : totalCups * gPerCup;
  const rawPkg = dailyG * freqDays;
  const pkg = Math.ceil(rawPkg / 250) * 250;
  const badge = cups === 2 ? "En Popüler" : null;
  const minPrice = Math.round((pkg / 1000) * minKgPrice);
  const maxPrice = Math.round((pkg / 1000) * maxKgPrice);
  const flavorLabel = FLAVORS.find(f => f.value === flavor)?.label;
  const roastLabel = ROASTS.find(r => r.value === roast)?.label;

  return (
    <div className="space-y-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/20 px-4 py-1.5 mb-4">
          <span className="text-[10px] tracking-[0.25em] uppercase text-primary font-semibold">Adım 1 · Tüketim</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-heading">Size Özel Planınızı Şekillendirin</h3>
        <p className="text-sm text-body/60 mt-2 max-w-md mx-auto">Her seçim, fincanınızdaki lezzeti belirler.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-card border border-border p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] group hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-primary font-semibold">Günlük Tüketim</div>
              <div className="text-sm text-muted">{isKarma ? "Her yöntem için ayrı ayrı belirleyin" : "Kaç fincan içiyorsunuz?"}</div>
            </div>
          </div>
          {isKarma ? (
            <div className="space-y-2">
              {([
                { key: "filtre" as const, label: "Filtre", gram: 15, icon: "⏳" },
                { key: "espresso" as const, label: "Espresso", gram: 18, icon: "☕" },
                { key: "turk" as const, label: "Türk", gram: 9, icon: "🫖" },
              ]).map((item) => (
                <div key={item.key} className="flex items-center justify-between bg-page/50 border border-border/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-body">{item.label}</span>
                    <span className="text-[9px] text-muted/60">{item.gram}g/fincan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setKarmaCups(prev => ({ ...prev, [item.key]: Math.max(0, prev[item.key] - 1) }))}
                      className="w-7 h-7 flex items-center justify-center text-sm text-body/40 hover:text-primary hover:bg-primary/5 border border-border rounded-full transition-all duration-200"
                    >
                      −
                    </button>
                    <span className="text-lg font-bold text-heading tabular-nums w-5 text-center">{karmaCups[item.key]}</span>
                    <button
                      onClick={() => setKarmaCups(prev => ({ ...prev, [item.key]: Math.min(6, prev[item.key] + 1) }))}
                      className="w-7 h-7 flex items-center justify-center text-sm text-body/40 hover:text-primary hover:bg-primary/5 border border-border rounded-full transition-all duration-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between bg-primary/5 border border-primary/20 px-3 py-2">
                <span className="text-xs font-bold text-heading">Toplam</span>
                <span className="text-lg font-bold text-primary tabular-nums">{totalCups} fincan</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-6 bg-page/50 border border-border/50 py-4">
            <button
              onClick={() => setCups(Math.max(1, cups - 1))}
              className="w-12 h-12 flex items-center justify-center text-2xl text-body/40 hover:text-primary hover:bg-primary/5 border border-border rounded-full transition-all duration-200"
            >
              −
            </button>
            <div className="text-center">
              <span className="text-4xl sm:text-5xl font-bold text-heading tabular-nums">{cups}</span>
              <div className="text-xs uppercase tracking-wider text-muted mt-0.5">fincan</div>
            </div>
            <button
              onClick={() => setCups(Math.min(6, cups + 1))}
              className="w-12 h-12 flex items-center justify-center text-2xl text-body/40 hover:text-primary hover:bg-primary/5 border border-border rounded-full transition-all duration-200"
            >
              +
            </button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] group hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-primary font-semibold">Demleme Yöntemi</div>
              <div className="text-sm text-muted">Nasıl hazırlıyorsunuz?</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BREWS.map((m) => (
              <button
                key={m.value}
                onClick={() => setBrew(m.value)}
                className={`flex items-center gap-3 px-3 py-3 border text-left transition-all duration-200 ${
                  brew === m.value
                    ? "bg-primary/5 border-primary text-heading shadow-[0_0_0_1px_rgba(196,114,75,0.3)]"
                    : "bg-page/50 border-border/50 text-body/60 hover:text-heading hover:border-primary/20"
                }`}
              >
                <span className="text-lg">{m.icon}</span>
                <span className="text-sm font-semibold uppercase tracking-wider">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
          </div>
          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-primary font-semibold">Teslimat Sıklığı</div>
            <div className="text-sm text-muted">Ne sıklıkla gelsin?</div>
          </div>
        </div>
        <div className="flex gap-2">
          {FREQ_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFreqDays(f.value)}
              className={`flex-1 text-center px-3 py-3 border transition-all duration-200 ${
                freqDays === f.value
                  ? "bg-primary/5 border-primary text-heading shadow-[0_0_0_1px_rgba(196,114,75,0.3)]"
                  : "bg-page/50 border-border/50 text-body/60 hover:text-heading hover:border-primary/20"
              }`}
            >
              <span className="text-sm font-bold uppercase tracking-wider block">{f.label}</span>
              <span className="text-xs text-muted/60 mt-0.5 block">{f.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs tracking-[0.25em] uppercase text-primary font-semibold">Plan Önerisi</span>
              {badge && (
                <span className="bg-primary/10 text-primary text-xs tracking-[0.15em] uppercase px-2 py-0.5 font-semibold border border-primary/20">{badge}</span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-bold text-heading">{pkg}g</span>
            </div>
            <p className="text-sm text-body/50 mt-2">
              Her {freqDays} günde bir teslimat · {totalCups} fincan/gün
              <span className="group/info relative inline-flex items-center ml-1">
                <svg className="w-3.5 h-3.5 text-muted/40 hover:text-primary cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/info:block bg-[#1a1410] text-white text-[10px] leading-tight px-2 py-1.5 whitespace-nowrap z-10 shadow-lg">
                  {isKarma ? `${karmaCups.filtre}f+${karmaCups.espresso}e+${karmaCups.turk}t · ${dailyG.toFixed(0)}g/gün` : `${dailyG.toFixed(0)}g/gün · ${brew === "filtre" ? "15g" : brew === "espresso" ? "18g" : "9g"}/fincan`} · 2 gün kargo dahil
                </span>
              </span>
            </p>
            <p className="text-sm text-body/40 mt-1">
              Kahveniz bitmeden yenisi kapınızda
            </p>
            <p className="text-sm text-body mt-4 pt-3 border-t border-primary/10">
              <span className="text-primary font-semibold">Tahmini Teslimat Tutarı:</span> {minPrice} TL – {maxPrice} TL
              <span className="text-xs text-body/60 block mt-0.5">Seçeceğiniz mikro-lot hasadın güncel değerine göre sevk anında netleşir.</span>
            </p>
          </div>
        </div>
        <p className="text-sm text-body/50 mt-4 text-center">
          🔒 Esnek Yönetim: Seyahat veya stok durumunuza göre planınızı dilediğiniz an panelinizden erteleyebilir veya dondurabilirsiniz.
        </p>
      </div>

      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/20 px-4 py-1.5 mb-6">
          <span className="text-[10px] tracking-[0.25em] uppercase text-primary font-semibold">Adım 2 · Lezzet</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-heading mb-2">Damak Tadınızı Tanımlayın</h3>
        <p className="text-sm text-body/60 max-w-md mx-auto mb-6">Stello, profilinize en uygun çekirdekleri seçsin.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-card border border-border p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-primary font-semibold">Lezzet Profili</div>
              <div className="text-sm text-muted">Hangi tattan hoşlanırsınız?</div>
            </div>
          </div>
          <div className="space-y-2">
            {FLAVORS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFlavor(f.value)}
                className={`w-full text-left px-4 py-3 border transition-all duration-200 ${
                  flavor === f.value
                    ? "bg-primary/5 border-primary shadow-[0_0_0_1px_rgba(196,114,75,0.3)]"
                    : "bg-page/50 border-border/50 hover:text-heading hover:border-primary/20"
                }`}
              >
                <div>
                  <span className="text-sm font-bold uppercase tracking-wider">{f.label}</span>
                  <span className="ml-2 text-xs text-primary/70 font-semibold">{f.desc}</span>
                </div>
                <p className="text-sm text-body/50 leading-relaxed mt-1">{f.detail}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
            </div>
            <div>
          <div className="text-xs tracking-[0.2em] uppercase text-primary font-semibold">Kavrum</div>
          <div className="text-sm text-muted">Nasıl bir doku istersiniz?</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ROASTS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRoast(r.value)}
                className={`text-center px-3 py-4 border transition-all duration-200 ${
                  roast === r.value
                    ? "bg-primary/5 border-primary text-heading shadow-[0_0_0_1px_rgba(196,114,75,0.3)]"
                    : "bg-page/50 border-border/50 text-body/60 hover:text-heading hover:border-primary/20"
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-full h-1 mb-2 rounded-full max-w-[32px] transition-colors ${
                    r.value === "acik" ? "bg-amber-300" : r.value === "orta" ? "bg-amber-600" : "bg-amber-900"
                  }`} />
                  <span className="text-sm font-bold uppercase tracking-wider">{r.label}</span>
                  <span className="text-xs text-muted/60 mt-0.5">{r.desc}</span>
                  <p className="text-xs text-body/40 leading-tight mt-1 px-1">{r.detail}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-3.75A2.25 2.25 0 006.75 7.5 2.25 2.25 0 009 9.75m3-5.25a2.25 2.25 0 012.25 2.25 2.25 2.25 0 01-2.25 2.25m0 0a2.25 2.25 0 01-2.25-2.25 2.25 2.25 0 012.25-2.25z" /></svg>
            </div>
            <div>
              <div className="text-base font-bold text-heading">Profiliniz Hazır</div>
              <div className="text-sm text-muted mt-0.5">
                {totalCups} fincan · {BREWS.find(b => b.value === brew)?.label}{isKarma ? ` (${karmaCups.filtre}f+${karmaCups.espresso}e+${karmaCups.turk}t)` : ""} · {flavorLabel} · {roastLabel} kavrum
              </div>
            </div>
          </div>
          <Link
              href={`/profil-olustur?cups=${totalCups}&brew=${brew}&flavor=${flavor}&roast=${roast}&freq=${freqDays}${planId ? `&plan=${planId}` : ""}${isKarma ? `&kf=${karmaCups.filtre}&ke=${karmaCups.espresso}&kt=${karmaCups.turk}` : ""}`}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:shadow-[0_4px_16px_rgba(196,114,75,0.4)] shrink-0"
          >
            Profil Oluştur ve Planı Başlat →
          </Link>
        </div>
      </div>
    </div>
  );
}
