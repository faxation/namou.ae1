import ContentCard from "@/components/ContentCard";
import { exampleDealDefaults, exampleDealGFA, calculateROI, formatNumber } from "@/data/mock";
import Link from "next/link";

export default function ExampleDealPage() {
  const outputs = calculateROI(exampleDealDefaults, exampleDealGFA);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest font-heading">Example Deal: RAK Central</h1>
        <p className="text-sm text-muted mt-1">
          A real-world walkthrough of the ROI tool using a high-end tower in RAK Central.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assumptions */}
        <ContentCard>
          <h2 className="text-base font-semibold text-deep-forest mb-4">Deal Assumptions</h2>
          <div className="divide-y divide-mint-light/30">
            <AssumptionRow label="Project Type" value="High-end mixed-use tower" />
            <AssumptionRow label="GFA" value={`${formatNumber(exampleDealGFA)} sq ft`} />
            <AssumptionRow
              label="Construction Cost"
              value={`$${formatNumber(exampleDealDefaults.constructionCostPerSqFt)}/sq ft`}
              note="High-end tower (corrected from $220)"
            />
            <AssumptionRow label="Expected Sale Price" value={`$${formatNumber(exampleDealDefaults.salePricePerSqFt)}/sq ft`} />
            <AssumptionRow label="Net Sellable Area" value={`${exampleDealDefaults.netSellableAreaPct}%`} />
            <AssumptionRow label="Target Profit Margin" value={`${exampleDealDefaults.targetProfitMarginPct}%`} />
          </div>
        </ContentCard>

        {/* Results */}
        <ContentCard className="bg-forest text-white border-forest">
          <h2 className="text-base font-medium opacity-80 mb-4">Calculated Results</h2>
          <div className="space-y-5">
            <ResultRow label="Total Development Value" value={`$${formatNumber(outputs.totalDevelopmentValue)}`} />
            <ResultRow label="Total Construction Cost" value={`$${formatNumber(exampleDealGFA * exampleDealDefaults.constructionCostPerSqFt)}`} />
            <ResultRow label="ROI" value={`${outputs.roi}%`} />
            <ResultRow label="Maximum Land Price" value={`$${formatNumber(outputs.maximumLandPrice)}`} highlight />
            <ResultRow label="GFA Price" value={`$${outputs.gfaPrice.toFixed(2)}/sq ft`} />
          </div>

          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-sm opacity-80 leading-relaxed">
              Based on these assumptions, the maximum viable land price for this
              RAK Central tower project is <strong className="text-mint">${formatNumber(outputs.maximumLandPrice)}</strong>.
            </p>
          </div>
        </ContentCard>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/roi/calculator"
          className="px-6 py-3 bg-white border border-forest text-forest rounded-xl font-semibold text-sm hover:bg-mint-white transition-colors"
        >
          Adjust Variables Yourself
        </Link>
        <Link
          href="/offer"
          className="px-6 py-3 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-deep-forest transition-colors"
        >
          Submit Your Offer
        </Link>
      </div>
    </div>
  );
}

function AssumptionRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex justify-between items-baseline py-2.5">
      <span className="text-sm text-muted">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium text-deep-forest">{value}</span>
        {note && <p className="text-[10px] text-mint mt-0.5">{note}</p>}
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs opacity-70">{label}</p>
      <p className={`text-xl font-bold ${highlight ? "text-mint" : ""}`}>{value}</p>
    </div>
  );
}
