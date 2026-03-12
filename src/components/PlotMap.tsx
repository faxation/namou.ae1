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
  // Holds the approximate-area circle for the currently selected plot
  const circleRef    = useRef<L.Circle | null>(null);
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
      maxZoom: 22,      // user can scroll past native tile max; Leaflet upscales
      zoomSnap: 0.5,    // half-step increments for fine-grained inspection
      zoomControl: false,
      attributionControl: true,
    });

    // Zoom controls at bottom-right — clear of the Available Plots overlay (top-left)
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // ── Esri World Imagery — photo-realistic satellite basemap ──────────────
    //
    // IMPORTANT: maxNativeZoom is set to 16, NOT 19.
    //
    // Esri's raster tile cache for recently developed RAK coastal areas
    // (Al Marjan Beach District, Al Maireed, etc.) runs out at zoom 17+.
    // When coverage is absent Esri returns an HTTP 200 with an actual PNG
    // image containing "Map data not yet available" text — NOT a 404.
    // Leaflet cannot distinguish a placeholder PNG from real imagery, so it
    // renders the placeholder faithfully at every tile position.
    //
    // Setting maxNativeZoom:16 tells Leaflet: never request tiles above zoom 16
    // from this provider. At zoom 17-22 Leaflet upscales the real zoom-16
    // tiles instead — showing actual satellite imagery (slightly soft at high
    // zoom) rather than repeating placeholder text tiles.
    //
    // Zoom-16 Esri tiles reliably exist for the entire RAK region.
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; <a href='https://www.esri.com' target='_blank'>Esri</a> &mdash; " +
          "Esri, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP",
        maxNativeZoom: 16,
        maxZoom: 22,
      }
    ).addTo(map);

    // ── Esri Reference — road names and place labels overlay ─────────────────
    // maxNativeZoom:16 matches the imagery layer so labels scale up together.
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { opacity: 0.9, maxNativeZoom: 16, maxZoom: 22 }
    ).addTo(map);

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

  // ── Approximate plot-area circle ─────────────────────────────────────────
  // Draws a dashed amber ring sized to the selected plot's recorded area.
  // The radius is derived from plotArea (sqft → m²) as a circle of equivalent
  // area — it is approximate, not a surveyed boundary. The dashed style
  // communicates this clearly. On satellite imagery this ring gives the
  // investor an immediate visual sense of the plot's physical footprint
  // relative to nearby roads and structures.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    // Remove previous circle
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
          color:       "#D97706",   // amber — high contrast on satellite imagery
          weight:      3,
          opacity:     0.95,
          fillColor:   "#F59E0B",
          fillOpacity: 0.18,
          dashArray:   "7 4",      // dashed = approximate indicator, not exact boundary
        }
      ).addTo(mapRef.current);
    }
  }, [mapReady, selectedPlot, compareMode]);

  // ── Pan/zoom to selected plot (or return to overview) ───────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (!compareMode && selectedPlot?.lat != null && selectedPlot?.lng != null) {
      const lat = selectedPlot.lat!;
      const lng = selectedPlot.lng!;
      // requestAnimationFrame defers until after the browser has settled the
      // React DOM layout (detail panel opened, map container resized,
      // ResizeObserver invalidateSize fired), then refreshes dimensions and flies.
      const id = requestAnimationFrame(() => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize();
        if (circleRef.current) {
          mapRef.current.fitBounds(
            circleRef.current.getBounds().pad(3.0),
            { maxZoom: 17, animate: true, duration: 1.3 }
          );
        } else {
          mapRef.current.flyTo([lat, lng], 17, { animate: true, duration: 1.2 });
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
