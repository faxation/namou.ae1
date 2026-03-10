import Link from "next/link";
import ContentCard from "@/components/ContentCard";
import { landCategories } from "@/data/mock";

export default function CategoriesPage() {
  return (
    <div className="flex flex-col flex-1 gap-5 animate-fade-in min-h-0 overflow-y-auto md:overflow-y-hidden">
      <div className="shrink-0">
        <h1 className="text-xl lg:text-3xl font-bold text-forest font-heading">Land Categories</h1>
        <p className="text-sm text-muted mt-1">
          Browse available plots by type for easier comparison and ROI analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 auto-rows-fr">
        {landCategories.map((cat) => (
          <Link key={cat.slug} href={`/categories/${cat.slug}`} className="group flex">
            <ContentCard className="w-full flex flex-col transition-all group-hover:border-forest/30 group-hover:shadow-md">
              <h2 className="text-lg font-semibold text-forest mb-1">{cat.label}</h2>
              <p className="text-sm text-muted mb-3">{cat.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-deep-forest bg-mint-light/40 px-3 py-1 rounded-full">
                  {cat.plotCount} available plot{cat.plotCount !== 1 ? "s" : ""}
                </span>
                <svg className="w-5 h-5 text-forest opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
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
