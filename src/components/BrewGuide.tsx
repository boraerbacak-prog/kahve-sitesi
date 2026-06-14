import { getBrewMethods, brewMethodIcons } from "@/lib/brew-recommendations";

interface BrewGuideProps {
  origin: string | null;
  process: string | null;
  roastLevel: string | null;
  body: string | null;
}

export default function BrewGuide({ origin, process, roastLevel, body }: BrewGuideProps) {
  const methods = getBrewMethods(origin, process, roastLevel, body);
  if (methods.length === 0) return null;

  return (
    <div className="border border-border bg-white p-5">
      <h3 className="text-xs font-semibold text-heading uppercase tracking-wider mb-3">İdeal Demleme</h3>
      <div className="flex flex-wrap gap-2">
        {methods.map((m) => (
          <span key={m} className="inline-flex items-center gap-1 px-3 py-1.5 bg-page-hover border border-border text-xs text-heading">
            {brewMethodIcons[m] && <span>{brewMethodIcons[m]}</span>}
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
