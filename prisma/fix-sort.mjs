import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

await prisma.signatureProduct.update({
  where: { slug: "ahsap-stand" },
  data: { image: "wood-ahşap-stand.jpg" },
});
console.log("Fixed ahsap stand image");

const sigProducts = [
  { slug: "rostello-logolu-tisort", sortOrder: 1 },
  { slug: "rostello-termos", sortOrder: 2 },
  { slug: "rostello-siyah-termos", sortOrder: 3 },
  { slug: "rostello-anahtarlik-kirmizi", sortOrder: 4 },
  { slug: "rostello-anahtarlik-mavi", sortOrder: 5 },
  { slug: "rostello-anahtarlik-gri", sortOrder: 6 },
  { slug: "portafiltre-sapi-ahsap-e61", sortOrder: 7 },
  { slug: "lelit-ahsap-kit", sortOrder: 8 },
  { slug: "profitec-go-ahsap-buhar", sortOrder: 9 },
  { slug: "gaggia-classic-buhar", sortOrder: 10 },
  { slug: "lelit-mara-x-v2-ahsap-kit", sortOrder: 11 },
  { slug: "portafiltre-sapi-ahsap", sortOrder: 12 },
  { slug: "ogutucu-kapagi-mazzer-philos", sortOrder: 13 },
  { slug: "ahsap-stand", sortOrder: 14 },
];
for (const p of sigProducts) {
  await prisma.signatureProduct.update({ where: { slug: p.slug }, data: { sortOrder: p.sortOrder } });
}
console.log("Signature sort orders set");

const equipItems = [
  { slug: "aywens-tamper", sortOrder: 1 },
  { slug: "mini-kettle-600", sortOrder: 2 },
  { slug: "mini-kettle-350-celik", sortOrder: 3 },
  { slug: "sut-potu-350", sortOrder: 4 },
  { slug: "tamper-mati", sortOrder: 5 },
  { slug: "hassas-kahve-tartisi", sortOrder: 6 },
  { slug: "cam-kahve-demleme-400", sortOrder: 7 },
  { slug: "seramik-demleme-kirmizi", sortOrder: 8 },
  { slug: "seramik-demleme-beyaz", sortOrder: 9 },
  { slug: "french-press", sortOrder: 10 },
  { slug: "tamper", sortOrder: 11 },
  { slug: "moka-pot-2", sortOrder: 12 },
  { slug: "kahve-tartisi-2", sortOrder: 13 },
  { slug: "konchero-mostro-degirmen", sortOrder: 14 },
  { slug: "mocca-master-filtre-4", sortOrder: 15 },
  { slug: "mocca-master-select-2", sortOrder: 16 },
  { slug: "makaron-2", sortOrder: 17 },
];
for (const e of equipItems) {
  await prisma.equipment.update({ where: { slug: e.slug }, data: { sortOrder: e.sortOrder } });
}
console.log("Equipment sort orders set");

await prisma.$disconnect();
console.log("Done!");
