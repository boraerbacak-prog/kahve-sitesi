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
    where: { email: "admin@rostello.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@rostello.com",
      password: adminPassword,
      role: "admin",
    },
  });
  console.log("Admin:", admin.email);

  // Segments as categories
  const cats = [
    { name: "Standart Çekirdek", slug: "standart" },
    { name: "Specialty", slug: "specialty" },
    { name: "Blend & Harman", slug: "blend" },
  ];
  for (const c of cats) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  console.log("Kategoriler eklendi");

  const categories = {};
  for (const c of cats) {
    const cat = await prisma.category.findUnique({ where: { slug: c.slug } });
    categories[c.slug] = cat.id;
  }

  const products = [
    // === STANDART ÇEKİRDEK ===
    {
      name: "Guatemala SHB 18 SC", slug: "guatemala-shb-18-sc",
      desc: "Yüksek rakımda yetişen sert çekirdekli Guatemala kahvesi. Dengeli gövde, kakao ve hafif baharat notaları.",
      price: 1380, stock: 100, weight: 1000,
      origin: "Guatemala", region: "Huehuetenango / Antigua", altitude: "1500-1800m",
      process: "Washed", variety: "Arabica", grade: "SHB 18 SC",
      roastLevel: "medium", segment: "standart",
      flavorNotes: JSON.stringify(["kakao", "baharat", "fındık", "sütlü çikolata"]),
      body: "Full", acidity: "Medium",
      cat: "standart", featured: true,
    },
    {
      name: "Guatemala", slug: "guatemala",
      desc: "Klasik Guatemala karakteri. Dengeli, tatlı ve yumuşak içimli.",
      price: 1355, stock: 100, weight: 1000,
      origin: "Guatemala", region: "Antigua", altitude: "1300-1700m",
      process: "Washed", variety: "Arabica",
      roastLevel: "medium", segment: "standart",
      flavorNotes: JSON.stringify(["karamel", "çikolata", "portakal"]),
      body: "Medium", acidity: "Medium",
      cat: "standart",
    },
    {
      name: "Colombia Supremo 18 SC", slug: "colombia-supremo-18-sc",
      desc: "Kolombiya'nın en kaliteli çekirdek sınıfı. Tatlı, yumuşak ve aromatik.",
      price: 1365, stock: 100, weight: 1000,
      origin: "Colombia", region: "Huila / Antioquia", altitude: "1400-1800m",
      process: "Washed", variety: "Arabica", grade: "Supremo 18 SC",
      roastLevel: "medium", segment: "standart",
      flavorNotes: JSON.stringify(["karamel", "kırmızı meyve", "çikolata"]),
      body: "Medium", acidity: "Medium",
      cat: "standart", featured: true,
    },
    {
      name: "Brasil Mogiana", slug: "brasil-mogiana",
      desc: "Brezilya Mogiana bölgesi kahvesi. Düşük asiditeli, tatlı ve dengeli.",
      price: 1310, stock: 100, weight: 1000,
      origin: "Brezilya", region: "Mogiana", altitude: "900-1200m",
      process: "Natural / Pulped Natural", variety: "Arabica",
      roastLevel: "medium", segment: "standart",
      flavorNotes: JSON.stringify(["fındık", "çikolata", "karamel", "yer fıstığı"]),
      body: "Full", acidity: "Low",
      cat: "standart", featured: true,
    },
    {
      name: "Rio Minas 17-18 2/3 (TK)", slug: "rio-minas-17-18-2-3",
      desc: "Uygun fiyatlı, günlük kullanım için ideal Brezilya kahvesi.",
      price: 1015, stock: 100, weight: 1000,
      origin: "Brezilya", region: "Minas Gerais", altitude: "800-1200m",
      process: "Natural", variety: "Arabica", grade: "17-18 2/3 (TK)",
      roastLevel: "medium", segment: "standart",
      flavorNotes: JSON.stringify(["tahıl", "çikolata", "haftif meyvemsi"]),
      body: "Medium", acidity: "Low",
      cat: "standart",
    },
    {
      name: "Ethiopia Sidamo G2", slug: "ethiopia-sidamo-g2",
      desc: "Sidamo bölgesinin zarif ve çiçeksi karakteri. Grade 2 kalite.",
      price: 1310, stock: 75, weight: 1000,
      origin: "Etiyopya", region: "Sidamo", altitude: "1700-2200m",
      process: "Washed", variety: "Arabica", grade: "G2",
      roastLevel: "light", segment: "standart",
      flavorNotes: JSON.stringify(["çiçek", "limon", "bergamot", "yeşil çay"]),
      body: "Light", acidity: "High",
      cat: "standart", featured: true,
    },
    {
      name: "Ethiopia Sidamo G4", slug: "ethiopia-sidamo-g4",
      desc: "Sidamo'nun ulaşılabilir versiyonu. Günlük filtre kahve için ideal.",
      price: 1110, stock: 75, weight: 1000,
      origin: "Etiyopya", region: "Sidamo", altitude: "1700-2000m",
      process: "Washed", variety: "Arabica", grade: "G4",
      roastLevel: "light", segment: "standart",
      flavorNotes: JSON.stringify(["çiçek", "narenciye", "hafif meyvemsi"]),
      body: "Light", acidity: "High",
      cat: "standart",
    },
    {
      name: "Ethiopia Lekempt G4", slug: "ethiopia-lekempt-g4",
      desc: "Ekonomik Etiyopya seçeneği. Yumuşak ve tatlı.",
      price: 950, stock: 100, weight: 1000,
      origin: "Etiyopya", region: "Lekempti (Wollega)", altitude: "1500-1900m",
      process: "Natural", variety: "Arabica", grade: "G4",
      roastLevel: "light", segment: "standart",
      flavorNotes: JSON.stringify(["meyvemsi", "hafif çiçek", "tatlı"]),
      body: "Light", acidity: "Medium",
      cat: "standart",
    },
    {
      name: "Rwanda Kula Project", slug: "rwanda-kula-project",
      desc: "Ruanda Kula Projesi'nden özenle seçilmiş çekirdekler. Parlak ve temiz.",
      price: 1110, stock: 60, weight: 1000,
      origin: "Ruanda", region: "Kula Project", altitude: "1500-2000m",
      process: "Washed", variety: "Arabica",
      roastLevel: "light", segment: "standart",
      flavorNotes: JSON.stringify(["kırmızı meyve", "çiçek", "portakal"]),
      body: "Light", acidity: "High",
      cat: "standart",
    },
    {
      name: "Rwanda Impexcor", slug: "rwanda-impexcor",
      desc: "Ruanda'nın volkanik topraklarında yetişmiş dengeli kahve.",
      price: 1150, stock: 60, weight: 1000,
      origin: "Ruanda", region: "Impexcor", altitude: "1500-2000m",
      process: "Washed", variety: "Arabica",
      roastLevel: "light", segment: "standart",
      flavorNotes: JSON.stringify(["kırmızı meyve", "karamel", "çiçek"]),
      body: "Medium", acidity: "Medium",
      cat: "standart",
    },
    {
      name: "Peru Grade 1", slug: "peru-grade-1",
      desc: "Peru'nun yüksek rakım kahveleri. Yumuşak, tatlı ve dengeli.",
      price: 1375, stock: 60, weight: 1000,
      origin: "Peru", region: "Cajamarca / Chanchamayo", altitude: "1400-1800m",
      process: "Washed", variety: "Arabica", grade: "G1",
      roastLevel: "medium", segment: "standart",
      flavorNotes: JSON.stringify(["karamel", "fındık", "hafif meyvemsi"]),
      body: "Medium", acidity: "Medium",
      cat: "standart",
    },
    {
      name: "Venezuela", slug: "venezuela",
      desc: "Venezuela kahvesi, yumuşak ve tatlı karakteriyle öne çıkar.",
      price: 1135, stock: 50, weight: 1000,
      origin: "Venezuela", region: "Merida", altitude: "1200-1600m",
      process: "Washed", variety: "Arabica",
      roastLevel: "medium", segment: "standart",
      flavorNotes: JSON.stringify(["çikolata", "fındık", "hafif baharat"]),
      body: "Medium", acidity: "Low",
      cat: "standart",
    },
    {
      name: "Honduras", slug: "honduras",
      desc: "Orta Amerika'nın yükselen kahve üreticisi. Dengeli ve tatlı.",
      price: 1380, stock: 60, weight: 1000,
      origin: "Honduras", region: "Copán / Marcala", altitude: "1200-1700m",
      process: "Washed", variety: "Arabica",
      roastLevel: "medium", segment: "standart",
      flavorNotes: JSON.stringify(["karamel", "kırmızı meyve", "çikolata"]),
      body: "Medium", acidity: "Medium",
      cat: "standart",
    },
    {
      name: "Costa Rica Terrazu", slug: "costa-rica-terrazu",
      desc: "Costa Rica Terrazu bölgesi. Parlak asiditeli ve kompleks.",
      price: 1375, stock: 50, weight: 1000,
      origin: "Costa Rica", region: "Tarrazú", altitude: "1500-2000m",
      process: "Washed / Honey", variety: "Arabica",
      roastLevel: "medium", segment: "standart",
      flavorNotes: JSON.stringify(["portakal", "bal", "karamel", "hafif çiçek"]),
      body: "Medium", acidity: "High",
      cat: "standart",
    },
    {
      name: "Uganda Robusta", slug: "uganda-robusta",
      desc: "Yükek gövde ve krema için ideal Robusta çekirdeği. Espresso harmanlarına güç katar.",
      price: 830, stock: 100, weight: 1000,
      origin: "Uganda", region: "Mbale", altitude: "900-1400m",
      process: "Natural", variety: "Robusta",
      roastLevel: "dark", segment: "standart",
      flavorNotes: JSON.stringify(["çikolata", "fındık", "tahıl", "düşük asidite"]),
      body: "Full", acidity: "Low",
      cat: "standart",
    },

    // === SPECIALTY ===
    {
      name: "Ethiopia Yirga Koke Honey G1", slug: "ethiopia-yirga-koke-honey-g1",
      desc: "Yirga Koke'nin eşsiz Honey işlem kahvesi. Grade 1 kalite, kompleks ve zarif.",
      price: 2220, stock: 35, weight: 1000,
      origin: "Etiyopya", region: "Yirga Koke", altitude: "1800-2200m",
      process: "Honey", variety: "Arabica", grade: "G1",
      roastLevel: "light", segment: "specialty",
      flavorNotes: JSON.stringify(["bal", "yasemin", "kayısı", "limon"]),
      body: "Light", acidity: "High",
      cat: "specialty", featured: true,
    },
    {
      name: "Ethiopia Chelbessa Danche G1", slug: "ethiopia-chelbessa-danche-g1",
      desc: "Chelbessa Danche'den seçilmiş özel part. Çiçeksi ve meyvemsi.",
      price: 1930, stock: 30, weight: 1000,
      origin: "Etiyopya", region: "Chelbessa Danche", altitude: "1900-2300m",
      process: "Washed", variety: "Arabica", grade: "G1",
      roastLevel: "light", segment: "specialty",
      flavorNotes: JSON.stringify(["bergamot", "yasemin", "şeftali", "limonata"]),
      body: "Light", acidity: "High",
      cat: "specialty", featured: true,
    },
    {
      name: "Ethiopia Ariacha G1", slug: "ethiopia-ariacha-g1",
      desc: "Ariacha bölgesi Grade 1 kahvesi. Nadir bulunan özel bir part.",
      price: 2265, stock: 25, weight: 1000,
      origin: "Etiyopya", region: "Ariacha", altitude: "1900-2200m",
      process: "Washed", variety: "Arabica", grade: "G1",
      roastLevel: "light", segment: "specialty",
      flavorNotes: JSON.stringify(["çilek", "çiçek balı", "narenciye", "beyaz şeftali"]),
      body: "Light", acidity: "High",
      cat: "specialty",
    },
    {
      name: "Colombia La Roca Pink Bourbon", slug: "colombia-la-roca-pink-bourbon",
      desc: "Nadir Pink Bourbon türü. Eşsiz tat profili ve zarif asidite.",
      price: 3500, stock: 15, weight: 1000,
      origin: "Colombia", region: "La Roca", altitude: "1700-2100m",
      process: "Washed", variety: "Pink Bourbon",
      roastLevel: "light", segment: "specialty",
      flavorNotes: JSON.stringify(["pembe greyfurt", "çilek", "gül", "beyaz çay"]),
      body: "Light", acidity: "High",
      cat: "specialty", featured: true,
    },
    {
      name: "Colombia El Paraiso", slug: "colombia-el-paraiso",
      desc: "El Paraiso çiftliğinden özel seçki. Kompleks ve tatmin edici.",
      price: 3050, stock: 18, weight: 1000,
      origin: "Colombia", region: "El Paraiso", altitude: "1600-2000m",
      process: "Washed", variety: "Arabica",
      roastLevel: "light", segment: "specialty",
      flavorNotes: JSON.stringify(["kırmızı meyve", "portakal", "karamel", "çiçek"]),
      body: "Medium", acidity: "High",
      cat: "specialty",
    },
    {
      name: "Colombia La Reserva", slug: "colombia-la-reserva",
      desc: "Rezerv kalite Kolombiya. Özenle seçilmiş çekirdekler.",
      price: 3025, stock: 20, weight: 1000,
      origin: "Colombia", region: "La Reserva", altitude: "1600-2000m",
      process: "Washed", variety: "Arabica",
      roastLevel: "light", segment: "specialty",
      flavorNotes: JSON.stringify(["kırmızı meyve", "karamel", "çikolata", "portakal"]),
      body: "Medium", acidity: "Medium",
      cat: "specialty",
    },
  ];

  for (const p of products) {
    const categoryId = categories[p.cat];
    if (!categoryId) continue;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.desc,
        price: p.price,
        stock: p.stock,
        weight: p.weight,
        origin: p.origin,
        region: p.region,
        altitude: p.altitude,
        process: p.process,
        variety: p.variety,
        grade: p.grade,
        roastLevel: p.roastLevel,
        segment: p.segment,
        flavorNotes: p.flavorNotes,
        body: p.body,
        acidity: p.acidity,
        featured: p.featured || false,
        published: true,
        categoryId,
      },
    });
  }

  console.log(`${products.length} ürün eklendi`);
  console.log("\nAdmin: admin@rostello.com / admin123");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
