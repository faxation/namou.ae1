"use client";

import Link from "next/link";
import { landCategories } from "@/data/mock";

export default function LandingPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-mint-white overflow-hidden">
      {/* Subtle background gradient — no glass, no clutter (Jad) */}
      <div className="absolute inset-0 bg-gradient-to-b from-mint-white via-mint-bg/30 to-mint-white" />

      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 py-6 z-10">
        <span className="text-sm tracking-[0.25em] uppercase text-deep-forest/70 font-heading">
          Real Estate Done Right
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm border border-mint-light/50">
            <div className="w-6 h-6 rounded-full bg-forest flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-forest">Specialist</span>
          </div>
        </div>
      </header>

      {/* Center content — clean, minimal (Jad: no glass design) */}
      <main className="relative z-10 flex flex-col items-center gap-6 text-center max-w-2xl px-6">
        <h1 className="font-heading text-6xl md:text-7xl leading-none font-bold tracking-wider text-forest">
          NAMOU
        </h1>
        <p className="text-sm tracking-[0.3em] uppercase text-deep-forest/60">
          Properties
        </p>

        <p className="text-base text-muted max-w-md leading-relaxed mt-2">
          Strategic land investment opportunities across Ras Al Khaimah.
          Curated plots, transparent ROI, and a clear path to ownership.
        </p>

        {/* Navigate by category (Jad: bundle by TYPE not area) */}
        <div className="mt-6 w-full max-w-lg">
          <p className="text-xs uppercase tracking-wider text-deep-forest/50 mb-3">
            Browse by land type
          </p>
          <div className="grid grid-cols-2 gap-2">
            {landCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="px-4 py-3 bg-white border border-mint-light/60 rounded-xl text-sm text-deep-forest hover:border-forest/30 hover:shadow-sm transition-all text-center font-medium"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick entry to overview */}
        <Link
          href="/overview"
          className="mt-4 px-8 py-3 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-deep-forest transition-colors"
        >
          Explore the Opportunity
        </Link>
      </main>
    </div>
  );
}
