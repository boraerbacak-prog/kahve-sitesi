"use client";

import { useMemo, useState } from "react";
import { calculateFreshness, getPhaseEmoji, getPhaseColor } from "@/lib/flavor-curve";
import { calculateDispatch } from "@/lib/dispatch-engine";

interface SubscriptionData {
  id: string;
  startDate: string;
  brewMethod?: string | null;
  deliveryFrequency: string;
  plan: { name: string; tier: string };
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  origin?: string | null;
  process?: string | null;
  roastLevel?: string | null;
  roastedAt?: string | null;
  createdAt: string;
}

interface Props {
  subscription: SubscriptionData;
  products: ProductData[];
}

export default function LiveFlavorCalendar({ subscription, products }: Props) {
  const [selectedDelivery, setSelectedDelivery] = useState(0);

  const dispatchResults = useMemo(() => {
    return products.map((product) => {
      const freshness = calculateFreshness({
        origin: product.origin,
        process: product.process,
        roastLevel: product.roastLevel,
        roastedAt: product.roastedAt ? new Date(product.roastedAt) : null,
        createdAt: new Date(product.createdAt),
      });

      const dispatch = calculateDispatch({
        origin: product.origin,
        process: product.process,
        roastLevel: product.roastLevel,
        brewMethod: subscription.brewMethod,
      });

      return {
        product,
        freshness,
        dispatch,
      };
    });
  }, [products, subscription.brewMethod]);

  const nextDeliveryDates = useMemo(() => {
    const dates: Date[] = [];
    const freqMonths = subscription.deliveryFrequency === "weekly" ? 0.25 : 1;
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + Math.floor(i * freqMonths));
      dates.push(d);
    }
    return dates;
  }, [subscription.deliveryFrequency]);

  const deliveryLabel = subscription.deliveryFrequency === "weekly"
    ? "Haftalık" : subscription.deliveryFrequency === "biweekly"
    ? "2 Haftada Bir" : "Aylık";

  return (
    <div className="space-y-8">
      <div className="bg-white border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-heading uppercase tracking-wider">{subscription.plan.name}</h2>
            <p className="text-xs text-muted">{deliveryLabel} teslimat</p>
          </div>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 uppercase tracking-wider font-semibold">
            {subscription.plan.tier === "daily" ? "Klasik" : subscription.plan.tier === "explorer" ? "Avcı" : "Koleksiyoner"}
          </span>
        </div>

        <div className="flex gap-2">
          {nextDeliveryDates.map((date, i) => (
            <button
              key={i}
              onClick={() => setSelectedDelivery(i)}
              className={`flex-1 p-3 text-center border text-sm transition ${
                selectedDelivery === i
                  ? "border-primary bg-primary/5 text-primary font-semibold"
                  : "border-border text-muted hover:border-primary/30"
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wider">
                {i === 0 ? "Bu Ay" : i === 1 ? "Gelecek Ay" : "3. Ay"}
              </span>
              <span className="block text-xs mt-1">
                {date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
              </span>
            </button>
          ))}
        </div>
      </div>

      {dispatchResults.map(({ product, freshness, dispatch }) => {
        const phaseColor = getPhaseColor(freshness.currentPhase.name);
        const emoji = getPhaseEmoji(freshness.currentPhase.name);

        return (
          <div key={product.id} className="bg-white border border-border p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-heading">{product.name}</h3>
                <p className="text-xs text-muted">
                  {product.origin || "Menşei belirtilmemiş"} ·{" "}
                  {product.roastLevel === "light" ? "Zarif" : product.roastLevel === "medium" ? "İdeal" : "Karakterli"} Kavrum
                </p>
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 uppercase tracking-wider"
                style={{ color: phaseColor, backgroundColor: `${phaseColor}15` }}
              >
                {emoji} {freshness.currentPhase.nameTr} · %{Math.round(freshness.overallCurve)}
              </span>
            </div>

            <div className="relative h-16 bg-page-hover rounded-sm overflow-hidden mb-4">
              {freshness.phases.map((phase) => {
                const left = (phase.startDay / freshness.totalDays) * 100;
                const width = ((phase.endDay - phase.startDay) / freshness.totalDays) * 100;
                const isActive = phase.name === freshness.currentPhase.name;
                return (
                  <div
                    key={phase.name}
                    className="absolute top-0 h-full transition-all duration-500"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: `${getPhaseColor(phase.name)}${isActive ? "25" : "10"}`,
                      borderRight: "1px solid rgba(0,0,0,0.05)",
                    }}
                    title={`${phase.nameTr}: ${phase.startDay}-${phase.endDay}. gün`}
                  />
                );
              })}

              <div
                className="absolute top-0 w-0.5 h-full bg-heading transition-all duration-500 z-10"
                style={{ left: `${(freshness.day / freshness.totalDays) * 100}%` }}
              />

              <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-[9px] text-muted">
                <span>Kavrum (0)</span>
                <span>Zirve ({freshness.phases.find(p => p.name === "peak")?.startDay})</span>
                <span>Olgunluk ({freshness.totalDays})</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-page-hover">
                <span className="block text-lg mb-1">{getPhaseEmoji(freshness.currentPhase.name)}</span>
                <span className="text-[10px] text-muted uppercase tracking-wider block">Şu Anki Evre</span>
                <span className="text-xs font-semibold text-heading">{freshness.currentPhase.nameTr}</span>
              </div>
              <div className="p-3 bg-page-hover">
                <span className="block text-lg mb-1">📦</span>
                <span className="text-[10px] text-muted uppercase tracking-wider block">Kargolanma</span>
                <span className="text-xs font-semibold text-heading">
                  {dispatch.shipDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                </span>
              </div>
              <div className="p-3 bg-page-hover">
                <span className="block text-lg mb-1">🏠</span>
                <span className="text-[10px] text-muted uppercase tracking-wider block">Teslimat</span>
                <span className="text-xs font-semibold text-heading">
                  {dispatch.arrivalDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                </span>
              </div>
              <div className="p-3 bg-page-hover">
                <span className="block text-lg mb-1">
                  {dispatch.isPeakOnArrival ? "🔥" : dispatch.deliveryDay < dispatch.peakStartDay ? "⏳" : "🍂"}
                </span>
                <span className="text-[10px] text-muted uppercase tracking-wider block">Varış Lezzeti</span>
                <span className="text-xs font-semibold text-heading">
                  %{Math.round(dispatch.freshnessAtArrival)}
                </span>
              </div>
            </div>

            <div
              className="mt-4 p-3 text-sm"
              style={{
                backgroundColor: `${phaseColor}10`,
                borderLeft: `3px solid ${phaseColor}`,
              }}
            >
              <span className="text-xs font-semibold text-heading">AI Tahmini: </span>
              <span className="text-xs text-body">{dispatch.recommendation}</span>
            </div>
          </div>
        );
      })}

      <div className="bg-white border border-border p-6">
        <h3 className="text-sm font-bold text-heading uppercase tracking-wider mb-4">Zero-Day Waiting</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-page-hover">
            <span className="text-2xl block mb-2">🔥</span>
            <h4 className="text-xs font-bold text-heading uppercase tracking-wider mb-1">Kavrum</h4>
            <p className="text-[11px] text-muted">Siparişin üzerine özel kavrulur</p>
          </div>
          <div className="text-center p-4 bg-page-hover">
            <span className="text-2xl block mb-2">⏳</span>
            <h4 className="text-xs font-bold text-heading uppercase tracking-wider mb-1">Zamanlama</h4>
            <p className="text-[11px] text-muted">AI, varış gününü zirveye göre ayarlar</p>
          </div>
          <div className="text-center p-4 bg-page-hover">
            <span className="text-2xl block mb-2">✨</span>
            <h4 className="text-xs font-bold text-heading uppercase tracking-wider mb-1">Tüketim</h4>
            <p className="text-[11px] text-muted">Kutuyu aç, beklemeden %100 lezzetle demle</p>
          </div>
        </div>
      </div>
    </div>
  );
}
