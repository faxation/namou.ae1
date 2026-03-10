import ContentCard from "@/components/ContentCard";
import { exampleDealDefaults, exampleDealGFA, calculateROI, formatNumber } from "@/data/mock";
import Link from "next/link";

export default function ExampleDealPage() {
  const outputs = calculateROI(exampleDealDefaults, exampleDealGFA);
  const totalConstructionCost = exampleDealGFA * exampleDealDefaults.constructionCostPerSqFt;

  return (
    <div className="flex flex-col flex-1 gap-6 min-h-0 overflow-y-auto md:overflow-y-hidden">

      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-3xl font-bold text-forest font-heading">Example Deal: RAK Central</h1>
        <p className="text-sm text-muted mt-1">
          A real-world walkthrough using a high-end tower in RAK Central.
        </p>
      </div>

      {/* Main grid — fills remaining height */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">

        {/* Assumptions */}
        <ContentCard className="h-full">
          <p className="text-xs uppercase tracking-wider text-muted mb-4">Deal Assumptions</p>
          <div className="divide-y divide-mint-light/60">
            <Row label="Project Type" value="High-end mixed-use tower" />
            <Row label="GFA" value={`${formatNumber(exampleDealGFA)} sq ft`} />
            <Row label="Construction Cost" value={`AED ${formatNumber(exampleDealDefaults.constructionCostPerSqFt)} / sq ft`} />
            <Row label="Expected Sale Price" value={`AED ${formatNumber(exampleDealDefaults.salePricePerSqFt)} / sq ft`} />
            <Row label="Net Sellable Area" value={`${exampleDealDefaults.netSellableAreaPct}%`} />
            <Row label="Target Profit Margin" value={`${exampleDealDefaults.targetProfitMarginPct}%`} />
          </div>
        </ContentCard>

        {/* Results */}
        <div className="flex flex-col gap-4 h-full">
          <ContentCard className="bg-mint-bg border-mint-light flex-1">
            <p className="text-xs uppercase tracking-wider text-muted mb-4">Calculated Results</p>
            <div className="divide-y divide-mint-light/60">
              <Row label="Total Development Value" value={`AED ${formatNumber(outputs.totalDevelopmentValue)}`} />
              <Row label="Total Construction Cost" value={`AED ${formatNumber(totalConstructionCost)}`} />
              <Row label="ROI" value={`${outputs.roi}%`} />
              <Row label="Maximum Land Price" value={`AED ${formatNumber(outputs.maximumLandPrice)}`} highlight />
              <Row label="GFA Price" value={`AED ${outputs.gfaPrice.toFixed(2)} / sq ft`} />
            </div>
          </ContentCard>

          <ContentCard className="border-mint-light">
            <p className="text-sm text-muted leading-relaxed">
              Based on these assumptions, the maximum viable land price for this RAK Central tower is{" "}
              <strong className="text-forest">${formatNumber(outputs.maximumLandPrice)}</strong>.
            </p>
          </ContentCard>

          <div className="flex gap-3">
            <Link
              href="/roi"
              className="flex-1 text-center px-6 py-3 bg-white border border-forest text-forest rounded-xl font-semibold text-sm hover:bg-mint-white transition-colors"
            >
              Adjust Variables
            </Link>
            <Link
              href="/offer"
              className="flex-1 text-center px-6 py-3 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-deep-forest transition-colors"
            >
              Submit Offer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-sm font-bold ${highlight ? "text-forest" : "text-deep-forest"}`}>{value}</p>
    </div>
  );
}
