"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useRef } from "react";
import type { Plot } from "@/data/mock";

interface Props {
  plots: Plot[];
  selectedPlot: Plot | null;
  comparePlots: Plot[];
  compareMode: boolean;
  onSelectPlot: (plot: Plot) => void;
}

const MAP_CENTER: [number, number] = [25.745, 55.855];
const OVERVIEW_ZOOM = 11;

// ── Tile provider selection ────────────────────────────────────────────────
//
// PREFERRED: Mapbox Satellite Streets (satellite-streets-v12)
//   - Native zoom 22 coverage for UAE / RAK coastal areas
//   - Maxar imagery: significantly sharper than Esri at zoom 17–19
//   - Hybrid layer: satellite + road/place labels in one request (half the tile fetches)
//   - Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local to enable
//
// FALLBACK: Esri World Imagery + Esri Reference labels
//   - Esri's raster cache for recently developed RAK coastal areas runs out at zoom 17+
//   - Esri returns HTTP 200 placeholder PNGs (not 404s) — Leaflet cannot detect them
//   - maxNativeZoom:16 forces Leaflet to upscale zoom-16 tiles instead of requesting
//     zoom 17+ tiles (upscaled real imagery > placeholder text tiles)
//   - Zoom-16 Esri tiles reliably cover the entire RAK region
//
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const HAS_MAPBOX   = Boolean(MAPBOX_TOKEN);

// ── Plot-boundary status ───────────────────────────────────────────────────
//
// Exact polygon boundaries DO NOT exist in this dataset.
// The Plot type contains only lat/lng center points and plotArea (sqft).
// No GeoJSON, KML, or polygon coordinate arrays exist in this codebase.
//
// The dashed amber circle is derived from plotArea (sqft → m²) as an
// equivalent-area circle. It is an APPROXIMATE size indicator — not a
// surveyed boundary. The dashed style communicates this clearly.
//
// To render exact perimeters, real polygon geometry data must be added to
// the Plot type and sourced from the land registry or a GIS export.

