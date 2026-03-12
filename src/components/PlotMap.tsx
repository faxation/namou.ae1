"use client";

import { useState, useEffect, useRef } from "react";
import type { Plot } from "@/data/mock";

interface Props {
  plots: Plot[];
  selectedPlot: Plot | null;
  comparePlots: Plot[];
  compareMode: boolean;
  onSelectPlot: (plot: Plot) => void;
}

const MAP_CENTER          = { lat: 25.745, lng: 55.855 };
const OVERVIEW_ZOOM       = 11;
const INSPECTION_MAX_ZOOM = 20; // Google has native zoom 20+ for UAE coastal areas

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";

// ── Script loading singleton ───────────────────────────────────────────────
//
// Loads the Google Maps JavaScript API once, even under React StrictMode's
// double-mount. Returns a Promise that resolves when the API is ready.
let gmapsLoadPromise: Promise<void> | null = null;

function ensureGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  // Already loaded (e.g. second mount after StrictMode cleanup)
  if ((window as unknown as { google?: { maps?: unknown } }).google?.maps) {
    return Promise.resolve();
  }
  if (gmapsLoadPromise) return gmapsLoadPromise;

  gmapsLoadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load",  () => resolve());
    script.addEventListener("error", () => {
      gmapsLoadPromise = null; // allow retry on next mount
      reject(new Error("Google Maps failed to load"));
    });
    document.head.appendChild(script);
  });

  return gmapsLoadPromise;
}

// ── Marker icon builder ────────────────────────────────────────────────────
//
// Returns an inline-SVG data-URL icon matching the amber/forest pill design.
// Width adapts to the plot name length; anchor is at the bottom-centre
// (tip of the downward arrow), so the marker pin touches the coordinate.
//
// Must only be called after the Google Maps script has loaded (i.e. inside
// effects where mapReady is true) because google.maps.Size/Point are used.
function buildMarkerIcon(name: string, active: boolean): google.maps.Icon {
  const bg     = active ? "#003D2E"              : "rgba(245,158,11,0.95)";
  const bdr    = active ? "#002A1F"              : "#D97706";
  const color  = active ? "#ffffff"              : "#78350F";
  const shadow = active
    ? "drop-shadow(0 3px 8px rgba(0,61,46,0.60))"
    : "drop-shadow(0 2px 6px rgba(0,0,0,0.42))";

  // Adaptive width: at least 80 px, ~6 px per character + 18 px side padding
  const w   = Math.max(80, name.length * 6 + 18);
  const h   = 34;
  const mid = w / 2;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" style="filter:${shadow}">` +
    `<rect x="1" y="1" width="${w - 2}" height="24" rx="6" ry="6" fill="${bg}" stroke="${bdr}" stroke-width="2"/>` +
    `<text x="${mid}" y="13" font-family="system-ui,-apple-system,sans-serif" font-size="9.5"` +
    ` font-weight="700" fill="${color}" text-anchor="middle" dominant-baseline="middle">${name}</text>` +
    `<polygon points="${mid - 5},25 ${mid + 5},25 ${mid},33" fill="${bdr}"/>` +
    `</svg>`;

  return {
    url:         "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    scaledSize:  new google.maps.Size(w, h),
    anchor:      new google.maps.Point(mid, h),
  };
}

