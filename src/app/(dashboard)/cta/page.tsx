"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ContentCard from "@/components/ContentCard";

const actions = [
  {
    title: "Schedule a Site Visit",
    description: "Tour Al Marjan Island and meet the development team in person.",
    href: "/site-visit",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    timeline: "2-3 business days to arrange",
    prep: "Valid passport / Emirates ID required",
    details: "Includes helicopter tour, plot walkthrough, and lunch with the project director.",
    hasCalendar: true,
  },
  {
    title: "Book Another Call",
    description: "Continue the conversation with your Namou specialist.",
    href: "#",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    timeline: "Same-day availability",
    prep: "No preparation needed",
    details: "30-min focused session to address questions about pricing, zoning, or legal structure.",
    hasCalendar: true,
  },
  {
    title: "Schedule a Video Meeting",
    description: "Connect remotely to review plots, ROI models, or deal terms.",
    href: "#",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
    timeline: "Next available slot within 24 hours",
    prep: "Stable internet connection recommended",
    details: "Screen-share walkthrough of your customized ROI model with a senior analyst.",
    hasCalendar: true,
  },
  {
    title: "Receive Brochures & ROI Calculations",
    description: "Get detailed property brochures and personalised ROI reports sent to your inbox.",
    href: "#",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22 6 12 13 2 6" />
      </svg>
    ),
    timeline: "Delivered within 1 hour",
    prep: "No preparation needed",
    details: "Receive a curated package with project brochures, plot specifications, and your customised ROI breakdown.",
    hasBrochureForm: true,
  },
];

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CTAPage() {
  const [calendarAction, setCalendarAction] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  /* Brochure form state */
  const [brochureOpen, setBrochureOpen] = useState(false);
  const [brochureForm, setBrochureForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [brochureErrors, setBrochureErrors] = useState<Record<string, boolean>>({});
  const [brochureSubmitted, setBrochureSubmitted] = useState(false);

  function openBrochure() {
    setBrochureForm({ firstName: "", lastName: "", email: "", phone: "" });
    setBrochureErrors({});
    setBrochureSubmitted(false);
    setBrochureOpen(true);
  }
  function closeBrochure() { setBrochureOpen(false); }
  function setBF(field: string, value: string) {
    setBrochureForm((prev) => ({ ...prev, [field]: value }));
    if (brochureErrors[field]) setBrochureErrors((prev) => ({ ...prev, [field]: false }));
  }
  function submitBrochure(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, boolean> = {};
    if (!brochureForm.firstName.trim()) errs.firstName = true;
    if (!brochureForm.lastName.trim()) errs.lastName = true;
    if (!brochureForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(brochureForm.email)) errs.email = true;
    if (!brochureForm.phone.trim()) errs.phone = true;
    setBrochureErrors(errs);
    if (Object.keys(errs).length === 0) setBrochureSubmitted(true);
  }

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewDate]);

  function openCalendar(actionTitle: string) {
    const now = new Date();
    setViewDate(now);
    setSelectedDate(null);
    setSelectedTime(null);
    setConfirmed(false);
    setCalendarAction(actionTitle);
  }

  function closeCalendar() {
    setCalendarAction(null);
  }

  function prevMonth() {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  }

  function nextMonth() {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  }

  function selectDay(day: number) {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (d < today) return;
    setSelectedDate(d);
    setSelectedTime(null);
    setConfirmed(false);
  }

  function isSelected(day: number) {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === viewDate.getFullYear()
      && selectedDate.getMonth() === viewDate.getMonth()
      && selectedDate.getDate() === day;
  }

  function isToday(day: number) {
    return today.getFullYear() === viewDate.getFullYear()
      && today.getMonth() === viewDate.getMonth()
      && today.getDate() === day;
  }

  function isPast(day: number) {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return d < today;
  }

  function handleConfirm() {
    setConfirmed(true);
  }

  return (
    <div className="flex flex-col flex-1 gap-3 lg:gap-4 animate-fade-in min-h-0 overflow-y-auto md:overflow-y-hidden">
      <div className="shrink-0">
        <h1 className="text-xl lg:text-3xl font-bold text-forest font-heading">Next Steps</h1>
        <p className="text-sm text-muted mt-1">
          Ready to move forward? Choose your preferred next action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 auto-rows-fr">
        {actions.map((action) => {
          const inner = (
            <ContentCard
              className="w-full flex flex-col transition-all group-hover:shadow-md group-hover:border-forest/30"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-forest/10 text-forest">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-deep-forest">{action.title}</h2>
                  <p className="text-sm mt-1.5 text-muted leading-relaxed">{action.description}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-forest bg-forest/8 border border-forest/15 px-2.5 py-1 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  {action.timeline}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-deep-forest bg-mint-bg border border-mint-light/60 px-2.5 py-1 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  {action.prep}
                </span>
              </div>

              <p className="mt-3 text-xs text-muted leading-relaxed">{action.details}</p>

              <div className="mt-auto pt-4 flex items-center text-xs font-medium text-forest opacity-0 group-hover:opacity-100 transition-opacity">
                Get started
                <svg className="w-3.5 h-3.5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </ContentCard>
          );

          if (action.hasCalendar) {
            return (
              <button
                key={action.title}
                onClick={() => openCalendar(action.title)}
                className="group flex text-left"
              >
                {inner}
              </button>
            );
          }

          if ((action as typeof action & { hasBrochureForm?: boolean }).hasBrochureForm) {
            return (
              <button
                key={action.title}
                onClick={openBrochure}
                className="group flex text-left"
              >
                {inner}
              </button>
            );
          }

          return (
            <Link key={action.title} href={action.href} className="group flex">
              {inner}
            </Link>
          );
        })}
      </div>

      {/* Calendar Modal */}
      {calendarAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-deep-forest/60 backdrop-blur-sm" onClick={closeCalendar} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden w-full h-full md:w-[75vw] md:h-[75vh] flex flex-col">
            {/* Header */}
            <div className="bg-forest px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <Image
                  src="/logo.png"
                  alt="Namou"
                  width={120}
                  height={40}
                  className="object-contain h-6 sm:h-8 w-auto brightness-0 invert shrink-0"
                />
                <div className="w-px h-6 sm:h-8 bg-white/20 shrink-0" />
                <p className="text-xs sm:text-sm font-medium text-white/90 truncate">{calendarAction}</p>
              </div>
              <button onClick={closeCalendar} className="text-white/60 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {confirmed ? (
              /* Confirmation */
              <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3 className="text-xl font-bold text-forest mb-2">Confirmed</h3>
                <p className="text-sm text-muted">
                  Your <strong className="text-deep-forest">{calendarAction?.toLowerCase()}</strong> is scheduled for{" "}
                  <strong className="text-deep-forest">
                    {selectedDate && `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`}
                  </strong>{" "}
                  at <strong className="text-deep-forest">{selectedTime}</strong>.
                </p>
                <p className="text-xs text-muted mt-3">Your Namou specialist will send a confirmation shortly.</p>
                <button
                  onClick={closeCalendar}
                  className="mt-6 px-8 py-2.5 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-deep-forest transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Calendar + Time picker */
              <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-y-hidden">
                {/* Calendar */}
                <div className="flex-1 px-4 sm:px-10 py-4 sm:py-8 flex flex-col min-h-0">
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-3 sm:mb-5">
                    <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-mint-bg transition-colors text-muted hover:text-forest">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <h3 className="text-base sm:text-xl font-bold text-deep-forest">
                      {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </h3>
                    <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-mint-bg transition-colors text-muted hover:text-forest">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-3">
                    {DAYS.map(d => (
                      <div key={d} className="text-center text-xs sm:text-sm font-semibold text-muted uppercase tracking-wider py-1 sm:py-2">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-3 flex-1" style={{ gridAutoRows: "1fr" }}>
                    {calendarDays.map((day, i) => {
                      if (day === null) return <div key={`e-${i}`} />;
                      const past = isPast(day);
                      const sel = isSelected(day);
                      const tod = isToday(day);
                      return (
                        <button
                          key={day}
                          onClick={() => selectDay(day)}
                          disabled={past}
                          className={`
                            w-full rounded-lg sm:rounded-xl text-sm sm:text-lg font-medium transition-colors flex items-center justify-center
                            ${sel
                              ? "bg-forest text-white"
                              : tod
                                ? "bg-forest/10 text-forest font-bold ring-2 ring-forest/30"
                                : past
                                  ? "text-muted/30 cursor-not-allowed"
                                  : "text-deep-forest hover:bg-mint-bg"
                            }
                          `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots — visible when a date is selected */}
                <div className={`w-full md:w-72 border-t md:border-t-0 md:border-l border-mint-light/40 flex flex-col transition-all ${selectedDate ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                  <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-mint-light/40">
                    <p className="text-xs sm:text-sm uppercase tracking-widest text-muted font-semibold">
                      {selectedDate
                        ? `${MONTHS[selectedDate.getMonth()].slice(0, 3)} ${selectedDate.getDate()}`
                        : "Select a date"}
                    </p>
                    <p className="text-sm sm:text-base text-muted mt-1">Pick a time</p>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 sm:py-5 grid grid-cols-3 md:grid-cols-1 gap-2 md:gap-0 md:space-y-2.5 md:block">
                    {TIME_SLOTS.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`w-full px-2 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-base font-medium transition-colors text-center ${
                          selectedTime === time
                            ? "bg-forest text-white"
                            : "border border-mint-light text-deep-forest hover:border-forest/30 hover:bg-mint-bg"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  {/* Confirm */}
                  <div className="px-4 sm:px-5 py-4 sm:py-5 border-t border-mint-light/40">
                    <button
                      onClick={handleConfirm}
                      disabled={!selectedDate || !selectedTime}
                      className={`w-full py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-colors ${
                        selectedDate && selectedTime
                          ? "bg-forest text-white hover:bg-deep-forest"
                          : "bg-mint-light/50 text-muted cursor-not-allowed"
                      }`}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Brochure Form Modal */}
      {brochureOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-deep-forest/60 backdrop-blur-sm" onClick={closeBrochure} />

          <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden w-full max-w-md mx-4 flex flex-col">
            {/* Header */}
            <div className="bg-forest px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Namou" width={120} height={40} className="object-contain h-7 w-auto brightness-0 invert" />
                <div className="w-px h-7 bg-white/20" />
                <p className="text-sm font-medium text-white/90">Receive Brochures</p>
              </div>
              <button onClick={closeBrochure} className="text-white/60 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {brochureSubmitted ? (
              <div className="flex flex-col items-center justify-center px-8 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3 className="text-xl font-bold text-forest mb-2">Request Received</h3>
                <p className="text-sm text-muted">
                  We&apos;ll send your brochures and ROI calculations to <strong className="text-deep-forest">{brochureForm.email}</strong> shortly.
                </p>
                <button onClick={closeBrochure} className="mt-6 px-8 py-2.5 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-deep-forest transition-colors">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submitBrochure} className="px-6 py-6 flex flex-col gap-4">
                <p className="text-xs text-muted leading-relaxed">Enter your details below and we&apos;ll send you detailed property brochures and personalised ROI calculations.</p>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-deep-forest">First Name<span className="text-red-400 ml-0.5">*</span></span>
                    <input type="text" value={brochureForm.firstName} onChange={(e) => setBF("firstName", e.target.value)} maxLength={80} placeholder="John" className={`w-full px-4 py-2.5 rounded-xl border text-sm text-deep-forest placeholder:text-muted/50 outline-none transition-colors ${brochureErrors.firstName ? "border-red-400 bg-red-50/30" : "border-mint-light/60 bg-white focus:border-forest/40 focus:ring-1 focus:ring-forest/10"}`} />
                    {brochureErrors.firstName && <span className="text-[10px] text-red-500">Required</span>}
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-deep-forest">Last Name<span className="text-red-400 ml-0.5">*</span></span>
                    <input type="text" value={brochureForm.lastName} onChange={(e) => setBF("lastName", e.target.value)} maxLength={80} placeholder="Doe" className={`w-full px-4 py-2.5 rounded-xl border text-sm text-deep-forest placeholder:text-muted/50 outline-none transition-colors ${brochureErrors.lastName ? "border-red-400 bg-red-50/30" : "border-mint-light/60 bg-white focus:border-forest/40 focus:ring-1 focus:ring-forest/10"}`} />
                    {brochureErrors.lastName && <span className="text-[10px] text-red-500">Required</span>}
                  </label>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-deep-forest">Email<span className="text-red-400 ml-0.5">*</span></span>
                  <input type="email" value={brochureForm.email} onChange={(e) => setBF("email", e.target.value)} maxLength={254} placeholder="john@email.com" className={`w-full px-4 py-2.5 rounded-xl border text-sm text-deep-forest placeholder:text-muted/50 outline-none transition-colors ${brochureErrors.email ? "border-red-400 bg-red-50/30" : "border-mint-light/60 bg-white focus:border-forest/40 focus:ring-1 focus:ring-forest/10"}`} />
                  {brochureErrors.email && <span className="text-[10px] text-red-500">Valid email required</span>}
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-deep-forest">Phone Number<span className="text-red-400 ml-0.5">*</span></span>
                  <input type="tel" value={brochureForm.phone} onChange={(e) => setBF("phone", e.target.value)} maxLength={20} placeholder="+971 50 000 0000" className={`w-full px-4 py-2.5 rounded-xl border text-sm text-deep-forest placeholder:text-muted/50 outline-none transition-colors ${brochureErrors.phone ? "border-red-400 bg-red-50/30" : "border-mint-light/60 bg-white focus:border-forest/40 focus:ring-1 focus:ring-forest/10"}`} />
                  {brochureErrors.phone && <span className="text-[10px] text-red-500">Required</span>}
                </label>

                <button type="submit" className="w-full py-3 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-deep-forest transition-colors mt-2">
                  Send Me the Brochures
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
