import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function tl(n: number): string { return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function htmlTable(title: string, headers: string[], rows: string[][]): string {
  const thead = headers.map(h => `<th style="background:#C4724B;color:#fff;padding:8px 12px;font-weight:600;text-align:left;border:1px solid #ddd;white-space:nowrap">${h}</th>`).join("");
  const tbody = rows.map(r =>
    "<tr>" + r.map(c => `<td style="padding:6px 12px;border:1px solid #ddd">${c}</td>`).join("") + "</tr>"
  ).join("");
  return `<!DOCTYPE html><meta charset="utf-8"><body><h2 style="font-family:Arial;color:#333">${title}</h2><table style="border-collapse:collapse;font-family:Arial;font-size:13px">${thead}${tbody}</table></body></html>`;
}

export async function GET() {
  const items = await prisma.equipment.findMany({ orderBy: { sortOrder: "asc" } });

  const rows = items.map(p => [
    p.name, p.slug, tl(p.price), p.salePrice ? tl(p.salePrice) : "",
    p.image, p.soldOut ? "Evet" : "Hayır", String(p.sortOrder), p.published ? "Evet" : "Hayır",
  ]);

  const html = htmlTable("Ekipmanlar", ["Ürün Adı", "Slug", "Fiyat", "İndirimli", "Görsel", "Tükendi", "Sıra", "Yayında"], rows);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="ekipman-${new Date().toISOString().slice(0, 10)}.xls"`,
    },
  });
}
