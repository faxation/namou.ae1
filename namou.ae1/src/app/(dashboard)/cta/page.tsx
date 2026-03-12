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
  },
];

export default function CTAPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest font-heading">Next Steps</h1>
        <p className="text-sm text-muted mt-1">
          Ready to move forward? Choose your preferred next action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link key={action.title} href={action.href} className="group">
            <ContentCard
              className={`h-full transition-all group-hover:shadow-md ${
                action.primary
                  ? "bg-forest text-white border-forest group-hover:bg-deep-forest"
                  : "group-hover:border-forest/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    action.primary ? "bg-white/15 text-white" : "bg-forest/10 text-forest"
                  }`}
                >
                  {action.icon}
                </div>
                <div>
                  <h2
                    className={`text-base font-semibold ${
                      action.primary ? "text-white" : "text-deep-forest"
                    }`}
                  >
                    {action.title}
                  </h2>
                  <p
                    className={`text-sm mt-1 ${
                      action.primary ? "text-white/70" : "text-muted"
                    }`}
                  >
                    {action.description}
                  </p>
                </div>
              </div>
            </ContentCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
