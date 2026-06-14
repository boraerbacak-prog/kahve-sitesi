import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ZHEbiXSjn5e2@ep-odd-dew-aploo4k9-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.menuItem.deleteMany({ where: { group: "header" } });

  const items = [
    { label: "Dükkan", href: "#", sortOrder: 1, group: "header" },
    { label: "İZ", href: "#", sortOrder: 2, group: "header" },
    { label: "Zanaat", href: "#", sortOrder: 3, group: "header" },
    { label: "Kurumsal", href: "#", sortOrder: 4, group: "header" },
    { label: "Hikâyemiz", href: "/hikaye", sortOrder: 5, group: "header" },
  ];

  const created: Record<string, string> = {};
  for (const item of items) {
    const m = await prisma.menuItem.create({ data: item });
    created[item.label] = m.id;
  }

  const subs = [
    { label: "Kahveler", href: "/urunler", parentLabel: "Dükkan", sortOrder: 1 },
    { label: "Ekipmanlar", href: "/ekipmanlar", parentLabel: "Dükkan", sortOrder: 2 },
    { label: "İmza Ürünler", href: "/imza-urunler", parentLabel: "Dükkan", sortOrder: 3 },
    { label: "Kavrum Takvimi", href: "/kavrum-takvimi", parentLabel: "İZ", sortOrder: 1 },
    { label: "Kahvemi Bul", href: "/ai-barista", parentLabel: "İZ", sortOrder: 2 },
    { label: "Tahmisane", href: "/kavurma-dukkani", parentLabel: "Zanaat", sortOrder: 1 },
    { label: "Demleme Rehberi", href: "/demleme", parentLabel: "Zanaat", sortOrder: 2 },
    { label: "Kurumsal Satış", href: "/b2b", parentLabel: "Kurumsal", sortOrder: 1 },
    { label: "Akademi", href: "/blog", parentLabel: "Kurumsal", sortOrder: 2 },
  ];

  for (const sub of subs) {
    await prisma.menuItem.create({
      data: {
        label: sub.label,
        href: sub.href,
        parentId: created[sub.parentLabel],
        sortOrder: sub.sortOrder,
        group: "header",
      },
    });
  }

  console.log("✅ Menü güncellendi");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
