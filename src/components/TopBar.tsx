export default function TopBar() {
  return (
    <header className="flex items-center justify-end gap-4 px-8 py-4">
      {/* Specialist badge */}
      <div className="flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm border border-mint-light/50">
        <div className="w-6 h-6 rounded-full bg-forest flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <span className="text-sm font-medium text-forest">Specialist</span>
      </div>

      {/* Search icon */}
      <button className="w-8 h-8 flex items-center justify-center text-forest hover:text-deep-forest transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </header>
  );
}
