import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  let cat = await prisma.category.findFirst({ where: { slug: "tadim-paketi" } });
  if (!cat) {
    cat = await prisma.category.create({
      data: { name: "Tadım Paketi", slug: "tadim-paketi", description: "Özenle seçilmiş 3 kahveden oluşan tadım paketleri." },
    });
    console.log("Created category: Tadım Paketi");
  } else {
    console.log("Category Tadım Paketi already exists");
  }

  const bundles = [
    {
      name: "Standart Tadım Paketi",
      slug: "standart-tadim-paketi",
      description:
        "Giriş seviye kahvelerle tadım yolculuğuna başlayın. İçindekiler: Brasil Mogiana (fındık/çikolata/karamel), Colombia Supremo 18 SC (karamel/kırmızı meyve/çikolata), Guatemala (karamel/badem/sütlü çikolata). Her kahveden ~83g, toplam 250g. Yaklaşık 15 brew.",
      price: 750,
      stock: 50,
      weight: 250,
      origin: "Karışık",
      roastLevel: "medium",
      flavorNotes: JSON.stringify(["fındık", "karamel", "çikolata", "dengeli"]),
      segment: "bundle",
      featured: true,
      published: true,
      categoryId: cat.id,
    },
    {
      name: "Orta Tadım Paketi",
      slug: "orta-tadim-paketi",
      description:
        "Dengeli ve aromatik kahvelerle bir adım öteye. İçindekiler: Ethiopia Sidamo G2 (çiçek/limon/bergamot), Honduras (kavun/bal/karamel), Costa Rica Terrazu (portakal/bal/kırmızı meyve). Her kahveden ~83g, toplam 250g. Yaklaşık 15 brew.",
      price: 750,
      stock: 50,
      weight: 250,
      origin: "Karışık",
      roastLevel: "medium",
      flavorNotes: JSON.stringify(["çiçek", "bal", "karamel", "ferah"]),
      segment: "bundle",
      featured: true,
      published: true,
      categoryId: cat.id,
    },
    {
      name: "Üst Damak Tadım Paketi",
      slug: "ust-damak-tadim-paketi",
      description:
        "Premium tek köken kahvelerle gerçek bir deneyim. İçindekiler: Colombia El Paraiso (kırmızı meyve/karamel/pembe meyveler), Ethiopia Yirga Koke Honey G1 (çiçek/bal/bergamot), Colombia La Roca Pink Bourbon (pembe meyveler/çiçek/bal). Her kahveden ~83g, toplam 250g. Yaklaşık 15 brew.",
      price: 750,
      stock: 50,
      weight: 250,
      origin: "Kolombiya, Etiyopya",
      roastLevel: "light",
      flavorNotes: JSON.stringify(["pembe meyve", "çiçek", "bal", "bergamot", "kompleks"]),
      segment: "bundle",
      featured: true,
      published: true,
      categoryId: cat.id,
    },
  ];

  for (const b of bundles) {
    const existing = await prisma.product.findUnique({ where: { slug: b.slug } });
    if (!existing) {
      await prisma.product.create({ data: b });
      console.log("Created:", b.name);
    } else {
      console.log("Already exists:", b.name);
    }
  }

  await prisma.$disconnect();
  console.log("Done!");
}

main().catch(console.error);
