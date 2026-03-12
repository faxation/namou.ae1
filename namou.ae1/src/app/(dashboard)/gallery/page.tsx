"use client";

import { useState } from "react";
import ContentCard from "@/components/ContentCard";
import { galleryImages } from "@/data/mock";

const galleryTabs = ["Images", "Videos"];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState(galleryTabs[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = galleryImages.filter((img) =>
    activeTab === "Images" ? img.category === "image" : img.category === "video"
  );

  const selectedImage = filtered[selectedIndex] || filtered[0];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest font-heading">Ras Al Khaimah at a Glance</h1>
        <p className="text-sm text-muted mt-1">
          Experience Ras Al Khaimah through a curated visual tour of its landmarks and surroundings.
        </p>
      </div>

      <ContentCard>
        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {galleryTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedIndex(0); }}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                activeTab === tab
                  ? "bg-forest text-white"
                  : "bg-mint-white text-deep-forest hover:bg-mint-light/30"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Hero image */}
        <div className="relative w-full h-[380px] rounded-xl bg-gradient-to-br from-mint-light/30 to-mint/20 mb-4 overflow-hidden border border-mint-light/40 flex items-center justify-center">
          {selectedImage ? (
            <div className="text-center text-deep-forest/40">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-sm font-medium">{selectedImage.alt}</p>
            </div>
          ) : (
            <p className="text-sm text-muted">No {activeTab.toLowerCase()} available</p>
          )}

          {/* Navigation arrows */}
          <button
            onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => setSelectedIndex(Math.min(filtered.length - 1, selectedIndex + 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filtered.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg bg-gradient-to-br from-mint-light/30 to-mint/10 border transition-all overflow-hidden flex items-center justify-center ${
                i === selectedIndex
                  ? "border-forest ring-2 ring-forest/20"
                  : "border-mint-light/40 hover:border-forest/30"
              }`}
            >
              <svg className="w-5 h-5 text-deep-forest/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
          ))}
        </div>
      </ContentCard>
    </div>
  );
}
