"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";

const mainNavItems = [
  { href: "/master-plan", baseHref: "/master-plan", label: "Master Plan", icon: PlanIcon },
  { href: "/roi", baseHref: "/roi", label: "ROI", icon: TrendIcon },
  { href: "/offer", baseHref: "/offer", label: "Final Offer", icon: CheckIcon },
  { href: "/cta", baseHref: "/cta", label: "Next Steps", icon: RocketIcon },
];

const resourceNavItems = [
  { href: "/agreement", baseHref: "/agreement", label: "Agreement", icon: AgreementIcon },
];

function ContextLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type");
  const urlArea = searchParams.get("area");

  const [ctxType, setCtxType] = useState<string | null>(() => {
    if (urlType) return urlType;
    try { return sessionStorage.getItem("ctx_type"); } catch { return null; }
  });
  const [ctxArea, setCtxArea] = useState<string | null>(() => {
    if (urlArea) return urlArea;
    try { return sessionStorage.getItem("ctx_area"); } catch { return null; }
  });

  useEffect(() => {
    if (urlType) {
      sessionStorage.setItem("ctx_type", urlType);
      if (urlArea) sessionStorage.setItem("ctx_area", urlArea);
      if (urlType !== ctxType) setCtxType(urlType);
      if (urlArea !== ctxArea) setCtxArea(urlArea);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlType, urlArea]);

  const otherAreasHref = ctxType
    ? `/other-areas?type=${encodeURIComponent(ctxType)}${ctxArea ? `&area=${encodeURIComponent(ctxArea)}` : ""}`
    : "/other-areas";
  const otherTypesHref = ctxType
    ? `/other-types?type=${encodeURIComponent(ctxType)}${ctxArea ? `&area=${encodeURIComponent(ctxArea)}` : ""}`
    : "/other-types";

  const activeOtherAreas = pathname === "/other-areas";
  const activeOtherTypes = pathname === "/other-types";

  return (
    <>
      <div className="mx-2 my-2 border-t border-white/10" />
      <NavLink href={otherAreasHref} label="Other Areas" active={activeOtherAreas} onNavigate={onNavigate}>
        <MapPinIcon className="w-4 h-4 shrink-0" />
      </NavLink>
      <NavLink href={otherTypesHref} label="Other Land Types" active={activeOtherTypes} onNavigate={onNavigate}>
        <LayersIcon className="w-4 h-4 shrink-0" />
      </NavLink>
    </>
  );
}

function SidebarNav({ pathname, navItems, onNavigate }: { pathname: string; navItems: typeof mainNavItems; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-2 flex-1">
      {navItems.map((item) => {
        const active =
          item.baseHref === "/roi"
            ? pathname === "/roi" || pathname === "/roi/calculator"
            : pathname.startsWith(item.baseHref);
        return (
          <NavLink key={item.baseHref} href={item.href} label={item.label} active={active} onNavigate={onNavigate}>
            <item.icon className="w-4 h-4 shrink-0" />
          </NavLink>
        );
      })}

      {/* Resources separator */}
      <div className="mx-2 my-2 border-t border-white/10" />
      <p className="px-2 text-[10px] uppercase tracking-widest text-white/30 mb-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">Resources</p>
      {resourceNavItems.map((item) => {
        const active = pathname.startsWith(item.baseHref);
        return (
          <NavLink key={item.baseHref} href={item.href} label={item.label} active={active} onNavigate={onNavigate}>
            <item.icon className="w-4 h-4 shrink-0" />
          </NavLink>
        );
      })}

      {/* Context-sensitive bottom links */}
      <Suspense fallback={null}>
        <ContextLinks pathname={pathname} onNavigate={onNavigate} />
      </Suspense>
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Close on escape key
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setMobileOpen(false);
  }, []);
  useEffect(() => {
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [handleEsc]);

  // Build master plan href with context if present in current URL path
  const parts = pathname.split("/").filter(Boolean);
  const inCategoryContext = parts[0] === "categories" && parts.length >= 3;
  const pathCtxType = inCategoryContext ? parts[1] : null;
  const pathCtxArea = inCategoryContext ? parts[2] : null;

  const navItems = mainNavItems.map((item) => {
    if (item.baseHref === "/master-plan" && pathCtxType && pathCtxArea) {
      return { ...item, href: `/master-plan?type=${encodeURIComponent(pathCtxType)}&area=${encodeURIComponent(pathCtxArea)}` };
    }
    return item;
  });

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-forest text-white px-4 py-3 shrink-0">
        <Link href="/home" className="flex items-center">
          <Image
            src="/logo-sidebar.png"
            alt="Namou"
            width={120}
            height={40}
            className="object-contain object-left h-8 w-auto"
            priority
          />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-deep-forest/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-forest text-white py-6 flex flex-col animate-fade-in">
            <Link href="/home" className="mb-6 px-4 flex items-center" onClick={() => setMobileOpen(false)}>
              <Image
                src="/logo-sidebar.png"
                alt="Namou"
                width={168}
                height={56}
                className="object-contain object-left h-10 w-auto"
                priority
              />
            </Link>
            <SidebarNav pathname={pathname} navItems={navItems} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="group hidden md:flex flex-col w-[42px] lg:w-[52px] hover:w-[200px] min-h-screen bg-forest text-white py-4 lg:py-8 shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out">
        {/* Logo */}
        <Link href="/home" className="mb-4 lg:mb-10 px-2 flex items-center">
          {/* Collapsed: small square crop; expanded: full logo */}
          <div className="w-[36px] group-hover:w-[168px] transition-[width] duration-200 ease-in-out overflow-hidden shrink-0">
            <Image
              src="/logo-sidebar.png"
              alt="Namou"
              width={168}
              height={56}
              className="object-contain object-left h-10 w-auto min-w-[168px]"
              priority
            />
          </div>
        </Link>

        <SidebarNav pathname={pathname} navItems={navItems} />
      </aside>
    </>
  );
}

/* ── Inline SVG icons ── */

function PlanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function TrendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}


function AgreementIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function NavLink({ href, label, active, children, onNavigate }: { href: string; label: string; active: boolean; children: React.ReactNode; onNavigate?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`nav-link relative flex items-center gap-3 px-2 py-2 md:py-1.5 lg:py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-white/15 text-white font-medium"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
      <span className="whitespace-nowrap md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
        {label}
      </span>
      {/* Tooltip — visible when collapsed, hidden when expanded */}
      <span className="nav-tooltip hidden md:block absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-deep-forest text-white text-xs font-medium whitespace-nowrap shadow-lg z-50 opacity-0 pointer-events-none transition-opacity">
        {label}
      </span>
    </Link>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
