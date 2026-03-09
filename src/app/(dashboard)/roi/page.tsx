"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import ContentCard from "@/components/ContentCard";
import { formatNumber, plots, type Plot } from "@/data/mock";

// ── Types ────────────────────────────────────────────────────────────────────

type PricingMethod = "per-plot" | "per-gfa";
type Scenario = "conservative" | "base" | "optimistic";
type Phase = 1 | 2 | 3;

interface Inputs {
  plotSize: number;
  pricingMethod: PricingMethod;
  pricePerPlotSqft: number;
  pricePerGFA: number;
  gfaRatio: number;
  efficiency: number;
  constructionCostPerGFA: number;
  softCostPct: number;
  sellingPricePerNSA: number;
}

interface OfferSim {
  method: PricingMethod;
  pricePerGFA: number;
  pricePerPlotSqft: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SLIDER_MIN = 2500;
const SLIDER_MAX = 4000;
const SENSITIVITY_PRICES = [2500, 2800, 3200, 3600, 4000];
const RLV_TARGET_MARGIN = 20;

const BASE_INPUTS: Inputs = {
  plotSize: 50000,
  pricingMethod: "per-gfa",
  pricePerPlotSqft: 500,
  pricePerGFA: 300,
  gfaRatio: 3.0,
  efficiency: 80,
  constructionCostPerGFA: 900,
  softCostPct: 10,
  sellingPricePerNSA: 3200,
};

const SCENARIO_OVERRIDES: Record<Scenario, Partial<Inputs>> = {
  conservative: { sellingPricePerNSA: 2500, constructionCostPerGFA: 1000, efficiency: 75 },
  base:         { sellingPricePerNSA: 3200, constructionCostPerGFA: 900,  efficiency: 80 },
  optimistic:   { sellingPricePerNSA: 4000, constructionCostPerGFA: 800,  efficiency: 85 },
};

const SCENARIO_META: Record<Scenario, { label: string; description: string; riskLevel: string; riskColor: string; suitedFor: string; marketOutlook: string }> = {
  conservative: {
    label: "Conservative",
    description: "Lower exit price, higher construction cost, tighter efficiency",
    riskLevel: "Low Risk",
    riskColor: "text-forest bg-forest/10",
    suitedFor: "Risk-averse investors seeking capital preservation with steady returns",
    marketOutlook: "Assumes slower market absorption, premium construction standards, and conservative pricing benchmarks",
  },
  base: {
    label: "Base Case",
    description: "Market-standard assumptions for a balanced projection",
    riskLevel: "Moderate Risk",
    riskColor: "text-amber-700 bg-amber-50",
    suitedFor: "Balanced investors targeting market-rate returns with manageable exposure",
    marketOutlook: "Reflects current market conditions, standard construction specs, and median comparable pricing",
  },
  optimistic: {
    label: "Optimistic",
    description: "Premium exit price, lean construction, higher efficiency",
    riskLevel: "Higher Risk",
    riskColor: "text-blue-700 bg-blue-50",
    suitedFor: "Growth-focused investors comfortable with higher exposure for outsized returns",
    marketOutlook: "Projects strong demand, value-engineered construction, and premium positioning in a bullish market",
  },
};

// ── Calculations ──────────────────────────────────────────────────────────────

function compute(inp: Inputs) {
  const gfa = inp.plotSize * inp.gfaRatio;
  const nsa = gfa * (inp.efficiency / 100);
  const landCost = inp.pricingMethod === "per-plot"
    ? inp.plotSize * inp.pricePerPlotSqft
    : gfa * inp.pricePerGFA;
  const constructionCost = gfa * inp.constructionCostPerGFA * (1 + inp.softCostPct / 100);
  const totalCost = landCost + constructionCost;
  const revenue = nsa * inp.sellingPricePerNSA;
  const profit = revenue - totalCost;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const returnOnCost = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const gdvMultiple = totalCost > 0 ? revenue / totalCost : 0;
  const profitPerPlotSqft = inp.plotSize > 0 ? profit / inp.plotSize : 0;
  const equivPricePerGFA = inp.sellingPricePerNSA * (inp.efficiency / 100);
  const rlv = revenue * (1 - RLV_TARGET_MARGIN / 100) - constructionCost;
  return { gfa, nsa, landCost, constructionCost, totalCost, revenue, profit, profitMargin, returnOnCost, gdvMultiple, profitPerPlotSqft, equivPricePerGFA, rlv };
}

function computeOffer(inp: Inputs, offer: OfferSim) {
  const gfa = inp.plotSize * inp.gfaRatio;
  const offerLandCost = offer.method === "per-gfa"
    ? gfa * offer.pricePerGFA
    : inp.plotSize * offer.pricePerPlotSqft;
  const constructionCost = gfa * inp.constructionCostPerGFA * (1 + inp.softCostPct / 100);
  const newTotalCost = offerLandCost + constructionCost;
  const revenue = gfa * (inp.efficiency / 100) * inp.sellingPricePerNSA;
  const newProfit = revenue - newTotalCost;
  const newMargin = revenue > 0 ? (newProfit / revenue) * 100 : 0;
  return { offerLandCost, constructionCost, newTotalCost, newProfit, newMargin };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtM(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

function fmtAED(n: number): string {
  return `AED ${fmtM(n)}`;
}

function getDealLabel(margin: number): { label: string; bg: string; text: string } {
  if (margin < 15) return { label: "Weak Deal",            bg: "bg-red-50",    text: "text-red-600" };
  if (margin < 20) return { label: "Acceptable",           bg: "bg-amber-50",  text: "text-amber-600" };
  if (margin < 25) return { label: "Good Deal",            bg: "bg-blue-50",   text: "text-blue-700" };
  if (margin < 30) return { label: "Strong Deal",          bg: "bg-mint-bg",   text: "text-forest" };
  return              { label: "Exceptional Opportunity", bg: "bg-forest/10", text: "text-forest" };
}

// ── Page ──────────────────────────────────────────────────────────────────────

function deriveInputsFromPlot(plot: Plot, base: Inputs): Inputs {
  const derivedFAR = plot.far ?? (plot.gfa ? plot.gfa / plot.plotArea : base.gfaRatio);
  const derivedPricePerGFA = plot.gfa
    ? plot.askingPrice / plot.gfa
    : plot.askingPrice / (plot.plotArea * derivedFAR);
  return {
    ...base,
    plotSize: plot.plotArea,
    pricingMethod: "per-plot",
    pricePerPlotSqft: plot.pricePerSqFt,
    pricePerGFA: Math.round(derivedPricePerGFA),
    gfaRatio: parseFloat(derivedFAR.toFixed(2)),
  };
}

function loadInitialROIState() {
  if (typeof window === "undefined") return { inputs: BASE_INPUTS, offer: { method: "per-gfa" as PricingMethod, pricePerGFA: 200, pricePerPlotSqft: 400 }, sourcePlot: null as Plot | null, comparePlots: [] as Plot[] };
  let inputs = BASE_INPUTS;
  let offer: OfferSim = { method: "per-gfa", pricePerGFA: 200, pricePerPlotSqft: 400 };
  let sourcePlot: Plot | null = null;
  let comparePlots: Plot[] = [];
  try {
    const cStored = sessionStorage.getItem("compare_plots");
    if (cStored) { const cp: Plot[] = JSON.parse(cStored); if (cp.length === 2) comparePlots = cp; }
  } catch { /* ignore */ }
  try {
    const stored = sessionStorage.getItem("selected_plot");
    if (stored) {
      const plot: Plot = JSON.parse(stored);
      sourcePlot = plot;
      inputs = deriveInputsFromPlot(plot, BASE_INPUTS);
      const derivedPricePerGFA = plot.gfa
        ? plot.askingPrice / plot.gfa
        : plot.askingPrice / (plot.plotArea * (plot.far ?? BASE_INPUTS.gfaRatio));
      offer = { method: "per-gfa", pricePerGFA: Math.round(derivedPricePerGFA * 0.8), pricePerPlotSqft: Math.round(plot.pricePerSqFt * 0.8) };
    }
  } catch { /* ignore */ }
  return { inputs, offer, sourcePlot, comparePlots };
}

export default function ROIPage() {
  const router = useRouter();
  const [inputs, setInputs] = useState<Inputs>(() => loadInitialROIState().inputs);
  const [activeScenario, setActiveScenario] = useState<Scenario>("base");
  const [offer, setOffer] = useState<OfferSim>(() => loadInitialROIState().offer);
  const [sourcePlot, setSourcePlot] = useState<Plot | null>(() => loadInitialROIState().sourcePlot);
  const [comparePlots, setComparePlots] = useState<Plot[]>(() => loadInitialROIState().comparePlots);
  const [phase, setPhase] = useState<Phase>(1);
  const [showPlotPicker, setShowPlotPicker] = useState(false);

  const isCompareMode = comparePlots.length === 2;

  // Compute results for primary inputs
  const results = useMemo(() => compute(inputs), [inputs]);
  const offerResults = useMemo(() => computeOffer(inputs, offer), [inputs, offer]);
  const dealLabel = getDealLabel(results.profitMargin);

  // Compute results for second plot (comparison mode)
  const inputs2 = useMemo(() => {
    if (!isCompareMode) return null;
    // Apply same scenario overrides but with second plot's land data
    const base = { ...BASE_INPUTS, ...SCENARIO_OVERRIDES[activeScenario] };
    return deriveInputsFromPlot(comparePlots[1], base);
  }, [isCompareMode, comparePlots, activeScenario]);

  const results2 = useMemo(() => inputs2 ? compute(inputs2) : null, [inputs2]);
  const dealLabel2 = results2 ? getDealLabel(results2.profitMargin) : null;

  const sensitivityData = useMemo(() =>
    SENSITIVITY_PRICES.map(price => ({ price, ...compute({ ...inputs, sellingPricePerNSA: price }) })),
    [inputs]
  );
  const closestSensPrice = SENSITIVITY_PRICES.reduce((c, p) =>
    Math.abs(p - inputs.sellingPricePerNSA) < Math.abs(c - inputs.sellingPricePerNSA) ? p : c,
    SENSITIVITY_PRICES[0]
  );
  const maxAbsProfit = Math.max(...sensitivityData.map(d => Math.abs(d.profit)), 1);

  function update<K extends keyof Inputs>(key: K, value: Inputs[K]) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  function applyScenario(s: Scenario) {
    setActiveScenario(s);
    setInputs(prev => ({ ...prev, ...SCENARIO_OVERRIDES[s] }));
    // In compare mode, inputs2 is re-derived automatically via useMemo
  }

  const sliderVal = Math.min(Math.max(inputs.sellingPricePerNSA, SLIDER_MIN), SLIDER_MAX);

  return (
    <div className="flex flex-col flex-1 gap-5 min-h-0 overflow-y-auto animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-forest font-heading">ROI Simulator</h1>
            {isCompareMode ? (
              <>
                {comparePlots.map((cp, ci) => (
                  <span key={cp.id} className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border ${ci === 0 ? "text-forest bg-forest/10 border-forest/20" : "text-blue-700 bg-blue-50 border-blue-200"}`}>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {cp.name}
                  </span>
                ))}
                <button
                  onClick={() => { setComparePlots([]); sessionStorage.removeItem("compare_plots"); }}
                  className="text-xs text-muted hover:text-forest ml-1"
                  aria-label="Clear comparison"
                >×</button>
              </>
            ) : sourcePlot && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-forest bg-forest/10 border border-forest/20 px-3 py-1.5 rounded-full">
                <button
                  onClick={() => router.push("/master-plan")}
                  className="flex items-center gap-1.5 hover:underline"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {sourcePlot.name}
                </button>
                <button
                  onClick={() => { setSourcePlot(null); setInputs(BASE_INPUTS); sessionStorage.removeItem("selected_plot"); }}
                  className="ml-0.5 text-forest/60 hover:text-forest"
                  aria-label="Clear plot"
                >×</button>
              </span>
            )}
          </div>
          <p className="text-sm text-muted mt-1">
            {isCompareMode
              ? `Comparing ${comparePlots[0].name} vs ${comparePlots[1].name} — same scenario, side-by-side results.`
              : sourcePlot
                ? `Modelling ${sourcePlot.area} — choose a scenario, then fine-tune if needed.`
                : "Choose a scenario to start, adjust variables if needed, then review your returns."}
          </p>
        </div>

        {/* Phase stepper */}
        <div className="flex items-center gap-1.5">
          {([1, 2, 3] as Phase[]).map(p => (
            <button
              key={p}
              onClick={() => setPhase(p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                phase === p
                  ? "bg-forest text-white shadow-sm"
                  : phase > p ? "bg-mint-bg text-forest" : "text-muted hover:text-forest"
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                phase === p ? "bg-white/20" : phase > p ? "bg-forest/10" : "bg-mint-light/50"
              }`}>{p}</span>
              {p === 1 ? "Scenario" : p === 2 ? "Variables" : "Results"}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 1 — Scenario Selection                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {phase === 1 && (
        <div className="flex flex-col gap-5 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            {(["conservative", "base", "optimistic"] as Scenario[]).map((s) => {
              const meta = SCENARIO_META[s];
              const isActive = activeScenario === s;
              return (
                <button
                  key={s}
                  onClick={() => applyScenario(s)}
                  className={`text-left rounded-2xl border-2 p-7 transition-all flex flex-col ${
                    isActive
                      ? "border-forest bg-mint-bg/50 shadow-sm"
                      : "border-mint-light/40 bg-white hover:border-forest/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className={`text-lg font-bold font-heading ${isActive ? "text-forest" : "text-deep-forest"}`}>
                      {meta.label}
                    </p>
                    {isActive && (
                      <span className="w-6 h-6 rounded-full bg-forest flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted leading-relaxed mb-5">{meta.description}</p>

                  {/* Key Assumptions */}
                  <div className="rounded-xl bg-mint-bg/40 border border-mint-light/40 px-4 py-3 mb-5">
                    <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-2.5">Key Assumptions</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted">Exit Price / NSA</span>
                        <span className="text-sm font-semibold text-deep-forest">AED {formatNumber(SCENARIO_OVERRIDES[s].sellingPricePerNSA ?? BASE_INPUTS.sellingPricePerNSA)}/sqft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted">Construction Cost</span>
                        <span className="text-sm font-semibold text-deep-forest">AED {formatNumber(SCENARIO_OVERRIDES[s].constructionCostPerGFA ?? BASE_INPUTS.constructionCostPerGFA)}/sqft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted">Efficiency</span>
                        <span className="text-sm font-semibold text-deep-forest">{SCENARIO_OVERRIDES[s].efficiency ?? BASE_INPUTS.efficiency}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Scenario Profile */}
                  <div className="space-y-4 border-t border-mint-light/60 pt-4 mt-auto">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-wider text-muted font-semibold">Risk Profile</p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.riskColor}`}>{meta.riskLevel}</span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Suited For</p>
                      <p className="text-sm text-deep-forest leading-relaxed">{meta.suitedFor}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">Market Outlook</p>
                      <p className="text-sm text-deep-forest leading-relaxed">{meta.marketOutlook}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end shrink-0">
            <button
              onClick={() => setPhase(2)}
              className="flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-xl font-semibold text-base hover:bg-deep-forest transition-colors"
            >
              Continue
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 2 — Fine-tune Variables                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {phase === 2 && (
        <div className="flex flex-col gap-5 flex-1">
          {/* Active scenario reminder */}
          <div className="flex items-center justify-between bg-mint-bg/50 rounded-xl px-5 py-3 border border-mint-light/40 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Active scenario:</span>
              <span className="text-sm font-bold text-forest">{SCENARIO_META[activeScenario].label}</span>
            </div>
            <button onClick={() => setPhase(1)} className="text-sm text-forest font-medium hover:underline">Change scenario</button>
          </div>

          {/* Input variables — full width, 2-column grid */}
          <ContentCard className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <Section title="Land">
                <NumInput label="Plot Size" value={inputs.plotSize} unit="sqft" suffix onChange={v => update("plotSize", v)} />
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted">Pricing Method</span>
                  <TogglePair
                    optA={{ key: "per-plot", label: "/ Plot sqft" }}
                    optB={{ key: "per-gfa",  label: "/ GFA" }}
                    value={inputs.pricingMethod}
                    onChange={v => update("pricingMethod", v as PricingMethod)}
                  />
                </div>
                {inputs.pricingMethod === "per-plot"
                  ? <NumInput label="Price / Plot sqft" value={inputs.pricePerPlotSqft} unit="AED" prefix onChange={v => update("pricePerPlotSqft", v)} />
                  : <NumInput label="Price / GFA sqft"  value={inputs.pricePerGFA}       unit="AED" prefix onChange={v => update("pricePerGFA", v)} />
                }
                <ComputedRow label="Total Land Cost" value={fmtAED(results.landCost)} />
              </Section>

              <Section title="Development">
                <NumInput label="GFA Ratio (FAR)" value={inputs.gfaRatio} unit="×" suffix onChange={v => update("gfaRatio", v)} />
                <ComputedRow label="GFA" value={`${formatNumber(Math.round(results.gfa))} sqft`} />
                <NumInput label="Efficiency (NSA/GFA)" value={inputs.efficiency} unit="%" suffix onChange={v => update("efficiency", v)} />
                <ComputedRow label="NSA" value={`${formatNumber(Math.round(results.nsa))} sqft`} />
              </Section>

              <Section title="Construction">
                <NumInput label="Cost / GFA sqft" value={inputs.constructionCostPerGFA} unit="AED" prefix onChange={v => update("constructionCostPerGFA", v)} />
                <NumInput label="Soft Cost" value={inputs.softCostPct} unit="%" suffix onChange={v => update("softCostPct", v)} />
                <ComputedRow label="Total Construction" value={fmtAED(results.constructionCost)} />
              </Section>

              <Section title="Sales">
                <NumInput label="Selling Price / NSA" value={inputs.sellingPricePerNSA} unit="AED" prefix onChange={v => update("sellingPricePerNSA", v)} />
                <div className="py-2">
                  <div className="flex justify-between text-xs text-muted mb-1.5">
                    <span>AED {formatNumber(SLIDER_MIN)}</span>
                    <span className="font-medium text-forest">AED {formatNumber(sliderVal)}</span>
                    <span>AED {formatNumber(SLIDER_MAX)}</span>
                  </div>
                  <input
                    type="range" min={SLIDER_MIN} max={SLIDER_MAX} step={100}
                    value={sliderVal}
                    onChange={e => update("sellingPricePerNSA", Number(e.target.value))}
                    className="w-full accent-forest cursor-pointer"
                  />
                </div>
                <ComputedRow label="Equiv. Price / GFA" value={`AED ${formatNumber(Math.round(results.equivPricePerGFA))}`} />
              </Section>
            </div>
          </ContentCard>

          {/* Navigation */}
          <div className="flex justify-between gap-3 shrink-0">
            <button
              onClick={() => setPhase(1)}
              className="flex items-center gap-2 px-5 py-3 border border-forest text-forest rounded-xl font-semibold text-sm hover:bg-mint-bg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
              Change Scenario
            </button>
            <button
              onClick={() => setPhase(3)}
              className="flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-xl font-semibold text-base hover:bg-deep-forest transition-colors"
            >
              View Results
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 3 — Results                                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {phase === 3 && !isCompareMode && (
        <div className="flex flex-col gap-5 flex-1">

          {/* KPI Row — Profit & Margin are visually emphasized */}
          <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr_1.3fr] gap-4 shrink-0">
            <KPICard
              label="Total Revenue (GDV)"
              value={fmtAED(results.revenue)}
              sub={`${formatNumber(Math.round(results.nsa))} sqft NSA`}
              tooltipFormula="Revenue = Plot × FAR × Efficiency × Price/sqft"
              tooltipLines={[
                `Plot Size: ${formatNumber(inputs.plotSize)} sqft`,
                `× FAR: ${inputs.gfaRatio}`,
                `= GFA: ${formatNumber(Math.round(results.gfa))} sqft`,
                `× Efficiency: ${inputs.efficiency}%`,
                `= NSA: ${formatNumber(Math.round(results.nsa))} sqft`,
                `× Selling Price: AED ${formatNumber(inputs.sellingPricePerNSA)}/sqft`,
                "---",
                `= Revenue: ${fmtAED(results.revenue)}`,
              ]}
            />
            <KPICard
              label="Total Cost"
              value={fmtAED(results.totalCost)}
              sub="Land + Construction"
              tooltipFormula="Total Cost = Land Cost + Construction Cost"
              tooltipLines={[
                inputs.pricingMethod === "per-plot"
                  ? `Land: ${formatNumber(inputs.plotSize)} sqft × AED ${formatNumber(inputs.pricePerPlotSqft)}/sqft`
                  : `Land: ${formatNumber(Math.round(results.gfa))} GFA × AED ${formatNumber(inputs.pricePerGFA)}/sqft`,
                `= Land Cost: ${fmtAED(results.landCost)}`,
                "---",
                `Construction: ${formatNumber(Math.round(results.gfa))} GFA × AED ${formatNumber(inputs.constructionCostPerGFA)}`,
                `× (1 + ${inputs.softCostPct}% soft cost)`,
                `= Construction Cost: ${fmtAED(results.constructionCost)}`,
                "---",
                `= ${fmtAED(results.landCost)} + ${fmtAED(results.constructionCost)}`,
                `= Total Cost: ${fmtAED(results.totalCost)}`,
              ]}
            />
            <KPICard
              label="Total Profit"
              value={fmtAED(results.profit)}
              sub={`${results.returnOnCost.toFixed(1)}% ROC`}
              primary
              tooltipFormula="Profit = Revenue − Total Cost"
              tooltipLines={[
                `Revenue: ${fmtAED(results.revenue)}`,
                `− Total Cost: ${fmtAED(results.totalCost)}`,
                "---",
                `= Profit: ${fmtAED(results.profit)}`,
              ]}
            />
            <KPICard
              label="Profit Margin"
              value={`${results.profitMargin.toFixed(1)}%`}
              badge={dealLabel}
              primary
              tooltipFormula="Margin = (Profit ÷ Revenue) × 100"
              tooltipLines={[
                `Profit: ${fmtAED(results.profit)}`,
                `÷ Revenue: ${fmtAED(results.revenue)}`,
                `× 100`,
                "---",
                `= Margin: ${results.profitMargin.toFixed(1)}%`,
              ]}
            />
          </div>

          {/* Details row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">

            {/* Investor Metrics */}
            <ContentCard className="flex flex-col">
              <p className="text-xs uppercase tracking-widest text-muted mb-3 font-semibold">Investor Metrics</p>
              <div className="divide-y divide-mint-light/60 flex-1">
                <MetricRow label="Return on Cost"      value={`${results.returnOnCost.toFixed(1)}%`} />
                <MetricRow label="GDV Multiple"         value={`${results.gdvMultiple.toFixed(2)}×`} />
                <MetricRow label="Profit / Land sqft"   value={`AED ${formatNumber(Math.round(results.profitPerPlotSqft))}`} />
                <MetricRow label="Land Cost"            value={fmtAED(results.landCost)} />
                <MetricRow label="Construction Cost"    value={fmtAED(results.constructionCost)} />
                <MetricRow label="Residual Land Value"  value={fmtAED(results.rlv)} sub="at 20% margin target" highlight={results.rlv > 0} />
              </div>
            </ContentCard>

            {/* Sensitivity chart */}
            <ContentCard className="flex flex-col">
              <p className="text-xs uppercase tracking-widest text-muted mb-4 font-semibold">Profit vs. Exit Price</p>
              <div className="flex items-end gap-3 flex-1 min-h-[120px]">
                {sensitivityData.map(d => {
                  const ratio = d.profit >= 0 ? d.profit / maxAbsProfit : 0;
                  const isCurrent = d.price === closestSensPrice;
                  return (
                    <div key={d.price} className="flex flex-col items-center flex-1 h-full">
                      <div className="flex-1 flex items-end w-full">
                        <div
                          className={`w-full rounded-t transition-all ${isCurrent ? "bg-forest" : "bg-forest/25"}`}
                          style={{ height: `${Math.max(ratio * 100, 3)}%` }}
                        />
                      </div>
                      <p className={`text-xs mt-2 font-medium ${isCurrent ? "text-forest" : "text-muted"}`}>
                        {(d.price / 1000).toFixed(1)}K
                      </p>
                      <p className={`text-xs ${isCurrent ? "text-forest font-semibold" : "text-muted"}`}>
                        {fmtAED(d.profit)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted mt-3 text-center">AED per sqft NSA</p>
            </ContentCard>

            {/* Offer Simulator */}
            <ContentCard className="flex flex-col">
              <p className="text-xs uppercase tracking-widest text-muted mb-1 font-semibold">Offer Simulator</p>
              <p className="text-sm text-muted mb-4">Test a land offer to see profit impact.</p>

              <TogglePair
                optA={{ key: "per-gfa",  label: "Price / GFA" }}
                optB={{ key: "per-plot", label: "Price / Plot sqft" }}
                value={offer.method}
                onChange={v => setOffer(o => ({ ...o, method: v as PricingMethod }))}
                fullWidth
              />

              <div className="mt-3">
                {offer.method === "per-gfa"
                  ? <NumInput label="Offer Price / GFA"      value={offer.pricePerGFA}       unit="AED" prefix onChange={v => setOffer(o => ({ ...o, pricePerGFA: v }))} />
                  : <NumInput label="Offer Price / Plot sqft" value={offer.pricePerPlotSqft} unit="AED" prefix onChange={v => setOffer(o => ({ ...o, pricePerPlotSqft: v }))} />
                }
              </div>

              <div className="mt-2 divide-y divide-mint-light/60 flex-1">
                <MetricRow label="Offer Land Cost" value={fmtAED(offerResults.offerLandCost)} />
                <MetricRow label="New Total Cost"  value={fmtAED(offerResults.newTotalCost)} />
                <MetricRow label="New Profit"      value={fmtAED(offerResults.newProfit)} highlight={offerResults.newProfit > 0} />
                <div className="flex items-center justify-between py-3">
                  <p className="text-sm text-muted">New Profit Margin</p>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-deep-forest">{offerResults.newMargin.toFixed(1)}%</p>
                    {(() => {
                      const dl = getDealLabel(offerResults.newMargin);
                      return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dl.bg} ${dl.text}`}>{dl.label}</span>;
                    })()}
                  </div>
                </div>
              </div>
            </ContentCard>
          </div>

          {/* Navigation */}
          <div className="flex justify-between shrink-0 relative">
            <button
              onClick={() => setPhase(2)}
              className="flex items-center gap-2 px-5 py-3 border border-forest text-forest rounded-xl font-semibold text-sm hover:bg-mint-bg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
              Adjust Variables
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowPlotPicker(v => !v)}
                  className="flex items-center gap-2 px-5 py-3 border border-forest/30 text-forest rounded-xl font-medium text-sm hover:bg-mint-bg transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                  Compare Plots
                </button>
                {showPlotPicker && (
                  <div className="absolute bottom-full right-0 mb-2 z-50 bg-white border border-mint-light rounded-2xl shadow-lg p-4 min-w-[260px]">
                    <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-3">Select a plot to compare</p>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {plots.filter(p => p.id !== sourcePlot?.id).map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            const plotA = sourcePlot ?? plots[0];
                            const both = [plotA, p];
                            setComparePlots(both);
                            sessionStorage.setItem("compare_plots", JSON.stringify(both));
                            setShowPlotPicker(false);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-mint-bg transition-colors border border-transparent hover:border-mint-light/60"
                        >
                          <p className="text-sm font-semibold text-forest">{p.name}</p>
                          <p className="text-xs text-muted mt-0.5">{p.area} · AED {formatNumber(p.askingPrice)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  sessionStorage.setItem("roi_results", JSON.stringify({ inputs, results, activeScenario }));
                  router.push("/offer");
                }}
                className="flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-xl font-semibold text-base hover:bg-deep-forest transition-colors"
              >
                Proceed to Offer
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PHASE 3 — Comparison Results (side-by-side)                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {phase === 3 && isCompareMode && results2 && inputs2 && (
        <div className="flex flex-col gap-5 flex-1">

          {/* Color legend bar */}
          <div className="flex items-center justify-center gap-6 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-forest" />
              <span className="text-sm font-semibold text-forest">{comparePlots[0].name}</span>
              <span className="text-xs text-muted">{comparePlots[0].area}</span>
            </div>
            <span className="text-muted text-xs">vs</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-700" />
              <span className="text-sm font-semibold text-blue-700">{comparePlots[1].name}</span>
              <span className="text-xs text-muted">{comparePlots[1].area}</span>
            </div>
          </div>

          {/* Unified KPI Row — centered titles, two color-coded values per card */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            <KPICard
              label="Total Revenue (GDV)"
              value=""
              compareValues={{
                v1: fmtAED(results.revenue),
                v2: fmtAED(results2.revenue),
                label1: comparePlots[0].name,
                label2: comparePlots[1].name,
              }}
            />
            <KPICard
              label="Total Cost"
              value=""
              compareValues={{
                v1: fmtAED(results.totalCost),
                v2: fmtAED(results2.totalCost),
                label1: comparePlots[0].name,
                label2: comparePlots[1].name,
              }}
            />
            <KPICard
              label="Total Profit"
              value=""
              primary
              compareValues={{
                v1: fmtAED(results.profit),
                v2: fmtAED(results2.profit),
                label1: comparePlots[0].name,
                label2: comparePlots[1].name,
              }}
            />
            <KPICard
              label="Profit Margin"
              value=""
              primary
              compareValues={{
                v1: `${results.profitMargin.toFixed(1)}%`,
                v2: `${results2.profitMargin.toFixed(1)}%`,
                label1: comparePlots[0].name,
                label2: comparePlots[1].name,
                badge1: dealLabel,
                badge2: dealLabel2!,
              }}
            />
          </div>

          {/* Detailed comparison table */}
          <ContentCard className="flex-1 min-h-0 overflow-y-auto">
            <p className="text-xs uppercase tracking-widest text-muted mb-4 font-semibold">Detailed Comparison</p>
            <div className="grid gap-0" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              {/* Header */}
              <div className="py-2 text-xs font-semibold text-muted">Metric</div>
              <div className="py-2 text-xs font-semibold text-forest text-right">{comparePlots[0].name}</div>
              <div className="py-2 text-xs font-semibold text-blue-700 text-right">{comparePlots[1].name}</div>

              {[
                { label: "Plot Area", v1: `${formatNumber(inputs.plotSize)} sqft`, v2: `${formatNumber(inputs2.plotSize)} sqft`, section: "Land" },
                { label: "Land Cost", v1: fmtAED(results.landCost), v2: fmtAED(results2.landCost) },
                { label: "Price / sqft", v1: `AED ${formatNumber(inputs.pricePerPlotSqft)}`, v2: `AED ${formatNumber(inputs2.pricePerPlotSqft)}` },
                { label: "GFA", v1: `${formatNumber(Math.round(results.gfa))} sqft`, v2: `${formatNumber(Math.round(results2.gfa))} sqft`, section: "Development" },
                { label: "NSA", v1: `${formatNumber(Math.round(results.nsa))} sqft`, v2: `${formatNumber(Math.round(results2.nsa))} sqft` },
                { label: "FAR", v1: inputs.gfaRatio.toString(), v2: inputs2.gfaRatio.toString() },
                { label: "Construction Cost", v1: fmtAED(results.constructionCost), v2: fmtAED(results2.constructionCost), section: "Costs" },
                { label: "Total Cost", v1: fmtAED(results.totalCost), v2: fmtAED(results2.totalCost) },
                { label: "Revenue (GDV)", v1: fmtAED(results.revenue), v2: fmtAED(results2.revenue), section: "Returns" },
                { label: "Profit", v1: fmtAED(results.profit), v2: fmtAED(results2.profit), highlight: true },
                { label: "Profit Margin", v1: `${results.profitMargin.toFixed(1)}%`, v2: `${results2.profitMargin.toFixed(1)}%`, highlight: true },
                { label: "Return on Cost", v1: `${results.returnOnCost.toFixed(1)}%`, v2: `${results2.returnOnCost.toFixed(1)}%` },
                { label: "GDV Multiple", v1: `${results.gdvMultiple.toFixed(2)}×`, v2: `${results2.gdvMultiple.toFixed(2)}×` },
                { label: "Profit / Land sqft", v1: `AED ${formatNumber(Math.round(results.profitPerPlotSqft))}`, v2: `AED ${formatNumber(Math.round(results2.profitPerPlotSqft))}` },
                { label: "Residual Land Value", v1: fmtAED(results.rlv), v2: fmtAED(results2.rlv) },
              ].map((row, ri) => (
                <React.Fragment key={row.label}>
                  {row.section && (
                    <div className={`col-span-3 text-[10px] uppercase tracking-widest text-muted font-semibold ${ri > 0 ? "mt-3 pt-3 border-t border-mint-light/40" : ""} pb-1.5`}>
                      {row.section}
                    </div>
                  )}
                  <div className={`py-2 text-sm ${row.highlight ? "font-semibold text-deep-forest" : "text-muted"}`}>{row.label}</div>
                  <div className={`py-2 text-sm text-right ${row.highlight ? "font-bold text-forest" : "font-semibold text-deep-forest"}`}>{row.v1}</div>
                  <div className={`py-2 text-sm text-right ${row.highlight ? "font-bold text-blue-700" : "font-semibold text-deep-forest"}`}>{row.v2}</div>
                </React.Fragment>
              ))}
            </div>
          </ContentCard>

          {/* Navigation */}
          <div className="flex justify-between shrink-0">
            <button
              onClick={() => setPhase(2)}
              className="flex items-center gap-2 px-5 py-3 border border-forest text-forest rounded-xl font-semibold text-sm hover:bg-mint-bg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
              Adjust Variables
            </button>
            <button
              onClick={() => {
                sessionStorage.setItem("roi_results", JSON.stringify({ inputs, results, activeScenario }));
                router.push("/offer");
              }}
              className="flex items-center gap-2 px-10 py-3 bg-forest text-white rounded-xl font-semibold text-base hover:bg-deep-forest transition-colors"
            >
              Submit Offer
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function KPICard({
  label, value, sub, highlight, primary, badge, tooltipFormula, tooltipLines,
  compareValues,
}: {
  label: string; value: string; sub?: string; highlight?: boolean; primary?: boolean;
  badge?: { label: string; bg: string; text: string };
  tooltipFormula?: string;
  tooltipLines?: string[];
  compareValues?: { v1: string; v2: string; label1: string; label2: string; badge1?: { label: string; bg: string; text: string }; badge2?: { label: string; bg: string; text: string } };
}) {
  const [show, setShow] = useState(false);
  const cardBg = primary
    ? "bg-forest/10 border-forest/25 ring-1 ring-forest/10"
    : highlight ? "bg-mint-bg border-mint-light" : "";
  return (
    <div
      className="relative"
      onMouseEnter={() => (tooltipLines || tooltipFormula) && setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <ContentCard className={`${cardBg} py-5 px-5`}>
        <p className="text-xs uppercase tracking-widest text-muted mb-2 font-semibold text-center">{label}</p>
        {compareValues ? (
          <div className="flex items-start gap-3">
            <div className="flex-1 text-center">
              <p className="text-[10px] font-medium text-forest mb-1">{compareValues.label1}</p>
              <p className={`${primary ? "text-2xl" : "text-xl"} font-bold font-heading leading-tight text-forest`}>{compareValues.v1}</p>
              {compareValues.badge1 && (
                <span className={`mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${compareValues.badge1.bg} ${compareValues.badge1.text}`}>
                  {compareValues.badge1.label}
                </span>
              )}
            </div>
            <div className="w-px self-stretch bg-mint-light/60" />
            <div className="flex-1 text-center">
              <p className="text-[10px] font-medium text-blue-700 mb-1">{compareValues.label2}</p>
              <p className={`${primary ? "text-2xl" : "text-xl"} font-bold font-heading leading-tight text-blue-700`}>{compareValues.v2}</p>
              {compareValues.badge2 && (
                <span className={`mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${compareValues.badge2.bg} ${compareValues.badge2.text}`}>
                  {compareValues.badge2.label}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className={`${primary ? "text-3xl" : "text-2xl"} font-bold font-heading leading-tight ${highlight || primary ? "text-forest" : "text-deep-forest"}`}>{value}</p>
            {sub && <p className="text-sm text-muted mt-1">{sub}</p>}
            {badge && (
              <span className={`mt-2 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
            )}
          </div>
        )}
      </ContentCard>
      {(tooltipLines || tooltipFormula) && show && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-deep-forest text-white rounded-xl shadow-lg px-5 py-4 min-w-[300px] pointer-events-none">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-deep-forest rotate-45 rounded-sm" />
          {tooltipFormula && (
            <p className="text-sm font-bold text-mint mb-2 tracking-wide font-mono">{tooltipFormula}</p>
          )}
          {tooltipLines?.map((line, i) => {
            const isSeparator = line === "---";
            const isBold = line.startsWith("=");
            if (isSeparator) return <hr key={i} className="border-white/20 my-2" />;
            const display = isBold ? line.slice(1) : line;
            return (
              <p key={i} className={`text-[13px] leading-relaxed ${isBold ? "font-bold text-white mt-1" : "text-white/80"}`}>
                {display}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-1">{title}</p>
      <div className="divide-y divide-mint-light/60">{children}</div>
    </div>
  );
}

function TogglePair({
  optA, optB, value, onChange, fullWidth,
}: {
  optA: { key: string; label: string };
  optB: { key: string; label: string };
  value: string;
  onChange: (v: string) => void;
  fullWidth?: boolean;
}) {
  return (
    <div className={`flex rounded-lg border border-mint-light overflow-hidden text-sm ${fullWidth ? "w-full" : ""}`}>
      {[optA, optB].map((opt, i) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`${fullWidth ? "flex-1" : ""} px-3 py-2 transition-colors ${i > 0 ? "border-l border-mint-light" : ""} ${
            value === opt.key ? "bg-forest text-white" : "text-muted bg-white hover:bg-mint-bg"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function NumInput({
  label, value, unit, prefix, suffix, onChange,
}: {
  label: string; value: number; unit: string; prefix?: boolean; suffix?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <label className="text-sm text-muted">{label}</label>
      <div className="flex items-center border border-mint-light rounded-lg overflow-hidden focus-within:border-forest transition-colors">
        {prefix && <span className="px-2.5 py-1.5 text-sm text-muted bg-mint-bg border-r border-mint-light">{unit}</span>}
        <input
          type="number"
          value={value}
          onChange={e => { const v = Number(e.target.value); if (!isNaN(v)) onChange(v); }}
          className="w-28 px-2.5 py-1.5 text-sm font-semibold text-forest bg-white text-right outline-none"
        />
        {suffix && <span className="px-2.5 py-1.5 text-sm text-muted bg-mint-bg border-l border-mint-light">{unit}</span>}
      </div>
    </div>
  );
}

function ComputedRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 -mx-3 px-3 rounded-lg ${highlight ? "bg-forest/5" : "bg-mint-bg/40"}`}>
      <p className="text-sm text-muted flex items-center gap-1">
        <span className="text-xs text-forest/50">=</span>
        {label}
      </p>
      <p className={`text-sm font-bold ${highlight ? "text-forest" : "text-deep-forest"}`}>{value}</p>
    </div>
  );
}

function MetricRow({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm text-muted">{label}</p>
        {sub && <p className="text-xs text-muted/60">{sub}</p>}
      </div>
      <p className={`text-base font-bold ${highlight ? "text-forest" : "text-deep-forest"}`}>{value}</p>
    </div>
  );
}

