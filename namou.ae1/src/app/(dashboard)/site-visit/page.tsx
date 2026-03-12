"use client";

import ContentCard from "@/components/ContentCard";
import { itineraryItems } from "@/data/mock";

const iconMap: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  user: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  "hard-hat": ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18h20M6 18V9a6 6 0 0112 0v9" /><path d="M2 18a2 2 0 002 2h16a2 2 0 002-2" />
    </svg>
  ),
  "map-pin": ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  briefcase: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  ),
  building: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  ),
  layout: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
};

export default function SiteVisitPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-forest font-heading">Visit Itinerary</h1>
        <span className="px-3 py-1 rounded-full bg-mint text-forest text-xs font-semibold uppercase tracking-wide">
          VIP Access
        </span>
      </div>
      <p className="text-sm text-muted mb-6">Meetings &amp; Services</p>

      <ContentCard>
        {/* Schedule prompt */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-mint-white rounded-xl border border-mint-light/40">
          <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-deep-forest">Schedule your visit</p>
            <p className="text-xs text-muted">Select your preferred dates to visit.</p>
          </div>
        </div>

        {/* Itinerary grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {itineraryItems.map((item) => {
            const IconComponent = iconMap[item.icon] || iconMap.user;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-4 bg-mint-white/60 rounded-xl border border-mint-light/30"
              >
                <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                  <IconComponent className="w-4 h-4 text-forest" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-deep-forest">{item.title}</p>
                  <p className="text-xs text-muted mt-0.5">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm CTA */}
        <div className="mt-6">
          <button className="px-8 py-3 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-deep-forest transition-colors">
            Confirm
          </button>
        </div>
      </ContentCard>
    </div>
  );
}
