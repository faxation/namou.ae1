"use client";

import { useState, useMemo, useEffect } from "react";
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

/* ── Agreement-style helpers (match /agreement page) ── */

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-deep-forest">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {children}
      {error && <span className="text-[10px] text-red-500">Required</span>}
    </label>
  );
}

function inputCls(error?: boolean) {
  return `w-full px-3 py-2 rounded-lg border text-sm text-deep-forest placeholder:text-muted/50 outline-none transition-colors ${
    error
      ? "border-red-400 bg-red-50/30 focus:border-red-500"
      : "border-mint-light/60 bg-white focus:border-forest/40 focus:ring-1 focus:ring-forest/10"
  }`;
}

/* ── Payment Plan helpers ── */

interface PaymentStage { label: string; pct: number; amount: number; sub?: string }

function parsePaymentStages(text: string, price: number): PaymentStage[] {
  const stages: PaymentStage[] = [];
  const segments = text.split(/\s*\/\s*/);
  let totalPct = 0;
  for (const seg of segments) {
    const parts = seg.split(/\s*—\s*/);
    const m = parts[0].match(/(\d+)%\s*(.*)/);
    if (!m) continue;
    const pct = parseInt(m[1]);
    let label = m[2].trim();
    const yearMatch = label.match(/end of each year\s+([\d,\s&]+)\s*(.*)/i);
    if (yearMatch) {
      const years = yearMatch[1].match(/\d+/g) || [];
      const suffix = yearMatch[2].trim();
      for (const y of years) {
        stages.push({ label: `End of year ${y}${suffix ? ` ${suffix}` : ""}`, pct, amount: Math.round(price * pct / 100) });
        totalPct += pct;
      }
    } else {
      if (label) label = label.charAt(0).toUpperCase() + label.slice(1);
      else label = "Payment";
      stages.push({ label, pct, amount: Math.round(price * pct / 100) });
      totalPct += pct;
    }
    if (parts.length > 1) {
      const tail = parts[1].trim();
      const instMatch = tail.match(/(\d+)\s*instalment/i);
      const remainPct = 100 - totalPct;
      if (instMatch && remainPct > 0) {
        const n = parseInt(instMatch[1]);
        const total = Math.round(price * remainPct / 100);
        stages.push({ label: `Balance (${n} quarterly instalments)`, pct: remainPct, amount: total, sub: `AED ${formatNumber(Math.round(total / n))} per instalment` });
        totalPct += remainPct;
      } else if (/remaining|close/i.test(tail) && 100 - totalPct > 0) {
        const rp = 100 - totalPct;
        stages.push({ label: /within 30 days/i.test(tail) ? "Balance (within 30 days)" : "Balance", pct: rp, amount: Math.round(price * rp / 100) });
        totalPct += rp;
      }
    }
  }
  return stages;
}

/* ── Next Steps Modal ── */

