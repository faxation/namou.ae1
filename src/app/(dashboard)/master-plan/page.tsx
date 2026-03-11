"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ContentCard from "@/components/ContentCard";
import { plots, areas, landCategories, type Plot, formatNumber } from "@/data/mock";

function areaSlug(area: string) {
  return area.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const typeToLandUse: Record<string, string[]> = {
  residential: ["Residential"],
  commercial:  ["Hospitality", "Convention Center & Hotel"],
  "mixed-use": ["Residential / Mixed-use"],
  industrial:  [],
};

export default function MasterPlanPage() {
  return (
    <React.Suspense fallback={<div className="flex flex-col flex-1 animate-fade-in" />}>
      <MasterPlanContent />
    </React.Suspense>
  );
}

function MasterPlanContent() {
  const searchParams = useSearchParams();
  const urlCtxType = searchParams.get("type");
  const urlCtxArea = searchParams.get("area");

  // Fall back to sessionStorage context set during onboarding when URL params are absent
  const [storedCtx] = useState<{ type: string | null; area: string | null }>(() => {
    try { return { type: sessionStorage.getItem("ctx_type"), area: sessionStorage.getItem("ctx_area") }; }
    catch { return { type: null, area: null }; }
  });

  const ctxType = urlCtxType ?? storedCtx.type;
  const ctxArea = urlCtxArea ?? storedCtx.area;

  const areaName = ctxArea ? (areas.find(a => areaSlug(a) === ctxArea) ?? null) : null;
  const typeLabel = ctxType ? (landCategories.find(c => c.slug === ctxType)?.label ?? ctxType) : null;

  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [comparePlots, setComparePlots] = useState<Plot[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  function handleSelectPlot(plot: Plot) {
    if (compareMode) {
      setComparePlots(prev => {
        const exists = prev.find(p => p.id === plot.id);
        let next: Plot[];
        if (exists) next = prev.filter(p => p.id !== plot.id);
        else if (prev.length >= 2) next = prev;
        else next = [...prev, plot];
        sessionStorage.setItem("compare_plots", JSON.stringify(next));
        return next;
      });
    } else {
      setSelectedPlot(plot);
      sessionStorage.setItem("selected_plot", JSON.stringify(plot));
    }
  }

  function toggleCompareMode() {
    if (compareMode) {
      setComparePlots([]);
      setCompareMode(false);
      sessionStorage.removeItem("compare_plots");
    } else {
      setSelectedPlot(null);
      setCompareMode(true);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSelectedPlot(null); setComparePlots([]); }, [ctxType, ctxArea]);

  const filteredPlots = plots.filter((p) => {
    const matchesType = !ctxType || !typeToLandUse[ctxType]?.length
      || typeToLandUse[ctxType].some(f => p.landUse.includes(f));
    const matchesArea = !areaName || p.area === areaName;
    return matchesType && matchesArea;
  });

  const showPanel = selectedPlot && !compareMode;
  const showCompare = compareMode && comparePlots.length > 0;

  return (
    <div className="flex flex-col flex-1 gap-2 lg:gap-3 animate-fade-in min-h-0 overflow-y-auto md:overflow-y-hidden">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-xl lg:text-3xl font-bold text-forest font-heading">Master Plan Overview</h1>
          <p className="text-sm text-muted mt-0.5">
            Zoning, access, and land distribution within Al Marjan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(typeLabel || areaName) && (
            <>
              {typeLabel && (
                <span className="text-xs font-medium text-forest bg-forest/10 border border-forest/20 px-3 py-1.5 rounded-full">
                  {typeLabel}
                </span>
              )}
              {areaName && (
                <>
                  <span className="text-muted text-xs">·</span>
                  <span className="text-xs font-medium text-deep-forest bg-mint-bg border border-mint-light px-3 py-1.5 rounded-full">
                    {areaName}
                  </span>
                </>
              )}
            </>
          )}
          {selectedPlot && !compareMode && (
            <>
              <span className="text-sm font-semibold text-forest bg-forest/10 border border-forest/20 px-3 py-1.5 rounded-full">
                {selectedPlot.name}
              </span>
              <button
                onClick={() => {
                  const initial = [selectedPlot];
                  sessionStorage.setItem("compare_plots", JSON.stringify(initial));
                  setComparePlots(initial);
                  setSelectedPlot(null);
                  setCompareMode(true);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-forest/30 text-forest bg-white hover:border-forest hover:bg-mint-bg transition-colors"
              >
                Compare Plots
              </button>
            </>
          )}
          {compareMode && (
            <button
              onClick={toggleCompareMode}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-forest text-white border-forest"
            >
              Exit Compare
            </button>
          )}
        </div>
      </div>

      {/* Compare hint */}
      {compareMode && comparePlots.length === 0 && (
        <div className="shrink-0 text-sm text-muted bg-mint-bg/50 rounded-xl px-4 py-2.5 border border-mint-light/40">
          Click up to 2 plots on the map to compare them side by side.
        </div>
      )}

      {/* Map + detail — horizontal on desktop, stacked on mobile */}
      <div className="flex flex-col md:flex-row flex-1 gap-3 min-h-0">

        {/* Map */}
        <div className={`relative bg-mint-white rounded-2xl overflow-hidden border border-mint-light/40 shadow-sm min-h-[250px] md:min-h-0 ${showPanel || showCompare ? "md:w-1/2" : "flex-1"}`}>

          {/* MangoMap iframe — real geographic map; Mango header clipped by container overflow:hidden */}
          <div className="absolute inset-0" style={{ overflow: "hidden" }}>
            <iframe
              src="https://mangomap.com/view-kcauw7z5/maps/153305/namou-lands?preview=true"
              title="Namou Master Plan Map"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
              loading="lazy"
              onLoad={() => setMapLoaded(true)}
              style={{
                position: "absolute",
                top: "-52px",
                left: 0,
                width: "100%",
                height: "calc(100% + 52px)",
                border: "none",
              }}
            />
          </div>

          {/* Loading overlay — shown until iframe fires onLoad */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-mint-white z-20 gap-3">
              <div className="w-7 h-7 border-2 border-forest/20 border-t-forest rounded-full animate-spin" />
              <p className="text-xs text-muted tracking-wide">Loading map…</p>
            </div>
          )}

          {/* Floating plot selector — Namou-styled overlay, top-left */}
          {filteredPlots.length > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-mint-light/40 shadow-sm overflow-hidden">
                <div className="px-3 pt-2.5 pb-1">
                  <p className="text-[9px] uppercase tracking-wider text-muted font-semibold">
                    {compareMode ? `Select Plots (${comparePlots.length}/2)` : "Available Plots"}
                  </p>
                </div>
                <div className="flex flex-col divide-y divide-mint-light/40 max-h-[260px] overflow-y-auto">
                  {filteredPlots.map(plot => {
                    const isSelected = selectedPlot?.id === plot.id;
                    const isCompared = comparePlots.some(p => p.id === plot.id);
                    const active = isSelected || isCompared;
                    return (
                      <button
                        key={plot.id}
                        onClick={() => handleSelectPlot(plot)}
                        className={`w-full text-left px-3 py-2.5 transition-colors ${
                          active ? "bg-forest" : "bg-transparent hover:bg-mint-bg"
                        }`}
                      >
                        <p className={`text-xs font-semibold ${active ? "text-white" : "text-deep-forest"}`}>
                          {plot.name}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${active ? "text-white/70" : "text-muted"}`}>
                          {formatNumber(plot.plotArea)} sqft
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Area summary stats — top-right overlay, shown when no side panel */}
          {!showPanel && !showCompare && (
            <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-xl p-4 text-xs text-deep-forest shadow-sm min-w-[180px]">
              <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-2">Area Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Plots Shown</span>
                  <span className="font-bold text-forest">{filteredPlots.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Total Area</span>
                  <span className="font-bold text-deep-forest">{formatNumber(filteredPlots.reduce((s, p) => s + p.plotArea, 0))} sqft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Avg. Price/sqft</span>
                  <span className="font-bold text-deep-forest">AED {formatNumber(Math.round(filteredPlots.reduce((s, p) => s + p.pricePerSqFt, 0) / (filteredPlots.length || 1)))}</span>
                </div>
                {filteredPlots.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted">Price Range</span>
                    <span className="font-bold text-deep-forest">AED {formatNumber(Math.min(...filteredPlots.map(p => p.pricePerSqFt)))}–{formatNumber(Math.max(...filteredPlots.map(p => p.pricePerSqFt)))}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Plot detail panel — horizontal split */}
        {showPanel && (
          <PlotDetailPanel plot={selectedPlot} onClose={() => setSelectedPlot(null)} />
        )}

        {/* Comparison table — right side */}
        {showCompare && (
          <ComparisonTable plots={comparePlots} onRemove={(id) => setComparePlots(prev => {
            const next = prev.filter(p => p.id !== id);
            sessionStorage.setItem("compare_plots", JSON.stringify(next));
            return next;
          })} />
        )}
      </div>
    </div>
  );
}

function ComparisonTable({ plots: cPlots, onRemove }: { plots: Plot[]; onRemove: (id: string) => void }) {
  const router = useRouter();
  const rows: { label: string; getValue: (p: Plot) => string; highlight?: boolean; section?: string }[] = [
    { label: "Land Use", getValue: (p) => p.landUse, section: "Details" },
    { label: "Plot Type", getValue: (p) => p.plotType },
    { label: "Plot Area", getValue: (p) => `${formatNumber(p.plotArea)} sqft` },
    { label: "GFA", getValue: (p) => p.gfa ? `${formatNumber(p.gfa)} sqft` : "—" },
    { label: "FAR", getValue: (p) => p.far ? p.far.toString() : "—" },
    { label: "Zoning", getValue: (p) => p.zoning || "—" },
    { label: "Asking Price", getValue: (p) => `AED ${formatNumber(p.askingPrice)}`, highlight: true, section: "Pricing" },
    { label: "Price / sqft", getValue: (p) => `AED ${formatNumber(p.pricePerSqFt)}` },
    { label: "Max Height", getValue: (p) => p.maxHeight || "—", section: "Location & Access" },
    { label: "Location", getValue: (p) => p.location },
    { label: "Airport ETA", getValue: (p) => p.airportEta },
    { label: "Casino ETA", getValue: (p) => p.casinoEta },
  ];

  const lowestPrice = Math.min(...cPlots.map(p => p.askingPrice));
  const lowestPriceSqft = Math.min(...cPlots.map(p => p.pricePerSqFt));

  function handleCompareROI() {
    sessionStorage.setItem("compare_plots", JSON.stringify(cPlots));
    // Set the first plot as selected for ROI, store both for comparison
    sessionStorage.setItem("selected_plot", JSON.stringify(cPlots[0]));
    router.push("/roi");
  }

  return (
    <div className="md:w-1/2 flex flex-col min-h-0">
    <ContentCard className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-deep-forest font-heading">Plot Comparison</p>
          <span className="text-[10px] font-medium text-muted bg-mint-bg border border-mint-light/60 px-2 py-0.5 rounded-full">
            {cPlots.length}/2 selected
          </span>
        </div>
      </div>

      {/* Column headers — plot cards */}
      <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: `110px repeat(${cPlots.length}, 1fr)` }}>
        <div />
        {cPlots.map(p => (
          <div key={p.id} className="bg-mint-bg/50 rounded-xl p-3 border border-mint-light/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-forest">{p.name}</p>
                <p className="text-[10px] text-muted mt-0.5">{p.area}</p>
              </div>
              <button onClick={() => onRemove(p.id)} className="text-muted hover:text-red-500 transition-colors p-0.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-lg font-bold text-forest font-heading mt-1">AED {formatNumber(p.askingPrice)}</p>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {p.askingPrice === lowestPrice && cPlots.length > 1 && (
                <span className="text-[9px] font-semibold text-forest bg-forest/10 px-1.5 py-0.5 rounded">Best Price</span>
              )}
              {p.pricePerSqFt === lowestPriceSqft && cPlots.length > 1 && (
                <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Best /sqft</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Data rows */}
      <div className="grid gap-0 flex-1" style={{ gridTemplateColumns: `110px repeat(${cPlots.length}, 1fr)` }}>
        {rows.map((row, ri) => (
          <React.Fragment key={row.label}>
            {row.section && (
              <div className={`col-span-full text-[10px] uppercase tracking-widest text-muted font-semibold ${ri > 0 ? "mt-3 pt-3 border-t border-mint-light/40" : ""} pb-1.5`}>
                {row.section}
              </div>
            )}
            <div className="py-1.5 text-xs text-muted flex items-center">{row.label}</div>
            {cPlots.map(p => (
              <div key={p.id} className={`py-1.5 px-3 text-sm font-bold ${row.highlight ? "text-forest" : "text-deep-forest"}`}>
                {row.getValue(p)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* CTA — Compare ROI for both plots */}
      {cPlots.length === 2 && (
        <div className="mt-4 pt-4 border-t border-mint-light/60 shrink-0">
          <button
            onClick={handleCompareROI}
            className="w-full px-4 py-3 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-deep-forest transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
            Compare ROI for Both Plots
          </button>
        </div>
      )}
    </ContentCard>
    </div>
  );
}

function PlotDetailPanel({ plot, onClose }: { plot: Plot; onClose: () => void }) {
  const [openSection, setOpenSection] = useState<string>("land-info");

  function toggle(key: string) {
    setOpenSection(prev => (prev === key ? "" : key));
  }

  return (
    <div className="md:w-1/2 flex flex-col min-h-0">
      <ContentCard className="flex-1 overflow-y-auto flex flex-col">
        {/* Header — plot name */}
        <div className="flex items-start justify-between mb-4 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-forest font-heading">{plot.name}</h2>
            <p className="text-xs text-muted mt-0.5">{plot.area}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-forest transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Accordion sections */}
        <div className="flex-1 flex flex-col gap-1">

          {/* 1. Land Info */}
          <AccordionSection
            title="Land Info"
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>}
            isOpen={openSection === "land-info"}
            onToggle={() => toggle("land-info")}
          >
            <div className="divide-y divide-mint-light/60">
              <PlotRow label="Land Use" value={plot.landUse} />
              <PlotRow label="Plot Type" value={plot.plotType} />
              <PlotRow label="Plot Area" value={`${formatNumber(plot.plotArea)} sq ft`} />
              <PlotRow label="Asking Price" value={`AED ${formatNumber(plot.askingPrice)}`} highlight />
              <PlotRow label="Price / sq ft" value={`AED ${formatNumber(plot.pricePerSqFt)}`} />
              {plot.gfa && <PlotRow label="GFA" value={`${formatNumber(plot.gfa)} sq ft`} />}
              {plot.far && <PlotRow label="FAR" value={plot.far.toString()} />}
              {plot.maxHeight && <PlotRow label="Max Height" value={plot.maxHeight} />}
              {plot.zoning && <PlotRow label="Zoning" value={plot.zoning} />}
              {plot.infrastructure && <PlotRow label="Infrastructure" value={plot.infrastructure} />}
              {plot.dimensions && (
                <PlotRow label="Dimensions" value={`${plot.dimensions.width} × ${plot.dimensions.depth} ft`} />
              )}
            </div>
          </AccordionSection>

          {/* 2. Land Gallery */}
          <AccordionSection
            title="Land Gallery"
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>}
            isOpen={openSection === "gallery"}
            onToggle={() => toggle("gallery")}
          >
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-lg bg-mint-bg border border-mint-light/40 flex items-center justify-center"
                >
                  <div className="text-center text-muted">
                    <svg className="w-6 h-6 mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p className="text-[9px]">{plot.name} — View {i}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>

          {/* 3. Land Map Location */}
          <AccordionSection
            title="Land Map Location"
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>}
            isOpen={openSection === "map"}
            onToggle={() => toggle("map")}
          >
            <div className="aspect-[16/9] rounded-lg bg-mint-bg border border-mint-light/40 flex items-center justify-center">
              <div className="text-center text-muted">
                <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <p className="text-xs font-medium text-deep-forest">{plot.location}</p>
                <p className="text-[10px] mt-0.5">Airport: {plot.airportEta} · Casino: {plot.casinoEta}</p>
              </div>
            </div>
          </AccordionSection>
        </div>

        {/* CTAs */}
        <div className="mt-4 pt-4 border-t border-mint-light/60 flex gap-2 shrink-0">
          <Link
            href="/roi"
            className="flex-1 text-center px-4 py-2.5 border border-forest text-forest rounded-xl font-semibold text-sm hover:bg-mint-bg transition-colors"
          >
            Analyze ROI
          </Link>
          <a
            href="/offer"
            className="flex-1 text-center px-4 py-2.5 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-deep-forest transition-colors"
          >
            Submit Offer
          </a>
        </div>
      </ContentCard>
    </div>
  );
}

function AccordionSection({
  title, icon, isOpen, onToggle, children,
}: {
  title: string; icon: React.ReactNode; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border transition-colors ${isOpen ? "border-forest/20 bg-mint-bg/30" : "border-mint-light/40 bg-white"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className={`transition-colors ${isOpen ? "text-forest" : "text-muted"}`}>{icon}</span>
          <span className={`text-sm font-semibold transition-colors ${isOpen ? "text-forest" : "text-deep-forest"}`}>{title}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180 text-forest" : "text-muted"}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

function PlotRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-sm font-bold ${highlight ? "text-forest" : "text-deep-forest"}`}>{value}</p>
    </div>
  );
}
