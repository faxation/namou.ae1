"use client";

import { useState } from "react";
import ContentCard from "@/components/ContentCard";
import { plots, calculateROI, formatNumber, type ROIInputs } from "@/data/mock";

export default function ROICalculatorPage() {
  const [selectedPlotId, setSelectedPlotId] = useState(plots[0].id);
  const [inputs, setInputs] = useState<ROIInputs>({
    constructionCostPerSqFt: 800,
    salePricePerSqFt: 1500,
    netSellableAreaPct: 75,
    targetProfitMarginPct: 20,
  });

  const selectedPlot = plots.find((p) => p.id === selectedPlotId) || plots[0];
  const gfa = selectedPlot.gfa || selectedPlot.plotArea * (selectedPlot.far || 3);

  const outputs = calculateROI(inputs, gfa);

  const updateInput = (key: keyof ROIInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest font-heading">Interactive ROI Tool</h1>
        <p className="text-sm text-muted mt-1">
          Adjust variables live to reverse-engineer the land price you&apos;re willing to offer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inputs column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Plot selector */}
          <ContentCard>
            <h2 className="text-sm font-semibold text-deep-forest mb-3">Select Plot</h2>
            <div className="flex gap-2 flex-wrap">
              {plots.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlotId(p.id)}
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
            <p className="text-xs text-muted mt-2">
              GFA: {formatNumber(Math.round(gfa))} sq ft | Asking: AED {formatNumber(selectedPlot.askingPrice)}
            </p>
          </ContentCard>

          {/* Sliders */}
          <ContentCard>
            <h2 className="text-sm font-semibold text-deep-forest mb-4">Adjustable Variables</h2>
            <div className="space-y-5">
              <SliderInput
                label="Construction Cost per sq ft"
                value={inputs.constructionCostPerSqFt}
                min={200}
                max={1500}
                step={10}
                unit="$"
                onChange={(v) => updateInput("constructionCostPerSqFt", v)}
              />
              <SliderInput
                label="Expected Sale Price per sq ft"
                value={inputs.salePricePerSqFt}
                min={500}
                max={3000}
                step={10}
                unit="$"
                onChange={(v) => updateInput("salePricePerSqFt", v)}
              />
              <SliderInput
                label="Net Sellable Area (NSA)"
                value={inputs.netSellableAreaPct}
                min={50}
                max={90}
                step={1}
                unit="%"
                onChange={(v) => updateInput("netSellableAreaPct", v)}
              />
              <SliderInput
                label="Target Developer Profit Margin"
                value={inputs.targetProfitMarginPct}
                min={5}
                max={40}
                step={1}
                unit="%"
                onChange={(v) => updateInput("targetProfitMarginPct", v)}
              />
            </div>
          </ContentCard>
        </div>

        {/* Outputs column */}
        <div className="space-y-4">
          <ContentCard className="bg-forest text-white border-forest">
            <h2 className="text-sm font-medium opacity-80 mb-4">Calculated Results</h2>
            <div className="space-y-4">
              <OutputMetric label="ROI" value={`${outputs.roi}%`} />
              <OutputMetric label="Total Development Value" value={`$${formatNumber(outputs.totalDevelopmentValue)}`} />
              <OutputMetric label="Maximum Land Price" value={`$${formatNumber(outputs.maximumLandPrice)}`} highlight />
              <OutputMetric label="GFA Price" value={`$${outputs.gfaPrice.toFixed(2)}/sq ft`} />
            </div>
          </ContentCard>

          <a
            href="/offer"
            className="block w-full text-center px-6 py-3 bg-mint text-forest rounded-xl font-semibold text-sm hover:bg-mint-light transition-colors"
          >
            Proceed to Final Offer
          </a>
        </div>
      </div>
    </div>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm text-muted">{label}</label>
        <span className="text-sm font-semibold text-forest">
          {unit === "$" ? `$${formatNumber(value)}` : `${value}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-mint-light rounded-full appearance-none cursor-pointer accent-forest"
      />
      <div className="flex justify-between text-[10px] text-muted mt-0.5">
        <span>{unit === "$" ? `$${min}` : `${min}${unit}`}</span>
        <span>{unit === "$" ? `$${formatNumber(max)}` : `${max}${unit}`}</span>
      </div>
    </div>
  );
}

function OutputMetric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs opacity-70">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-mint" : ""}`}>{value}</p>
    </div>
  );
}
