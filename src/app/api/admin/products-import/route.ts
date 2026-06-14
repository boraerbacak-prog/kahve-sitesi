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

    const headMap: Record<string, string> = {
      "kategori": "category", "ürün adı": "name", "product name": "name", "name": "name",
      "slug": "slug", "fiyat (₺)": "price", "fiyat": "price", "price": "price",
      "i̇ndirimli": "compareAt", "indirimli fiyat": "compareAt", "compareat": "compareAt",
      "stok": "stock", "stock": "stock",
      "ağırlık (g)": "weight", "ağırlık": "weight", "weight": "weight",
      "menşei": "origin", "menşe": "origin", "origin": "origin",
      "bölge": "region", "region": "region",
      "kavrum": "roastLevel", "roastlevel": "roastLevel",
      "gövde": "body", "body": "body",
      "asidite": "acidity", "acidity": "acidity",
      "segment": "segment", "seviye": "grade", "grade": "grade",
      "i̇şlem": "process", "process": "process",
      "çeşit": "variety", "variety": "variety",
      "rakım": "altitude", "altitude": "altitude",
      "yayında": "published", "published": "published",
      "öne çıkan": "featured", "featured": "featured",
    };
    const mapped = headers.map(h => headMap[h.toLowerCase().trim()] || h);

    const colIndex = (name: string) => mapped.indexOf(name);

    const parseNum = (v: string) => parseFloat(v.replace(",", ".").replace(/[^0-9.,-]/g, "")) || 0;

    const cats = await prisma.category.findMany();
    const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

    let imported = 0;
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(delim).map((v: string) => v.trim().replace(/^"(.*)"$/, "$1"));
      const get = (name: string) => { const idx = colIndex(name); return idx >= 0 ? vals[idx] || "" : ""; };

      const name = get("name");
      const slug = get("slug");
      if (!name || !slug) continue;

      const catName = get("category");
      const categorySlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "standart-cekirdek";
      const categoryId = catMap[categorySlug];
      if (!categoryId) continue;

      await prisma.product.upsert({
        where: { slug },
        update: {
          name,
          description: get("description") || "",
          price: parseNum(get("price")),
          compareAt: get("compareAt") ? parseNum(get("compareAt")) : null,
          stock: parseInt(get("stock")) || 0,
          weight: get("weight") ? parseInt(get("weight")) : null,
          origin: get("origin") || null,
          region: get("region") || null,
          roastLevel: get("roastLevel") || null,
          categoryId,
          published: get("published").toLowerCase() === "evet" || get("published") === "1",
          featured: get("featured").toLowerCase() === "evet" || get("featured") === "1",
        },
        create: {
          name, slug,
          description: get("description") || "",
          price: parseNum(get("price")),
          compareAt: get("compareAt") ? parseNum(get("compareAt")) : null,
          stock: parseInt(get("stock")) || 0,
          weight: get("weight") ? parseInt(get("weight")) : null,
          origin: get("origin") || null,
          region: get("region") || null,
          roastLevel: get("roastLevel") || null,
          categoryId,
          published: get("published").toLowerCase() === "evet" || get("published") === "1",
          featured: get("featured").toLowerCase() === "evet" || get("featured") === "1",
        },
      });
      imported++;
    }

    return NextResponse.json({ success: true, imported });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
