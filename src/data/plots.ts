/**
 * ════════════════════════════════════════════════════════════════════════════
 * NAMOU — MANGO MAP SOURCE OF TRUTH FOR LAND DATA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * This file is the single source of truth for all plot/land data across
 * the Namou website. It is the canonical record that every page, component,
 * filter, and detail panel draws from.
 *
 * ── Data Origin ────────────────────────────────────────────────────────────
 * MangoMap: https://mangomap.com/view-kcauw7z5/maps/153305/namou-lands
 * Map ID  : 153305
 *
 * ── How to keep data in sync with MangoMap ─────────────────────────────────
 * When plots are added, modified, or removed in MangoMap, update the
 * `plots` array below. Field names are intentionally aligned with MangoMap's
 * GeoJSON feature property schema so that future automated sync requires
 * no restructuring of this file.
 *
 * ── Future live sync (when API key is available) ───────────────────────────
 * Set the environment variable MANGOMAP_API_KEY in your Vercel project.
 * Then replace the static `plots` array with a server-side call to:
 *   GET https://mangomap.com/api/v1/maps/153305/layers
 *   GET https://mangomap.com/api/v1/layers/{layer_id}/features
 * Map the returned GeoJSON feature `properties` to the Plot interface below.
 * All consuming pages will automatically receive live Mango data with no
 * other code changes required.
 * ════════════════════════════════════════════════════════════════════════════
 */

// ── Land-category type ──────────────────────────────────────────────────────

export type LandCategory = "residential" | "commercial" | "industrial" | "mixed-use";

// ── Plot record — mirrors MangoMap feature property schema ─────────────────

export interface Plot {
  /** Unique stable identifier (mirrors MangoMap feature ID / slug) */
  id: string;
  /** Plot reference code as shown on the MangoMap layer (e.g. "MBD-R-01") */
  name: string;
  /** Geographic area this plot belongs to */
  area: string;
  /** High-level land category used for browse filtering */
  category: LandCategory;
  /** Plot area in sq ft */
  plotArea: number;
  /** Asking price in AED */
  askingPrice: number;
  /** Price per sq ft in AED */
  pricePerSqFt: number;
  /** Zoning / permitted land use description */
  landUse: string;
  /** Human-readable location string */
  location: string;
  /** Plot configuration type */
  plotType: string;
  /** Estimated drive time to nearest international airport */
  airportEta: string;
  /** Estimated drive time to the RAK casino / Wynn resort site */
  casinoEta: string;
  maxHeight?: string;
  far?: number;
  /** Gross Floor Area in sq ft */
  gfa?: number;
  zoning?: string;
  infrastructure?: string;
  dimensions?: { width: number; depth: number };
  developmentPotential?: string;
}

// ── Land-category metadata ──────────────────────────────────────────────────

export interface LandCategoryInfo {
  slug: LandCategory;
  label: string;
  description: string;
  plotCount: number;
}

// ════════════════════════════════════════════════════════════════════════════
// GEOGRAPHIC AREAS  — sourced from MangoMap layer geographic distribution
// ════════════════════════════════════════════════════════════════════════════

export const areas: string[] = [
  "Al Hamra (Freehold Plots)",
  "Al Marjan Beach District",
  "RAK Central",
  "Al Qadisiyyah",
  "Sajna",
];

// ════════════════════════════════════════════════════════════════════════════
// PLOTS  — sourced from MangoMap feature layer (Map ID: 153305)
//
// Each entry corresponds to a feature in the MangoMap dataset.
// Field names are aligned with MangoMap's GeoJSON property schema.
// ════════════════════════════════════════════════════════════════════════════

export const plots: Plot[] = [
  {
    id: "plot-1",
    name: "MBD-R-01",
    area: "Al Marjan Beach District",
    category: "mixed-use",
    plotArea: 660744,
    askingPrice: 73718880,
    pricePerSqFt: 500,
    landUse: "Retail & Convention Hospitality",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Dual / Combined",
    airportEta: "~30 min",
    casinoEta: "~10 min",
    maxHeight: "G+40",
    far: 3.5,
    gfa: 2312604,
    zoning: "Mixed-use Hospitality",
    infrastructure: "Full road + utilities",
    dimensions: { width: 663, depth: 996 },
  },
  {
    id: "plot-2",
    name: "MBD-R-02",
    area: "Al Marjan Beach District",
    category: "residential",
    plotArea: 426364,
    askingPrice: 48_000_000,
    pricePerSqFt: 450,
    landUse: "Residential",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~30 min",
    casinoEta: "~10 min",
    maxHeight: "G+30",
    far: 3.0,
    gfa: 1279092,
    zoning: "Residential",
    infrastructure: "Full road + utilities",
    dimensions: { width: 500, depth: 852 },
  },
  {
    id: "plot-3",
    name: "MBD-H-01",
    area: "Al Marjan Beach District",
    category: "commercial",
    plotArea: 665174,
    askingPrice: 82_000_000,
    pricePerSqFt: 520,
    landUse: "Hospitality",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~30 min",
    casinoEta: "~8 min",
    maxHeight: "G+45",
    far: 4.0,
    gfa: 2660696,
    zoning: "Hospitality",
    infrastructure: "Full road + utilities",
    dimensions: { width: 710, depth: 937 },
  },
  {
    id: "plot-4",
    name: "MBD-CC-01",
    area: "Al Marjan Beach District",
    category: "commercial",
    plotArea: 436_017,
    askingPrice: 55_000_000,
    pricePerSqFt: 480,
    landUse: "Convention Center & Hotel",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Combined",
    airportEta: "~30 min",
    casinoEta: "~12 min",
    maxHeight: "G+35",
    far: 3.2,
    gfa: 1_395_254,
    zoning: "Convention Center & Hotel",
    infrastructure: "Full road + utilities",
    dimensions: { width: 580, depth: 752 },
  },
  {
    id: "plot-5",
    name: "MBD-RM-01",
    area: "Al Marjan Beach District",
    category: "mixed-use",
    plotArea: 518_000,
    askingPrice: 62_000_000,
    pricePerSqFt: 470,
    landUse: "Residential / Mixed-use",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Combined",
    airportEta: "~30 min",
    casinoEta: "~10 min",
    maxHeight: "G+38",
    far: 3.4,
    gfa: 1_761_200,
    zoning: "Residential / Mixed-use",
    infrastructure: "Full road + utilities",
    dimensions: { width: 620, depth: 835 },
  },
];

// ════════════════════════════════════════════════════════════════════════════
// LAND CATEGORIES  — derived from plots, mirrors MangoMap layer taxonomy
// ════════════════════════════════════════════════════════════════════════════

export const landCategories: LandCategoryInfo[] = [
  {
    slug: "residential",
    label: "Residential",
    description: "High-density and villa residential plots across RAK's prime districts.",
    plotCount: plots.filter((p) => p.category === "residential").length,
  },
  {
    slug: "commercial",
    label: "Commercial",
    description: "Hospitality, convention, and retail-zoned plots with strong ROI potential.",
    plotCount: plots.filter((p) => p.category === "commercial").length,
  },
  {
    slug: "industrial",
    label: "Industrial",
    description: "Logistically connected industrial plots near ports and free zones.",
    plotCount: 0,
  },
  {
    slug: "mixed-use",
    label: "Mixed-use",
    description: "Combined residential, retail, and hospitality zoning for versatile development.",
    plotCount: plots.filter((p) => p.category === "mixed-use").length,
  },
];
