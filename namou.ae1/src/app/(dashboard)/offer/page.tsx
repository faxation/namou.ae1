"use client";

import { useState, useMemo } from "react";
import ContentCard from "@/components/ContentCard";
import { plots, calculateROI, formatNumber, type ROIInputs } from "@/data/mock";

export default function FinalOfferPage() {
  const [selectedPlotId, setSelectedPlotId] = useState(plots[0].id);
  const [inputs] = useState<ROIInputs>({
    constructionCostPerSqFt: 800,
    salePricePerSqFt: 1500,
    netSellableAreaPct: 75,
    targetProfitMarginPct: 20,
  });
  const [submitted, setSubmitted] = useState(false);
  // Capture deal ref once at submission time to avoid calling Date.now() during render.
  const [dealRef, setDealRef] = useState<string | null>(null);

  const selectedPlot = plots.find((p) => p.id === selectedPlotId) || plots[0];
  const gfa = selectedPlot.gfa || selectedPlot.plotArea * (selectedPlot.far || 3);
  const outputs = useMemo(() => calculateROI(inputs, gfa), [inputs, gfa]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest font-heading">Final Offer</h1>
        <p className="text-sm text-muted mt-1">
          Based on your assumptions, your land offer would be:
        </p>
      </div>

      {/* Plot selector */}
      <ContentCard className="mb-4">
        <h2 className="text-sm font-semibold text-deep-forest mb-3">Select Plot</h2>
        <div className="flex gap-2 flex-wrap">
          {plots.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedPlotId(p.id); setSubmitted(false); setDealRef(null); }}
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

      {/* Offer summary */}
      <ContentCard className="bg-forest text-white border-forest mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs opacity-70">Calculated GFA Price</p>
            <p className="text-2xl font-bold text-mint">${outputs.gfaPrice.toFixed(2)}/sq ft</p>
          </div>
          <div>
            <p className="text-xs opacity-70">Total Land Value</p>
            <p className="text-2xl font-bold">${formatNumber(outputs.maximumLandPrice)}</p>
          </div>
          <div>
            <p className="text-xs opacity-70">ROI</p>
            <p className="text-2xl font-bold">{outputs.roi}%</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20 text-sm opacity-80">
          <p>Plot: {selectedPlot.name} | GFA: {formatNumber(Math.round(gfa))} sq ft | Location: {selectedPlot.location}</p>
        </div>
      </ContentCard>

      {/* Submit offer */}
      {!submitted ? (
        <ContentCard>
          <h2 className="text-base font-semibold text-deep-forest mb-3">Submit Your Offer</h2>
          <p className="text-sm text-muted mb-4">
            Confirm your offer to generate a secure deal link. Your specialist will review and
            prepare the documentation for signing.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setDealRef(`NAMOU-${selectedPlot.name}-${Date.now().toString(36).toUpperCase()}`);
                setSubmitted(true);
              }}
              className="px-8 py-3 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-deep-forest transition-colors"
            >
              Submit Offer
            </button>
            <a
              href="/roi/calculator"
              className="px-6 py-3 bg-white border border-mint-light text-deep-forest rounded-xl font-medium text-sm hover:bg-mint-white transition-colors"
            >
              Adjust Assumptions
            </a>
          </div>
        </ContentCard>
      ) : (
        <ContentCard className="border-mint bg-mint-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-forest flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-forest">Offer Submitted</h2>
              <p className="text-sm text-muted mt-1">
                Your offer of <strong className="text-forest">${formatNumber(outputs.maximumLandPrice)}</strong> for
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
  );
}
