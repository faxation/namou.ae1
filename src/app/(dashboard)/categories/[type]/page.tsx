import Link from "next/link";
import { plots, landCategories, areas, type LandCategory } from "@/data/mock";

export function generateStaticParams() {
  return landCategories.map((c) => ({ type: c.slug }));
}

function areaSlug(area: string) {
  return area.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const category = landCategories.find((c) => c.slug === type);

  if (!category) {
    return <div className="text-muted text-sm">Category not found.</div>;
  }

  const availableAreas = areas.filter((area) =>
    plots.some((p) => p.category === (type as LandCategory) && p.area === area)
  );

  return (
    <div className="flex flex-col flex-1 gap-5 animate-fade-in min-h-0 overflow-y-auto md:overflow-y-hidden">
      <div className="shrink-0">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <Link href="/categories" className="hover:text-forest transition-colors">Categories</Link>
          <span>/</span>
          <span>{category.label}</span>
        </div>
        <h1 className="text-xl lg:text-3xl font-bold text-forest font-heading">{category.label}</h1>
        <p className="text-sm text-muted mt-1">Select an area to browse available plots.</p>
      </div>

      {availableAreas.length === 0 ? (
        <p className="text-sm text-muted">No plots available in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 flex-1 auto-rows-fr max-w-lg">
          {availableAreas.map((area) => (
            <Link
              key={area}
              href={`/categories/${type}/${areaSlug(area)}`}
              className="px-4 py-3 bg-white border border-mint-light/60 rounded-xl text-sm text-deep-forest hover:border-forest/30 hover:shadow-sm transition-all text-center font-medium"
            >
              {area}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