function NextStepsModal({ onClose, plotName, selectedPlots, enableOfferWebhook = false }: { onClose: () => void; plotName: string; selectedPlots: Plot[]; enableOfferWebhook?: boolean }) {
  const [clientType, setClientType] = useState<string | null>(null);
  useEffect(() => {
    try { const raw = sessionStorage.getItem("namou_session"); if (raw) setClientType(JSON.parse(raw).clientType ?? null); } catch { /* ignore */ }
  }, []);

  const isBroker = clientType === "Broker";

  // Property Introduction form state (Developer / Investor / default)
  const [piForm, setPiForm] = useState({ fullName: "", mobile: "", email: "", passportId: "", city: "", country: "" });
  // A2A form state (Broker)
  const [a2aForm, setA2aForm] = useState({ companyName: "", address: "", tradeLicense: "", contactPerson: "", phone: "", email: "", investorName: "", investorPhone: "", investorEmail: "" });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setPi(field: string, value: string) {
    setPiForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  }
  function setA2a(field: string, value: string) {
    setA2aForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validate() {
    const errs: Record<string, boolean> = {};
    if (isBroker) {
      if (!a2aForm.companyName.trim()) errs.companyName = true;
      if (!a2aForm.address.trim()) errs.address = true;
      if (!a2aForm.tradeLicense.trim()) errs.tradeLicense = true;
      if (!a2aForm.contactPerson.trim()) errs.contactPerson = true;
      if (!a2aForm.phone.trim()) errs.phone = true;
      if (!a2aForm.email.trim() || !emailRe.test(a2aForm.email)) errs.email = true;
      if (!a2aForm.investorName.trim()) errs.investorName = true;
      if (!a2aForm.investorPhone.trim()) errs.investorPhone = true;
      if (!a2aForm.investorEmail.trim() || !emailRe.test(a2aForm.investorEmail)) errs.investorEmail = true;
    } else {
      if (!piForm.fullName.trim()) errs.fullName = true;
      if (!piForm.mobile.trim()) errs.mobile = true;
      if (!piForm.email.trim() || !emailRe.test(piForm.email)) errs.email = true;
      if (!piForm.passportId.trim()) errs.passportId = true;
      if (!piForm.city.trim()) errs.city = true;
      if (!piForm.country.trim()) errs.country = true;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (submitting) return; // prevent duplicate submissions

    if (enableOfferWebhook) {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const properties = selectedPlots.length > 0
          ? selectedPlots.map(p => ({
              id: p.id,
              Location: p.area,
              Price: p.askingPrice,
              Type: p.landUse,
              Area_sqft: p.plotArea,
              Ownership: "Free hold",
            }))
          : [{ id: "-", Location: "-", Price: 0, Type: "-", Area_sqft: 0, Ownership: "Free hold" }];

        const payload = isBroker
          ? {
              sourcePage: "/offer",
              sourceAction: "offer-popup-submit",
              agreement_type: "a2a",
              assignee_email: "undefined",
              phone_number: a2aForm.phone || "-",
              src: "webpage",
              data: {
                name: a2aForm.contactPerson || "-",
                email: a2aForm.email || "-",
                broker_number: a2aForm.phone || "-",
                company_name: a2aForm.companyName || "-",
                agent_id_number: "-",
                trade_license: a2aForm.tradeLicense || "-",
                id_number: "-",
                city: "null",
                country: a2aForm.address || "-",
                investor_name: a2aForm.investorName || "-",
                investor_email: a2aForm.investorEmail || "-",
                investor_number: a2aForm.investorPhone || "null",
                properties: properties,
                broker_commision_cut: "2",
              },
            }
          : {
              sourcePage: "/offer",
              sourceAction: "offer-popup-submit",
              agreement_type: "b2a",
              phone_number: piForm.mobile || "-",
              src: "webpage",
              assignee_email: "undefined",
              data: {
                investor_name: piForm.fullName || "-",
                investor_number: piForm.mobile || "null",
                email: piForm.email || "-",
                id_number: piForm.passportId || "-",
                city: piForm.city || "null",
                country: piForm.country || "-",
                properties: properties,
              },
              commission: "2%",
            };

        const res = await fetch("/api/offer/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(body.error || `Request failed (${res.status})`);
        }
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "Submission failed");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    }

    setSubmitted(true);
  }

  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* modal card — matches agreement card style */}
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-mint-light/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* close button */}
        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-mint-bg hover:bg-mint-light/60 flex items-center justify-center transition-colors z-10">
          <svg className="w-3.5 h-3.5 text-deep-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-12">
            <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 className="text-lg font-bold text-forest mb-1">Submitted</h3>
            <p className="text-xs text-muted max-w-xs">
              {isBroker
                ? "Your A2A Agreement has been submitted. A representative will review and countersign shortly."
                : "Your Property Introduction Form has been submitted. A specialist will be in touch shortly."}
            </p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-deep-forest transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`flex flex-col p-5 ${isBroker ? "gap-2.5" : "gap-4"}`}>
            {/* Header */}
            <div className={`bg-forest rounded-xl px-5 flex items-center justify-between ${isBroker ? "py-3" : "py-4"}`}>
              <p className="text-sm font-bold text-white">{isBroker ? "A2A Agreement" : "Property Introduction Form"}</p>
              <p className="text-sm font-bold text-white/80" dir="rtl">{isBroker ? "اتفاقية وسيط إلى وسيط" : "نموذج تعريف العقار"}</p>
            </div>

            {/* Property / context summary — non-broker only; broker merges into Party A card */}
            {!isBroker && (
              <div className="bg-mint-bg/50 border border-mint-light/60 rounded-xl px-4 py-3">
                <p className="text-[9px] uppercase tracking-widest text-muted font-semibold mb-2">Property Being Introduced</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-[10px] text-muted">Plot</p><p className="text-xs font-semibold text-deep-forest">{plotName}</p></div>
                  <div><p className="text-[10px] text-muted">Commission</p><p className="text-xs font-semibold text-deep-forest">2%</p></div>
                </div>
              </div>
            )}

            {/* Fields — conditional on client type */}
            {isBroker ? (
              <>
                {/* Property + Party A (read-only, merged) */}
                <div className="bg-mint-bg/50 border border-mint-light/60 rounded-xl px-4 py-2">
                  <div className="grid grid-cols-4 gap-2">
                    <div><p className="text-[10px] text-muted">Plot</p><p className="text-xs font-semibold text-deep-forest">{plotName}</p></div>
                    <div><p className="text-[10px] text-muted">Company</p><p className="text-xs font-semibold text-deep-forest">Namou Properties LLC</p></div>
                    <div><p className="text-[10px] text-muted">Trade License</p><p className="text-xs font-semibold text-deep-forest">RAK-XXXX-XXXX</p></div>
                    <div><p className="text-[10px] text-muted">Contact</p><p className="text-xs font-semibold text-deep-forest">info@namou.ae</p></div>
                  </div>
                </div>

                {/* Party B */}
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted font-semibold mb-1.5">Party B (Referring Agent)</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field label="Company Name" required error={errors.companyName}>
                      <input type="text" value={a2aForm.companyName} onChange={(e) => setA2a("companyName", e.target.value)} maxLength={100} className={inputCls(errors.companyName)} placeholder="ABC Real Estate" />
                    </Field>
                    <Field label="Trade License No." required error={errors.tradeLicense}>
                      <input type="text" value={a2aForm.tradeLicense} onChange={(e) => setA2a("tradeLicense", e.target.value)} maxLength={30} className={inputCls(errors.tradeLicense)} placeholder="DXB-0000-0000" />
                    </Field>
                    <Field label="Contact Person" required error={errors.contactPerson}>
                      <input type="text" value={a2aForm.contactPerson} onChange={(e) => setA2a("contactPerson", e.target.value)} maxLength={100} className={inputCls(errors.contactPerson)} placeholder="Jane Smith" />
                    </Field>
                    <Field label="Phone" required error={errors.phone}>
                      <input type="tel" value={a2aForm.phone} onChange={(e) => setA2a("phone", e.target.value)} maxLength={20} className={inputCls(errors.phone)} placeholder="+971 50 000 0000" />
                    </Field>
                    <Field label="Address" required error={errors.address}>
                      <input type="text" value={a2aForm.address} onChange={(e) => setA2a("address", e.target.value)} maxLength={200} className={inputCls(errors.address)} placeholder="Business Bay, Dubai, UAE" />
                    </Field>
                    <Field label="Email" required error={errors.email}>
                      <input type="email" value={a2aForm.email} onChange={(e) => setA2a("email", e.target.value)} maxLength={254} className={inputCls(errors.email)} placeholder="agent@company.com" />
                    </Field>
                  </div>
                </div>

                {/* Referred Investor */}
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-muted font-semibold mb-1.5">Referred Investor</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field label="Investor Full Name" required error={errors.investorName}>
                      <input type="text" value={a2aForm.investorName} onChange={(e) => setA2a("investorName", e.target.value)} maxLength={100} className={inputCls(errors.investorName)} placeholder="John Doe" />
                    </Field>
                    <Field label="Investor Phone" required error={errors.investorPhone}>
                      <input type="tel" value={a2aForm.investorPhone} onChange={(e) => setA2a("investorPhone", e.target.value)} maxLength={20} className={inputCls(errors.investorPhone)} placeholder="+971 55 000 0000" />
                    </Field>
                    <Field label="Investor Email" required error={errors.investorEmail}>
                      <input type="email" value={a2aForm.investorEmail} onChange={(e) => setA2a("investorEmail", e.target.value)} maxLength={254} className={inputCls(errors.investorEmail)} placeholder="investor@email.com" />
                    </Field>
                  </div>
                </div>
              </>
            ) : (
              /* Property Introduction fields (Developer / Investor / default) */
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name" required error={errors.fullName}>
                  <input type="text" value={piForm.fullName} onChange={(e) => setPi("fullName", e.target.value)} maxLength={100} className={inputCls(errors.fullName)} placeholder="John Doe" />
                </Field>
                <Field label="Mobile Number" required error={errors.mobile}>
                  <input type="tel" value={piForm.mobile} onChange={(e) => setPi("mobile", e.target.value)} maxLength={20} className={inputCls(errors.mobile)} placeholder="+971 50 000 0000" />
                </Field>
                <Field label="Email" required error={errors.email}>
                  <input type="email" value={piForm.email} onChange={(e) => setPi("email", e.target.value)} maxLength={254} className={inputCls(errors.email)} placeholder="investor@email.com" />
                </Field>
                <Field label="Passport No / ID" required error={errors.passportId}>
                  <input type="text" value={piForm.passportId} onChange={(e) => setPi("passportId", e.target.value)} maxLength={30} className={inputCls(errors.passportId)} placeholder="A12345678" />
                </Field>
                <Field label="City" required error={errors.city}>
                  <input type="text" value={piForm.city} onChange={(e) => setPi("city", e.target.value)} maxLength={80} className={inputCls(errors.city)} placeholder="Dubai" />
                </Field>
                <Field label="Country" required error={errors.country}>
                  <input type="text" value={piForm.country} onChange={(e) => setPi("country", e.target.value)} maxLength={80} className={inputCls(errors.country)} placeholder="UAE" />
                </Field>
              </div>
            )}

            {/* Error message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                {submitError}
              </div>
            )}

            {/* Date + Submit */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-muted mb-1">Date</p>
                <p className="text-xs font-medium text-deep-forest bg-mint-bg/40 border border-mint-light/40 rounded-lg px-3 py-1.5">{dateStr}</p>
              </div>
              <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-deep-forest transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
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
  const [comparePlots] = useState<Plot[]>(() => {
    if (typeof window === "undefined") return [];
    try { const s = sessionStorage.getItem("compare_plots"); if (s) { const cp: Plot[] = JSON.parse(s); if (cp.length === 2) return cp; } } catch { /* ignore */ }
    return [];
  });
  const [submitted, setSubmitted] = useState(false);
  const [dealRef, setDealRef] = useState<string | null>(null);
  const [showNextSteps, setShowNextSteps] = useState(false);

  const selectedPlot = plots.find((p) => p.id === selectedPlotId) || plots[0];
  const selectedPlots = comparePlots.length === 2 ? comparePlots : [selectedPlot];
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

  const paymentStages = useMemo(() => {
    if (!selectedPlot.paymentPlan) return [];
    return parsePaymentStages(selectedPlot.paymentPlan, offerSummary.landCost);
  }, [selectedPlot, offerSummary.landCost]);

  return (
    <div className="flex flex-col flex-1 gap-3 lg:gap-5 animate-fade-in min-h-0 overflow-y-auto md:overflow-y-hidden">
      <div className="shrink-0">
        <h1 className="text-xl lg:text-3xl font-bold text-forest font-heading">Payment Plan</h1>
        <p className="text-sm text-muted mt-1">
          {hasROI
            ? "Review the payment schedule based on your selected plot and ROI variables."
            : "Select a plot and review the payment plan below."}
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

      {/* Payment plan summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <ContentCard className="bg-mint-bg border-mint-light">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Land Price</p>
          <p className="text-2xl font-bold font-heading text-deep-forest">{fmtAED(offerSummary.landCost)}</p>
          <p className="text-xs text-muted mt-1">{formatNumber(selectedPlot.plotArea)} sqft</p>
        </ContentCard>
        <ContentCard className="bg-mint-bg border-mint-light">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Total Dev. Cost</p>
          <p className="text-2xl font-bold font-heading text-deep-forest">{fmtAED(offerSummary.totalCost)}</p>
          <p className="text-xs text-muted mt-1">Land + Construction</p>
        </ContentCard>
        <ContentCard className="bg-forest/10 border-forest/20">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Payment Stages</p>
          <p className="text-2xl font-bold font-heading text-deep-forest">{paymentStages.length}</p>
          <p className="text-xs text-muted mt-1">{selectedPlot.paymentPlan ? "Structured plan" : "No plan"}</p>
        </ContentCard>
        <ContentCard className="bg-forest/10 border-forest/20">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Projected Profit</p>
          <p className={`text-2xl font-bold font-heading ${offerSummary.profit > 0 ? "text-forest" : "text-red-600"}`}>{fmtAED(offerSummary.profit)}</p>
          <p className="text-xs text-muted mt-1">{offerSummary.profitMargin.toFixed(1)}% margin</p>
        </ContentCard>
      </div>

      {/* Cost breakdown + offer details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <ContentCard className={`flex flex-col ${paymentStages.length > 4 ? "p-3 md:p-4" : ""}`}>
          <p className={`text-xs uppercase tracking-widest text-muted font-semibold ${paymentStages.length > 4 ? "mb-2" : "mb-3"}`}>Payment Schedule</p>
          {paymentStages.length > 0 ? (
            <div className="divide-y divide-mint-light/60 flex-1">
              {paymentStages.map((stage, i) => (
                <div key={i} className={`flex items-center justify-between ${paymentStages.length > 4 ? "py-2" : "py-4"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full bg-forest/10 text-forest font-bold flex items-center justify-center shrink-0 ${paymentStages.length > 4 ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-xs"}`}>{i + 1}</span>
                    <p className={`font-bold text-deep-forest ${paymentStages.length > 4 ? "text-base" : "text-lg"}`}>{stage.pct}%</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={`font-bold text-deep-forest ${paymentStages.length > 4 ? "text-sm" : "text-base"}`}>{fmtAED(stage.amount)}</p>
                    <p className={`text-muted ${paymentStages.length > 4 ? "text-[11px]" : "text-xs"}`}>{stage.label}</p>
                    {stage.sub && <p className="text-[11px] text-muted">{stage.sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted italic flex-1 flex items-center">No payment plan available for this plot.</p>
          )}
          <div className={`mt-auto border-t border-mint-light/60 flex justify-between text-sm ${paymentStages.length > 4 ? "pt-2" : "pt-4"}`}>
            <span className="text-muted">Total</span>
            <span className="font-bold text-deep-forest">{fmtAED(offerSummary.landCost)}</span>
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
                  { step: "1", text: "Offer reviewed within 3-5 business days" },
                  { step: "2", text: "Dedicated Offer Manager assigned" },
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
              <button
                onClick={() => setShowNextSteps(true)}
                className="px-6 py-3 bg-white border border-mint-light text-deep-forest rounded-xl font-medium text-sm hover:bg-mint-white transition-colors"
              >
                Next Steps
              </button>
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

      {/* Next Steps modal */}
      {showNextSteps && (
        <NextStepsModal onClose={() => setShowNextSteps(false)} plotName={selectedPlot.name} selectedPlots={selectedPlots} enableOfferWebhook />
      )}
    </div>
  );
}
