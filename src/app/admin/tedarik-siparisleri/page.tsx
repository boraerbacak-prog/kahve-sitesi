"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { esc, htmlExcel, downloadXls, trDate, tl } from "@/lib/excel";

interface PurchaseOrder {
  id: string; status: string; total: number; notes: string | null; createdAt: string;
  supplier: { id: string; name: string };
  items: { id: string; quantity: number; unitPrice: number; product: { id: string; name: string } }[];
}

interface Product { id: string; name: string; }

interface Supplier { id: string; name: string; }

const statusLabels: Record<string, string> = {
  pending: "Bekliyor", ordered: "Sipariş Verildi", received: "Teslim Alındı", cancelled: "İptal",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  ordered: "bg-blue-100 text-blue-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminTedarikSiparisleriPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notifMsg, setNotifMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/purchase-orders").then(r => r.json()),
      fetch("/api/admin/suppliers").then(r => r.json()),
      fetch("/api/admin/products?all=1").then(r => r.json()).catch(() => ({ products: [] })),
    ]).then(([orderData, supData, prodData]) => {
      if (orderData.purchaseOrders) setOrders(orderData.purchaseOrders);
      if (supData.suppliers) setSuppliers(supData.suppliers);
      if (prodData.products) setProducts(prodData.products);
    });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/purchase-orders", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const d = await res.json();
      setOrders(prev => prev.map(o => o.id === id ? d.purchaseOrder : o));
      setNotifMsg("Durum güncellendi ✓");
      setTimeout(() => setNotifMsg(""), 3000);
    }
  };

  const createOrder = async (data: any) => {
    const res = await fetch("/api/admin/purchase-orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setShowModal(false);
      const d = await fetch("/api/admin/purchase-orders").then(r => r.json());
      if (d.purchaseOrders) setOrders(d.purchaseOrders);
      setNotifMsg("Sipariş oluşturuldu ✓");
      setTimeout(() => setNotifMsg(""), 3000);
    }
  };

  const exportExcel = () => {
    const headers = ["Sipariş ID","Tedarikçi","Ürünler","Toplam","Durum","Tarih"];
    const rows = orders.map(o => [
      `#${o.id.slice(0,8)}`, esc(o.supplier.name),
      esc(o.items.map(i => `${i.product.name} x${i.quantity}`).join(", ")),
      `${tl(o.total)}₺`, statusLabels[o.status] || o.status, trDate(o.createdAt),
    ]);
    downloadXls(`tedarik-siparisleri-${new Date().toISOString().slice(0,10)}.xls`, htmlExcel("Tedarik Siparişleri", headers, rows));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-4 inline-block">← Admin Panel</Link>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-amber-900">Tedarik Siparişleri ({orders.length})</h1>
        <div className="flex items-center gap-3">
          {notifMsg && <span className="text-xs text-green-600 animate-pulse">{notifMsg}</span>}
          <button onClick={exportExcel} className="text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel</button>
          <button onClick={() => { setEditingId(null); setShowModal(true); }}
            className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition">+ Yeni Sipariş</button>
        </div>
      </div>
      <Link href="/admin/tedarikciler" className="text-xs text-amber-600 hover:underline mb-4 inline-block">← Tedarikçilere Dön</Link>

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-amber-50 border-b border-amber-100 text-amber-800">
            <th className="text-left p-4">Sipariş</th>
            <th className="text-left p-4">Tedarikçi</th>
            <th className="text-left p-4">Ürünler</th>
            <th className="text-left p-4">Toplam</th>
            <th className="text-left p-4">Durum</th>
            <th className="text-left p-4">Tarih</th>
          </tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                <td className="p-4 font-mono text-xs text-gray-500">#{o.id.slice(0, 8)}</td>
                <td className="p-4 font-medium text-gray-900">{o.supplier.name}</td>
                <td className="p-4 text-gray-600 max-w-[250px]">
                  {o.items.map(i => (
                    <span key={i.id} className="text-xs">{i.product.name} × {i.quantity} ({tl(i.unitPrice)}₺) </span>
                  ))}
                </td>
                <td className="p-4 font-semibold text-gray-900">{tl(o.total)}₺</td>
                <td className="p-4">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded border-0 ${statusColors[o.status] || "bg-gray-100"}`}
                  >
                    {Object.entries(statusLabels).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-gray-500 text-xs">{trDate(o.createdAt)}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Sipariş yok</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-amber-900 mb-4">Yeni Tedarik Siparişi</h2>
            <OrderForm suppliers={suppliers} products={products} onSave={createOrder} onCancel={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function OrderForm({ suppliers, products, onSave, onCancel }: { suppliers: Supplier[]; products: Product[]; onSave: (data: any) => void; onCancel: () => void }) {
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([
    { productId: "", quantity: 1, unitPrice: 0 },
  ]);

  const addItem = () => setItems(prev => [...prev, { productId: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: string, value: any) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [key]: value } : item));
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="flex flex-col gap-3">
      <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
        className="border border-amber-200 rounded-lg px-3 py-2 text-sm"
      >
        <option value="">Tedarikçi Seçin</option>
        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <div className="border border-amber-100 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-amber-800">Ürünler</p>
          <button onClick={addItem} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200">+ Ürün Ekle</button>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2 items-end">
            <select value={item.productId} onChange={e => updateItem(idx, "productId", e.target.value)}
              className="border border-amber-200 rounded px-2 py-1.5 text-xs flex-1"
            >
              <option value="">Ürün</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" placeholder="Adet" value={item.quantity} onChange={e => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
              className="border border-amber-200 rounded px-2 py-1.5 text-xs w-16" />
            <input type="number" placeholder="Birim Fiyat" value={item.unitPrice} onChange={e => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
              className="border border-amber-200 rounded px-2 py-1.5 text-xs w-20" />
            {items.length > 1 && (
              <button onClick={() => removeItem(idx)} className="text-xs text-red-500 px-1">✕</button>
            )}
          </div>
        ))}
        <p className="text-sm font-semibold text-amber-900 mt-2">Toplam: {tl(total)}₺</p>
      </div>

      <textarea placeholder="Notlar" value={notes} onChange={e => setNotes(e.target.value)}
        className="border border-amber-200 rounded-lg px-3 py-2 text-sm" rows={2} />

      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onCancel} className="text-sm px-4 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50">İptal</button>
        <button onClick={() => onSave({ supplierId, notes, items })}
          className="text-sm px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition">Oluştur</button>
      </div>
    </div>
  );
}
