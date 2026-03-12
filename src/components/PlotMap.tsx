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
// Zoom 18 shows individual buildings, road widths, and plot boundaries clearly —
// deep enough for a real-estate investor to evaluate access and immediate context.
const DETAIL_ZOOM = 18;

function buildIcon(name: string, active: boolean): L.DivIcon {
  const bg     = active ? "#003D2E"             : "rgba(245,158,11,0.95)";
  const bdr    = active ? "#002A1F"             : "#D97706";
  const color  = active ? "#ffffff"             : "#78350F";
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
  const [mapReady, setMapReady] = useState(false);

  // Keep the callback stable so markers don't recreate on every parent render
  const onSelectRef = useRef(onSelectPlot);
  useEffect(() => { onSelectRef.current = onSelectPlot; }, [onSelectPlot]);

  // ── Map initialisation (once on mount) ──────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: MAP_CENTER,
      zoom: OVERVIEW_ZOOM,
      // maxZoom: 22 — allows the user to scroll/zoom past the provider's native
      // tile max. Leaflet will upscale the highest available tiles rather than
      // showing "Map data not available" placeholders, keeping real imagery
      // visible at any zoom depth.
      maxZoom: 22,
      // zoomSnap: 0.5 — half-step zoom increments feel smoother and more
      // controlled when inspecting plot boundaries.
      zoomSnap: 0.5,
      // Disable the default top-left zoom control; we add it at bottom-right
      // so it doesn't overlap the "Available Plots" overlay panel.
      zoomControl: false,
      attributionControl: true,
    });

    // Zoom controls at bottom-right — clear of the Available Plots overlay
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // ── CartoDB Voyager — full real-world tile layer ─────────────────────────
    // Replaces Esri World Imagery which returns "Map data not yet available"
    // placeholder tiles for Al Marjan Beach District and other RAK areas at
    // zoom 17+. Esri's raster cache does not fully cover recently developed
    // coastal areas; it returns an actual tile IMAGE containing that text
    // (HTTP 200) so maxNativeZoom cannot help — Leaflet has no way to detect
    // a placeholder and fall back to a lower zoom.
    //
    // CartoDB Voyager tiles are vector-rendered on-demand from OpenStreetMap,
    // guaranteeing full coverage at every zoom level for every area.
    // Roads, buildings, coastline, water, and labels are all present at zoom 18.
    // maxNativeZoom: 20  → native tile resolution goes to zoom 20
    // maxZoom: 22        → Leaflet upscales zoom-20 tiles at 21-22
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      {
        attribution:
          "&copy; <a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions' target='_blank'>CARTO</a>",
        subdomains: "abcd",
        maxNativeZoom: 20,
        maxZoom: 22,
      }
    ).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    // ── ResizeObserver: keep Leaflet in sync with container size changes ─────
    // When the detail panel opens the map container shrinks from full-width to
    // md:w-1/2 via CSS flex. Without this, Leaflet's viewport cache stays stale
    // and flyTo centres on wrong coordinates.
    const ro = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // ── Rebuild markers whenever plots or selection state changes ────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    plots.forEach((plot) => {
      if (plot.lat == null || plot.lng == null) return;

      const isActive =
        selectedPlot?.id === plot.id ||
        comparePlots.some((p) => p.id === plot.id);

      const marker = L.marker([plot.lat, plot.lng], {
        icon: buildIcon(plot.name, isActive),
        riseOnHover: true,
      });

      marker.on("click", () => onSelectRef.current(plot));
      marker.addTo(map);
      markersRef.current.set(plot.id, marker);
    });
  }, [mapReady, plots, selectedPlot, comparePlots, compareMode]);

  // ── Pan/zoom to selected plot (or return to overview) ───────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (!compareMode && selectedPlot?.lat != null && selectedPlot?.lng != null) {
      const lat = selectedPlot.lat!;
      const lng = selectedPlot.lng!;
      // requestAnimationFrame defers until the browser has finished laying out
      // the React DOM changes (detail panel opening, map container resizing).
      // By then the ResizeObserver has already fired invalidateSize(), so flyTo
      // computes the correct centre in the current container dimensions.
      const id = requestAnimationFrame(() => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize();
        mapRef.current.flyTo([lat, lng], DETAIL_ZOOM, {
          animate: true,
          duration: 1.2,
        });
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
