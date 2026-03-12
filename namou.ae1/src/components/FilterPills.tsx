"use client";

interface FilterPillsProps {
  filters: string[];
  active: string[];
  onToggle: (filter: string) => void;
}

export default function FilterPills({ filters, active, onToggle }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = active.includes(filter);
        return (
          <button
            key={filter}
            onClick={() => onToggle(filter)}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors border ${
              isActive
                ? "bg-forest text-white border-forest"
                : "bg-white text-deep-forest border-mint-light hover:border-forest/30"
            }`}
          >
            {filter}
            {isActive && (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
