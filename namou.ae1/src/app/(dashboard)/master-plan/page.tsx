"use client";

import { useState } from "react";
import ContentCard from "@/components/ContentCard";
import FilterPills from "@/components/FilterPills";
import { masterPlanFilters, plots } from "@/data/mock";

export default function MasterPlanPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>(["Residential"]);

  const handleToggle = (filter: string) => {
    if (filter === "Master Plan") {
      setActiveFilters([]);
      return;
    }
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredPlots = activeFilters.length === 0
    ? plots
    : plots.filter((p) =>
        activeFilters.some((f) => p.landUse.includes(f))
      );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest font-heading">Master Plan Overview</h1>
        <p className="text-sm text-muted mt-1">
          A comprehensive view of zoning, access, and land distribution within Al Marjan.
        </p>
      </div>

      <ContentCard>
        {/* Filters */}
        <div className="mb-5">
          <FilterPills
            filters={masterPlanFilters}
            active={activeFilters}
            onToggle={handleToggle}
          />
        </div>

        {/* Master plan map placeholder */}
        <div className="relative w-full h-[480px] bg-mint-white rounded-xl overflow-hidden border border-mint-light/40">
          {/* Grid/map background */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#003D2E" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Plot indicators on map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[80%] h-[80%]">
              {filteredPlots.map((plot, i) => (
                <div
                  key={plot.id}
                  className="absolute bg-amber-400/70 border-2 border-amber-500 rounded-sm flex items-center justify-center cursor-pointer hover:bg-amber-400 transition-colors"
                  style={{
                    width: "80px",
                    height: "50px",
                    left: `${15 + (i % 3) * 30}%`,
                    top: `${30 + Math.floor(i / 3) * 25}%`,
                  }}
                  title={plot.name}
                >
                  <span className="text-[10px] font-bold text-amber-900">{plot.name}</span>
                </div>
              ))}

              {/* Roads / labels */}
              <div className="absolute left-[5%] top-[20%] text-[10px] text-deep-forest/40 uppercase tracking-wider -rotate-90 origin-left">
                Main Road
              </div>
              <div className="absolute top-[10%] left-[30%] text-[10px] text-deep-forest/40 uppercase tracking-wider">
                Al Marjan Blvd
              </div>
            </div>
          </div>

          {/* Map legend */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs text-deep-forest shadow-sm">
            <p className="font-medium mb-1.5">Legend</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-400 border border-amber-500 rounded-sm" />
              <span>Available Plot</span>
            </div>
          </div>
        </div>
      </ContentCard>
    </div>
  );
}
