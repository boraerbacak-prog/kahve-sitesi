"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate, tl } from "@/lib/excel";

interface OrderItem {
  id: string; quantity: number; price: number;
  product: { id: string; name: string; slug: string };
}

interface Order {
  id: string; status: string; total: number; createdAt: string;
  shippingName: string | null; shippingAddress: string | null;
  shippingCity: string | null; shippingPhone: string | null;
  paymentMethod: string | null;
  cargoCompany: string | null;
  trackingNumber: string | null;
  user: { id: string; name: string | null; email: string };
  items: OrderItem[];
}

const cargoCompanies = [
  { value: "", label: "Seçiniz" },
  { value: "yurtici", label: "Yurtiçi Kargo" },
  { value: "mng", label: "MNG Kargo" },
  { value: "aras", label: "Aras Kargo" },
  { value: "ptt", label: "PTT Kargo" },
  { value: "surat", label: "Sürat Kargo" },
  { value: "ups", label: "UPS" },
  { value: "fedex", label: "FedEx" },
  { value: "dhl", label: "DHL" },
  { value: "other", label: "Diğer" },
];

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  confirmed: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "Bekliyor", confirmed: "Onaylandı", shipped: "Kargoda", delivered: "Teslim Edildi", cancelled: "İptal",
};

const statusFlow: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

function notifySound() {
  // subtle notification
  const audio = new Audio("data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=");
  audio.volume = 0.3;
  audio.play().catch(() => {});
}

