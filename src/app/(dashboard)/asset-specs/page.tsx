"use client";

import { useState } from "react";
import ContentCard from "@/components/ContentCard";
import { plots, formatNumber, formatAED } from "@/data/mock";

const specTabs = ["Snapshot", "Build Potential", "Payment Plan"];

export default function AssetSpecsPage() {
  const [selectedPlot, setSelectedPlot] = useState(plots[0]);
  const [activeTab, setActiveTab] = useState(specTabs[0]);

  return (
    <div className="flex flex-col flex-1 gap-3 lg:gap-5 animate-fade-in min-h-0 overflow-y-auto md:overflow-y-hidden">
      <div className="shrink-0">
        <h1 className="text-xl lg:text-3xl font-bold text-forest font-heading">Asset Specifications</h1>
        <p className="text-sm text-muted mt-1">
          A quick, structured view of plot details, build rules, deal terms, and ROI assumptions.
        </p>
      </div>

      <ContentCard className="flex-1 flex flex-col min-h-0">
        {/* Plot selector — horizontal scroll row */}
        <div className="flex gap-3 overflow-x-auto pb-3 mb-5 -mx-2 px-2 shrink-0">
          {plots.map((plot) => (
            <button
              key={plot.id}
              onClick={() => setSelectedPlot(plot)}
              className={`flex-shrink-0 flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-colors min-w-[160px] ${
                selectedPlot.id === plot.id
                  ? "bg-forest text-white border-forest"
                  : "bg-mint-white border-mint-light hover:border-forest/30"
              }`}
            >
              <span className={`text-xs font-medium ${selectedPlot.id === plot.id ? "text-white/70" : "text-muted"}`}>{plot.name}</span>
              <span className="text-sm font-bold mt-0.5">{formatNumber(plot.plotArea)} sq. ft.</span>
              <span className={`text-xs mt-1 ${selectedPlot.id === plot.id ? "text-white/60" : "text-muted"}`}>
                {plot.dimensions
                  ? `${plot.dimensions.width} × ${plot.dimensions.depth}`
                  : "—"}
              </span>
            </button>
          ))}
        </div>

        {/* Spec tabs */}
        <div className="flex gap-2 mb-5 shrink-0">
          {specTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                activeTab === tab
                  ? "bg-forest text-white"
                  : "bg-mint-white text-deep-forest hover:bg-mint-light/30"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Spec grid */}
        {activeTab === "Snapshot" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 auto-rows-fr">
            <SpecTile label="Plot Area" value={`${formatNumber(selectedPlot.plotArea)} sq. ft.`} />
            <SpecTile label="Asking Price" value={formatAED(selectedPlot.askingPrice)} />
            <SpecTile label="Price / sq. ft. / DFA" value={`AED ${selectedPlot.pricePerSqFt}`} />
            <SpecTile label="Land Use" value={selectedPlot.landUse} />
            <SpecTile label="Location" value={selectedPlot.location} />
            <SpecTile label="Plot Type" value={selectedPlot.plotType} />
            <SpecTile label="Airport ETA" value={selectedPlot.airportEta} subLabel="RAK Airport" />
            <SpecTile label="Wynn Casino ETA" value={selectedPlot.casinoEta} />
          </div>
        )}

        {activeTab === "Build Potential" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 auto-rows-fr">
            <SpecTile label="Max Height" value={selectedPlot.maxHeight || "—"} />
            <SpecTile label="FAR" value={selectedPlot.far?.toString() || "—"} />
            <SpecTile label="GFA" value={selectedPlot.gfa ? `${formatNumber(selectedPlot.gfa)} sq. ft.` : "—"} />
            <SpecTile label="Zoning" value={selectedPlot.zoning || "—"} />
            <SpecTile label="Infrastructure" value={selectedPlot.infrastructure || "—"} />
          </div>
        )}

        {activeTab === "Payment Plan" && (
          <div className="flex-1 flex items-center justify-center text-muted text-sm">
            Payment plan details coming soon
          </div>
        )}
      </ContentCard>
    </div>
  );
}

function SpecTile({
  label,
  value,
  subLabel,
}: {
  label: string;
  value: string;
  subLabel?: string;
}) {
  return (
    <div className="bg-mint-white/80 border border-mint-light/40 rounded-xl p-4">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-sm font-semibold text-deep-forest">{value}</p>
      {subLabel && <p className="text-xs text-muted mt-0.5">{subLabel}</p>}
    </div>
  );
}
