"use client";

import { useState } from "react";
import ContentCard from "@/components/ContentCard";
import { landmarks } from "@/data/mock";

const tabs = ["Nearby Landmarks", "Al Marjan Beach District"];

export default function RakLandscapePage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [activeLandmark, setActiveLandmark] = useState<string | null>(null);

  const selectedLandmark = landmarks.find((l) => l.id === activeLandmark);

  return (
    <div className="flex flex-col flex-1 gap-5 animate-fade-in">
      {/* Page header */}
      <div className="shrink-0">
        <h1 className="text-3xl font-bold text-forest font-heading">Getting to Know RAK</h1>
        <p className="text-sm text-muted mt-1">
          Explore the landscape of Al Marjan beach district
        </p>
      </div>

      <ContentCard className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                activeTab === tab
                  ? "bg-forest text-white"
                  : "bg-mint-white text-deep-forest hover:bg-mint-light/30"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Map area — static satellite image placeholder */}
        <div className="relative w-full flex-1 min-h-[280px] bg-mint-bg rounded-xl overflow-hidden">
          {/* Placeholder satellite map */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3a6b5a] via-[#5a8b7a] to-[#7aab9a] opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-deep-forest/50">
              <svg className="w-16 h-16 mx-auto mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              <p className="text-sm font-medium">RAK Satellite Map</p>
              <p className="text-xs mt-1 text-muted">Interactive map integration pending</p>
            </div>
          </div>

          {/* Landmark pins */}
          {landmarks.map((lm, i) => (
            <button
              key={lm.id}
              onClick={() => setActiveLandmark(activeLandmark === lm.id ? null : lm.id)}
              className="absolute flex flex-col items-center group"
              style={{ top: `${30 + i * 25}%`, left: `${35 + i * 20}%` }}
            >
              <div className={`w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-colors ${
                activeLandmark === lm.id ? "bg-forest" : "bg-deep-forest"
              }`}>
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span className="mt-1 text-xs font-medium text-deep-forest bg-white/80 px-2 py-0.5 rounded shadow-sm">
                {lm.name}
              </span>
            </button>
          ))}
        </div>

        {/* Gallery overlay */}
        {selectedLandmark && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {selectedLandmark.images.map((img, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl bg-gradient-to-br from-mint-light/40 to-mint/20 flex items-center justify-center overflow-hidden border border-mint-light/50"
              >
                <div className="text-center text-deep-forest/40">
                  <svg className="w-8 h-8 mx-auto mb-1 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <p className="text-xs">{selectedLandmark.name} {i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
