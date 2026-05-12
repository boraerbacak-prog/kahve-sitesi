import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ZHEbiXSjn5e2@ep-odd-dew-aploo4k9-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.menuItem.updateMany({
    where: { label: "Demleme" },
    data: { label: "Demleme Rehberi" },
  });
  console.log("Güncellendi:", result.count, "kayıt");
  await prisma.$disconnect();
}

main();
