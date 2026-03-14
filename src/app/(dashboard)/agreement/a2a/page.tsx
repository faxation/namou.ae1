"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { plots } from "@/data/mock";

/* ── helpers ── */
function formatDate() {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function getSelectedPlots() {
  try {
    const raw = sessionStorage.getItem("selectedPlots");
    if (raw) {
      const arr = JSON.parse(raw) as string[];
      return arr.map((id) => plots.find((p) => p.id === id)).filter(Boolean) as typeof plots;
    }
  } catch {
    /* ignore */
  }
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
    const newW = rect.width * 2;
    const newH = rect.height * 2;
    c.width = newW;
    c.height = newH;
    ctx.scale(2, 2);
    setupCtx(ctx);
    if (savedImg) {
      ctx.putImageData(savedImg, 0, 0);
    }
  }, [setupCtx]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  useEffect(() => {
    clearRef.current = () => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, c.width, c.height);
      hasStrokes.current = false;
      resize();
      onEnd("");
    };
  }, [resize, onEnd, clearRef]);

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

/* ── Main Page ── */
export default function A2APage() {
  const [sharedPlots, setSharedPlots] = useState<typeof plots>([]);
  const [dateStr, setDateStr] = useState("");
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSharedPlots(getSelectedPlots());
    setDateStr(formatDate());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const [form, setForm] = useState({
    companyName: "",
    address: "",
    tradeLicense: "",
    contactPerson: "",
    phone: "",
    email: "",
    investorName: "",
    investorPhone: "",
    investorEmail: "",
  });
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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center animate-fade-in text-center px-4">
        <div className="w-20 h-20 rounded-full bg-forest/10 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-forest font-heading mb-2">Submission Received</h2>
        <p className="text-sm text-muted max-w-md">
          Your A2A Agreement has been submitted successfully. A Namou representative will review and countersign shortly.
        </p>
        <Link href="/agreement" className="mt-8 px-8 py-3 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-deep-forest transition-colors">
          Back to Agreements
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 animate-fade-in overflow-y-auto">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-6 max-w-3xl mx-auto w-full px-4 py-6 md:px-0">

        {/* Header */}
        <div className="bg-forest rounded-2xl px-5 sm:px-8 py-6 flex items-center gap-4 sm:gap-5">
          <Image src="/logo.png" alt="Namou" width={140} height={46} className="object-contain h-8 sm:h-10 w-auto brightness-0 invert" />
          <div className="w-px h-8 sm:h-10 bg-white/20" />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">A2A Agreement</h1>
            <p className="text-xs sm:text-sm text-white/70" dir="rtl">اتفاقية وسيط إلى وسيط</p>
          </div>
        </div>

        {/* Party A — pre-filled, read-only */}
        <div className="bg-mint-bg/50 border border-mint-light/60 rounded-2xl px-6 py-5">
          <p className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-3">Party A (Namou Properties LLC)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted">Company</p>
              <p className="text-sm font-semibold text-deep-forest">Namou Properties LLC</p>
            </div>
            <div>
              <p className="text-xs text-muted">Trade License</p>
              <p className="text-sm font-semibold text-deep-forest">RAK-XXXX-XXXX</p>
            </div>
            <div>
              <p className="text-xs text-muted">Contact</p>
              <p className="text-sm font-semibold text-deep-forest">info@namou.ae</p>
            </div>
          </div>
        </div>

        {/* Shared Properties Summary */}
        <div className="bg-mint-bg/50 border border-mint-light/60 rounded-2xl px-6 py-5">
          <p className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-3">Shared Properties</p>
          {sharedPlots.length > 0 ? (
            <div className="space-y-3">
              {sharedPlots.map((plot) => (
                <div key={plot.id} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted">Property</p>
                    <p className="text-sm font-semibold text-deep-forest">{plot.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Size</p>
                    <p className="text-sm font-semibold text-deep-forest">{plot.plotArea.toLocaleString()} sqft</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Price</p>
                    <p className="text-sm font-semibold text-deep-forest">AED {plot.askingPrice.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted italic">No properties selected. Please select plots from the Master Plan first.</p>
          )}
        </div>

        {/* Party B Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-mint-light/30 p-6">
          <p className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-5">Party B (Referring Agent)</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name" required error={errors.companyName}>
              <input type="text" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} maxLength={100} className={inputCls(errors.companyName)} placeholder="ABC Real Estate" />
            </Field>
            <Field label="Trade License No." required error={errors.tradeLicense}>
              <input type="text" value={form.tradeLicense} onChange={(e) => set("tradeLicense", e.target.value)} maxLength={30} className={inputCls(errors.tradeLicense)} placeholder="DXB-0000-0000" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address" required error={errors.address}>
                <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} maxLength={200} className={inputCls(errors.address)} placeholder="Business Bay, Dubai, UAE" />
              </Field>
            </div>
            <Field label="Contact Person / Full Name" required error={errors.contactPerson}>
              <input type="text" value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} maxLength={100} className={inputCls(errors.contactPerson)} placeholder="Jane Smith" />
            </Field>
            <Field label="Phone" required error={errors.phone}>
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={20} className={inputCls(errors.phone)} placeholder="+971 50 000 0000" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Email" required error={errors.email}>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={254} className={inputCls(errors.email)} placeholder="agent@company.com" />
              </Field>
            </div>
          </div>
        </div>

        {/* Referred Investor */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-mint-light/30 p-6">
          <p className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-5">Referred Investor</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
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

        {/* Date */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-mint-light/30 p-6">
          <div>
            <p className="text-xs text-muted mb-1">Date</p>
            <p className="text-sm font-medium text-deep-forest bg-mint-bg/40 border border-mint-light/40 rounded-xl px-4 py-2.5 w-fit">{dateStr || "\u00A0"}</p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-deep-forest transition-colors"
        >
          Submit A2A Agreement
        </button>
      </form>
    </div>
  );
}

/* ── Shared UI ── */
function Field({ label, required, error, children }: { label: string; required?: boolean; error?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-deep-forest">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {children}
      {error && <span className="text-[11px] text-red-500">This field is required</span>}
    </label>
  );
}

function inputCls(error?: boolean) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm text-deep-forest placeholder:text-muted/50 outline-none transition-colors ${
    error
      ? "border-red-400 bg-red-50/30 focus:border-red-500"
      : "border-mint-light/60 bg-white focus:border-forest/40 focus:ring-1 focus:ring-forest/10"
  }`;
}
