/* ── Mock data for the baseline UI (v1, no backend) ── */

export type LandCategory = "residential" | "commercial" | "industrial" | "mixed-use";

export interface Plot {
  id: string;
  name: string;
  area: string;
  category: LandCategory;
  plotArea: number; // sq ft
  askingPrice: number; // AED
  pricePerSqFt: number; // AED
  landUse: string;
  location: string;
  plotType: string;
  airportEta: string;
  casinoEta: string;
  maxHeight?: string;
  far?: number;
  gfa?: number;
  zoning?: string;
  infrastructure?: string;
  dimensions?: { width: number; depth: number };
  developmentPotential?: string;
  paymentPlan?: string;
  lat?: number; // WGS84 latitude (decimal degrees)
  lng?: number; // WGS84 longitude (decimal degrees)
}

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

export interface LandCategoryInfo {
  slug: LandCategory;
  label: string;
  description: string;
  plotCount: number;
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

/* ── Areas ── */
export const areas = [
  "Al Marjan Beach District",
  "Al Maireed",
  "Al Nakheel",
  "Al Hamra (Freehold Plots)",
  "RAK Central",
  "Al Qadisiyyah",
  "Sajna",
];

/* ── Plots ── */
export const plots: Plot[] = [
  // ── Al Marjan Beach District ──────────────────────────────────────────────
  {
    id: "ambd-north-bay",
    name: "AMBD North Bay",
    area: "Al Marjan Beach District",
    category: "mixed-use",
    plotArea: 144_001,
    askingPrice: 288_001_500,
    pricePerSqFt: 2000,
    landUse: "Residential / Mixed-use",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Combined",
    airportEta: "~20 min",
    casinoEta: "~5 min",
    maxHeight: "G+10",
    far: 2,
    gfa: 288_002,
    zoning: "Residential / Mixed-use",
    infrastructure: "Full road + utilities",
    paymentPlan: "10% down payment — within 30 days to close the remaining amount",
    lat: 25.673117,
    lng: 55.739483,
  },
  {
    id: "beach-d01-009",
    name: "Beach D01-009",
    area: "Al Marjan Beach District",
    category: "residential",
    plotArea: 116_066,
    askingPrice: 274_177_955,
    pricePerSqFt: 2362,
    landUse: "Residential",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~20 min",
    casinoEta: "~5 min",
    maxHeight: "2B+G+19",
    far: 4.72,
    gfa: 547_832,
    zoning: "Residential",
    infrastructure: "Full road + utilities",
    paymentPlan: "5% Booking / 15% within 30 days SPA / 20% end of each year 1, 2, 3 & 4 from signing SPA",
    lat: 25.6655,
    lng: 55.7605,
  },
  {
    id: "beach-d01-010",
    name: "Beach D01-010",
    area: "Al Marjan Beach District",
    category: "residential",
    plotArea: 140_849,
    askingPrice: 270_268_395,
    pricePerSqFt: 1919,
    landUse: "Residential",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~20 min",
    casinoEta: "~5 min",
    maxHeight: "2B+G+11",
    far: 3.84,
    gfa: 540_860,
    zoning: "Residential",
    infrastructure: "Full road + utilities",
    paymentPlan: "5% Booking / 15% within 30 days SPA / 20% end of each year 1, 2, 3 & 4 from signing SPA",
    lat: 25.6648,
    lng: 55.7612,
  },
  {
    id: "beach-d01-011",
    name: "Beach D01-011",
    area: "Al Marjan Beach District",
    category: "residential",
    plotArea: 134_007,
    askingPrice: 205_805_820,
    pricePerSqFt: 1536,
    landUse: "Residential",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~20 min",
    casinoEta: "~5 min",
    maxHeight: "2B+G+11",
    far: 3.07,
    gfa: 411_401,
    zoning: "Residential",
    infrastructure: "Full road + utilities",
    paymentPlan: "5% Booking / 15% within 30 days SPA / 20% end of each year 1, 2, 3 & 4 from signing SPA",
    lat: 25.6641,
    lng: 55.7601,
  },
  {
    id: "ambd-d02-014",
    name: "AMBD D02-014",
    area: "Al Marjan Beach District",
    category: "residential",
    plotArea: 121_551,
    askingPrice: 264_981_275,
    pricePerSqFt: 2180,
    landUse: "Residential",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~20 min",
    casinoEta: "~5 min",
    maxHeight: "2B+G+19",
    far: 4.36,
    gfa: 529_963,
    zoning: "Residential",
    infrastructure: "Full road + utilities",
    paymentPlan: "5% Booking / 15% within 30 days SPA / 20% end of each year 1, 2, 3 & 4 from signing SPA",
    lat: 25.6660,
    lng: 55.7618,
  },
  {
    id: "ambd-d02-015",
    name: "AMBD D02-015",
    area: "Al Marjan Beach District",
    category: "residential",
    plotArea: 128_225,
    askingPrice: 224_479_680,
    pricePerSqFt: 1751,
    landUse: "Residential",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~20 min",
    casinoEta: "~5 min",
    maxHeight: "2B+G+11",
    far: 3.5,
    gfa: 448_788,
    zoning: "Residential",
    infrastructure: "Full road + utilities",
    paymentPlan: "5% Booking / 15% within 30 days SPA / 20% end of each year 1, 2, 3 & 4 from signing SPA",
    lat: 25.6653,
    lng: 55.7624,
  },
  {
    id: "ambd-d02-016",
    name: "AMBD D02-016",
    area: "Al Marjan Beach District",
    category: "residential",
    plotArea: 124_862,
    askingPrice: 223_892_065,
    pricePerSqFt: 1793,
    landUse: "Residential",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~20 min",
    casinoEta: "~5 min",
    maxHeight: "2B+G+11",
    far: 3.59,
    gfa: 448_255,
    zoning: "Residential",
    infrastructure: "Full road + utilities",
    paymentPlan: "5% Booking / 15% within 30 days SPA / 20% end of each year 1, 2, 3 & 4 from signing SPA",
    lat: 25.6646,
    lng: 55.7628,
  },
  {
    id: "ambd-d02-017",
    name: "AMBD D02-017",
    area: "Al Marjan Beach District",
    category: "residential",
    plotArea: 129_287,
    askingPrice: 232_793_930,
    pricePerSqFt: 1801,
    landUse: "Residential",
    location: "Al Marjan Beach District, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~20 min",
    casinoEta: "~5 min",
    maxHeight: "2B+G+11",
    far: 3.59,
    gfa: 464_140,
    zoning: "Residential",
    infrastructure: "Full road + utilities",
    paymentPlan: "5% Booking / 15% within 30 days SPA / 20% end of each year 1, 2, 3 & 4 from signing SPA",
    lat: 25.6639,
    lng: 55.7614,
  },
  // ── Al Nakheel ────────────────────────────────────────────────────────────
  {
    id: "nakheel-3120100077",
    name: "Nakheel 3120100077",
    area: "Al Nakheel",
    category: "mixed-use",
    plotArea: 15_370,
    askingPrice: 6_200_000,
    pricePerSqFt: 403,
    landUse: "Residential / Commercial / Mixed-Use",
    location: "Al Nakheel, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~15 min",
    casinoEta: "~15 min",
    maxHeight: "G+20",
    far: 10.5,
    gfa: 161_385,
    zoning: "Residential / Commercial / Mixed-Use",
    infrastructure: "Full road + utilities",
    lat: 25.796857,
    lng: 55.969447,
  },
  {
    id: "nakheel-hotel",
    name: "Nakheel Hotel Plot",
    area: "Al Nakheel",
    category: "mixed-use",
    plotArea: 120_000,
    askingPrice: 40_000_000,
    pricePerSqFt: 333,
    landUse: "Commercial / Residential",
    location: "Al Nakheel, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~15 min",
    casinoEta: "~15 min",
    maxHeight: "2B+G+9",
    zoning: "Commercial / Residential",
    infrastructure: "Full road + utilities",
    lat: 25.772931,
    lng: 55.965119,
  },
  // ── RAK Central ───────────────────────────────────────────────────────────
  {
    id: "corniche-3140010048",
    name: "Corniche Al Qawasim",
    area: "RAK Central",
    category: "mixed-use",
    plotArea: 14_920,
    askingPrice: 16_000_000,
    pricePerSqFt: 1072,
    landUse: "Commercial / Residential",
    location: "Corniche Al Qawasim, Dafan Al Khor, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~15 min",
    casinoEta: "~15 min",
    maxHeight: "G+M+6",
    far: 4,
    gfa: 59_680,
    zoning: "Commercial / Residential",
    infrastructure: "Full road + utilities",
    lat: 25.789835,
    lng: 55.949638,
  },
  // ── Al Maireed ────────────────────────────────────────────────────────────
  {
    id: "maireed-309010789",
    name: "Maireed 309010789",
    area: "Al Maireed",
    category: "mixed-use",
    plotArea: 17_934,
    askingPrice: 8_966_760,
    pricePerSqFt: 500,
    landUse: "Residential / Commercial",
    location: "Al Maireed, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~10 min",
    casinoEta: "~20 min",
    maxHeight: "B+G+4",
    far: 3,
    gfa: 53_802,
    zoning: "Residential / Commercial",
    infrastructure: "Full road + utilities",
    paymentPlan: "10% Booking / 10% within 30 days SPA — 15 instalment payment every 3 months",
    lat: 25.821900,
    lng: 55.966300,
  },
  {
    id: "maireed-309010790",
    name: "Maireed 309010790",
    area: "Al Maireed",
    category: "mixed-use",
    plotArea: 16_995,
    askingPrice: 8_497_290,
    pricePerSqFt: 500,
    landUse: "Residential / Commercial",
    location: "Al Maireed, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~10 min",
    casinoEta: "~20 min",
    maxHeight: "B+G+4",
    far: 3,
    gfa: 50_985,
    zoning: "Residential / Commercial",
    infrastructure: "Full road + utilities",
    paymentPlan: "10% Booking / 10% within 30 days SPA — 15 instalment payment every 3 months",
    lat: 25.821688,
    lng: 55.966080,
  },
  {
    id: "maireed-309010791",
    name: "Maireed 309010791",
    area: "Al Maireed",
    category: "mixed-use",
    plotArea: 26_706,
    askingPrice: 13_352_885,
    pricePerSqFt: 500,
    landUse: "Residential / Commercial",
    location: "Al Maireed, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~10 min",
    casinoEta: "~20 min",
    maxHeight: "B+G+4",
    far: 3,
    gfa: 80_118,
    zoning: "Residential / Commercial",
    infrastructure: "Full road + utilities",
    paymentPlan: "10% Booking / 10% within 30 days SPA — 15 instalment payment every 3 months",
    lat: 25.822100,
    lng: 55.966500,
  },
  {
    id: "maireed-rp-02",
    name: "Maireed Res RP-02",
    area: "Al Maireed",
    category: "residential",
    plotArea: 5_505,
    askingPrice: 1_926_743,
    pricePerSqFt: 350,
    landUse: "Residential",
    location: "Al Maireed, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~10 min",
    casinoEta: "~20 min",
    maxHeight: "B+G+1+Roof",
    far: 2.625,
    gfa: 14_451,
    zoning: "Residential",
    infrastructure: "Full road + utilities",
    paymentPlan: "10% Booking / 10% within 30 days SPA — 15 instalment payment every 3 months",
    lat: 25.827286,
    lng: 55.971158,
  },
  {
    id: "maireed-rp-22",
    name: "Maireed Res RP-22",
    area: "Al Maireed",
    category: "residential",
    plotArea: 7_786,
    askingPrice: 2_724_936,
    pricePerSqFt: 350,
    landUse: "Residential",
    location: "Al Maireed, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~10 min",
    casinoEta: "~20 min",
    maxHeight: "B+G+1+Roof",
    far: 2.625,
    gfa: 20_438,
    zoning: "Residential",
    infrastructure: "Full road + utilities",
    paymentPlan: "10% Booking / 10% within 30 days SPA — 15 instalment payment every 3 months",
    lat: 25.827500,
    lng: 55.971358,
  },
  {
    id: "maireed-rp-23",
    name: "Maireed Res RP-23",
    area: "Al Maireed",
    category: "residential",
    plotArea: 5_505,
    askingPrice: 1_926_743,
    pricePerSqFt: 350,
    landUse: "Residential",
    location: "Al Maireed, Ras Al Khaimah",
    plotType: "Single",
    airportEta: "~10 min",
    casinoEta: "~20 min",
    maxHeight: "B+G+1+Roof",
    far: 2.625,
    gfa: 14_451,
    zoning: "Residential",
    infrastructure: "Full road + utilities",
    paymentPlan: "10% Booking / 10% within 30 days SPA — 15 instalment payment every 3 months",
    lat: 25.828874,
    lng: 55.972228,
  },
];

/* ── Filter categories for Master Plan ── */
export const masterPlanFilters = [
  "Master Plan",
  "Residential",
  "Residential / Mixed-use",
  "Residential / Commercial",
  "Commercial / Residential",
  "Residential / Commercial / Mixed-Use",
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

/* ── Land categories (Jad: bundle by TYPE not area) ── */
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
    plotCount: 0, // no mock plots yet
  },
  {
    slug: "mixed-use",
    label: "Mixed-use",
    description: "Combined residential, retail, and hospitality zoning for versatile development.",
    plotCount: plots.filter((p) => p.category === "mixed-use").length,
  },
];

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
