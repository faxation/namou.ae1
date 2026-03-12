"use client";

import { useState, useMemo } from "react";
import { plots, formatNumber, type ROIInputs } from "@/data/mock";

interface SimResult {
  plotName: string;
  area: string;
  plotArea: number;
  landCost: number;
  pricePerSqFt: number;
  gfa: number;
  nsa: number;
  far: number;
  constructionCost: number;
  totalCost: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

interface Scenario {
  id: string;
  label: string;
  plotIds: [string, string];
  inputs: ROIInputs;
}

const scenarios: Scenario[] = [
  {
    id: "s1",
    label: "Residential vs Mixed-use",
    plotIds: [plots[4].id, plots[1].id],
    inputs: {
      constructionCostPerSqFt: 990,
      salePricePerSqFt: 3200,
      netSellableAreaPct: 80,
      targetProfitMarginPct: 20,
    },
  },
  {
    id: "s2",
    label: "Hospitality vs Convention",
    plotIds: [plots[2].id, plots[3].id],
    inputs: {
      constructionCostPerSqFt: 1100,
      salePricePerSqFt: 2800,
      netSellableAreaPct: 70,
      targetProfitMarginPct: 25,
    },
  },
  {
    id: "s3",
    label: "Premium Beachfront",
    plotIds: [plots[0].id, plots[2].id],
    inputs: {
      constructionCostPerSqFt: 1200,
      salePricePerSqFt: 3500,
      netSellableAreaPct: 75,
      targetProfitMarginPct: 22,
    },
  },
];

function computeResult(
  plotId: string,
  inputs: ROIInputs
): SimResult | null {
  const plot = plots.find((p) => p.id === plotId);
  if (!plot) return null;
  const gfa = plot.gfa || plot.plotArea * (plot.far || 3);
  const nsa = gfa * (inputs.netSellableAreaPct / 100);
  const landCost = plot.plotArea * plot.pricePerSqFt;
  const constructionCost = gfa * inputs.constructionCostPerSqFt;
  const totalCost = landCost + constructionCost;
  const revenue = nsa * inputs.salePricePerSqFt;
  const profit = revenue - totalCost;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    plotName: plot.name,
    area: plot.area,
    plotArea: plot.plotArea,
    landCost,
    pricePerSqFt: plot.pricePerSqFt,
    gfa,
    nsa,
    far: plot.far || 3,
    constructionCost,
    totalCost,
    revenue,
    profit,
    profitMargin,
  };
}

function fmtM(n: number) {
  return `AED ${(n / 1_000_000).toFixed(1)}M`;
}

function fmtPct(n: number) {
  return `${n.toFixed(1)}%`;
}

