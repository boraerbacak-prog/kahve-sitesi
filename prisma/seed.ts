import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ZHEbiXSjn5e2@ep-odd-dew-aploo4k9-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@kahveci.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@kahveci.com",
      password: adminPassword,
      role: "admin",
    },
  });

  console.log("Admin oluşturuldu:", admin.email);

  const categories = [
    { name: "Tek Köken", slug: "tek-koken" },
    { name: "Espresso Blend", slug: "espresso-blend" },
    { name: "Filtre Kahve", slug: "filtre-kahve" },
    { name: "Hediye Seti", slug: "hediye-seti" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("Kategoriler oluşturuldu");

  const products = [
    {
      name: "Ethiopia Yirgacheffe",
      slug: "ethiopia-yirgacheffe",
      description: "Çiçeksi ve narenciye notalarıyla parlak, orta gövdeli bir kahve.",
      price: 250, stock: 50, weight: 250,
      origin: "Etiyopya", roastLevel: "light",
      categorySlug: "tek-koken", featured: true,
    },
    {
      name: "Colombia Supremo",
      slug: "colombia-supremo",
      description: "Karamel ve çikolata notaları, dengeli asidite.",
      price: 220, stock: 50, weight: 250,
      origin: "Kolombiya", roastLevel: "medium",
      categorySlug: "tek-koken", featured: true,
    },
    {
      name: "Espresso Classico",
      slug: "espresso-classico",
      description: "Koyu kavrulmuş, yoğun gövdeli.",
      price: 200, compareAt: 250, stock: 50, weight: 250,
      origin: "Karışım", roastLevel: "dark",
      categorySlug: "espresso-blend", featured: true,
    },
    {
      name: "Brazil Santos",
      slug: "brazil-santos",
      description: "Yumuşak, düşük asiditeli.",
      price: 190, stock: 50, weight: 250,
      origin: "Brezilya", roastLevel: "medium",
      categorySlug: "filtre-kahve", featured: true,
    },
    {
      name: "Guatemala Antigua",
      slug: "guatemala-antigua",
      description: "Baharatlı ve kakao notaları.",
      price: 235, stock: 30, weight: 250,
      origin: "Guatemala", roastLevel: "medium",
      categorySlug: "tek-koken", featured: false,
    },
    {
      name: "Kenya AA",
      slug: "kenya-aa",
      description: "Siyah frenk üzümü ve narenciye.",
      price: 280, stock: 25, weight: 250,
      origin: "Kenya", roastLevel: "light",
      categorySlug: "tek-koken", featured: false,
    },
    {
      name: "Hediye Seti - 3'lü",
      slug: "hediye-seti-3lu",
      description: "3 farklı tek köken kahve, özel kutusunda.",
      price: 650, stock: 20, weight: 750,
      origin: "Karışım", roastLevel: "medium",
      categorySlug: "hediye-seti", featured: false,
    },
  ];

  for (const product of products) {
    const category = await prisma.category.findUnique({ where: { slug: product.categorySlug } });
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name, slug: product.slug,
        description: product.description,
        price: product.price, compareAt: product.compareAt || undefined,
        stock: product.stock, weight: product.weight,
        origin: product.origin, roastLevel: product.roastLevel,
        featured: product.featured, published: true,
        categoryId: category.id,
      },
    });
  }

  console.log(`${products.length} ürün oluşturuldu`);
  console.log("\nAdmin: admin@kahveci.com / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
