import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const posts = [
  {
    title: "Kahve Çekirdeği Seçim Rehberi",
    slug: "kahve-cekirdegi-secim-rehberi",
    excerpt: "Arabica ve Robusta arasındaki farklar, tek köken ve harman çekirdekler. Size en uygun kahve çekirdeğini nasıl seçeceğinizi adım adım anlatıyoruz.",
    author: "Rostello",
    imageUrl: "/akademi/kahve-cekirdegi.jpg",
  },
  {
    title: "Evde Mükemmel Filtre Kahve Nasıl Yapılır?",
    slug: "evde-mukemmel-filtre-kahve",
    excerpt: "V60, Chemex ve French Press ile evde barista kalitesinde filtre kahve hazırlamanın püf noktaları. Su sıcaklığı, öğütüm boyutu ve demleme süresi rehberi.",
    author: "Rostello",
    imageUrl: "/akademi/filtre-kahve.jpg",
  },
  {
    title: "Specialty Coffee Nedir?",
    slug: "specialty-coffee-nedir",
    excerpt: "Specialty coffee sınıflandırması, SCA puanlama sistemi ve specialty kahveyi diğer kahvelerden ayıran temel özellikler.",
    author: "Rostello",
    imageUrl: "/akademi/specialty-coffee.jpg",
  },
  {
    title: "Kavrum Profilleri ve Lezzete Etkisi",
    slug: "kavrum-profilleri",
    excerpt: "Zarif, İdeal ve Karakterli kavrum arasındaki farklar. Hangi kavrum profili hangi demleme yöntemi için uygun? Detaylı kavrum rehberi.",
    author: "Rostello",
    imageUrl: "/akademi/kavrum.jpg",
  },
  {
    title: "Dünyanın En İyi Kahve Bölgeleri",
    slug: "dunyanin-en-iyi-kahve-bolgeleri",
    excerpt: "Etiyopya'dan Kolombiya'ya, Brezilya'dan Kenya'ya dünyanın dört bir yanındaki özel kahve bölgelerini ve karakteristik tat profillerini keşfedin.",
    author: "Rostello",
    imageUrl: "/akademi/kahve-bolgeleri.jpg",
  },
  {
    title: "Cold Brew Rehberi: Soğuk Kahve Sevenler İçin",
    slug: "cold-brew-rehberi",
    excerpt: "Evde cold brew yapmanın 3 farklı yöntemi. Hangi çekirdekler soğuk demleme için daha uygun? Adım adım soğuk kahve rehberi.",
    author: "Rostello",
    imageUrl: "/akademi/cold-brew.jpg",
  },
];

async function main() {
  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { ...post, published: true },
      create: { ...post, content: "<p>İçerik yakında eklenecek.</p>", published: true },
    });
    console.log(`Upserted: ${post.slug}`);
  }
  console.log("Blog seed completed.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
