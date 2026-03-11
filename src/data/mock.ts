/**
 * Namou app data — non-land records + re-exports of Mango land data.
 *
 * Land data (Plot, LandCategory, areas, plots, landCategories) lives in
 * src/data/plots.ts — the single source of truth tied to MangoMap.
 * All existing imports of those symbols from "@/data/mock" continue to work
 * unchanged via the re-exports below.
 */

// ── Re-export Mango land data (single source of truth) ─────────────────────
export type { LandCategory, Plot, LandCategoryInfo } from "./plots";
export { areas, plots, landCategories } from "./plots";

// ── Non-land types ──────────────────────────────────────────────────────────

export interface Landmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
  images: string[];
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: "image" | "video";
}

export interface ItineraryItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ROIInputs {
  constructionCostPerSqFt: number;
  salePricePerSqFt: number;
  netSellableAreaPct: number;
  targetProfitMarginPct: number;
}

export interface ROIOutputs {
  roi: number;
  totalDevelopmentValue: number;
  maximumLandPrice: number;
  gfaPrice: number;
}

/* ── Filter categories for Master Plan ── */
export const masterPlanFilters = [
  "Master Plan",
  "Residential",
  "Hospitality",
  "Convention Center & Hotel",
  "Residential / Mixed-use",
];

/* ── Landmarks ── */
export const landmarks: Landmark[] = [
  {
    id: "mina-al-arab",
    name: "Mina Al Arab",
    lat: 25.805,
    lng: 55.965,
    images: [
      "/images/landmarks/mina-al-arab-1.jpg",
      "/images/landmarks/mina-al-arab-2.jpg",
      "/images/landmarks/mina-al-arab-3.jpg",
    ],
  },
  {
    id: "al-hamra",
    name: "Al Hamra",
    lat: 25.725,
    lng: 55.788,
    images: [
      "/images/landmarks/al-hamra-1.jpg",
      "/images/landmarks/al-hamra-2.jpg",
      "/images/landmarks/al-hamra-3.jpg",
    ],
  },
];

/* ── Gallery ── */
export const galleryImages: GalleryImage[] = [
  { id: "g1", src: "/images/gallery/rak-1.jpg", alt: "RAK waterfront aerial", category: "image" },
  { id: "g2", src: "/images/gallery/rak-2.jpg", alt: "RAK modern architecture", category: "image" },
  { id: "g3", src: "/images/gallery/rak-3.jpg", alt: "RAK beachfront", category: "image" },
  { id: "g4", src: "/images/gallery/rak-4.jpg", alt: "RAK marina", category: "image" },
  { id: "g5", src: "/images/gallery/rak-5.jpg", alt: "RAK skyline", category: "image" },
  { id: "g6", src: "/images/gallery/rak-6.jpg", alt: "RAK landscape", category: "image" },
];

/* ── Itinerary ── */
export const itineraryItems: ItineraryItem[] = [
  {
    id: "it-1",
    title: "Founder Meeting",
    description: "Meet NAMOU's Founder in person",
    icon: "user",
  },
  {
    id: "it-2",
    title: "Contractor Meeting",
    description: "Meet on-site to confirm build readiness.",
    icon: "hard-hat",
  },
  {
    id: "it-3",
    title: "Al Marjan Island Site Visit",
    description: "Private guided tour of the Al Marjan project.",
    icon: "map-pin",
  },
  {
    id: "it-4",
    title: "Senior COC Member Meeting",
    description: "Discuss Compliance and regulatory clearance.",
    icon: "briefcase",
  },
  {
    id: "it-5",
    title: "Meet a member of RAK Municipality",
    description: "Verify local zoning and government protocols.",
    icon: "building",
  },
  {
    id: "it-6",
    title: "Meet the Master Plan Developer",
    description: "Deep dive into the comprehensive project blueprint.",
    icon: "layout",
  },
];

/* ── Helper to format numbers ── */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatAED(n: number): string {
  return `AED ${n.toLocaleString("en-US")}`;
}

/* ── ROI calculation helper ── */
export function calculateROI(inputs: ROIInputs, gfa: number): ROIOutputs {
  const { constructionCostPerSqFt, salePricePerSqFt, netSellableAreaPct, targetProfitMarginPct } = inputs;
  const nsa = gfa * (netSellableAreaPct / 100);
  const totalDevelopmentValue = nsa * salePricePerSqFt;
  const totalConstructionCost = gfa * constructionCostPerSqFt;
  const profit = totalDevelopmentValue - totalConstructionCost;
  const roi = totalConstructionCost > 0 ? (profit / totalConstructionCost) * 100 : 0;
  const maximumLandPrice = totalDevelopmentValue - totalConstructionCost - totalDevelopmentValue * (targetProfitMarginPct / 100);
  const gfaPrice = gfa > 0 ? maximumLandPrice / gfa : 0;

  return {
    roi: Math.round(roi * 100) / 100,
    totalDevelopmentValue: Math.round(totalDevelopmentValue),
    maximumLandPrice: Math.round(Math.max(0, maximumLandPrice)),
    gfaPrice: Math.round(Math.max(0, gfaPrice) * 100) / 100,
  };
}

/* ── Example deal defaults (RAK Central, Jad: $800/sqft construction) ── */
export const exampleDealDefaults: ROIInputs = {
  constructionCostPerSqFt: 800,
  salePricePerSqFt: 1500,
  netSellableAreaPct: 75,
  targetProfitMarginPct: 20,
};

export const exampleDealGFA = 2_000_000; // sq ft — RAK Central tower
