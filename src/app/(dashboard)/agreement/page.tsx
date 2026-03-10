"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { plots } from "@/data/mock";

/* ── helpers ── */
function formatDate() {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function getSelectedPlot() {
  try {
    const raw = sessionStorage.getItem("selectedPlots");
    if (raw) {
      const arr = JSON.parse(raw) as string[];
      if (arr.length > 0) return plots.find((p) => p.id === arr[0]) ?? null;
    }
  } catch { /* ignore */ }
  return null;
}

function getSelectedPlots() {
  try {
    const raw = sessionStorage.getItem("selectedPlots");
    if (raw) {
      const arr = JSON.parse(raw) as string[];
      return arr.map((id) => plots.find((p) => p.id === id)).filter(Boolean) as typeof plots;
    }
  } catch { /* ignore */ }
  return [];
}

/* ── Signature Pad ── */
function SignaturePad({
  onEnd,
  clearRef,
}: {
  onEnd: (dataUrl: string) => void;
  clearRef: React.MutableRefObject<(() => void) | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStrokes = useRef(false);

  const setupCtx = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#003D2E";
  }, []);

  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let savedImg: ImageData | null = null;
    if (hasStrokes.current) {
      savedImg = ctx.getImageData(0, 0, c.width, c.height);
    }
    const rect = c.getBoundingClientRect();
    c.width = rect.width * 2;
    c.height = rect.height * 2;
    ctx.scale(2, 2);
    setupCtx(ctx);
    if (savedImg) ctx.putImageData(savedImg, 0, 0);
  }, [setupCtx]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  clearRef.current = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, c.width, c.height);
    hasStrokes.current = false;
    resize();
    onEnd("");
  };

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    if ("touches" in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    drawing.current = true;
    hasStrokes.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    drawing.current = false;
    if (canvasRef.current) onEnd(canvasRef.current.toDataURL("image/png"));
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchMove={move}
      onTouchEnd={end}
      className="w-full h-full cursor-crosshair touch-none"
    />
  );
}

/* ── Shared UI ── */
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

/* ══════════════════════════════════════════════════════
   Property Introduction Form (left panel)
   ══════════════════════════════════════════════════════ */
function PropertyIntroductionForm() {
  const [plot, setPlot] = useState<ReturnType<typeof getSelectedPlot>>(null);
  const [dateStr, setDateStr] = useState("");
  useEffect(() => { setPlot(getSelectedPlot()); setDateStr(formatDate()); }, []);

  const [form, setForm] = useState({ fullName: "", mobile: "", email: "", passportId: "", city: "", country: "" });
  const [signature, setSignature] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const clearSig = useRef<(() => void) | null>(null);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  }

  function validate() {
    const errs: Record<string, boolean> = {};
    if (!form.fullName.trim()) errs.fullName = true;
    if (!form.mobile.trim()) errs.mobile = true;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) errs.email = true;
    if (!form.passportId.trim()) errs.passportId = true;
    if (!form.city.trim()) errs.city = true;
    if (!form.country.trim()) errs.country = true;
    if (!signature) errs.signature = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center text-center px-4">
        <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h3 className="text-lg font-bold text-forest mb-1">Submitted</h3>
        <p className="text-xs text-muted max-w-xs">Your Property Introduction Form has been submitted. A specialist will be in touch shortly.</p>
        <button onClick={() => { setSubmitted(false); setForm({ fullName: "", mobile: "", email: "", passportId: "", city: "", country: "" }); setSignature(""); clearSig.current?.(); }} className="mt-4 px-6 py-2 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-deep-forest transition-colors">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 flex-1">
      {/* Header */}
      <div className="bg-forest rounded-xl px-5 py-4 flex items-center justify-between">
        <p className="text-sm font-bold text-white">Property Introduction Form</p>
        <p className="text-sm font-bold text-white/80" dir="rtl">نموذج تعريف العقار</p>
      </div>

      {/* Property Summary */}
      <div className="bg-mint-bg/50 border border-mint-light/60 rounded-xl px-4 py-3">
        <p className="text-[9px] uppercase tracking-widest text-muted font-semibold mb-2">Property Being Introduced</p>
        {plot ? (
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-[10px] text-muted">Property</p><p className="text-xs font-semibold text-deep-forest">{plot.name}</p></div>
            <div><p className="text-[10px] text-muted">Size</p><p className="text-xs font-semibold text-deep-forest">{plot.plotArea.toLocaleString()} sqft</p></div>
            <div><p className="text-[10px] text-muted">Commission</p><p className="text-xs font-semibold text-deep-forest">2%</p></div>
          </div>
        ) : (
          <p className="text-xs text-muted italic">No property selected. Select a plot from Master Plan first.</p>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full Name" required error={errors.fullName}>
          <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} maxLength={100} className={inputCls(errors.fullName)} placeholder="John Doe" />
        </Field>
        <Field label="Mobile Number" required error={errors.mobile}>
          <input type="tel" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} maxLength={20} className={inputCls(errors.mobile)} placeholder="+971 50 000 0000" />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={254} className={inputCls(errors.email)} placeholder="investor@email.com" />
        </Field>
        <Field label="Passport No / ID" required error={errors.passportId}>
          <input type="text" value={form.passportId} onChange={(e) => set("passportId", e.target.value)} maxLength={30} className={inputCls(errors.passportId)} placeholder="A12345678" />
        </Field>
        <Field label="City" required error={errors.city}>
          <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} maxLength={80} className={inputCls(errors.city)} placeholder="Dubai" />
        </Field>
        <Field label="Country" required error={errors.country}>
          <input type="text" value={form.country} onChange={(e) => set("country", e.target.value)} maxLength={80} className={inputCls(errors.country)} placeholder="UAE" />
        </Field>
      </div>

      {/* Signature */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] uppercase tracking-widest text-muted font-semibold">Signature</p>
          <button type="button" onClick={() => clearSig.current?.()} className="text-[10px] text-forest hover:text-deep-forest transition-colors font-medium">Clear</button>
        </div>
        <div className={`w-full h-24 border-2 border-dashed rounded-lg overflow-hidden ${errors.signature ? "border-red-400 bg-red-50/30" : "border-mint-light bg-white"}`}>
          <SignaturePad onEnd={setSignature} clearRef={clearSig} />
        </div>
        {errors.signature && <p className="text-[10px] text-red-500 mt-0.5">Signature is required</p>}
      </div>

      {/* Date + Submit */}
      <div className="flex items-end justify-between mt-auto">
        <div>
          <p className="text-[10px] text-muted mb-1">Date</p>
          <p className="text-xs font-medium text-deep-forest bg-mint-bg/40 border border-mint-light/40 rounded-lg px-3 py-1.5">{dateStr || "\u00A0"}</p>
        </div>
        <button type="submit" className="px-6 py-2.5 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-deep-forest transition-colors">
          Submit
        </button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════
   A2A Agreement Form (right panel)
   ══════════════════════════════════════════════════════ */