export default function AdminSiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notifMsg, setNotifMsg] = useState("");
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders").then(r => r.json()).then(d => { if (d.orders) setOrders(d.orders); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      setNotifMsg("Durum güncellendi, müşteriye e-posta gönderildi ✓");
      notifySound();
      setTimeout(() => setNotifMsg(""), 3000);
    }
  };

  const saveCargo = async (id: string, cargoCompany: string, trackingNumber: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, cargoCompany, trackingNumber }),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, cargoCompany, trackingNumber } : o));
      setNotifMsg("Kargo bilgisi kaydedildi ✓");
      notifySound();
      setTimeout(() => setNotifMsg(""), 3000);
    }
  };

  const sendEmail = async (order: Order) => {
    await updateStatus(order.id, order.status);
    const body = `Merhaba ${order.user.name || "değerli müşterimiz"},\n\n"${order.items.map(i => i.product.name).join(", ")}" siparişinizin durumu: ${statusLabels[order.status]}\n\nSipariş No: #${order.id.slice(0, 8)}\nTutar: ${tl(order.total)}₺`;
    const subject = `Sipariş Durumu #${order.id.slice(0, 8)} - Rostello`;
    window.open(`mailto:${order.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  };

  const sendWhatsApp = (order: Order) => {
    const phone = order.shippingPhone?.replace(/^0/, "").replace(/[^0-9]/g, "") || "";
    if (!phone) {
      setNotifMsg("Müşterinin telefon numarası yok");
      setTimeout(() => setNotifMsg(""), 3000);
      return;
    }
    const msg = `Merhaba ${order.user.name || "değerli müşterimiz"}%0A%0A"${order.items.map(i => i.product.name).join(", ")}" siparişinizin durumu: ${statusLabels[order.status]}%0A%0ASipariş No: #${order.id.slice(0, 8)}%0ATutar: ${tl(order.total)}₺`;
    window.open(`https://wa.me/90${phone}?text=${msg}`, "_blank");
  };

  const filtered = filter ? orders.filter(o => o.status === filter) : orders;

  const exportExcel = () => {
    const headers = ["Sipariş ID","Müşteri","E-posta","Telefon","Ürünler","Tutar","Durum","Tarih","Adres","Ödeme","Kargo Firması","Takip No"];
    const rows = filtered.map(o => [
      `#${o.id.slice(0,8)}`, esc(o.user.name), esc(o.user.email),
      esc(o.shippingPhone || "—"),
      esc(o.items.map(i => i.product.name).join(", ")),
      `${tl(o.total)}₺`, statusLabels[o.status] || o.status,
      trDate(o.createdAt),
      esc([o.shippingAddress, o.shippingCity].filter(Boolean).join(", ")),
      o.paymentMethod || "—",
      o.cargoCompany ? cargoCompanies.find(c => c.value === o.cargoCompany)?.label || o.cargoCompany : "—",
      o.trackingNumber || "—",
    ]);
    downloadXls(`siparisler-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Siparişler", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-amber-900">Siparişler ({orders.length})</h1>
        <div className="flex items-center gap-3">
          {notifMsg && <span className="text-xs text-green-600 animate-pulse">{notifMsg}</span>}
          <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${filter === s ? "bg-amber-600 text-white border-amber-600" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}
          >
            {s ? `${statusLabels[s]} (${orders.filter(o => o.status === s).length})` : `Tümü (${orders.length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">Sipariş</th>
            <th className="text-left p-4">Müşteri</th>
            <th className="text-left p-4">Ürünler</th>
            <th className="text-left p-4">Tutar</th>
            <th className="text-left p-4">Tarih</th>
            <th className="text-left p-4">Durum</th>
            <th className="text-left p-4">İletişim</th>
          </tr></thead>
          <tbody>
            {filtered.map((o) => (
              <>
                <tr key={o.id} className="border-b border-amber-50 hover:bg-amber-50/50 cursor-pointer" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  <td className="p-4 font-mono text-xs text-gray-500">#{o.id.slice(0, 8)}</td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{o.user.name || "İsimsiz"}</p>
                    <p className="text-xs text-gray-500">{o.user.email}</p>
                    {o.shippingPhone && <p className="text-xs text-gray-400">{o.shippingPhone}</p>}
                  </td>
                  <td className="p-4 text-gray-600 max-w-[200px] truncate">
                    {o.items.map(i => i.product.name).join(", ")}
                  </td>
                  <td className="p-4 font-semibold text-gray-900">{tl(o.total)}₺</td>
                  <td className="p-4 text-gray-500 text-xs">{trDate(o.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${o.status === "delivered" ? "bg-green-500" : o.status === "shipped" ? "bg-blue-500" : o.status === "confirmed" ? "bg-yellow-500" : "bg-gray-400"}`} />
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded border-0 ${statusColors[o.status] || "bg-gray-100"}`}
                      >
                        {Object.entries(statusLabels).map(([v, l]) => {
                          const allowed = statusFlow[o.status] || [];
                          const isCurrent = v === o.status;
                          const canTransition = allowed.includes(v) || isCurrent;
                          return <option key={v} value={v} disabled={!canTransition && !isCurrent}>{l}{canTransition && !isCurrent ? " →" : ""}</option>;
                        })}
                      </select>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); sendEmail(o); }}
                        className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-1 rounded hover:bg-amber-200 transition" title="E-posta gönder">📧</button>
                      <button onClick={(e) => { e.stopPropagation(); sendWhatsApp(o); }}
                        className="text-[10px] bg-green-100 text-green-700 px-1.5 py-1 rounded hover:bg-green-200 transition" title="WhatsApp ile iletişim">💬</button>
                    </div>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr key={`${o.id}-detail`}>
                    <td colSpan={7} className="p-4 bg-amber-50/50">
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Sipariş Detayı</p>
                          <p className="text-gray-700">#{o.id}</p>
                          <p className="text-gray-500 text-xs">{o.paymentMethod === "stripe" ? "Kredi Kartı" : o.paymentMethod === "wallet" ? "Cüzdan" : o.paymentMethod === "bank" ? "Havale/EFT" : o.paymentMethod || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Teslimat Adresi</p>
                          <p className="text-gray-700">{o.shippingName || o.user.name || "—"}</p>
                          <p className="text-gray-500 text-xs">{o.shippingAddress}, {o.shippingCity}</p>
                          <p className="text-gray-500 text-xs">{o.shippingPhone || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Kargo Bilgisi</p>
                          <select value={o.cargoCompany || ""} onChange={(e) => saveCargo(o.id, e.target.value, o.trackingNumber || "")}
                            className="text-xs border border-amber-200 rounded px-1 py-0.5 w-full mb-1"
                          >
                            {cargoCompanies.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                          <div className="flex gap-1">
                            <input type="text" defaultValue={o.trackingNumber || ""} placeholder="Takip no"
                              onBlur={(e) => saveCargo(o.id, o.cargoCompany || "", e.target.value)}
                              className="text-xs border border-amber-200 rounded px-1 py-0.5 w-full"
                            />
                          </div>
                          {o.trackingNumber && o.cargoCompany && (
                            <a href={`https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${o.trackingNumber}`}
                              target="_blank" className="text-xs text-blue-600 hover:underline mt-1 block">🔍 Kargo Takip</a>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Ürünler</p>
                          {o.items.map(i => (
                            <p key={i.id} className="text-gray-700">{i.product.name} × {i.quantity} = {tl(i.price * i.quantity)}₺</p>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">İletişim</p>
                          <div className="flex flex-col gap-1">
                            <a href={`mailto:${o.user.email}`} className="text-xs text-amber-600 hover:underline">📧 {o.user.email}</a>
                            {o.shippingPhone && (
                              <a href={`https://wa.me/90${o.shippingPhone.replace(/^0/, "").replace(/[^0-9]/g, "")}`} target="_blank" className="text-xs text-green-600 hover:underline">💬 WhatsApp</a>
                            )}
                            <button onClick={() => {
                              const msg = `Sipariş #${o.id.slice(0, 8)} - ${o.user.name}\nÜrünler: ${o.items.map(i => i.product.name).join(", ")}\nTutar: ${tl(o.total)}₺\nDurum: ${statusLabels[o.status]}\nAdres: ${o.shippingAddress}, ${o.shippingCity}\nTel: ${o.shippingPhone || "—"}`;
                              navigator.clipboard.writeText(msg);
                              setNotifMsg("Sipariş bilgisi kopyalandı ✓");
                              setTimeout(() => setNotifMsg(""), 2000);
                            }} className="text-xs text-gray-500 hover:text-gray-700">📋 Bilgiyi Kopyala</button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-amber-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className={`w-2 h-2 rounded-full ${o.status === "pending" ? "bg-gray-500" : "bg-green-500"}`} />
                          <span>Sipariş Alındı</span>
                          <span className="text-gray-300">→</span>
                          <span className={`w-2 h-2 rounded-full ${o.status === "confirmed" || o.status === "shipped" || o.status === "delivered" ? "bg-green-500" : "bg-gray-300"}`} />
                          <span>Onaylandı</span>
                          <span className="text-gray-300">→</span>
                          <span className={`w-2 h-2 rounded-full ${o.status === "shipped" || o.status === "delivered" ? "bg-green-500" : "bg-gray-300"}`} />
                          <span>Kargoda</span>
                          <span className="text-gray-300">→</span>
                          <span className={`w-2 h-2 rounded-full ${o.status === "delivered" ? "bg-green-500" : "bg-gray-300"}`} />
                          <span>Teslim Edildi</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">Sipariş yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
