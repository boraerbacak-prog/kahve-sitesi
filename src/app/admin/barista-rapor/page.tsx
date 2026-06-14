"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate } from "@/lib/excel";

interface BaristaReport {
  totalMessages: number; totalConversations: number;
  totalUserMsgs: number; totalAssistantMsgs: number;
  avgMessagesPerConversation: number;
  avgUserMessagesPerConversation: number;
  recentMessages: number; olderMessages: number;
  fallbackRate: number; fallbackCount: number;
  peakHour: { hour: string; count: number } | null;
  hourlyCounts: Record<string, number>;
  dailyCounts: Record<string, number>;
  topWords: [string, number][];
  topTopics: { topic: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}

export default function AdminBaristaRaporPage() {
  const [report, setReport] = useState<BaristaReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics/barista")
      .then(r => r.json())
      .then(d => { setReport(d); setLoading(false); })
      .catch(() => { setError("Rapor yüklenemedi"); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <span className="text-4xl animate-pulse">📊</span>
      <p className="text-gray-500 mt-4">Rapor hazırlanıyor...</p>
    </div>
  );

  if (error || !report) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <p className="text-gray-500">{error || "Rapor yüklenemedi"}</p>
    </div>
  );

  const maxTopicCount = Math.max(...report.topTopics.map(t => t.count), 1);
  const maxMonthlyCount = Math.max(...report.monthlyTrend.map(t => t.count), 1);
  const maxHourlyCount = Math.max(...Object.values(report.hourlyCounts), 1);
  const maxDailyCount = Math.max(...Object.values(report.dailyCounts), 1);

  const exportExcel = () => {
    const h1 = ["Metrik", "Değer"];
    const metricRows = [
      ["Toplam Mesaj", String(report.totalMessages)],
      ["Toplam Sohbet", String(report.totalConversations)],
      ["Kullanıcı Mesajı", String(report.totalUserMsgs)],
      ["AI Mesajı", String(report.totalAssistantMsgs)],
      ["Ort. Mesaj/Sohbet", String(report.avgMessagesPerConversation)],
      ["Son 30 Gün Mesaj", String(report.recentMessages)],
      ["Fallback Oranı", `%${report.fallbackRate}`],
    ];
    const h2 = ["Konu", "Mesaj Sayısı"];
    const topicRows = report.topTopics.map(t => [t.topic, String(t.count)]);
    const h3 = ["Ay", "Mesaj Sayısı"];
    const monthRows = report.monthlyTrend.map(t => [t.month, String(t.count)]);

    const html1 = htmlExcel("Barista Raporu - Metrikler", h1, metricRows);
    const html2 = htmlExcel("Barista Raporu - Konular", h2, topicRows);
    const html3 = htmlExcel("Barista Raporu - Aylık Trend", h3, monthRows);
    downloadXls(`barista-rapor-${new Date().toISOString().slice(0,10)}.xls`, html1 + html2 + html3);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div><Link href="/admin" className="text-sm text-amber-600 hover:underline mb-1 inline-block">← Admin Panel</Link>
          <h1 className="text-3xl font-bold text-amber-900">AI Barista Raporu</h1>
        </div>
        <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500">Excel</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {[
          { label:"Toplam Mesaj", value:report.totalMessages.toLocaleString("tr-TR"), color:"amber" },
          { label:"Toplam Sohbet", value:report.totalConversations.toLocaleString("tr-TR"), color:"amber" },
          { label:"Kullanıcı", value:report.totalUserMsgs.toLocaleString("tr-TR"), color:"blue" },
          { label:"AI Yanıtı", value:report.totalAssistantMsgs.toLocaleString("tr-TR"), color:"green" },
          { label:"Ort. Mesaj/Sohbet", value:String(report.avgMessagesPerConversation), color:"purple" },
          { label:"Son 30 Gün", value:report.recentMessages.toLocaleString("tr-TR"), color:"indigo" },
          { label:"Fallback Oranı", value:`%${report.fallbackRate}`, color:"red" },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border border-${s.color}-100 p-5`}>
            <p className={`text-xs text-${s.color}-600 uppercase tracking-wide`}>{s.label}</p>
            <p className={`text-2xl font-bold text-${s.color}-900`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Topics */}
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">Konulara Göre Dağılım</h2>
          <div className="space-y-2">
            {report.topTopics.map((t) => (
              <div key={t.topic}>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="text-gray-700">{t.topic}</span>
                  <span className="font-semibold text-amber-700">{t.count}</span>
                </div>
                <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${(t.count / maxTopicCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">Aylık Mesaj Trendi</h2>
          <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2">
            {report.monthlyTrend.map((t) => {
              const [, month] = t.month.split("-");
              return (
                <div key={t.month} className="flex flex-col items-center gap-1 min-w-[32px]">
                  <span className="text-[10px] text-gray-500 font-medium">{t.count > 999 ? `${Math.round(t.count/100)}b` : t.count}</span>
                  <div className="w-6 bg-amber-500 rounded-t transition-all hover:bg-amber-600" style={{ height: `${(t.count / maxMonthlyCount) * 120}px` }} />
                  <span className="text-[10px] text-gray-400">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Activity */}
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">Saatlik Aktivite (Son 7 Gün)</h2>
          <p className="text-xs text-gray-400 mb-3">En yoğun saat: <strong>{report.peakHour?.hour}:00</strong> ({report.peakHour?.count} mesaj)</p>
          <div className="flex items-end gap-1 h-28 overflow-x-auto pb-1">
            {Array.from({ length: 24 }, (_, h) => String(h)).map(h => (
              <div key={h} className="flex flex-col items-center gap-0.5 min-w-[14px]">
                <div className="w-2.5 bg-amber-400 rounded-t transition-all hover:bg-amber-500" style={{ height: `${((report.hourlyCounts[h] || 0) / maxHourlyCount) * 80}px` }} />
                <span className="text-[8px] text-gray-400">{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Activity */}
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">Günlük Aktivite (Son 7 Gün)</h2>
          <div className="space-y-2">
            {Object.entries(report.dailyCounts).map(([day, count]) => (
              <div key={day}>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="text-gray-700">{day}</span>
                  <span className="font-semibold text-amber-700">{count}</span>
                </div>
                <div className="h-2.5 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${(count / maxDailyCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Word Cloud */}
      <div className="bg-white rounded-xl border border-amber-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-900">En Çok Kullanılan Kelimeler</h2>
          <span className="text-xs text-gray-400">İyileştirme için hangi konulara odaklanılacağını gösterir</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Show top rams/Trends analysis */}
          {report.topWords.slice(0, 40).map(([word, count], i) => {
            const size = Math.min(Math.max(count / report.topWords[0][1], 0.3), 1);
            return (
              <span key={word} className="px-2 py-1 bg-amber-50 text-amber-800 rounded transition hover:bg-amber-100 hover:scale-110 cursor-default"
                style={{ fontSize: `${0.7 + size * 0.5}rem`, opacity: 0.5 + size * 0.5 }}
              >
                {word} <span className="text-[10px] opacity-60">({count})</span>
              </span>
            );
          })}
        </div>
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-sm text-amber-800">
            <strong>💡 Öneri:</strong> En çok sorulan konulara göre SSS sayfasını güncelleyin. 
            Fallback oranı <strong>%{report.fallbackRate}</strong> — 
            {report.fallbackRate > 15 ? " yüksek, AI yanıtlarını iyileştirmek gerekebilir." : " kabul edilebilir seviyede."}
          </p>
        </div>
      </div>
    </div>
  );
}
