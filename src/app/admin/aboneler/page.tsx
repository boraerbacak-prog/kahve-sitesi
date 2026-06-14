import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ConfirmDelete } from "../ConfirmButton";

export const dynamic = "force-dynamic";

async function toggleAction(id: string, action: "toggle" | "delete"): Promise<void> {
  "use server";
  const session = await auth();
  if (!session?.user) return;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "admin") return;

  if (action === "toggle") {
    const sub = await prisma.subscriber.findUnique({ where: { id } });
    if (sub) await prisma.subscriber.update({ where: { id }, data: { isActive: !sub.isActive } });
  } else if (action === "delete") {
    await prisma.subscriber.delete({ where: { id } });
  }
}

export default async function AdminSubscribersPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "admin") redirect("/");

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const headers = ["E-posta", "Ad", "Kaynak", "Durum", "Tarih"];
  const rows = subscribers.map(s => [
    s.email, s.name || "—", s.source,
    s.isActive ? "Aktif" : "Pasif",
    new Date(s.createdAt).toLocaleDateString("tr-TR"),
  ]);
  const thead = headers.map(h =>
    `<th style="background:#C4724B;color:#fff;padding:8px 12px;font-weight:600;text-align:left;border:1px solid #ddd;white-space:nowrap">${h.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</th>`
  ).join("");
  const tbody = rows.map(r =>
    "<tr>" + r.map(c =>
      `<td style="padding:6px 12px;border:1px solid #ddd">${String(c??"").replace(/&/g,"&amp;").replace(/</g,"&lt;")}</td>`
    ).join("") + "</tr>"
  ).join("");
  const xlsHtml = `<!DOCTYPE html><meta charset="utf-8"><body><h2 style="font-family:Arial;color:#333">E-Posta Aboneleri</h2><table style="border-collapse:collapse;font-family:Arial;font-size:13px">${thead}${tbody}</table></body></html>`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-sm text-amber-600 hover:underline mb-1 inline-block">← Admin Panel</Link>
          <h1 className="text-3xl font-bold text-amber-900">E-Posta Aboneleri</h1>
          <p className="text-sm text-gray-500 mt-1">Toplam {subscribers.length} abone · {subscribers.filter(s => s.isActive).length} aktif</p>
        </div>
        <form action={async () => {
          "use server";
          // This form triggers the Excel download via a data URI approach
        }}>
          <a href={`data:application/vnd.ms-excel;charset=utf-8,${encodeURIComponent(xlsHtml)}`}
            download={`aboneler-${new Date().toISOString().slice(0,10)}.xls`}
            className="inline-block text-xs bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition">Excel İndir</a>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-amber-50 text-left">
              <th className="px-4 py-3 font-semibold text-amber-900">E-posta</th>
              <th className="px-4 py-3 font-semibold text-amber-900">Ad</th>
              <th className="px-4 py-3 font-semibold text-amber-900">Kaynak</th>
              <th className="px-4 py-3 font-semibold text-amber-900">Durum</th>
              <th className="px-4 py-3 font-semibold text-amber-900">Tarih</th>
              <th className="px-4 py-3 font-semibold text-amber-900">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-t border-amber-50 hover:bg-amber-50/50">
                <td className="px-4 py-3 text-gray-700">{s.email}</td>
                <td className="px-4 py-3 text-gray-500">{s.name || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{s.source}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(s.createdAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <form action={async () => { "use server"; await toggleAction(s.id, "toggle"); }}>
                      <button className="text-xs text-amber-600 hover:underline">
                        {s.isActive ? "Pasif Yap" : "Aktif Yap"}
                      </button>
                    </form>
                    <form action={async () => { "use server"; await toggleAction(s.id, "delete"); }}>
                      <ConfirmDelete>Sil</ConfirmDelete>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Henüz abone yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
