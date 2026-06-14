import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const signatureProducts = [
  { name: "Rostello Logolu Tişört", slug: "rostello-logolu-tisort", description: "Rostello özel tasarım logolu pamuklu tişört.", price: 650, image: "tshirt-logolu.png", category: "Giyim", sizes: JSON.stringify(["S","M","L","XL"]), published: true },
  { name: "Rostello Termos", slug: "rostello-termos", description: "Rostello logolu çelik termos.", price: 750, image: "termos2.png", category: "Aksesuar", published: true },
  { name: "Rostello Siyah Termos", slug: "rostello-siyah-termos", description: "Siyah mat kaplamalı Rostello termos.", price: 850, image: "rostello-siyah-termos.png", category: "Aksesuar", published: true },
  { name: "Rostello Anahtarlık (Kırmızı)", slug: "rostello-anahtarlik-kirmizi", description: "Rostello logolu deri anahtarlık.", price: 150, image: "anahtarlik-1.png", category: "Aksesuar", published: true },
  { name: "Rostello Anahtarlık (Mavi)", slug: "rostello-anahtarlik-mavi", description: "Rostello logolu deri anahtarlık.", price: 150, image: "anahtarlik-2.png", category: "Aksesuar", published: true },
  { name: "Rostello Anahtarlık (Gri)", slug: "rostello-anahtarlik-gri", description: "Rostello logolu deri anahtarlık.", price: 150, image: "anahtarlik-3.png", category: "Aksesuar", published: true },
  { name: "Portafiltre Sapı Doğal Ahşap (E61)", slug: "portafiltre-sapi-ahsap-e61", description: "E61 grup başlıklarına uyumlu doğal ahşap portafiltre sapı.", price: 1500, salePrice: 1305, image: "wood-portafiltre-sapi-e61.jpg", category: "Wood Art", published: true },
  { name: "Lelit Ahşap Kit", slug: "lelit-ahsap-kit", description: "Lelit espresso makineleri için özel ahşap kit.", price: 4500, salePrice: 3960, image: "wood-lelit-kit.jpg", category: "Wood Art", published: true },
  { name: "Profitec Go Ahşap Buhar Düğmesi", slug: "profitec-go-ahsap-buhar", description: "Profitec Go için doğal ahşap buhar düğmesi.", price: 2000, salePrice: 1900, image: "wood-profitec-go-buhar.jpg", category: "Wood Art", published: true },
  { name: "Gaggia Classic Buhar Düğmesi", slug: "gaggia-classic-buhar", description: "Gaggia Classic için doğal ahşap buhar düğmesi.", price: 2000, salePrice: 1900, image: "wood-gaggia-buhar.jpg", category: "Wood Art", published: true },
  { name: "Lelit Mara X v2 Ahşap Kit", slug: "lelit-mara-x-v2-ahsap-kit", description: "Lelit Mara X v2 için özel ahşap kit.", price: 4500, salePrice: 3960, image: "wood-lelit-mara-x-kit.jpg", category: "Wood Art", published: true },
  { name: "Portafiltre Sapı Doğal Ahşap", slug: "portafiltre-sapi-ahsap", description: "Standart portafiltrelere uyumlu doğal ahşap sap.", price: 2500, salePrice: 2350, image: "wood-portafiltre-sapi-2.jpg", category: "Wood Art", published: true },
  { name: "Öğütücü Kapağı Mazzer Philos", slug: "ogutucu-kapagi-mazzer-philos", description: "Mazzer Philos öğütücü için doğal ahşap kapak.", price: 2000, salePrice: 1860, image: "wood-mazzer-philos-kapak.jpg", category: "Wood Art", published: true },
  { name: "Ahşap Stand", slug: "ahsap-stand", description: "Doğal ahşap stand. İhtiyacınıza uygun ölçülerde el yapımı.", price: 3000, salePrice: 2850, image: "wood-ahsap-stand.jpg", category: "Wood Art", published: true },
];

