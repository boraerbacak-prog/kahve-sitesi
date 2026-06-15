"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function BildirimBell() {
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/bildirim")
      .then(r => r.json())
      .then(d => {
        setUnread(d.unread || 0);
        setNotifications(d.notifications || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/admin/bildirim")
        .then(r => r.json())
        .then(d => {
          setUnread(d.unread || 0);
          setNotifications(d.notifications || []);
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markRead = async () => {
    await fetch("/api/admin/bildirim", { method: "POST" });
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const typeColors: Record<string, string> = {
    yeni: "bg-green-500",
    iptal: "bg-red-500",
    duraklatma: "bg-yellow-500",
    erteleme: "bg-blue-500",
    hizlandirma: "bg-purple-500",
    siparis: "bg-orange-500",
    siparis_iptal: "bg-red-600",
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen(!open); if (!open) markRead(); }} className="relative p-2 hover:bg-amber-100 rounded-lg transition">
        <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-amber-200 shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-amber-100 bg-amber-50">
            <span className="text-sm font-semibold text-amber-900">Bildirimler</span>
            <Link href="/admin/abonelik" className="text-xs text-amber-700 hover:underline" onClick={() => setOpen(false)}>Tümünü Gör →</Link>
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-amber-600">Henüz bildirim yok</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`px-4 py-3 border-b border-amber-50 hover:bg-amber-50/50 transition ${n.isRead ? "" : "bg-amber-50/30"}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${typeColors[n.type] || "bg-gray-400"}`} />
                  <span className="text-sm font-medium text-amber-900">{n.title}</span>
                </div>
                {n.message && <p className="text-xs text-amber-700/70 mt-0.5 ml-4">{n.message}</p>}
                <p className="text-[10px] text-amber-500 mt-0.5 ml-4">{new Date(n.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
