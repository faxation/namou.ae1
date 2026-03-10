import Link from "next/link";
import ContentCard from "@/components/ContentCard";
import { plots, formatNumber, formatAED } from "@/data/mock";

export function generateStaticParams() {
  return plots.map((p) => ({ id: p.id }));
}

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plot = plots.find((p) => p.id === id);

  if (!plot) {
    return <div className="text-muted text-sm">Asset not found.</div>;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto md:overflow-y-hidden">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-1">
        <Link href="/categories" className="hover:text-forest transition-colors">Categories</Link>
        <span>/</span>
        <Link href={`/categories/${plot.category}`} className="hover:text-forest transition-colors capitalize">{plot.category}</Link>
        <span>/</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl lg:text-3xl font-bold text-forest font-heading">{plot.name}</h1>
        <p className="text-sm text-muted mt-1">{plot.location}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Plot overview */}
          <ContentCard>
            <h2 className="text-base font-semibold text-deep-forest mb-4">Plot Overview</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <SpecRow label="Plot Area" value={`${formatNumber(plot.plotArea)} sq ft`} />
              <SpecRow label="Asking Price" value={formatAED(plot.askingPrice)} />
              <SpecRow label="Price / sq ft" value={`AED ${plot.pricePerSqFt}`} />
              <SpecRow label="Land Use" value={plot.landUse} />
              <SpecRow label="Plot Type" value={plot.plotType} />
              <SpecRow label="Location" value={plot.location} />
            </div>
          </ContentCard>

          {/* Asset specifications — clean structured list per Jad */}
          <ContentCard>
            <h2 className="text-base font-semibold text-deep-forest mb-4">Asset Specifications</h2>
            <div className="divide-y divide-mint-light/30">
              <SpecRow label="Plot Size" value={`${formatNumber(plot.plotArea)} sq ft`} />
              <SpecRow label="Max Height" value={plot.maxHeight || "—"} />
              <SpecRow label="Floor Area Ratio (FAR)" value={plot.far?.toString() || "—"} />
              <SpecRow label="GFA" value={plot.gfa ? `${formatNumber(plot.gfa)} sq ft` : "—"} />
              <SpecRow label="Zoning" value={plot.zoning || "—"} />
              <SpecRow label="Infrastructure Access" value={plot.infrastructure || "—"} />
            </div>
          </ContentCard>

          {/* Development potential */}
          <ContentCard>
            <h2 className="text-base font-semibold text-deep-forest mb-3">Development Potential</h2>
            <p className="text-sm text-muted leading-relaxed">
              {plot.developmentPotential ||
                `This ${plot.zoning || plot.landUse} zoned plot supports up to ${plot.maxHeight || "G+30"} construction with FAR of ${plot.far || "N/A"}. Total buildable GFA of ${plot.gfa ? formatNumber(plot.gfa) : "N/A"} sq ft makes it suitable for premium ${plot.landUse.toLowerCase()} development.`}
            </p>
          </ContentCard>
        </div>

        {/* Sidebar: location map + key metrics */}
        <div className="space-y-4">
          {/* Location map placeholder */}
          <ContentCard>
            <h2 className="text-base font-semibold text-deep-forest mb-3">Location</h2>
            <div className="w-full h-48 rounded-xl bg-mint-bg flex items-center justify-center border border-mint-light/40">
              <div className="text-center text-deep-forest/40">
                <svg className="w-10 h-10 mx-auto mb-1 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <p className="text-xs">Map placeholder</p>
              </div>
            </div>
          </ContentCard>

          {/* Key metrics */}
          <ContentCard>
            <h2 className="text-base font-semibold text-deep-forest mb-3">Key Metrics</h2>
            <div className="space-y-3">
              <MetricRow label="Airport ETA" value={plot.airportEta} />
              <MetricRow label="Wynn Casino ETA" value={plot.casinoEta} />
              {plot.dimensions && (
                <MetricRow label="Dimensions" value={`${plot.dimensions.width} × ${plot.dimensions.depth} ft`} />
              )}
            </div>
          </ContentCard>

          {/* CTA */}
          <Link
            href="/roi/calculator"
            className="block w-full text-center px-6 py-3 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-deep-forest transition-colors"
          >
            Calculate ROI for this plot
          </Link>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-2">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-deep-forest text-right">{value}</span>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs font-semibold text-forest">{value}</span>
    </div>
  );
}
