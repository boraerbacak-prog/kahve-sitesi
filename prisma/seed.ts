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

  // Clean slate: remove all products and old categories
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categories = [
    { name: "Standart Çekirdek", slug: "standart-cekirdek" },
    { name: "Specialty", slug: "specialty" },
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
    // === STANDART ÇEKİRDEKLER (Mayıs 2026 Fiyat Listesi) ===
    {
      name: "Guatemala SHB 18 SC",
      slug: "guatemala-shb-18-sc",
      description: "Kakao, baharat ve fındık notalarıyla dolgun gövdeli, dengeli asiditeli bir Guatemala kahvesi.",
      price: 1377.62, stock: 50, weight: 1000,
      origin: "Guatemala", region: "Antigua", roastLevel: "medium",
      body: "Full", acidity: "Medium",
      flavorNotes: JSON.stringify(["kakao", "baharat", "fındık"]),
      grade: "SHB 18 SC", segment: "standart",
      categorySlug: "standart-cekirdek", featured: true,
    },
    {
      name: "Guatemala",
      slug: "guatemala",
      description: "Karamel, badem ve sütlü çikolata notalarıyla yumuşak içimli bir Guatemala kahvesi.",
      price: 1355.05, stock: 50, weight: 1000,
      origin: "Guatemala", region: "Various", roastLevel: "medium",
      body: "Medium", acidity: "Medium",
      flavorNotes: JSON.stringify(["karamel", "badem", "sütlü çikolata"]),
      grade: "SHB", segment: "standart",
      categorySlug: "standart-cekirdek", featured: false,
    },
    {
      name: "Colombia Supremo 18 SC",
      slug: "colombia-supremo-18-sc",
      description: "Karamel, kırmızı meyve ve çikolata notalarıyla zengin, dengeli bir Kolombiya kahvesi.",
      price: 1363.73, stock: 50, weight: 1000,
      origin: "Kolombiya", region: "Various", roastLevel: "medium",
      body: "Medium", acidity: "Medium",
      flavorNotes: JSON.stringify(["karamel", "kırmızı meyve", "çikolata"]),
      grade: "Supremo 18 SC", segment: "standart",
      categorySlug: "standart-cekirdek", featured: true,
    },
    {
      name: "Brasil Mogiana",
      slug: "brasil-mogiana",
      description: "Fındık, çikolata ve karamel notalarıyla dolgun gövdeli, düşük asiditeli bir Brezilya kahvesi.",
      price: 1304.69, stock: 50, weight: 1000,
      origin: "Brezilya", region: "Mogiana", roastLevel: "medium",
      body: "Full", acidity: "Low",
      flavorNotes: JSON.stringify(["fındık", "çikolata", "karamel"]),
      grade: "SC", segment: "standart",
      categorySlug: "standart-cekirdek", featured: true,
    },
    {
      name: "Rio Minas 17-18 2/3 (TK)",
      slug: "rio-minas",
      description: "Çikolata, fındık ve tahıl notalarıyla orta gövdeli, düşük asiditeli bir Brezilya kahvesi.",
      price: 1012.97, stock: 50, weight: 1000,
      origin: "Brezilya", region: "Minas Gerais", roastLevel: "medium",
      body: "Medium", acidity: "Low",
      flavorNotes: JSON.stringify(["çikolata", "fındık", "tahıl"]),
      grade: "17-18", segment: "standart",
      categorySlug: "standart-cekirdek", featured: false,
    },
    {
      name: "Ethiopia Sidamo G2",
      slug: "ethiopia-sidamo-g2",
      description: "Çiçek, limon ve bergamot notalarıyla parlak, hafif gövdeli bir Etiyopya kahvesi.",
      price: 1309.03, stock: 50, weight: 1000,
      origin: "Etiyopya", region: "Sidamo", roastLevel: "light",
      body: "Light", acidity: "High",
      flavorNotes: JSON.stringify(["çiçek", "limon", "bergamot"]),
      grade: "G2", segment: "standart",
      categorySlug: "standart-cekirdek", featured: true,
    },
    {
      name: "Ethiopia Sidamo G4",
      slug: "ethiopia-sidamo-g4",
      description: "Yasemin, limon ve çiçek notalarıyla canlı, hafif gövdeli bir Etiyopya kahvesi.",
      price: 1104.13, stock: 50, weight: 1000,
      origin: "Etiyopya", region: "Sidamo", roastLevel: "light",
      body: "Light", acidity: "High",
      flavorNotes: JSON.stringify(["yasemin", "limon", "çiçek"]),
      grade: "G4", segment: "standart",
      categorySlug: "standart-cekirdek", featured: false,
    },
    {
      name: "Ethiopia Lekempt G4",
      slug: "ethiopia-lekempt-g4",
      description: "Çiçek, şeftali ve çay notalarıyla hafif gövdeli, orta asiditeli bir Etiyopya kahvesi.",
      price: 947.85, stock: 50, weight: 1000,
      origin: "Etiyopya", region: "Lekempt", roastLevel: "light",
      body: "Light", acidity: "Medium",
      flavorNotes: JSON.stringify(["çiçek", "şeftali", "çay"]),
      grade: "G4", segment: "standart",
      categorySlug: "standart-cekirdek", featured: false,
    },
    {
      name: "Rwanda Kula Project",
      slug: "rwanda-kula-project",
      description: "Çilek, vişne ve pembe meyve notalarıyla hafif gövdeli, yüksek asiditeli bir Ruanda kahvesi.",
      price: 1104.13, stock: 50, weight: 1000,
      origin: "Ruanda", region: "Kula", roastLevel: "light",
      body: "Light", acidity: "High",
      flavorNotes: JSON.stringify(["çilek", "vişne", "pembe meyveler"]),
      grade: "A", segment: "standart",
      categorySlug: "standart-cekirdek", featured: false,
    },
    {
      name: "Rwanda Impexcor",
      slug: "rwanda-impexcor",
      description: "Kırmızı meyve, karamel ve pembe meyve notalarıyla orta gövdeli bir Ruanda kahvesi.",
      price: 1149.28, stock: 50, weight: 1000,
      origin: "Ruanda", region: "Various", roastLevel: "light",
      body: "Medium", acidity: "Medium",
      flavorNotes: JSON.stringify(["kırmızı meyve", "karamel", "pembe meyveler"]),
      grade: "A", segment: "standart",
      categorySlug: "standart-cekirdek", featured: false,
    },
    {
      name: "Peru Grade 1",
      slug: "peru-grade-1",
      description: "Fındık, çikolata ve portakal notalarıyla orta gövdeli, dengeli bir Peru kahvesi.",
      price: 1373.28, stock: 50, weight: 1000,
      origin: "Peru", region: "Various", roastLevel: "medium",
      body: "Medium", acidity: "Medium",
      flavorNotes: JSON.stringify(["fındık", "çikolata", "portakal"]),
      grade: "Grade 1", segment: "standart",
      categorySlug: "standart-cekirdek", featured: false,
    },
    {
      name: "Venezuela",
      slug: "venezuela",
      description: "Badem, sütlü çikolata ve fındık notalarıyla orta gövdeli, düşük asiditeli bir Venezuela kahvesi.",
      price: 1134.52, stock: 50, weight: 1000,
      origin: "Venezuela", region: "Various", roastLevel: "medium",
      body: "Medium", acidity: "Low",
      flavorNotes: JSON.stringify(["badem", "sütlü çikolata", "fındık"]),
      grade: "A", segment: "standart",
      categorySlug: "standart-cekirdek", featured: false,
    },
    {
      name: "Honduras",
      slug: "honduras",
      description: "Kavun, bal ve karamel notalarıyla orta gövdeli, tatlı bir Honduras kahvesi.",
      price: 1377.62, stock: 50, weight: 1000,
      origin: "Honduras", region: "Various", roastLevel: "medium",
      body: "Medium", acidity: "Medium",
      flavorNotes: JSON.stringify(["kavun", "bal", "karamel"]),
      grade: "SHG", segment: "standart",
      categorySlug: "standart-cekirdek", featured: false,
    },
    {
      name: "Costa Rica Terrazu",
      slug: "costa-rica-terrazu",
      description: "Portakal, bal ve kırmızı meyve notalarıyla orta gövdeli, yüksek asiditeli bir Kosta Rika kahvesi.",
      price: 1373.28, stock: 50, weight: 1000,
      origin: "Kosta Rika", region: "Terrazu", roastLevel: "medium",
      body: "Medium", acidity: "High",
      flavorNotes: JSON.stringify(["portakal", "bal", "kırmızı meyve"]),
      grade: "SHB", segment: "standart",
      categorySlug: "standart-cekirdek", featured: false,
    },
    {
      name: "Uganda Robusta",
      slug: "uganda-robusta",
      description: "Bitter, fındık ve kakao notalarıyla dolgun gövdeli, düşük asiditeli bir Uganda Robusta kahvesi.",
      price: 826.30, stock: 50, weight: 1000,
      origin: "Uganda", region: "Various", roastLevel: "dark",
      body: "Full", acidity: "Low",
      flavorNotes: JSON.stringify(["bitter", "fındık", "kakao"]),
      grade: "Screen 18", segment: "standart",
      categorySlug: "standart-cekirdek", featured: false,
    },

    // === SPECIALTY ÇEKİRDEKLER ===
    {
      name: "Ethiopia Yirga Koke Honey G1",
      slug: "ethiopia-yirga-koke-honey-g1",
      description: "Çiçek, bal ve bergamot notalarıyla parlak, hafif gövdeli specialty bir Etiyopya kahvesi. Honey işleme yöntemiyle elde edilmiştir.",
      price: 2218.00, stock: 25, weight: 1000,
      origin: "Etiyopya", region: "Yirgacheffe", roastLevel: "light",
      body: "Light", acidity: "High",
      flavorNotes: JSON.stringify(["çiçek", "bal", "bergamot"]),
      grade: "G1", process: "Honey", segment: "specialty",
      categorySlug: "specialty", featured: true,
    },
    {
      name: "Ethiopia Chelbessa Danche G1",
      slug: "ethiopia-chelbessa-danche-g1",
      description: "Yasemin, limon ve çiçek notalarıyla canlı, hafif gövdeli specialty bir Etiyopya kahvesi.",
      price: 1927.14, stock: 25, weight: 1000,
      origin: "Etiyopya", region: "Chelbessa", roastLevel: "light",
      body: "Light", acidity: "High",
      flavorNotes: JSON.stringify(["yasemin", "limon", "çiçek"]),
      grade: "G1", process: "Washed", segment: "specialty",
      categorySlug: "specialty", featured: true,
    },
    {
      name: "Ethiopia Ariacha G1",
      slug: "ethiopia-ariacha-g1",
      description: "Şeftali, çiçek ve bergamot notalarıyla zarif, hafif gövdeli specialty bir Etiyopya kahvesi.",
      price: 2263.58, stock: 25, weight: 1000,
      origin: "Etiyopya", region: "Ariacha", roastLevel: "light",
      body: "Light", acidity: "High",
      flavorNotes: JSON.stringify(["şeftali", "çiçek", "bergamot"]),
      grade: "G1", process: "Natural", segment: "specialty",
      categorySlug: "specialty", featured: false,
    },
    {
      name: "Colombia La Roca Pink Bourbon",
      slug: "colombia-la-roca-pink-bourbon",
      description: "Pembe meyveler, çiçek ve bal notalarıyla kompleks, hafif gövdeli nadir bir Pink Bourbon çeşidi.",
      price: 3494.29, stock: 15, weight: 1000,
      origin: "Kolombiya", region: "La Roca", roastLevel: "light",
      body: "Light", acidity: "High",
      flavorNotes: JSON.stringify(["pembe meyveler", "çiçek", "bal"]),
      grade: "G1", variety: "Pink Bourbon", process: "Washed", segment: "specialty",
      categorySlug: "specialty", featured: true,
    },
    {
      name: "Colombia El Paraiso",
      slug: "colombia-el-paraiso",
      description: "Kırmızı meyve, karamel ve pembe meyve notalarıyla orta gövdeli, zarif bir Kolombiya specialty kahvesi.",
      price: 3031.96, stock: 20, weight: 1000,
      origin: "Kolombiya", region: "El Paraiso", roastLevel: "light",
      body: "Medium", acidity: "High",
      flavorNotes: JSON.stringify(["kırmızı meyve", "karamel", "pembe meyveler"]),
      grade: "G1", process: "Washed", segment: "specialty",
      categorySlug: "specialty", featured: false,
    },
    {
      name: "Colombia La Reserva",
      slug: "colombia-la-reserva",
      description: "Kırmızı meyve, çiçek ve bal notalarıyla orta gövdeli, dengeli bir Kolombiya specialty kahvesi.",
      price: 3026.53, stock: 20, weight: 1000,
      origin: "Kolombiya", region: "La Reserva", roastLevel: "light",
      body: "Medium", acidity: "Medium",
      flavorNotes: JSON.stringify(["kırmızı meyve", "çiçek", "bal"]),
      grade: "G1", process: "Washed", segment: "specialty",
      categorySlug: "specialty", featured: false,
    },

  ];

  for (const product of products) {
    const category = await prisma.category.findUnique({ where: { slug: product.categorySlug } });
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        compareAt: product.compareAt || undefined,
        stock: product.stock,
        weight: product.weight,
        origin: product.origin,
        region: product.region || undefined,
        roastLevel: product.roastLevel,
        body: product.body || undefined,
        acidity: product.acidity || undefined,
        flavorNotes: product.flavorNotes || undefined,
        grade: product.grade || undefined,
        process: product.process || undefined,
        variety: product.variety || undefined,
        segment: product.segment || undefined,
        featured: product.featured,
        published: true,
        categoryId: category.id,
      },
      create: {
        name: product.name, slug: product.slug,
        description: product.description,
        price: product.price,
        compareAt: product.compareAt || undefined,
        stock: product.stock, weight: product.weight,
        origin: product.origin,
        region: product.region || undefined,
        roastLevel: product.roastLevel,
        body: product.body || undefined,
        acidity: product.acidity || undefined,
        flavorNotes: product.flavorNotes || undefined,
        grade: product.grade || undefined,
        process: product.process || undefined,
        variety: product.variety || undefined,
        segment: product.segment || undefined,
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
    { label: "Dükkan", href: "#", sortOrder: 1 },
    { label: "İZ", href: "#", sortOrder: 2 },
    { label: "Zanaat", href: "#", sortOrder: 3 },
    { label: "Kurumsal", href: "#", sortOrder: 4 },
    { label: "Hikâyemiz", href: "/hikaye", sortOrder: 5 },
  ];

  const created: Record<string, string> = {};
  for (const item of menuItems) {
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
    { label: "Demleme Rehberi", href: "/demleme", parentLabel: "Deneyim", sortOrder: 2 },
    { label: "Kurumsal Satış", href: "/b2b", parentLabel: "Kurumsal", sortOrder: 1 },
    { label: "Akademi", href: "/blog", parentLabel: "Kurumsal", sortOrder: 2 },
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
      linkUrl: "/ai-barista",
      linkText: "Kahveni Keşfet",
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
