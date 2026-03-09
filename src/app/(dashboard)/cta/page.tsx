import Link from "next/link";
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
  },
  {
    title: "Submit an Offer",
    description: "Lock in your land price and generate a secure deal link.",
    href: "/offer",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    primary: true,
    timeline: "Instant confirmation",
    prep: "Complete the ROI Simulator first for best results",
    details: "Your offer is reviewed within 2 business hours. A dedicated closing manager handles all documentation.",
  },
];

export default function CTAPage() {
  return (
    <div className="flex flex-col flex-1 gap-4 animate-fade-in">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold text-forest font-heading">Next Steps</h1>
        <p className="text-sm text-muted mt-1">
          Ready to move forward? Choose your preferred next action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 auto-rows-fr">
        {actions.map((action) => (
          <Link key={action.title} href={action.href} className="group flex">
            <ContentCard
              className={`w-full flex flex-col transition-all group-hover:shadow-md group-hover:border-forest/30 ${
                action.primary ? "border-forest/40" : ""
              }`}
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

              {/* Timeline + prep badges */}
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

              {/* Extra detail */}
              <p className="mt-3 text-xs text-muted leading-relaxed">{action.details}</p>

              <div className="mt-auto pt-4 flex items-center text-xs font-medium text-forest opacity-0 group-hover:opacity-100 transition-opacity">
                Get started
                <svg className="w-3.5 h-3.5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </ContentCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
