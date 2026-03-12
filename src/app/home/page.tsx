"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { landCategories, plots, areas, type LandCategory } from "@/data/mock";

function areaSlug(area: string) {
  return area.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function LandingPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [selectedType, setSelectedType] = useState<LandCategory | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!sessionStorage.getItem("namou_session")) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!checked) return null;

  const availableAreas = selectedType
    ? areas.filter((area) => plots.some((p) => p.category === selectedType && p.area === area))
    : [];

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/rak-hero.jpg')" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-deep-forest/40" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-center px-4 sm:px-12 py-4 sm:py-6">
        <span className="text-xs tracking-[0.35em] uppercase text-white/60 font-heading">
          Real Estate Done Right
        </span>
      </header>

      {/* Center content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 sm:px-8 pt-4 sm:pt-6 pb-6 sm:pb-10">

        {/* Logo — outside the card, over the background */}
        <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
          <Image
            src="/logo.png"
            alt="Namou Properties"
            width={520}
            height={160}
            className="object-contain w-auto h-[15vh] sm:h-[28vh] lg:h-[34vh]"
            priority
          />
          <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-xl mx-auto leading-relaxed mt-2 sm:mt-3 px-2">
            Strategic land investment opportunities across Ras Al Khaimah.
            Curated plots, transparent ROI, and a clear path to ownership.
          </p>
        </div>

        {/* Card — selector only */}
        <div className="w-full max-w-4xl bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl px-4 sm:px-10 py-6 sm:py-8 shadow-2xl flex flex-col items-center gap-6">

          {/* Selector */}
          <div className="w-full">
            {selectedType === null ? (
              <>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-4 text-center">Browse by land type</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {landCategories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedType(cat.slug)}
                      className="py-4 sm:py-6 px-4 sm:px-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-sm sm:text-base font-semibold text-white hover:bg-white/30 hover:border-white/50 transition-all text-center"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Browse by area</p>
                  <button
                    onClick={() => setSelectedType(null)}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    ← Back
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableAreas.map((area) => (
                    <Link
                      key={area}
                      href={`/master-plan?type=${encodeURIComponent(selectedType)}&area=${encodeURIComponent(areaSlug(area))}`}
                      className="py-4 sm:py-6 px-4 sm:px-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-sm sm:text-base font-semibold text-white hover:bg-white/30 hover:border-white/50 transition-all text-center"
                    >
                      {area}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