export default function ROISimulatorPage() {
  const [activeScenario, setActiveScenario] = useState<string | null>(
    scenarios[0].id
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([
    plots[4].id,
    plots[1].id,
  ]);
  const [inputs, setInputs] = useState<ROIInputs>({
    constructionCostPerSqFt: 990,
    salePricePerSqFt: 3200,
    netSellableAreaPct: 80,
    targetProfitMarginPct: 20,
  });

  const applyScenario = (scenario: Scenario) => {
    setActiveScenario(scenario.id);
    setSelectedIds([...scenario.plotIds]);
    setInputs({ ...scenario.inputs });
  };

  const togglePlot = (id: string) => {
    setActiveScenario(null);
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 2
          ? [...prev, id]
          : prev
    );
  };

  const removePlot = (id: string) => {
    setActiveScenario(null);
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const results = useMemo(
    () =>
      selectedIds
        .map((id) => computeResult(id, inputs))
        .filter(Boolean) as SimResult[],
    [selectedIds, inputs]
  );

  const updateInput = (key: keyof ROIInputs, value: number) => {
    setActiveScenario(null);
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-88px)] overflow-hidden">
      {/* ── Header with title + scenario buttons ── */}
      <div className="flex items-center justify-between shrink-0 mb-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-forest font-heading">
            ROI Simulator
          </h1>
          {selectedIds.map((id) => {
            const p = plots.find((x) => x.id === id);
            return p ? (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-mint-light bg-white text-xs font-medium text-forest"
              >
                <span className="w-2 h-2 rounded-full bg-forest" />
                {p.name}
                <button
                  onClick={() => removePlot(id)}
                  className="ml-1 text-muted hover:text-forest"
                >
                  &times;
                </button>
              </span>
            ) : null;
          })}
        </div>

        {/* Scenario buttons */}
        <div className="flex items-center gap-1">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => applyScenario(s)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeScenario === s.id
                  ? "bg-forest text-white"
                  : "bg-white border border-mint-light text-muted hover:border-forest/30"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Split screen: left = simulator, right = results ── */}
      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        {/* Left: Plot selector + Variables */}
        <div className="w-1/2 flex flex-col gap-3 min-h-0 overflow-auto">
          {/* Plot selector */}
          <div className="bg-white rounded-xl border border-mint-light/50 p-4 shrink-0">
            <h2 className="text-sm font-semibold text-deep-forest mb-3">
              Select 2 plots to compare
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {plots.map((p) => {
                const selected = selectedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlot(p.id)}
                    className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                      selected
                        ? "border-forest bg-forest/5 ring-1 ring-forest"
                        : "border-mint-light bg-white hover:border-forest/30"
                    }`}
                  >
                    <span className="font-semibold text-forest block">
                      {p.name}
                    </span>
                    <span className="text-muted">{p.area}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Variables */}
          <div className="bg-white rounded-xl border border-mint-light/50 p-4 shrink-0">
            <h2 className="text-sm font-semibold text-deep-forest mb-4">
              Scenario Variables
            </h2>
            <div className="space-y-4">
              <VarSlider
                label="Construction Cost / sq ft"
                value={inputs.constructionCostPerSqFt}
                min={200}
                max={2000}
                step={10}
                fmt={(v) => `AED ${formatNumber(v)}`}
                onChange={(v) => updateInput("constructionCostPerSqFt", v)}
              />
              <VarSlider
                label="Expected Sale Price / sq ft"
                value={inputs.salePricePerSqFt}
                min={500}
                max={5000}
                step={50}
                fmt={(v) => `AED ${formatNumber(v)}`}
                onChange={(v) => updateInput("salePricePerSqFt", v)}
              />
              <VarSlider
                label="Net Sellable Area (NSA %)"
                value={inputs.netSellableAreaPct}
                min={50}
                max={95}
                step={1}
                fmt={(v) => `${v}%`}
                onChange={(v) => updateInput("netSellableAreaPct", v)}
              />
              <VarSlider
                label="Target Profit Margin"
                value={inputs.targetProfitMarginPct}
                min={5}
                max={50}
                step={1}
                fmt={(v) => `${v}%`}
                onChange={(v) => updateInput("targetProfitMarginPct", v)}
              />
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="w-1/2 flex flex-col min-h-0 overflow-hidden">
          {results.length >= 2 ? (
            <ResultsPanel results={results} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-mint-light/50">
              <p className="text-muted text-sm">
                Select 2 plots to see comparison results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Variables slider
   ════════════════════════════════════════════ */
function VarSlider({
  label,
  value,
  min,
  max,
  step,
  fmt,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-xs font-semibold text-forest">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-mint-light rounded-full appearance-none cursor-pointer accent-forest"
      />
    </div>
  );
}

/* ════════════════════════════════════════════
   Results panel (right side)
   ════════════════════════════════════════════ */
function ResultsPanel({ results }: { results: SimResult[] }) {
  const [a, b] = results;

  const marginLabel = (pct: number) =>
    pct >= 50
      ? "Exceptional Opportunity"
      : pct >= 30
        ? "Strong Return"
        : pct >= 15
          ? "Moderate Return"
          : "Low Return";

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-forest" />
          <strong className="text-forest">{a.plotName}</strong> {a.area}
        </span>
        <span className="text-muted">vs</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
          <strong className="text-[#3b82f6]">{b.plotName}</strong> {b.area}
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        <SummaryCard
          title="TOTAL REVENUE (GDV)"
          aLabel={a.plotName}
          aValue={fmtM(a.revenue)}
          bLabel={b.plotName}
          bValue={fmtM(b.revenue)}
        />
        <SummaryCard
          title="TOTAL COST"
          aLabel={a.plotName}
          aValue={fmtM(a.totalCost)}
          bLabel={b.plotName}
          bValue={fmtM(b.totalCost)}
        />
        <SummaryCard
          title="TOTAL PROFIT"
          aLabel={a.plotName}
          aValue={fmtM(a.profit)}
          bLabel={b.plotName}
          bValue={fmtM(b.profit)}
          highlight
        />
        <div className="bg-white rounded-xl border border-mint-light/50 px-2 py-2">
          <p className="text-[10px] text-muted uppercase tracking-wider text-center mb-1">
            Profit Margin
          </p>
          <div className="grid grid-cols-2 gap-1 text-center">
            <div>
              <p className="text-[9px] text-muted">{a.plotName}</p>
              <p className="text-base font-bold text-forest leading-tight">
                {fmtPct(a.profitMargin)}
              </p>
              <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[8px] font-medium rounded bg-mint-bg text-forest">
                {marginLabel(a.profitMargin)}
              </span>
            </div>
            <div>
              <p className="text-[9px] text-muted">{b.plotName}</p>
              <p className="text-base font-bold text-[#3b82f6] leading-tight">
                {fmtPct(b.profitMargin)}
              </p>
              <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[8px] font-medium rounded bg-blue-50 text-[#3b82f6]">
                {marginLabel(b.profitMargin)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed comparison table */}
      <div className="bg-white rounded-xl border border-mint-light/50 flex-1 min-h-0 overflow-auto">
        <div className="px-5 py-2">
          <h2 className="text-xs font-semibold text-deep-forest uppercase tracking-wider">
            Detailed Comparison
          </h2>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-mint-light/40">
              <th className="text-left px-5 pb-1 text-muted font-medium w-1/3">
                Metric
              </th>
              <th className="text-right px-5 pb-1 text-forest font-medium w-1/3">
                {a.plotName}
              </th>
              <th className="text-right px-5 pb-1 text-[#3b82f6] font-medium w-1/3">
                {b.plotName}
              </th>
            </tr>
          </thead>
          <tbody>
            <SectionHeader label="LAND" />
            <Row
              label="Plot Area"
              a={`${formatNumber(a.plotArea)} sqft`}
              b={`${formatNumber(b.plotArea)} sqft`}
            />
            <Row label="Land Cost" a={fmtM(a.landCost)} b={fmtM(b.landCost)} />
            <Row
              label="Price / sqft"
              a={`AED ${formatNumber(a.pricePerSqFt)}`}
              b={`AED ${formatNumber(b.pricePerSqFt)}`}
            />

            <SectionHeader label="DEVELOPMENT" />
            <Row
              label="GFA"
              a={`${formatNumber(a.gfa)} sqft`}
              b={`${formatNumber(b.gfa)} sqft`}
            />
            <Row
              label="NSA"
              a={`${formatNumber(Math.round(a.nsa))} sqft`}
              b={`${formatNumber(Math.round(b.nsa))} sqft`}
            />
            <Row label="FAR" a={String(a.far)} b={String(b.far)} />

            <SectionHeader label="COSTS" />
            <Row
              label="Construction Cost"
              a={fmtM(a.constructionCost)}
              b={fmtM(b.constructionCost)}
            />
            <Row
              label="Total Cost"
              a={fmtM(a.totalCost)}
              b={fmtM(b.totalCost)}
            />

            <SectionHeader label="RETURNS" />
            <Row
              label="Revenue (GDV)"
              a={fmtM(a.revenue)}
              b={fmtM(b.revenue)}
            />
            <Row
              label="Profit"
              a={fmtM(a.profit)}
              b={fmtM(b.profit)}
              highlight
            />
            <Row
              label="Margin"
              a={fmtPct(a.profitMargin)}
              b={fmtPct(b.profitMargin)}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Shared sub-components
   ════════════════════════════════════════════ */
function SummaryCard({
  title,
  aLabel,
  aValue,
  bLabel,
  bValue,
  highlight,
}: {
  title: string;
  aLabel: string;
  aValue: string;
  bLabel: string;
  bValue: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-xl border px-2 py-2 ${highlight ? "border-forest/30 bg-forest/[0.02]" : "border-mint-light/50"}`}
    >
      <p className="text-[10px] text-muted uppercase tracking-wider text-center mb-1">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-1 text-center">
        <div>
          <p className="text-[9px] text-muted">{aLabel}</p>
          <p
            className={`text-sm font-bold ${highlight ? "text-forest" : "text-deep-forest"}`}
          >
            {aValue}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted">{bLabel}</p>
          <p
            className={`text-sm font-bold ${highlight ? "text-forest" : "text-deep-forest"}`}
          >
            {bValue}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <tr>
      <td
        colSpan={3}
        className="px-5 pt-2 pb-0.5 text-[10px] font-semibold text-muted uppercase tracking-wider"
      >
        {label}
      </td>
    </tr>
  );
}

function Row({
  label,
  a,
  b,
  highlight,
}: {
  label: string;
  a: string;
  b: string;
  highlight?: boolean;
}) {
  return (
    <tr className="border-b border-mint-light/20 last:border-0">
      <td className="px-5 py-1 text-muted">{label}</td>
      <td
        className={`px-5 py-1 text-right font-medium ${highlight ? "text-forest font-bold" : "text-deep-forest"}`}
      >
        {a}
      </td>
      <td
        className={`px-5 py-1 text-right font-medium ${highlight ? "text-[#3b82f6] font-bold" : "text-deep-forest"}`}
      >
        {b}
      </td>
    </tr>
  );
}
