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

  const plans = [
    { name: "Başlangıç", slug: "baslangic", description: "Ayda 1 paket taze kahve. Yeni tatlar keşfetmek isteyenler için ideal.", price: 199, packageCount: 1, packageSize: 250, sortOrder: 1 },
    { name: "Keyif", slug: "keyif", description: "Ayda 2 paket. Düzenli kahve tüketenler için en popüler seçenek.", price: 379, packageCount: 2, packageSize: 250, hasDiscovery: true, discountPercent: 5, sortOrder: 2 },
    { name: "Gurme", slug: "gurme", description: "Ayda 3 paket. Gerçek kahve tutkunları için özel seçki.", price: 549, packageCount: 3, packageSize: 250, hasDiscovery: true, hasSpecialty: true, hasPriority: true, discountPercent: 10, sortOrder: 3 },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    });
  }

  console.log(`${plans.length} abonelik planı oluşturuldu`);

  await prisma.menuItem.deleteMany({ where: { parentId: { not: null } } });
  await prisma.menuItem.deleteMany();

  const menuItems = [
    { label: "Dijital Barista", href: "/ai-barista", sortOrder: 1 },
    { label: "Kahveler", href: "/urunler", sortOrder: 2 },
    { label: "Kahveni Bul", href: "/damak-testi", sortOrder: 3 },
    { label: "Abonelik", href: "/abonelik", sortOrder: 4 },
    { label: "Demleme", href: "/demleme", sortOrder: 5 },
    { label: "Akademi", href: "/blog", sortOrder: 6 },
    { label: "B2B", href: "/b2b", sortOrder: 7 },
  ];

  const created: Record<string, string> = {};
  for (const item of menuItems) {
    const m = await prisma.menuItem.create({ data: item });
    created[item.label] = m.id;
  }

  const subs = [
    { label: "Tüm Kahveler", href: "/urunler", parentLabel: "Kahveler", sortOrder: 1 },
    { label: "İmza Ürünler", href: "/imza-urunler", parentLabel: "Kahveler", sortOrder: 2 },
    { label: "Ekipmanlar", href: "/ekipmanlar", parentLabel: "Kahveler", sortOrder: 3 },
  ];

  for (const sub of subs) {
    await prisma.menuItem.create({
      data: { label: sub.label, href: sub.href, parentId: created[sub.parentLabel], sortOrder: sub.sortOrder },
    });
  }

  const totalMenus = menuItems.length + subs.length;
  console.log(`${totalMenus} menü öğesi oluşturuldu`);

  const pages = [
    {
      title: "Hakkımızda",
      slug: "hakkimizda",
      content: "<p>Rostello, en taze özel kahve çekirdeklerini özenle seçip kavuran bir kahve markasıdır.</p><p>Kahve tutkunlarına sipariş üzerine kavrulmuş, en kaliteli çekirdekleri sunuyoruz.</p>",
      published: true,
    },
    {
      title: "İletişim",
      slug: "iletisim",
      content: "<p>Bize ulaşmak için:</p><ul><li>Email: info@rostello.com</li><li>Instagram: @rostello</li></ul>",
      published: true,
    },
  ];

  for (const page of pages) {
    const existing = await prisma.customPage.findUnique({ where: { slug: page.slug } });
    if (!existing) {
      await prisma.customPage.create({ data: page });
    }
  }
  console.log(`${pages.length} sayfa oluşturuldu`);

  await prisma.homepageBlock.deleteMany();

  const blocks = [
    {
      section: "hero",
      blockType: "hero-heading",
      title: "Kahvenizi <span class=\"animate-copper mx-2\">Yapay Zeka</span> ile Keşfedin",
      subtitle: "",
      content: "",
      imageUrl: "",
      imageSize: "",
      linkUrl: "",
      linkText: "",
      badgeText: "",
      sortOrder: 0,
      styles: JSON.stringify({ textSize: "text-2xl sm:text-3xl lg:text-4xl", marginBottom: "mb-6" }),
    },
    {
      section: "hero",
      blockType: "hero-kahveni-bul",
      title: "Kahveni Bul",
      subtitle: "",
      content: "Damak tadınıza uygun kahveyi bulmak için testi çözün, size özel kahve profilinizi oluşturun.",
      imageUrl: "/celsus/kahveni-bul-carki.png",
      imageSize: "w-[420px] h-[420px] lg:w-[600px] lg:h-[600px]",
      linkUrl: "/damak-testi",
      linkText: "Teste Başla →",
      badgeText: "",
      sortOrder: 1,
      styles: JSON.stringify({ gap: "gap-8 lg:gap-12", titleSize: "text-3xl lg:text-4xl", contentSize: "text-base lg:text-lg", buttonSize: "px-8 py-4 text-sm" }),
    },
    {
      section: "hero",
      blockType: "hero-barista",
      title: "Barista ile Konuş",
      subtitle: "",
      content: "Kahve önerileri, demleme tüyoları ve daha fazlası için yapay zeka baristanızla sohbet edin.",
      imageUrl: "/celsus/dijital-barista.png",
      imageSize: "w-20 h-20",
      linkUrl: "/ai-barista",
      linkText: "",
      badgeText: "",
      sortOrder: 2,
      isActive: false,
      styles: JSON.stringify({ cardStyle: "bg-white border-2 border-[#D4A574] hover:border-[#C4724B]" }),
    },
  ];

  for (const block of blocks) {
    await prisma.homepageBlock.create({ data: block });
  }
  console.log(`${blocks.length} ana sayfa bloğu oluşturuldu`);

  console.log("\nAdmin: admin@kahveci.com / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
