import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const results: string[] = [];

  // 1. HEADER MENU — Dükkan (parent) + children, plus standalone links
  const dukkan = await prisma.menuItem.findFirst({ where: { href: "/urunler", parentId: null, group: "header" } });
  if (!dukkan) {
    const parent = await prisma.menuItem.create({ data: { label: "Dükkan", href: "/urunler", group: "header", sortOrder: 1 } });
    await prisma.menuItem.create({ data: { label: "Kahveler", href: "/urunler", parentId: parent.id, group: "header", sortOrder: 1 } });
    await prisma.menuItem.create({ data: { label: "Ekipmanlar", href: "/ekipmanlar", parentId: parent.id, group: "header", sortOrder: 2 } });
    await prisma.menuItem.create({ data: { label: "İmza Ürünler", href: "/imza-urunler", parentId: parent.id, group: "header", sortOrder: 3 } });
    results.push("Dükkan + children created");
  } else {
    results.push("Dükkan already exists");
  }

  const headerLinks = [
    { label: "Kahve Aboneliği", href: "/abonelik", sortOrder: 2 },
    { label: "Çekirdek Hesap", href: "/sadakat", sortOrder: 3 },
    { label: "Kavurumhane", href: "/kavurma-dukkani", sortOrder: 4 },
    { label: "Damak Testi", href: "/damak-testi", sortOrder: 5 },
  ];
  for (const link of headerLinks) {
    const exists = await prisma.menuItem.findFirst({ where: { href: link.href, parentId: null, group: "header" } });
    if (!exists) {
      await prisma.menuItem.create({ data: { ...link, group: "header" } });
      results.push(`Header: ${link.label} created`);
    }
  }

  // 2. FOOTER MENU — grouped as parent items with children
  const footerGroups = [
    {
      label: "Markamız", sortOrder: 1, children: [
        { label: "Hikayemiz", href: "/hikaye" },
        { label: "Akademi", href: "/akademi" },
        { label: "Kurumsal", href: "/b2b" },
        { label: "Mağazalar", href: "/magazalar" },
      ],
    },
    {
      label: "Öğren", sortOrder: 2, children: [
        { label: "Demleme Rehberi", href: "/demleme" },
        { label: "Akademi", href: "/akademi" },
        { label: "Kurumsal Satış", href: "/b2b" },
        { label: "Kavurumhane", href: "/kavurma-dukkani" },
        { label: "Damak Testi", href: "/damak-testi" },
      ],
    },
    {
      label: "Kişisel Verilerin Korunması", sortOrder: 3, children: [
        { label: "KVKK ve Gizlilik Politikası", href: "#" },
        { label: "Aydınlatma Metni", href: "#" },
        { label: "Çerez Politikası", href: "#" },
        { label: "KVKK Başvuru Formu", href: "#" },
      ],
    },
  ];

  for (const group of footerGroups) {
    const existing = await prisma.menuItem.findFirst({ where: { label: group.label, parentId: null, group: "footer" } });
    if (!existing) {
      const parent = await prisma.menuItem.create({ data: { label: group.label, href: "#", group: "footer", sortOrder: group.sortOrder } });
      for (const child of group.children) {
        await prisma.menuItem.create({ data: { ...child, parentId: parent.id, group: "footer", sortOrder: group.children.indexOf(child) + 1 } });
      }
      results.push(`Footer: ${group.label} created`);
    } else {
      results.push(`Footer: ${group.label} already exists`);
    }
  }

  // 3. FILM REEL
  const filmCount = await prisma.filmReelItem.count();
  if (filmCount === 0) {
    const filmItems = [
      { imageUrl: "/products/Gemini_Generated_Image_445e1s445e1s445e.png", title: "Ethiopia Sidamo G2", sortOrder: 1 },
      { imageUrl: "/products/Gemini_Generated_Image_c7t8k5c7t8k5c7t8.png", title: "Ethiopia Sidamo G4", sortOrder: 2 },
      { imageUrl: "/products/Gemini_Generated_Image_dvivc9dvivc9dviv.png", title: "Ethiopia Lekempt G4", sortOrder: 3 },
      { imageUrl: "/products/Gemini_Generated_Image_g74yvng74yvng74y.png", title: "Guatemala SHB 18 SC", sortOrder: 4 },
      { imageUrl: "/products/Gemini_Generated_Image_u229vnu229vnu229.png", title: "Colombia Supremo 18 SC", sortOrder: 5 },
      { imageUrl: "/products/Gemini_Generated_Image_v621nbv621nbv621.png", title: "Brasil Mogiana", sortOrder: 6 },
      { imageUrl: "/products/Gemini_Generated_Image_jwubysjwubysjwub.png", title: "Ethiopia Yirga Koke", sortOrder: 7 },
      { imageUrl: "/products/Gemini_Generated_Image_vzulafvzulafvzul.png", title: "Colombia La Roca", sortOrder: 8 },
      { imageUrl: "/products/Ardor.png", title: "Ardor", sortOrder: 9 },
      { imageUrl: "/celsus/urun/urun1.png", subtitle: "Celsus Ürün", sortOrder: 10 },
      { imageUrl: "/celsus/urun/urun2.png", subtitle: "Celsus Ürün", sortOrder: 11 },
      { imageUrl: "/celsus/urun/urun3.png", subtitle: "Celsus Ürün", sortOrder: 12 },
      { imageUrl: "/products/rostellajpeg.jpeg", title: "Rostello", sortOrder: 13 },
    ];
    await prisma.filmReelItem.createMany({ data: filmItems });
    results.push("Film reel items created");
  } else {
    results.push("Film reel items already exist");
  }

  // 4. B2B CONTENT
  const b2bCount = await prisma.b2BContent.count();
  if (b2bCount === 0) {
    const b2bItems = [
      { type: "service", title: "Kahve Aboneliği", description: "Düzenli ve kesintisiz tedarik. Her siparişte taze kavrum, ücretsiz kargo ve esnek paket seçenekleriyle kahveniz hiç bitmesin.", icon: "🔄", sortOrder: 1 },
      { type: "service", title: "Özel Çekirdek", description: "Size özel kavrum profili ve sabit fiyat garantisi. İşletmenizin damak tadına göre seçilmiş tek köken ve harman çekirdekler.", icon: "🫘", sortOrder: 2 },
      { type: "service", title: "Ekipman Tedariği", description: "Profesyonel espresso makinelerinden öğütücülere, demleme ekipmanlarından aksesuarlara kadar eksiksiz ekipman çözümleri.", icon: "⚙️", sortOrder: 3 },
      { type: "value", title: "Özel Danışmanlık", description: "Kahve menünüzden ekipman seçimine, konseptinize uygun çözümler için birebir danışmanlık.", sortOrder: 1 },
      { type: "value", title: "Kalite Kontrol", description: "Her partide SCAA standartlarında cupping testi. Tutarlı lezzet ve kalite garantisi.", sortOrder: 2 },
      { type: "value", title: "Eğitim & Reçete", description: "Ekibinize özel barista eğitimi, doğru ürün sunumu için standart reçeteler ve demleme talimatları.", sortOrder: 3 },
      { type: "value", title: "Sabit Fiyat Garantisi", description: "Düzenli siparişlerinizde yıl boyu sabit fiyat. Bütçenizi öngörülebilir kılın.", sortOrder: 4 },
      { type: "value", title: "Size Özel Kavrum", description: "İşletmenizin profiline göre özel kavrum ayarları. Farklı brew metodları için optimize edilmiş çekirdekler.", sortOrder: 5 },
      { type: "value", title: "Dijital Barista Desteği", description: "7/24 erişilebilir yapay zeka destekli kahve asistanınızla anında çözüm.", sortOrder: 6 },
      { type: "process", title: "Bize Yazın", description: "Formu doldurun, ihtiyaçlarınızı anlatalım. Size özel bir görüşme planlayalım.", step: "01", sortOrder: 1 },
      { type: "process", title: "Özel Teklif", description: "İşletmenizin hacmi ve ihtiyaçlarına göre kişiselleştirilmiş fiyat teklifi hazırlayalım.", step: "02", sortOrder: 2 },
      { type: "process", title: "Başlayın", description: "Eğitim, ekipman ve ilk siparişinizle birlikte eksiksiz teslimat. Düzenli destekle yanınızdayız.", step: "03", sortOrder: 3 },
    ];
    await prisma.b2BContent.createMany({ data: b2bItems });
    results.push("B2B content created");
  } else {
    results.push("B2B content already exists");
  }

  // 5. WORKSHOPS
  const wsCount = await prisma.workshop.count();
  if (wsCount === 0) {
    const wsItems = [
      { title: "Çekirdek Tadımı", description: "Farklı menşeilerden çekirdekleri yan yana deneyimleyin, aroma profillerini keşfedin.", date: "Başlangıç", sortOrder: 1 },
      { title: "Demleme Atölyesi", description: "V60, French Press, Moka Pot gibi yöntemlerle mükemmel demlemenin sırlarını öğrenin.", date: "Orta Seviye", sortOrder: 2 },
      { title: "Barista Eğitimi", description: "Profesyonel baristalardan espresso çekimi, süt köpürtme ve latte art teknikleri.", date: "İleri Seviye", sortOrder: 3 },
    ];
    await prisma.workshop.createMany({ data: wsItems });
    results.push("Workshops created");
  } else {
    results.push("Workshops already exist");
  }

  // 6. KAVURUMHANE INFO
  if (!(await prisma.kavurumhaneInfo.findFirst())) {
    await prisma.kavurumhaneInfo.create({
      data: { id: "global", title: "Kavurumhane", description: "Çekirdekten fincana, taze kavrumun ve kahve kültürünün kalbine hoş geldiniz.", address: "Moda, Bostancı Başı Cad. No:42, 34710 Kadıköy / İstanbul" },
    });
    results.push("Kavurumhane info created");
  } else {
    results.push("Kavurumhane info already exists");
  }

  // 7. KAVURUMHANE PROCESS
  const kpCount = await prisma.kavurumhaneProcess.count();
  if (kpCount === 0) {
    const kpItems = [
      { step: "01", title: "Çekirdek Seçimi", description: "Dünyanın en iyi kahve bölgelerinden özenle seçilmiş yeşil çekirdekler.", sortOrder: 1 },
      { step: "02", title: "Kavurum", description: "Geleneksel yöntemlerle, her partide aynı tutarlılıkta kavurum.", sortOrder: 2 },
      { step: "03", title: "Kalite Kontrol", description: "Uzman tadımcılarımız tarafından her parti test edilir.", sortOrder: 3 },
      { step: "04", title: "Paketleme", description: "Siparişe özel kavrulur, vakumlu paketlerde taze gönderim.", sortOrder: 4 },
    ];
    await prisma.kavurumhaneProcess.createMany({ data: kpItems });
    results.push("Kavurumhane processes created");
  } else {
    results.push("Kavurumhane processes already exist");
  }

  return NextResponse.json({ message: "Seed complete", results });
}
