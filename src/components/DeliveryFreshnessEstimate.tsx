import { calculateFreshness } from "@/lib/flavor-curve";
import { estimateDeliveryDate } from "@/lib/delivery-estimator";

interface Props {
  origin?: string | null;
  process?: string | null;
  roastLevel?: string | null;
  roastedAt?: Date | null;
  createdAt?: Date | null;
}

const phaseColors: Record<string, { bar: string; text: string }> = {
  resting: { bar: "#9CA3AF", text: "#6B7280" },
  prepeak: { bar: "#FCD34D", text: "#B45309" },
  peak: { bar: "#10B981", text: "#047857" },
  maturity: { bar: "#F59E0B", text: "#B45309" },
};

export default async function DeliveryFreshnessEstimate(props: Props) {
  if (!props.roastedAt) return null;

  const deliveryDate = await estimateDeliveryDate();
  const today = new Date();

  const todayResult = calculateFreshness(props, today);
  const deliveryResult = calculateFreshness(props, deliveryDate);

  const daysToDelivery = Math.round((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const phase = deliveryResult.currentPhase;
  const color = phaseColors[phase.name] || phaseColors.resting;

  return (
    <div className="mt-3 p-3 bg-white border border-border">
      <p className="text-[10px] text-muted uppercase tracking-wider mb-1">
        Bugün sipariş verirseniz
      </p>
      <p className="text-xs text-body">
        Tahmini teslimatta (<strong>{deliveryDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</strong>)
        kahveniz kavrum sonrası <strong>{deliveryResult.day}. gününde</strong> olacak
        ve <span style={{ color: color.bar }} className="font-semibold">{phase.nameTr}</span> fazında olacak.
      </p>
      <p className="text-[10px] text-muted mt-1">
        ({daysToDelivery} gün içinde elinizde)
      </p>
    </div>
  );
}