function buildIcon(name: string, active: boolean): L.DivIcon {
  const bg     = active ? "#003D2E"              : "rgba(245,158,11,0.95)";
  const bdr    = active ? "#002A1F"              : "#D97706";
  const color  = active ? "#ffffff"              : "#78350F";
  const shadow = active
    ? "0 3px 12px rgba(0,61,46,0.55)"
    : "0 2px 10px rgba(0,0,0,0.40)";

  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
      <div style="background:${bg};border:2px solid ${bdr};border-radius:7px;padding:4px 11px;font-size:10px;font-weight:700;color:${color};white-space:nowrap;box-shadow:${shadow};font-family:system-ui,-apple-system,sans-serif;line-height:1.4;letter-spacing:0.03em;">${name}</div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${bdr};"></div>
    </div>`,
    className: "",
    iconSize: [96, 34],
    iconAnchor: [48, 34],
  });
}

export default function PlotMap({
  plots,
  selectedPlot,
  comparePlots,
  compareMode,
  onSelectPlot,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markersRef   = useRef<Map<string, L.Marker>>(new Map());
  const circleRef    = useRef<L.Circle | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Stable callback ref — markers reference this so they never need to be
  // recreated when the parent re-renders with a new onSelectPlot reference.
  const onSelectRef = useRef(onSelectPlot);
  useEffect(() => { onSelectRef.current = onSelectPlot; }, [onSelectPlot]);

  // Refs for current selection state — used in the marker-build effect so
  // that initial icon states are correct without adding selectedPlot /
  // comparePlots to that effect's deps (which would cause full rebuilds).
  const selectedPlotRef = useRef(selectedPlot);
  const comparePlotsRef = useRef(comparePlots);
  useEffect(() => { selectedPlotRef.current = selectedPlot;   }, [selectedPlot]);
  useEffect(() => { comparePlotsRef.current = comparePlots; }, [comparePlots]);

  // ── Map initialisation (once on mount) ──────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: MAP_CENTER,
      zoom:   OVERVIEW_ZOOM,
      maxZoom: 22,
      zoomSnap: 0.5,
      zoomControl: false,
      attributionControl: true,
    });

    // Zoom controls at bottom-right — clear of the Available Plots overlay (top-left)
    L.control.zoom({ position: "bottomright" }).addTo(map);

    if (HAS_MAPBOX) {
      // ── Mapbox Satellite Streets — preferred high-detail hybrid imagery ──
      //
      // satellite-streets-v12: Maxar satellite imagery + road/place labels
      // baked into a single tile layer. Native zoom coverage to 22 for UAE.
      // Al Marjan Island: genuine high-resolution imagery at zoom 17–19.
      //
      // tileSize:512 + zoomOffset:-1 is the standard Leaflet configuration
      // for Mapbox Styles API tiles (512px tiles, server zoom = display zoom - 1).
      L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
        {
          attribution:
            '© <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a> ' +
            '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
          tileSize:      512,
          zoomOffset:    -1,
          maxNativeZoom: 22,
          maxZoom:       22,
          keepBuffer:    3,  // pre-fetch one extra tile ring — reduces blank-tile flash on pan
        }
      ).addTo(map);
    } else {
      // ── Esri World Imagery — satellite basemap (fallback) ─────────────────
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; <a href='https://www.esri.com' target='_blank'>Esri</a> &mdash; " +
            "Esri, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP",
          maxNativeZoom: 16,
          maxZoom:       22,
          keepBuffer:    3,
        }
      ).addTo(map);

      // ── Esri Reference — road names and place labels overlay ──────────────
      // maxNativeZoom:16 matches the imagery layer so labels scale up together.
      // Omitted in the Mapbox branch (labels are included in satellite-streets).
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { opacity: 0.9, maxNativeZoom: 16, maxZoom: 22, keepBuffer: 3 }
      ).addTo(map);
    }

    mapRef.current = map;
    setMapReady(true);

    // ── ResizeObserver: keep Leaflet in sync with container size changes ─────
    // When the detail panel opens the map shrinks to md:w-1/2. Without this,
    // Leaflet's viewport cache is stale and flyTo centres on wrong coordinates.
    const ro = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      circleRef.current = null;
    };
  }, []);

  // ── Build markers when the plots array changes ────────────────────────────
  //
  // Performance: this effect does NOT depend on selectedPlot / comparePlots.
  // Selection-driven icon changes are handled cheaply by the effect below.
  // This prevents 17 marker.remove() + 17 L.marker().addTo() calls (34 DOM
  // mutations) on every plot click. Instead: one full build on init, then
  // lightweight setIcon() calls on selection changes.
  //
  // Initial icon states are read from refs (updated synchronously before this
  // effect runs on the mapReady transition).
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    plots.forEach((plot) => {
      if (plot.lat == null || plot.lng == null) return;

      const isActive =
        selectedPlotRef.current?.id === plot.id ||
        comparePlotsRef.current.some((p) => p.id === plot.id);

      const marker = L.marker([plot.lat, plot.lng], {
        icon: buildIcon(plot.name, isActive),
        riseOnHover: true,
      });

      marker.on("click", () => onSelectRef.current(plot));
      marker.addTo(map);
      markersRef.current.set(plot.id, marker);
    });
  // selectedPlot / comparePlots intentionally excluded — handled by next effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, plots]);

  // ── Update marker icons when selection changes (no full rebuild) ──────────
  //
  // Calls marker.setIcon() only — no DOM removal or insertion.
  // 17 setIcon() calls is ~20× faster than removing and recreating 17 markers.
  useEffect(() => {
    if (!mapReady) return;

    const plotLookup = new Map(plots.map((p) => [p.id, p]));

    markersRef.current.forEach((marker, id) => {
      const plot = plotLookup.get(id);
      if (!plot) return;

      const isActive =
        selectedPlot?.id === id ||
        comparePlots.some((p) => p.id === id);

      marker.setIcon(buildIcon(plot.name, isActive));
    });
  }, [mapReady, plots, selectedPlot, comparePlots, compareMode]);

  // ── Approximate plot-area circle ─────────────────────────────────────────
  //
  // Draws a dashed amber ring sized to the selected plot's recorded area.
  // Radius = sqrt(plotArea_sqft × 0.0929 / π) — equivalent-area circle.
  // APPROXIMATE — not a surveyed boundary. Dashed style communicates this.
  // Gives the investor an immediate sense of the plot's physical footprint
  // relative to nearby roads, coastline, and surrounding development.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (circleRef.current) {
      circleRef.current.remove();
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

      circleRef.current = L.circle(
        [selectedPlot.lat!, selectedPlot.lng!],
        {
          radius:      radiusM,
          color:       "#D97706",  // amber — high contrast on satellite imagery
          weight:      3,
          opacity:     0.95,
          fillColor:   "#F59E0B",
          fillOpacity: 0.18,
          dashArray:   "7 4",     // dashed = approximate indicator, not exact boundary
        }
      ).addTo(mapRef.current);
    }
  }, [mapReady, selectedPlot, compareMode]);

  // ── Pan/zoom to selected plot (or return to overview) ────────────────────
  //
  // Uses fitBounds(circle.getBounds().pad(1.0)) so each plot is framed at
  // the highest useful zoom for its physical size:
  //   - Large plots (AMBD North Bay, R≈65m) → padded span ~390m → zoom ~17.5
  //   - Small plots (Maireed RP-02, R≈13m)  → padded span ~76m  → zoom ~19
  //
  // pad(1.0) = 100% padding on each side (span = 3× circle diameter).
  // This keeps the plot prominent while showing ~1–2 blocks of context,
  // matching the level of detail in the reference satellite screenshot.
  //
  // maxZoom for fitBounds:
  //   Mapbox: 19 — genuine Maxar high-detail imagery at this zoom for UAE
  //   Esri fallback: 17 — beyond this Leaflet upscales zoom-16 tiles; no
  //                       additional real-world detail is gained by going higher
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (!compareMode && selectedPlot?.lat != null && selectedPlot?.lng != null) {
      const lat = selectedPlot.lat!;
      const lng = selectedPlot.lng!;
      // requestAnimationFrame defers until after the browser has settled the
      // React DOM layout (detail panel opened, map container resized,
      // ResizeObserver invalidateSize fired), then refreshes dimensions and fits.
      const id = requestAnimationFrame(() => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize();
        if (circleRef.current) {
          mapRef.current.fitBounds(
            circleRef.current.getBounds().pad(1.0),
            { maxZoom: HAS_MAPBOX ? 19 : 17, animate: true, duration: 1.3 }
          );
        } else {
          mapRef.current.flyTo([lat, lng], HAS_MAPBOX ? 19 : 17, {
            animate: true,
            duration: 1.2,
          });
        }
      });
      return () => cancelAnimationFrame(id);
    } else if (!compareMode && !selectedPlot) {
      const id = requestAnimationFrame(() => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize();
        mapRef.current.flyTo(MAP_CENTER, OVERVIEW_ZOOM, {
          animate: true,
          duration: 1.0,
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [mapReady, selectedPlot, compareMode]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
