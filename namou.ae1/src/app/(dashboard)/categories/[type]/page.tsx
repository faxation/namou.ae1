import Link from "next/link";
import ContentCard from "@/components/ContentCard";
import { plots, landCategories, formatNumber, formatAED, type LandCategory } from "@/data/mock";

export function generateStaticParams() {
  return landCategories.map((c) => ({ type: c.slug }));
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const category = landCategories.find((c) => c.slug === type);
  const categoryPlots = plots.filter((p) => p.category === (type as LandCategory));

  if (!category) {
    return <div className="text-muted text-sm">Category not found.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <Link href="/categories" className="hover:text-forest transition-colors">Categories</Link>
          <span>/</span>
        </div>
        <h1 className="text-2xl font-bold text-forest font-heading">{category.label}</h1>
        <p className="text-sm text-muted mt-1">{category.description}</p>
      </div>

      {categoryPlots.length === 0 ? (
        <ContentCard>
          <p className="text-sm text-muted text-center py-8">No plots available in this category yet.</p>
        </ContentCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryPlots.map((plot) => (
            <Link key={plot.id} href={`/assets/${plot.id}`} className="group">
              <ContentCard className="h-full transition-all group-hover:border-forest/30 group-hover:shadow-md">
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
