import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ensureUserLoyalty } from "@/lib/loyalty";
import HeroSlider from "@/components/HeroSlider";
import PopularProducts from "@/components/PopularProducts";
import KahveniKesfet from "@/components/KahveniKesfet";
import CustomerReviews from "@/components/CustomerReviews";
import AkademiSection from "@/components/AkademiSection";
import RoastCalendar from "@/components/RoastCalendar";
import RevealOnScroll from "@/components/RevealOnScroll";

export default async function Home() {
  const session = await auth();

  let userLoyalty: { points: number; pendingPoints: number; totalSpent: number } | null = null;
  if (session?.user?.id) {
    try {
      const l = await ensureUserLoyalty(session.user.id);
      userLoyalty = l;
    } catch {
      // loyalty hatası sessiz geç
    }
  }

  const bestSellerProducts = await prisma.product.findMany({
    where: { published: true, isBestSeller: true },
    include: { category: true },
    take: 8,
  });

  const newArrivalProducts = await prisma.product.findMany({
    where: { published: true, isNewArrival: true },
    include: { category: true },
    take: 8,
  });

  const latestPosts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div>
      <HeroSlider />

      <RevealOnScroll delay={150}>
        <PopularProducts
          products={[...new Map([...bestSellerProducts, ...newArrivalProducts].map(p => [p.slug, p])).values()].map(p => ({
            slug: p.slug,
            name: p.name,
            price: p.price,
            origin: p.origin || p.category?.name || null,
            categoryName: p.category?.name || null,
            roastedAt: p.roastedAt?.toISOString() ?? null,
            process: p.process ?? null,
            roastLevel: p.roastLevel ?? null,
          }))}
          heading=""
          headingHighlight="Zirvede"
        />
      </RevealOnScroll>

      <RevealOnScroll delay={200}>
        <KahveniKesfet />
      </RevealOnScroll>

      <RevealOnScroll delay={250}>
        <RoastCalendar />
      </RevealOnScroll>

      <RevealOnScroll delay={350}>
        <section className="section-copper relative bg-page/95 py-24 sm:py-32 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <div className="absolute inset-0">
            <Image src="/celsus/demleme/demleme2.png" alt="" fill className="object-cover opacity-15" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#f5f2ed]/80 via-[#f5f2ed]/50 to-[#f5f2ed]/80" />
          </div>
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-14">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading">Kahveni Tamamlayan<br /><span className="animate-copper">Ayricaliklar</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Link href="/sadakat" className="group bg-card border border-border overflow-hidden hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="p-8">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-heading mb-2 group-hover:text-primary transition">Cekirdek Kredi</h3>
                  <p className="text-sm text-muted leading-relaxed mb-4">Her alisveriste odedigin tutarin %5&apos;i Cekirdek Kredi olarak hesabina yatirilir. Bir sonraki alisverisinde kullan.</p>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary group-hover:opacity-80 transition">Detaylari Gor &rarr;</span>
                </div>
              </Link>
              <Link href="/abonelik" className="group bg-card border border-border overflow-hidden hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="p-8">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-heading mb-2 group-hover:text-primary transition">Kişisel Kahve Planları</h3>
                  <p className="text-sm text-muted leading-relaxed mb-4">Seçili çekirdekler, en doğru zamanda hazırlanır ve tam vaktinde size ulaşır. Siz sadece kusursuz fincanın keyfini çıkarın.</p>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary group-hover:opacity-80 transition">Takvimi Incele &rarr;</span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={400}>
        <CustomerReviews />
      </RevealOnScroll>

      <RevealOnScroll delay={450}>
        <AkademiSection posts={latestPosts.map(p => ({
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt || "",
          imageUrl: p.imageUrl,
          author: p.author || "Rostello",
        }))} />
      </RevealOnScroll>

    </div>
  );
}
