import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    if (!file) return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });

    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    if (lines.length < 2) return NextResponse.json({ error: "Boş dosya" }, { status: 400 });

    const delim = lines[0].includes(";") ? ";" : ",";
    const headers = lines[0].split(delim).map(h => h.trim().replace(/^\uFEFF/, "").replace(/^"(.*)"$/, "$1"));

    const parseNum = (v: string) => parseFloat(v.replace(",", ".").replace(/[^0-9.,-]/g, "")) || 0;
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(delim).map(v => v.trim().replace(/^"(.*)"$/, "$1"));
      const row: Record<string, string> = {};
      headers.forEach((h, j) => { row[h.toLowerCase().trim()] = vals[j] || ""; });

      const name = row["ürün adı"] || row["name"] || "";
      const slug = row["slug"] || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (!name) continue;

      await prisma.equipment.upsert({
        where: { slug },
        update: {
          name, description: row["açıklama"] || row["description"] || "",
          price: parseNum(row["fiyat (₺)"] || row["fiyat"] || row["price"]),
          salePrice: parseNum(row["i̇ndirimli"] || row["salePrice"] || "") || null,
          image: row["görsel"] || row["image"] || "",
          soldOut: (row["tükendi"] || "").toLowerCase() === "evet" || row["tükendi"] === "1",
          sortOrder: parseInt(row["sıra"] || row["sortorder"]) || 0,
          published: (row["yayında"] || "").toLowerCase() === "evet" || row["yayında"] === "1",
        },
        create: {
          name, slug,
          description: row["açıklama"] || row["description"] || "",
          price: parseNum(row["fiyat (₺)"] || row["fiyat"] || row["price"]),
          salePrice: parseNum(row["i̇ndirimli"] || row["salePrice"] || "") || null,
          image: row["görsel"] || row["image"] || "",
          soldOut: (row["tükendi"] || "").toLowerCase() === "evet" || row["tükendi"] === "1",
          sortOrder: parseInt(row["sıra"] || row["sortorder"]) || 0,
          published: (row["yayında"] || "").toLowerCase() === "evet" || row["yayında"] === "1",
        },
      });
      imported++;
    }

    return NextResponse.json({ success: true, imported });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