function A2AForm() {
  const [sharedPlots, setSharedPlots] = useState<typeof plots>([]);
  const [dateStr, setDateStr] = useState("");
  useEffect(() => { setSharedPlots(getSelectedPlots()); setDateStr(formatDate()); }, []);

  const [form, setForm] = useState({ companyName: "", address: "", tradeLicense: "", contactPerson: "", phone: "", email: "", investorName: "", investorPhone: "", investorEmail: "" });
  const [signature, setSignature] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const clearSig = useRef<(() => void) | null>(null);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  }

  function validate() {
    const errs: Record<string, boolean> = {};
    if (!form.companyName.trim()) errs.companyName = true;
    if (!form.address.trim()) errs.address = true;
    if (!form.tradeLicense.trim()) errs.tradeLicense = true;
    if (!form.contactPerson.trim()) errs.contactPerson = true;
    if (!form.phone.trim()) errs.phone = true;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) errs.email = true;
    if (!form.investorName.trim()) errs.investorName = true;
    if (!form.investorPhone.trim()) errs.investorPhone = true;
    if (!form.investorEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.investorEmail)) errs.investorEmail = true;
    if (!signature) errs.signature = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center text-center px-4">
        <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h3 className="text-lg font-bold text-forest mb-1">Submitted</h3>
        <p className="text-xs text-muted max-w-xs">Your A2A Agreement has been submitted. A representative will review and countersign shortly.</p>
        <button onClick={() => { setSubmitted(false); setForm({ companyName: "", address: "", tradeLicense: "", contactPerson: "", phone: "", email: "", investorName: "", investorPhone: "", investorEmail: "" }); setSignature(""); clearSig.current?.(); }} className="mt-4 px-6 py-2 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-deep-forest transition-colors">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 flex-1">
      {/* Header */}
      <div className="bg-forest rounded-xl px-5 py-4 flex items-center justify-between">
        <p className="text-sm font-bold text-white">A2A Agreement</p>
        <p className="text-sm font-bold text-white/80" dir="rtl">اتفاقية وسيط إلى وسيط</p>
      </div>

      {/* Party A (read-only) */}
      <div className="bg-mint-bg/50 border border-mint-light/60 rounded-xl px-4 py-3">
        <p className="text-[9px] uppercase tracking-widest text-muted font-semibold mb-2">Party A (Namou Properties LLC)</p>
        <div className="grid grid-cols-3 gap-3">
          <div><p className="text-[10px] text-muted">Company</p><p className="text-xs font-semibold text-deep-forest">Namou Properties LLC</p></div>
          <div><p className="text-[10px] text-muted">Trade License</p><p className="text-xs font-semibold text-deep-forest">RAK-XXXX-XXXX</p></div>
          <div><p className="text-[10px] text-muted">Contact</p><p className="text-xs font-semibold text-deep-forest">info@namou.ae</p></div>
        </div>
      </div>

      {/* Shared Properties */}
      <div className="bg-mint-bg/50 border border-mint-light/60 rounded-xl px-4 py-3">
        <p className="text-[9px] uppercase tracking-widest text-muted font-semibold mb-2">Shared Properties</p>
        {sharedPlots.length > 0 ? (
          <div className="space-y-2">
            {sharedPlots.map((plot) => (
              <div key={plot.id} className="grid grid-cols-3 gap-3">
                <div><p className="text-[10px] text-muted">Property</p><p className="text-xs font-semibold text-deep-forest">{plot.name}</p></div>
                <div><p className="text-[10px] text-muted">Size</p><p className="text-xs font-semibold text-deep-forest">{plot.plotArea.toLocaleString()} sqft</p></div>
                <div><p className="text-[10px] text-muted">Price</p><p className="text-xs font-semibold text-deep-forest">AED {plot.askingPrice.toLocaleString()}</p></div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted italic">No properties selected. Select plots from Master Plan first.</p>
        )}
      </div>

      {/* Party B Fields */}
      <div>
        <p className="text-[9px] uppercase tracking-widest text-muted font-semibold mb-2">Party B (Referring Agent)</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company Name" required error={errors.companyName}>
            <input type="text" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} maxLength={100} className={inputCls(errors.companyName)} placeholder="ABC Real Estate" />
          </Field>
          <Field label="Trade License No." required error={errors.tradeLicense}>
            <input type="text" value={form.tradeLicense} onChange={(e) => set("tradeLicense", e.target.value)} maxLength={30} className={inputCls(errors.tradeLicense)} placeholder="DXB-0000-0000" />
          </Field>
          <div className="col-span-2">
            <Field label="Address" required error={errors.address}>
              <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} maxLength={200} className={inputCls(errors.address)} placeholder="Business Bay, Dubai, UAE" />
            </Field>
          </div>
          <Field label="Contact Person" required error={errors.contactPerson}>
            <input type="text" value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} maxLength={100} className={inputCls(errors.contactPerson)} placeholder="Jane Smith" />
          </Field>
          <Field label="Phone" required error={errors.phone}>
            <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={20} className={inputCls(errors.phone)} placeholder="+971 50 000 0000" />
          </Field>
          <div className="col-span-2">
            <Field label="Email" required error={errors.email}>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={254} className={inputCls(errors.email)} placeholder="agent@company.com" />
            </Field>
          </div>
        </div>
      </div>

      {/* Referred Investor */}
      <div>
        <p className="text-[9px] uppercase tracking-widest text-muted font-semibold mb-2">Referred Investor</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Investor Full Name" required error={errors.investorName}>
              <input type="text" value={form.investorName} onChange={(e) => set("investorName", e.target.value)} maxLength={100} className={inputCls(errors.investorName)} placeholder="John Doe" />
            </Field>
          </div>
          <Field label="Investor Phone" required error={errors.investorPhone}>
            <input type="tel" value={form.investorPhone} onChange={(e) => set("investorPhone", e.target.value)} maxLength={20} className={inputCls(errors.investorPhone)} placeholder="+971 55 000 0000" />
          </Field>
          <Field label="Investor Email" required error={errors.investorEmail}>
            <input type="email" value={form.investorEmail} onChange={(e) => set("investorEmail", e.target.value)} maxLength={254} className={inputCls(errors.investorEmail)} placeholder="investor@email.com" />
          </Field>
        </div>
      </div>

      {/* Signature */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] uppercase tracking-widest text-muted font-semibold">Signature (Party B)</p>
          <button type="button" onClick={() => clearSig.current?.()} className="text-[10px] text-forest hover:text-deep-forest transition-colors font-medium">Clear</button>
        </div>
        <div className={`w-full h-24 border-2 border-dashed rounded-lg overflow-hidden ${errors.signature ? "border-red-400 bg-red-50/30" : "border-mint-light bg-white"}`}>
          <SignaturePad onEnd={setSignature} clearRef={clearSig} />
        </div>
        {errors.signature && <p className="text-[10px] text-red-500 mt-0.5">Signature is required</p>}
      </div>

      {/* Date + Submit */}
      <div className="flex items-end justify-between mt-auto">
        <div>
          <p className="text-[10px] text-muted mb-1">Date</p>
          <p className="text-xs font-medium text-deep-forest bg-mint-bg/40 border border-mint-light/40 rounded-lg px-3 py-1.5">{dateStr || "\u00A0"}</p>
        </div>
        <button type="submit" className="px-6 py-2.5 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-deep-forest transition-colors">
          Submit
        </button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════
   Main Agreement Page — two forms side by side
   ══════════════════════════════════════════════════════ */
export default function AgreementPage() {
  return (
    <div className="flex flex-col flex-1 gap-4 animate-fade-in min-h-0">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold text-forest font-heading">Agreement</h1>
        <p className="text-sm text-muted mt-1">Fill in the relevant form below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left — Property Introduction Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-mint-light/30 flex flex-col overflow-y-auto min-h-0">
          <PropertyIntroductionForm />
        </div>

        {/* Right — A2A Agreement */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-mint-light/30 flex flex-col overflow-y-auto min-h-0">
          <A2AForm />
        </div>
      </div>
    </div>
  );
}
