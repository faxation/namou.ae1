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
const DETAIL_ZOOM = 16;

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

  // Keep the callback stable across renders so markers don't recreate on every parent render
  const onSelectRef = useRef(onSelectPlot);
  useEffect(() => { onSelectRef.current = onSelectPlot; }, [onSelectPlot]);

  // ── Map initialisation (once on mount) ──────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: MAP_CENTER,
      zoom: OVERVIEW_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    // Esri World Imagery — photo-realistic satellite base layer (free, no API key)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; <a href='https://www.esri.com' target='_blank'>Esri</a> &mdash; Esri, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP",
        maxZoom: 20,
      }
    ).addTo(map);

    // Esri Reference — road names + place labels overlay on top of satellite
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { opacity: 0.85, maxZoom: 20 }
    ).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    // ── ResizeObserver: tell Leaflet whenever the container changes size ──
    // This is critical: when the detail panel opens the map container shrinks
    // from full-width to md:w-1/2. Without this, Leaflet's internal viewport
    // cache is stale and flyTo centers on the wrong point.
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
    const map = mapRef.current;

    if (!compareMode && selectedPlot?.lat != null && selectedPlot?.lng != null) {
      // invalidateSize() ensures Leaflet knows the current container dimensions
      // before flying. This is essential when the detail panel has just opened
      // and the map container has resized — without it flyTo centres on stale
      // (full-width) dimensions and the pin appears off-centre.
      map.invalidateSize();
      map.flyTo(
        [selectedPlot.lat, selectedPlot.lng],
        DETAIL_ZOOM,
        { animate: true, duration: 1.2 }
      );
    } else if (!compareMode && !selectedPlot) {
      map.invalidateSize();
      map.flyTo(MAP_CENTER, OVERVIEW_ZOOM, { animate: true, duration: 1.0 });
    }
  }, [mapReady, selectedPlot, compareMode]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
