"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ContentCard from "@/components/ContentCard";
import { plots, areas, landCategories, formatNumber, formatAED, type LandCategory } from "@/data/mock";

function areaSlug(area: string) {
  return area.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function OtherAreasContent() {
  const searchParams = useSearchParams();
  const ctxType = searchParams.get("type") as LandCategory | null;
  const ctxArea = searchParams.get("area");

  if (!ctxType) {
    return <p className="text-sm text-muted">No land type context. Start from the <Link href="/" className="text-forest hover:underline">home page</Link>.</p>;
  }

  const category = landCategories.find((c) => c.slug === ctxType);
  const currentAreaName = ctxArea ? areas.find((a) => areaSlug(a) === ctxArea) : null;

  const otherAreas = areas.filter((area) =>
    area !== currentAreaName &&
    plots.some((p) => p.category === ctxType && p.area === area)
  );

  return (
    <div className="flex flex-col flex-1 gap-6">
      <div>
        <h1 className="text-3xl font-bold text-forest font-heading">Other Areas</h1>
        <p className="text-sm text-muted mt-1">
          {category?.label} plots available in other areas{currentAreaName ? ` beyond ${currentAreaName}` : ""}.
        </p>
      </div>

      {otherAreas.length === 0 ? (
        <p className="text-sm text-muted">No other areas available for this land type.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherAreas.map((area) => {
            const areaPlots = plots.filter((p) => p.category === ctxType && p.area === area);
            const lowestPrice = Math.min(...areaPlots.map((p) => p.askingPrice));
            return (
              <Link
                key={area}
                href={`/master-plan?type=${ctxType}&area=${areaSlug(area)}`}
                className="group"
              >
                <ContentCard className="h-full transition-all group-hover:border-forest/30 group-hover:shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-forest bg-mint-light/40 px-2 py-0.5 rounded">
                      {areaPlots.length} {areaPlots.length === 1 ? "plot" : "plots"}
                    </span>
                    <span className="text-xs text-muted">{category?.label}</span>
                  </div>
                  <p className="text-lg font-bold text-deep-forest">{area}</p>
                  <p className="text-sm text-forest font-medium mt-1">
                    From {formatAED(lowestPrice)}
                  </p>
                  <p className="text-xs text-muted mt-2">
                    {formatNumber(areaPlots.reduce((sum, p) => sum + p.plotArea, 0))} sq ft total
                  </p>
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
      )}
    </div>
  );
}

export default function OtherAreasPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <OtherAreasContent />
    </Suspense>
  );
}
