import Link from "next/link";
import ContentCard from "@/components/ContentCard";

const steps = [
  {
    number: 1,
    title: "Development Assumptions",
    description: "Define the type of project (tower, villa community, mixed-use) and its scale. This determines GFA, zoning constraints, and timeline.",
  },
  {
    number: 2,
    title: "Construction Cost",
    description: "Estimate total build cost per sq ft. For high-end towers in RAK, expect ~$800/sq ft including finishes, MEP, and common areas.",
  },
  {
    number: 3,
    title: "Sellable Area",
    description: "Calculate Net Sellable Area (NSA) — typically 70-80% of GFA. The rest goes to corridors, lobbies, mechanical rooms, and parking.",
  },
  {
    number: 4,
    title: "Sale Price Assumptions",
    description: "Determine expected revenue per sq ft based on comparable sales, location premium, and market trajectory. Current RAK premium: AED 1,200-1,800/sq ft.",
  },
  {
    number: 5,
    title: "Profit Margin",
    description: "Target developer profit margin (typically 15-25%). This is the buffer between total costs and total revenue that makes the deal viable.",
  },
];

export default function ROIExplainPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest font-heading">Understanding ROI</h1>
        <p className="text-sm text-muted mt-1">
          A step-by-step formula for evaluating land investment returns.
        </p>
      </div>

      <ContentCard className="mb-6">
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          The formula is simple: <strong className="text-deep-forest">Revenue &minus; Costs = Profit</strong>.
          But to reverse-engineer the maximum price you should pay for land, you need to work backwards
          from what you can sell, what it costs to build, and what margin you need.
        </p>
      </ContentCard>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <ContentCard key={step.number}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">{step.number}</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-deep-forest">{step.title}</h3>
                <p className="text-sm text-muted mt-1 leading-relaxed">{step.description}</p>
              </div>
            </div>
          </ContentCard>
        ))}
      </div>

      {/* CTA to calculator */}
      <div className="mt-6 text-center">
        <Link
          href="/roi/calculator"
          className="inline-block px-8 py-3 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-deep-forest transition-colors"
        >
          Try the Interactive ROI Tool
        </Link>
      </div>
    </div>
  );
}
