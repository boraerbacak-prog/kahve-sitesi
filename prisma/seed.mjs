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
  console.log("Admin:", admin.email);

  const cats = [
    { name: "Tek Köken", slug: "tek-koken" },
    { name: "Espresso Blend", slug: "espresso-blend" },
    { name: "Filtre Kahve", slug: "filtre-kahve" },
    { name: "Hediye Seti", slug: "hediye-seti" },
  ];
  for (const c of cats) await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  console.log("Kategoriler eklendi");

  const products = [
    { name:"Ethiopia Yirgacheffe", slug:"ethiopia-yirgacheffe", desc:"Çiçeksi ve narenciye notaları.", price:250, stock:50, weight:250, origin:"Etiyopya", roast:"light", cat:"tek-koken", featured:true },
    { name:"Colombia Supremo", slug:"colombia-supremo", desc:"Karamel ve çikolata.", price:220, stock:50, weight:250, origin:"Kolombiya", roast:"medium", cat:"tek-koken", featured:true },
    { name:"Espresso Classico", slug:"espresso-classico", desc:"Koyu kavrulmuş, yoğun.", price:200, compare:250, stock:50, weight:250, origin:"Karışım", roast:"dark", cat:"espresso-blend", featured:true },
    { name:"Brazil Santos", slug:"brazil-santos", desc:"Yumuşak, düşük asiditeli.", price:190, stock:50, weight:250, origin:"Brezilya", roast:"medium", cat:"filtre-kahve", featured:true },
    { name:"Guatemala Antigua", slug:"guatemala-antigua", desc:"Baharatlı ve kakao.", price:235, stock:30, weight:250, origin:"Guatemala", roast:"medium", cat:"tek-koken" },
    { name:"Kenya AA", slug:"kenya-aa", desc:"Frenk üzümü ve narenciye.", price:280, stock:25, weight:250, origin:"Kenya", roast:"light", cat:"tek-koken" },
    { name:"Hediye Seti 3'lü", slug:"hediye-seti-3lu", desc:"3 farklı kahve.", price:650, stock:20, weight:750, origin:"Karışım", roast:"medium", cat:"hediye-seti" },
  ];
  
  for (const p of products) {
    const cat = await prisma.category.findUnique({ where: { slug: p.cat } });
    if (!cat) continue;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name, slug: p.slug, description: p.desc,
        price: p.price, compareAt: p.compare, stock: p.stock, weight: p.weight,
        origin: p.origin, roastLevel: p.roast, featured: p.featured || false, published: true,
        categoryId: cat.id,
      },
    });
  }
  console.log("Ürünler eklendi");
  console.log("\nAdmin: admin@kahveci.com / admin123");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
