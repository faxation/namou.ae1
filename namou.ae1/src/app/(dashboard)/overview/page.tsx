import Link from "next/link";
import ContentCard from "@/components/ContentCard";
import { landCategories } from "@/data/mock";

export default function OverviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest font-heading">Namou Land Investment</h1>
        <p className="text-sm text-muted mt-1">
          Strategic land opportunities across Ras Al Khaimah — positioned for long-term value.
        </p>
      </div>

      <ContentCard className="mb-6">
        <h2 className="text-lg font-semibold text-deep-forest mb-3">The Opportunity</h2>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          RAK is one of the fastest-growing emirates for land investment. With new infrastructure,
          the Wynn casino resort, and expanding tourism, premium plots are appreciating at 15-25% annually.
          Namou provides curated access to verified freehold plots with clear title,
          full infrastructure, and development-ready zoning.
        </p>
      </ContentCard>

      {/* Land categories grid */}
      <h2 className="text-lg font-semibold text-deep-forest mb-3">Browse by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {landCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="group"
          >
            <ContentCard className="transition-all group-hover:border-forest/30 group-hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-forest">{cat.label}</h3>
                  <p className="text-xs text-muted mt-1 max-w-xs">{cat.description}</p>
                </div>
                <span className="text-xs font-medium text-mint bg-forest/10 px-2 py-1 rounded-full">
                  {cat.plotCount} plot{cat.plotCount !== 1 ? "s" : ""}
                </span>
              </div>
            </ContentCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
