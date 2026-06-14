import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LiveFlavorCalendar from "./LiveFlavorCalendar";

export default async function AbonelikTakvimPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscriptions: {
        where: { status: "active" },
        include: {
          plan: true,
          deliveries: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              items: { include: { product: true } },
            },
          },
        },
      },
    },
  });

  if (!user || user.subscriptions.length === 0) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <span className="text-4xl block mb-4">☕</span>
          <h1 className="text-2xl font-bold text-heading mb-3">Henüz Aboneliğiniz Yok</h1>
          <p className="text-sm text-muted mb-6">Rostello Zamanlanmış Gastronomi deneyimine başlamak için bir abonelik planı seçin.</p>
          <a href="/abonelik" className="inline-block bg-primary hover:bg-primary-hover text-white px-8 py-3 text-sm font-semibold tracking-wide uppercase transition">
            Planları İncele
          </a>
        </div>
      </div>
    );
  }

  const subscription = user.subscriptions[0];
  const latestDelivery = subscription.deliveries[0];
  const products = latestDelivery?.items.map((i) => i.product) || [];

  return (
    <div className="min-h-screen bg-page">
      <section className="relative bg-[#2c1810] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-light/5" />
        <div className="relative max-w-5xl mx-auto px-6">
          <span className="text-xs tracking-[0.2em] uppercase text-primary font-medium">Abonelik</span>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mt-3 mb-2">Lezzet Takvimi</h1>
          <p className="text-[#a39080] max-w-xl">
            Kahvenizin kavrumdan fincana yolculuğunu canlı takip edin.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 -mt-8 pb-24">
        <LiveFlavorCalendar
          subscription={JSON.parse(JSON.stringify({
            ...subscription,
            startDate: subscription.startDate.toISOString(),
            plan: subscription.plan,
          }))}
          products={JSON.parse(JSON.stringify(products.map((p) => ({
            ...p,
            createdAt: p.createdAt.toISOString(),
            roastedAt: p.roastedAt?.toISOString() || null,
          }))))}
        />
      </div>
    </div>
  );
}
