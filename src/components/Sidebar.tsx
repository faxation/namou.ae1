"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

const mainNavItems = [
  { href: "/master-plan", baseHref: "/master-plan", label: "Master Plan", icon: PlanIcon },
  { href: "/roi", baseHref: "/roi", label: "ROI", icon: TrendIcon },
  { href: "/offer", baseHref: "/offer", label: "Final Offer", icon: CheckIcon },
  { href: "/cta", baseHref: "/cta", label: "Next Steps", icon: RocketIcon },
];

const resourceNavItems = [
  { href: "/gallery", baseHref: "/gallery", label: "Gallery", icon: GalleryIcon },
];

function ContextLinks({ pathname }: { pathname: string }) {
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
    ? `/other-areas?type=${ctxType}${ctxArea ? `&area=${ctxArea}` : ""}`
    : "/other-areas";
  const otherTypesHref = ctxType
    ? `/other-types?type=${ctxType}${ctxArea ? `&area=${ctxArea}` : ""}`
    : "/other-types";

  const activeOtherAreas = pathname === "/other-areas";
  const activeOtherTypes = pathname === "/other-types";

  return (
    <>
      <div className="mx-2 my-2 border-t border-white/10" />
      <NavLink href={otherAreasHref} label="Other Areas" active={activeOtherAreas}>
        <MapPinIcon className="w-4 h-4 shrink-0" />
      </NavLink>
      <NavLink href={otherTypesHref} label="Other Land Types" active={activeOtherTypes}>
        <LayersIcon className="w-4 h-4 shrink-0" />
      </NavLink>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  // Build master plan href with context if present in current URL path
  const parts = pathname.split("/").filter(Boolean);
  const inCategoryContext = parts[0] === "categories" && parts.length >= 3;
  const pathCtxType = inCategoryContext ? parts[1] : null;
  const pathCtxArea = inCategoryContext ? parts[2] : null;

  const navItems = mainNavItems.map((item) => {
    if (item.baseHref === "/master-plan" && pathCtxType && pathCtxArea) {
      return { ...item, href: `/master-plan?type=${pathCtxType}&area=${pathCtxArea}` };
    }
    return item;
  });

  return (
    <aside className="group flex flex-col w-[52px] hover:w-[200px] min-h-screen bg-forest text-white py-8 shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out">
      {/* Logo */}
      <Link href="/" className="mb-10 px-2 flex items-center">
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

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {navItems.map((item) => {
          const active =
            item.baseHref === "/roi"
              ? pathname === "/roi" || pathname === "/roi/calculator"
              : pathname.startsWith(item.baseHref);
          return (
            <NavLink key={item.baseHref} href={item.href} label={item.label} active={active}>
              <item.icon className="w-4 h-4 shrink-0" />
            </NavLink>
          );
        })}

        {/* Resources separator */}
        <div className="mx-2 my-2 border-t border-white/10" />
        <p className="px-2 text-[10px] uppercase tracking-widest text-white/30 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">Resources</p>
        {resourceNavItems.map((item) => {
          const active = pathname.startsWith(item.baseHref);
          return (
            <NavLink key={item.baseHref} href={item.href} label={item.label} active={active}>
              <item.icon className="w-4 h-4 shrink-0" />
            </NavLink>
          );
        })}

        {/* Context-sensitive bottom links */}
        <Suspense fallback={null}>
          <ContextLinks pathname={pathname} />
        </Suspense>
      </nav>
    </aside>
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


function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
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

function NavLink({ href, label, active, children }: { href: string; label: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`nav-link relative flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-white/15 text-white font-medium"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {label}
      </span>
      {/* Tooltip — visible when collapsed, hidden when expanded */}
      <span className="nav-tooltip absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-deep-forest text-white text-xs font-medium whitespace-nowrap shadow-lg z-50 opacity-0 pointer-events-none transition-opacity">
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