export default function PlotMap({
  plots,
  selectedPlot,
  comparePlots,
  compareMode,
  onSelectPlot,
}: Props) {
  const containerRef    = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<google.maps.Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const markersRef      = useRef<Map<string, google.maps.Marker>>(new Map());
  const circleRef       = useRef<google.maps.Circle | null>(null);
  const roRef           = useRef<ResizeObserver | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Stable refs — prevent stale closures in marker click handlers and effects
  const onSelectRef     = useRef(onSelectPlot);
  const selectedRef     = useRef(selectedPlot);
  const comparePlotsRef = useRef(comparePlots);
  useEffect(() => { onSelectRef.current     = onSelectPlot; }, [onSelectPlot]);
  useEffect(() => { selectedRef.current     = selectedPlot;  }, [selectedPlot]);
  useEffect(() => { comparePlotsRef.current = comparePlots; }, [comparePlots]);

  // ── Map initialisation (once on mount) ────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !GOOGLE_KEY) return;

    let cancelled = false;

    ensureGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current || mapRef.current) return;

        const map = new google.maps.Map(containerRef.current, {
          center:    MAP_CENTER,
          zoom:      OVERVIEW_ZOOM,
          // HYBRID = satellite imagery + road/place name labels.
          // Better than pure SATELLITE for real-estate context (shows road
          // names and access routes that matter to investors and brokers).
          mapTypeId: google.maps.MapTypeId.HYBRID,
          maxZoom:   INSPECTION_MAX_ZOOM,
          // Controls — zoom at bottom-right (away from Available Plots overlay)
          zoomControl:       true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          mapTypeControl:     false, // fixed to HYBRID; keep UI clean
          streetViewControl:  false,
          fullscreenControl:  false,
          gestureHandling:    "greedy", // scroll always zooms (no two-finger requirement)
        });

        mapRef.current = map;

        // ResizeObserver — triggers Google Maps resize event when the CSS
        // container width changes (e.g. detail panel opens at md:w-1/2).
        // Equivalent to Leaflet's invalidateSize() call.
        const ro = new ResizeObserver(() => {
          if (mapRef.current) {
            google.maps.event.trigger(mapRef.current, "resize");
          }
        });
        ro.observe(containerRef.current!);
        roRef.current = ro;

        setMapReady(true);
      })
      .catch((err) => console.error("[PlotMap] Google Maps load error:", err));

    return () => {
      cancelled = true;
      roRef.current?.disconnect();
      roRef.current = null;

      if (mapRef.current) {
        markersRef.current.forEach((marker) => {
          google.maps.event.clearInstanceListeners(marker);
          marker.setMap(null);
        });
        markersRef.current.clear();

        if (circleRef.current) {
          circleRef.current.setMap(null);
          circleRef.current = null;
        }

        google.maps.event.clearInstanceListeners(mapRef.current);
        mapRef.current = null;
      }
    };
  }, []);

  // ── Build markers when the plots array changes ────────────────────────────
  //
  // Does NOT depend on selectedPlot / comparePlots — icon updates are handled
  // cheaply by the effect below using marker.setIcon() (no teardown/rebuild).
  // Initial icon states are read from refs populated on every render.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    markersRef.current.forEach((marker) => {
      google.maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
    });
    markersRef.current.clear();

    plots.forEach((plot) => {
      if (plot.lat == null || plot.lng == null) return;

      const isActive =
        selectedRef.current?.id === plot.id ||
        comparePlotsRef.current.some((p) => p.id === plot.id);

      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const marker = new google.maps.Marker({
        position:  { lat: plot.lat, lng: plot.lng },
        map,
        icon:      buildMarkerIcon(plot.name, isActive),
        title:     plot.name,
        optimized: false, // keep each marker as a real DOM element
        zIndex:    isActive ? 1000 : 1,
      });

      marker.addListener("click", () => onSelectRef.current(plot));
      markersRef.current.set(plot.id, marker);
    });
  // selectedPlot / comparePlots intentionally excluded — handled by next effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, plots]);

  // ── Update marker icons when selection changes (no full rebuild) ──────────
  //
  // Calls marker.setIcon() / setZIndex() only — no DOM removal or insertion.
  useEffect(() => {
    if (!mapReady) return;
    const plotLookup = new Map(plots.map((p) => [p.id, p]));

    markersRef.current.forEach((marker, id) => {
      const plot = plotLookup.get(id);
      if (!plot) return;

      const isActive =
        selectedPlot?.id === id ||
        comparePlots.some((p) => p.id === id);

      // eslint-disable-next-line @typescript-eslint/no-deprecated
      marker.setIcon(buildMarkerIcon(plot.name, isActive));
      marker.setZIndex(isActive ? 1000 : 1);
    });
  }, [mapReady, plots, selectedPlot, comparePlots, compareMode]);

  // ── Approximate plot-area circle ─────────────────────────────────────────
  //
  // Dashed amber ring derived from plotArea (sqft → m²) as an equivalent-area
  // circle. APPROXIMATE — no real polygon geometry exists in this dataset.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    if (
      !compareMode &&
      selectedPlot?.lat != null &&
      selectedPlot?.lng != null &&
      selectedPlot.plotArea
    ) {
      const areaM2  = selectedPlot.plotArea * 0.0929; // sqft → m²
      const radiusM = Math.sqrt(areaM2 / Math.PI);    // equivalent-area circle

      circleRef.current = new google.maps.Circle({
        center:        { lat: selectedPlot.lat, lng: selectedPlot.lng },
        radius:        radiusM,
        map:           mapRef.current,
        strokeColor:   "#D97706",  // amber — high contrast on satellite imagery
        strokeOpacity: 0.95,
        strokeWeight:  3,
        fillColor:     "#F59E0B",
        fillOpacity:   0.18,
        clickable:     false,
        zIndex:        500,
      });
    }
  }, [mapReady, selectedPlot, compareMode]);

  // ── Pan/zoom to selected plot (or return to overview) ────────────────────
  //
  // Uses fitBounds(paddedCircleBounds) — equivalent to Leaflet's pad(1.0):
  // bounds span extended by 100% on each side (= 3× original diameter).
  //
  // At zoom 19–20 with Google HYBRID, UAE imagery is ~0.15–0.3 m/px —
  // individual buildings, road widths, and bare-land parcel detail are clear.
  // maxZoom:20 on the map prevents overshooting the useful imagery depth.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (!compareMode && selectedPlot?.lat != null && selectedPlot?.lng != null) {
      const lat = selectedPlot.lat!;
      const lng = selectedPlot.lng!;
      // requestAnimationFrame defers until after the browser has settled the
      // React DOM layout (detail panel opened, container resized, resize event
      // triggered by ResizeObserver) so fitBounds sees the final viewport size.
      const id = requestAnimationFrame(() => {
        if (!mapRef.current) return;
        google.maps.event.trigger(mapRef.current, "resize");

        if (circleRef.current) {
          const bounds = circleRef.current.getBounds();
          if (bounds) {
            // Replicate Leaflet pad(1.0): extend by 100% on each side → 3× span
            const ne      = bounds.getNorthEast();
            const sw      = bounds.getSouthWest();
            const latSpan = ne.lat() - sw.lat();
            const lngSpan = ne.lng() - sw.lng();
            const padded  = new google.maps.LatLngBounds(
              { lat: sw.lat() - latSpan, lng: sw.lng() - lngSpan },
              { lat: ne.lat() + latSpan, lng: ne.lng() + lngSpan },
            );
            mapRef.current.fitBounds(padded);
          }
        } else {
          mapRef.current.setCenter({ lat, lng });
          mapRef.current.setZoom(INSPECTION_MAX_ZOOM);
        }
      });
      return () => cancelAnimationFrame(id);
    } else if (!compareMode && !selectedPlot) {
      const id = requestAnimationFrame(() => {
        if (!mapRef.current) return;
        google.maps.event.trigger(mapRef.current, "resize");
        mapRef.current.setCenter(MAP_CENTER);
        mapRef.current.setZoom(OVERVIEW_ZOOM);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [mapReady, selectedPlot, compareMode]);

  // ── No API key — show setup placeholder ──────────────────────────────────
  if (!GOOGLE_KEY) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-mint-white text-center px-6">
        <svg
          className="w-10 h-10 text-muted mb-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <p className="text-sm font-semibold text-deep-forest">Google Maps key required</p>
        <p className="text-xs text-muted mt-2 max-w-xs leading-relaxed">
          Add{" "}
          <code className="bg-mint-bg border border-mint-light/60 px-1 py-0.5 rounded text-[10px]">
            NEXT_PUBLIC_GOOGLE_MAPS_KEY
          </code>{" "}
          to{" "}
          <code className="bg-mint-bg border border-mint-light/60 px-1 py-0.5 rounded text-[10px]">
            .env.local
          </code>{" "}
          to activate satellite imagery.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Loading overlay — visible while the Google Maps script initialises */}
      {!mapReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-mint-white pointer-events-none">
          <div className="w-7 h-7 border-2 border-forest/20 border-t-forest rounded-full animate-spin" />
          <p className="text-xs text-muted mt-3 tracking-wide">Loading satellite imagery…</p>
        </div>
      )}
      <div ref={containerRef} className="absolute inset-0" />
    </>
  );
}