const equipment = [
  { name: "Aywens Kalibrasyonlu Kahve Tamper", slug: "aywens-tamper", description: "Kalibrasyonlu tamper. Hassas basınç.", price: 4700, salePrice: 4230, image: "aywens-tamper.jpg", published: true, soldOut: false },
  { name: "Mini Kettle 600 ML", slug: "mini-kettle-600", description: "Kompakt tasarımlı mini kettle. 600 ml.", price: 0, soldOut: true, image: "mini-kettle-600.jpg", published: true },
  { name: "Mini Kettle 350 ML Çelik", slug: "mini-kettle-350-celik", description: "Paslanmaz çelik mini kettle. 350 ml.", price: 0, soldOut: true, image: "mini-kettle-350-celik.jpg", published: true },
  { name: "Süt Potu 350 ML", slug: "sut-potu-350", description: "350 ml kapasiteli süt potu.", price: 0, soldOut: true, image: "sut-potu-350.jpg", published: true },
  { name: "Tamper Matı", slug: "tamper-mati", description: "Barista çalışma alanı için tamper matı.", price: 400, image: "tamper-mati.jpg", published: true },
  { name: "Hassas Kahve Tartısı", slug: "hassas-kahve-tartisi", description: "Tartı ve zamanlayıcılı hassas tartı.", price: 1000, salePrice: 950, image: "hassas-kahve-tartisi.jpg", published: true },
  { name: "Cam Kahve Demleme 400 ML", slug: "cam-kahve-demleme-400", description: "400 ml kapasiteli cam demleme aparatı.", price: 700, salePrice: 630, image: "cam-kahve-demleme-400.jpg", published: true },
  { name: "Seramik Demleme Kırmızı", slug: "seramik-demleme-kirmizi", description: "Kırmızı seramik kahve demleme aparatı.", price: 425, salePrice: 361.25, image: "seramik-demleme-kirmizi.jpg", published: true },
  { name: "Seramik Demleme Beyaz", slug: "seramik-demleme-beyaz", description: "Beyaz seramik kahve demleme aparatı.", price: 425, salePrice: 361.25, image: "seramik-demleme-beyaz.jpg", published: true },
  { name: "French Press", slug: "french-press", description: "350 ml French Press.", price: 450, salePrice: 382.50, image: "french-press.jpg", published: true },
  { name: "Tamper", slug: "tamper", description: "58 mm taban yüzeyli tamper.", price: 1100, salePrice: 990, image: "tamper.jpg", published: true },
  { name: "Moka Pot", slug: "moka-pot-2", description: "Geleneksel Moka Pot.", price: 0, soldOut: true, image: "moka-pot.jpg", published: true },
  { name: "Kahve Tartısı", slug: "kahve-tartisi-2", description: "Ergonomik tartı, 3000g kapasite.", price: 1100, salePrice: 1045, image: "kahve-tartisi.jpg", published: true },
  { name: "Konchero Mostro Kahve Değirmeni", slug: "konchero-mostro-degirmen", description: "Profesyonel kahve değirmeni.", price: 0, soldOut: true, image: "konchero-mostro-degirmen.jpg", published: true },
  { name: "Mocca Master Filtre Kağıdı No:4", slug: "mocca-master-filtre-4", description: "Mocca Master uyumlu No:4 filtre kağıdı.", price: 300, salePrice: 264, image: "mocca-master-filtre-4.jpg", published: true },
  { name: "Mocca Master Select", slug: "mocca-master-select-2", description: "Mocca Master Select kahve makinesi.", price: 0, soldOut: true, image: "mocca-master-select.jpg", published: true },
  { name: "Makaron (Düzleyici)", slug: "makaron-2", description: "Kahve düzleyici.", price: 0, soldOut: true, image: "makaron.jpg", published: true },
];

async function main() {
  console.log("Seeding SignatureProduct...");
  for (const p of signatureProducts) {
    await prisma.signatureProduct.upsert({ where: { slug: p.slug }, update: p, create: p });
  }
  console.log(`  ${signatureProducts.length} imza ürün eklendi`);

  console.log("Seeding Equipment...");
  for (const e of equipment) {
    await prisma.equipment.upsert({ where: { slug: e.slug }, update: e, create: e });
  }
  console.log(`  ${equipment.length} ekipman eklendi`);

  await prisma.$disconnect();
  console.log("Done!");
}

main().catch(e => { console.error(e.message); process.exit(1); });
