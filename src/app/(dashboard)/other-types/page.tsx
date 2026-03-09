"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ContentCard from "@/components/ContentCard";
import { plots, areas, landCategories, formatAED, type LandCategory } from "@/data/mock";

function areaSlug(area: string) {
  return area.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function OtherTypesContent() {
  const searchParams = useSearchParams();
  const ctxType = searchParams.get("type") as LandCategory | null;
  const ctxArea = searchParams.get("area");

  const otherCategories = landCategories.filter((c) => c.slug !== ctxType);

  return (
    <div className="flex flex-col flex-1 gap-6">
      <div>
        <h1 className="text-3xl font-bold text-forest font-heading">Other Land Types</h1>
        <p className="text-sm text-muted mt-1">
          Explore different land use categories across Al Marjan Island.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherCategories.map((category) => {
          const categoryPlots = plots.filter((p) => p.category === category.slug);
          const categoryAreas = areas.filter((area) =>
            categoryPlots.some((p) => p.area === area)
          );

          // Prefer passing the current area if it exists in this category, otherwise first available
          const currentAreaName = ctxArea ? areas.find((a) => areaSlug(a) === ctxArea) : null;
          const targetArea = currentAreaName && categoryAreas.includes(currentAreaName)
            ? ctxArea
            : categoryAreas.length > 0 ? areaSlug(categoryAreas[0]) : null;

          const href = targetArea
            ? `/master-plan?type=${category.slug}&area=${targetArea}`
            : `/master-plan?type=${category.slug}`;

          const lowestPrice = categoryPlots.length > 0
            ? Math.min(...categoryPlots.map((p) => p.askingPrice))
            : null;

          return (
            <Link key={category.slug} href={href} className="group">
              <ContentCard className="h-full transition-all group-hover:border-forest/30 group-hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-forest bg-mint-light/40 px-2 py-0.5 rounded">
                    {categoryPlots.length} {categoryPlots.length === 1 ? "plot" : "plots"}
                  </span>
                  <span className="text-xs text-muted">
                    {categoryAreas.length} {categoryAreas.length === 1 ? "area" : "areas"}
                  </span>
                </div>
                <p className="text-lg font-bold text-deep-forest">{category.label}</p>
                {lowestPrice !== null && (
                  <p className="text-sm text-forest font-medium mt-1">From {formatAED(lowestPrice)}</p>
                )}
                {categoryPlots.length === 0 && (
                  <p className="text-sm text-muted mt-1">No plots listed yet</p>
                )}
                <div className="flex items-center justify-end mt-3 pt-3 border-t border-mint-light/30">
                  <svg className="w-4 h-4 text-forest opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </ContentCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function OtherTypesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <OtherTypesContent />
    </Suspense>
  );
}
