"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ContentCard from "@/components/ContentCard";
import { plots, formatNumber, type Plot } from "@/data/mock";

interface ROIData {
  inputs: {
    plotSize: number;
    pricingMethod: string;
    pricePerPlotSqft: number;
    pricePerGFA: number;
    gfaRatio: number;
    efficiency: number;
    constructionCostPerGFA: number;
    softCostPct: number;
    sellingPricePerNSA: number;
  };
  results: {
    gfa: number;
    nsa: number;
    landCost: number;
    constructionCost: number;
    totalCost: number;
    revenue: number;
    profit: number;
    profitMargin: number;
    returnOnCost: number;
    rlv: number;
  };
  activeScenario: string;
}

function fmtAED(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`;
  return `AED ${n.toFixed(0)}`;
}

export default function FinalOfferPage() {
  const [roiData] = useState<ROIData | null>(() => {
    if (typeof window === "undefined") return null;
    try { const s = sessionStorage.getItem("roi_results"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [sourcePlot] = useState<Plot | null>(() => {
    if (typeof window === "undefined") return null;
    try { const s = sessionStorage.getItem("selected_plot"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [selectedPlotId, setSelectedPlotId] = useState(() => {
    if (typeof window === "undefined") return plots[0].id;
    try { const s = sessionStorage.getItem("selected_plot"); if (s) { const p: Plot = JSON.parse(s); return p.id; } } catch { /* ignore */ }
    return plots[0].id;
  });
  const [submitted, setSubmitted] = useState(false);
  const [dealRef, setDealRef] = useState<string | null>(null);

  const selectedPlot = plots.find((p) => p.id === selectedPlotId) || plots[0];
  const hasROI = roiData !== null;

  // Use ROI data if available, otherwise fall back to basic calculation
  const offerSummary = useMemo(() => {
    if (hasROI) {
      const r = roiData.results;
      return {
        landCost: r.landCost,
        totalCost: r.totalCost,
        revenue: r.revenue,
        profit: r.profit,
        profitMargin: r.profitMargin,
        returnOnCost: r.returnOnCost,
        gfa: r.gfa,
        nsa: r.nsa,
        rlv: r.rlv,
        scenario: roiData.activeScenario,
      };
    }
    // Fallback
    const gfa = selectedPlot.gfa || selectedPlot.plotArea * (selectedPlot.far || 3);
    const nsa = gfa * 0.8;
    const landCost = selectedPlot.askingPrice;
    const constructionCost = gfa * 900 * 1.1;
    const totalCost = landCost + constructionCost;
    const revenue = nsa * 3200;
    const profit = revenue - totalCost;
    return {
      landCost,
      totalCost,
      revenue,
      profit,
      profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
      returnOnCost: totalCost > 0 ? (profit / totalCost) * 100 : 0,
      gfa,
      nsa,
      rlv: revenue * 0.8 - constructionCost,
      scenario: "base",
    };
  }, [hasROI, roiData, selectedPlot]);

  const scenarioLabel = offerSummary.scenario === "conservative" ? "Conservative"
    : offerSummary.scenario === "optimistic" ? "Optimistic" : "Base Case";

  return (
    <div className="flex flex-col flex-1 gap-5 animate-fade-in">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold text-forest font-heading">Final Offer</h1>
        <p className="text-sm text-muted mt-1">
          {hasROI
            ? "Your offer is based on the ROI model you configured. Review and submit."
            : "Select a plot and review the offer summary below."}
        </p>
      </div>

      {/* Source info bar */}
      {hasROI && (
        <div className="flex items-center justify-between bg-mint-bg/50 rounded-xl px-5 py-3 border border-mint-light/40 shrink-0">
          <div className="flex items-center gap-3">
            {sourcePlot && (
              <span className="text-sm font-medium text-forest bg-forest/10 border border-forest/20 px-3 py-1 rounded-full">
                {sourcePlot.name}
              </span>
            )}
            <span className="text-sm text-muted">Scenario:</span>
            <span className="text-sm font-bold text-forest">{scenarioLabel}</span>
          </div>
          <Link href="/roi" className="text-sm text-forest font-medium hover:underline">Edit in ROI Simulator</Link>
        </div>
      )}

      {/* Plot selector — only if no ROI data */}
      {!hasROI && (
        <ContentCard>
          <h2 className="text-sm font-semibold text-deep-forest mb-3">Select Plot</h2>
          <div className="flex gap-2 flex-wrap">
            {plots.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedPlotId(p.id); setSubmitted(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  selectedPlotId === p.id
                    ? "bg-forest text-white border-forest"
                    : "bg-mint-white text-deep-forest border-mint-light hover:border-forest/30"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </ContentCard>
      )}

      {/* Offer summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <ContentCard className="bg-mint-bg border-mint-light">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Revenue (GDV)</p>
          <p className="text-2xl font-bold font-heading text-deep-forest">{fmtAED(offerSummary.revenue)}</p>
          <p className="text-xs text-muted mt-1">{formatNumber(Math.round(offerSummary.nsa))} sqft NSA</p>
        </ContentCard>
        <ContentCard className="bg-mint-bg border-mint-light">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Total Cost</p>
          <p className="text-2xl font-bold font-heading text-deep-forest">{fmtAED(offerSummary.totalCost)}</p>
          <p className="text-xs text-muted mt-1">Land + Construction</p>
        </ContentCard>
        <ContentCard className="bg-forest/10 border-forest/20">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Profit</p>
          <p className={`text-2xl font-bold font-heading ${offerSummary.profit > 0 ? "text-forest" : "text-red-600"}`}>{fmtAED(offerSummary.profit)}</p>
          <p className="text-xs text-muted mt-1">{offerSummary.returnOnCost.toFixed(1)}% ROC</p>
        </ContentCard>
        <ContentCard className="bg-forest/10 border-forest/20">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Profit Margin</p>
          <p className="text-2xl font-bold font-heading text-deep-forest">{offerSummary.profitMargin.toFixed(1)}%</p>
          <p className="text-xs text-muted mt-1">{scenarioLabel} scenario</p>
        </ContentCard>
      </div>

      {/* Cost breakdown + offer details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <ContentCard className="flex flex-col">
          <p className="text-xs uppercase tracking-widest text-muted mb-3 font-semibold">Cost Breakdown</p>
          <div className="divide-y divide-mint-light/60 flex-1">
            <div className="flex justify-between py-3">
              <span className="text-sm text-muted">Land Cost</span>
              <span className="text-base font-bold text-deep-forest">{fmtAED(offerSummary.landCost)}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-muted">GFA</span>
              <span className="text-base font-bold text-deep-forest">{formatNumber(Math.round(offerSummary.gfa))} sqft</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-muted">NSA</span>
              <span className="text-base font-bold text-deep-forest">{formatNumber(Math.round(offerSummary.nsa))} sqft</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-muted">Residual Land Value</span>
              <span className={`text-base font-bold ${offerSummary.rlv > 0 ? "text-forest" : "text-red-600"}`}>{fmtAED(offerSummary.rlv)}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-mint-light/60 text-sm text-muted">
            Plot: {selectedPlot.name} &middot; {selectedPlot.location}
          </div>
        </ContentCard>

        {/* Submit offer */}
        {!submitted ? (
          <ContentCard className="flex flex-col">
            <p className="text-xs uppercase tracking-widest text-muted mb-3 font-semibold">Submit Your Offer</p>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              Confirm your offer to generate a secure deal link. Your specialist will review and
              prepare the documentation for signing.
            </p>

            {/* What happens next */}
            <div className="flex-1 bg-mint-bg/40 rounded-xl border border-mint-light/40 p-4 mb-4">
              <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-3">What Happens Next</p>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Offer reviewed within 2 business hours" },
                  { step: "2", text: "Dedicated closing manager assigned" },
                  { step: "3", text: "Deal documentation prepared for e-signing" },
                  { step: "4", text: "Secure payment link generated" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-forest/10 text-forest text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <p className="text-sm text-deep-forest">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => { setDealRef(`NAMOU-${selectedPlot.name}-${Date.now().toString(36).toUpperCase()}`); setSubmitted(true); }}
                className="px-8 py-3 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-deep-forest transition-colors"
              >
                Submit Offer
              </button>
              <Link
                href="/roi"
                className="px-6 py-3 bg-white border border-mint-light text-deep-forest rounded-xl font-medium text-sm hover:bg-mint-white transition-colors"
              >
                Adjust in ROI Simulator
              </Link>
            </div>
          </ContentCard>
        ) : (
          <ContentCard className="border-mint bg-mint-white flex flex-col">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-forest">Offer Submitted</h2>
                <p className="text-sm text-muted mt-1">
                  Your offer of <strong className="text-forest">{fmtAED(offerSummary.landCost)}</strong> for
                  plot <strong>{selectedPlot.name}</strong> has been recorded.
                </p>
                <p className="text-sm text-muted mt-2">
                  A secure deal link has been generated. Your specialist will contact you
                  with next steps and signing instructions.
                </p>
                <div className="mt-3 p-2 bg-white rounded-lg border border-mint-light text-xs text-muted font-mono">
                  Deal ref: {dealRef}
                </div>
              </div>
            </div>
          </ContentCard>
        )}
      </div>
    </div>
  );
}
