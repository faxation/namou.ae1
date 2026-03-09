import Link from "next/link";
import ContentCard from "@/components/ContentCard";
import { plots, landCategories, areas, formatNumber, formatAED, type LandCategory } from "@/data/mock";

function areaSlug(area: string) {
  return area.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function generateStaticParams() {
  const params: { type: string; area: string }[] = [];
  for (const cat of landCategories) {
    for (const area of areas) {
      params.push({ type: cat.slug, area: areaSlug(area) });
    }
  }
  return params;
}

export default async function AreaPlotsPage({ params }: { params: Promise<{ type: string; area: string }> }) {
  const { type, area } = await params;
  const category = landCategories.find((c) => c.slug === type);
  const areaName = areas.find((a) => areaSlug(a) === area);

  if (!category || !areaName) {
    return <div className="text-muted text-sm">Not found.</div>;
  }

  const categoryPlots = plots.filter(
    (p) => p.category === (type as LandCategory) && p.area === areaName
  );

  return (
    <div className="flex flex-col flex-1 gap-5 animate-fade-in">
      <div className="shrink-0">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <Link href="/categories" className="hover:text-forest transition-colors">Categories</Link>
          <span>/</span>
          <Link href={`/categories/${type}`} className="hover:text-forest transition-colors">{category.label}</Link>
          <span>/</span>
          <span>{areaName}</span>
        </div>
        <h1 className="text-3xl font-bold text-forest font-heading">{areaName}</h1>
        <p className="text-sm text-muted mt-1">{category.label} plots in this area.</p>
      </div>

      {categoryPlots.length === 0 ? (
        <p className="text-sm text-muted">No plots available in this area for this category.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 auto-rows-fr">
          {categoryPlots.map((plot) => (
            <Link key={plot.id} href={`/assets/${plot.id}`} className="group flex">
              <ContentCard className="w-full flex flex-col transition-all group-hover:border-forest/30 group-hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-forest bg-mint-light/40 px-2 py-0.5 rounded">{plot.name}</span>
                  <span className="text-xs text-muted">{plot.plotType}</span>
                </div>
                <p className="text-lg font-bold text-deep-forest">{formatNumber(plot.plotArea)} sq ft</p>
                <p className="text-sm text-forest font-medium mt-1">{formatAED(plot.askingPrice)}</p>
                <p className="text-xs text-muted mt-2">{plot.location}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-mint-light/30">
                  <span className="text-xs text-muted">{plot.landUse}</span>
                  <svg className="w-4 h-4 text-forest opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </ContentCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
