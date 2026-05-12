"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BaristaReport {
  totalMessages: number;
  totalConversations: number;
  topWords: [string, number][];
  topTopics: { topic: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}

export default function AdminBaristaRaporPage() {
  const [report, setReport] = useState<BaristaReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics/barista")
      .then(r => r.json())
      .then(d => { setReport(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <span className="text-4xl animate-pulse">📊</span>
      <p className="text-gray-500 mt-4">Rapor hazırlanıyor...</p>
    </div>
  );

  if (!report) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <p className="text-gray-500">Rapor yüklenemedi</p>
    </div>
  );

  const maxTopicCount = Math.max(...report.topTopics.map(t => t.count), 1);
  const maxMonthlyCount = Math.max(...report.monthlyTrend.map(t => t.count), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <h1 className="text-3xl font-bold text-amber-900 mb-6">AI Barista Raporu</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <p className="text-xs text-amber-600 uppercase tracking-wide">Toplam Mesaj</p>
          <p className="text-3xl font-bold text-amber-900">{report.totalMessages.toLocaleString("tr-TR")}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <p className="text-xs text-amber-600 uppercase tracking-wide">Toplam Sohbet</p>
          <p className="text-3xl font-bold text-amber-900">{report.totalConversations.toLocaleString("tr-TR")}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <p className="text-xs text-amber-600 uppercase tracking-wide">Mesaj/Sohbet</p>
          <p className="text-3xl font-bold text-amber-900">
            {report.totalConversations > 0 ? (report.totalMessages / report.totalConversations).toFixed(1) : 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <p className="text-xs text-amber-600 uppercase tracking-wide">En Çok Sorulan</p>
          <p className="text-lg font-bold text-amber-900 truncate">{report.topTopics[0]?.topic || "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">Konulara Göre Dağılım</h2>
          <div className="space-y-3">
            {report.topTopics.map((t) => (
              <div key={t.topic}>
                <div className="flex justify-between text-sm mb-1">
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

        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">Aylık Mesaj Trendi</h2>
          <div className="space-y-3">
            {report.monthlyTrend.map((t) => {
              const [year, month] = t.month.split("-");
              const label = `${month}.${year}`;
              return (
                <div key={t.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{label}</span>
                    <span className="font-semibold text-amber-700">{t.count}</span>
                  </div>
                  <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600 rounded-full transition-all" style={{ width: `${(t.count / maxMonthlyCount) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-amber-100 p-6">
        <h2 className="text-lg font-bold text-amber-900 mb-4">En Çok Kullanılan Kelimeler</h2>
        <div className="flex flex-wrap gap-2">
          {report.topWords.slice(0, 30).map(([word, count]) => {
            const size = Math.min(Math.max(count / report.topWords[0][1], 0.3), 1);
            return (
              <span key={word} className="px-2 py-1 bg-amber-50 text-amber-800 rounded"
                style={{ fontSize: `${0.7 + size * 0.5}rem`, opacity: 0.5 + size * 0.5 }}
              >
                {word} ({count})
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
