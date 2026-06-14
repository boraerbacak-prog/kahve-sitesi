import { prisma } from "../src/lib/prisma";

async function main() {
  const item = await prisma.menuItem.findFirst({
    where: { label: "Felsefemiz", group: "header" },
  });

  if (!item) {
    console.log("Felsefemiz menu item not found.");
    return;
  }

  await prisma.menuItem.update({
    where: { id: item.id },
    data: { href: "/felsefemiz" },
  });

  console.log(`Updated "${item.label}" href: ${item.href} → /felsefemiz`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
