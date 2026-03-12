# Changelog

All implemented changes are documented here, mapping back to spec/notes.md and spec/screens/.

---

## [v1.0] — 2026-03-05

### Baseline UI (matching spec/screens/)

1. **Project scaffolded** — Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
2. **Brand tokens configured** — Forest Green #003D2E, Deep Forest #273D37, Mint #87c6ae, Mint White #f7fbf8; Bahnschrift (headings), Graphik Web (body)
3. **Shared layout shell** — Dark forest-green sidebar, TopBar with Specialist badge, mint-gradient background, ContentCard wrapper component
4. **Landing page** (screens 00–01) — Full-screen hero with "NAMOU" wordmark and area picker dropdown
5. **RAK Landscape page** (screens 02–04) — Satellite map placeholder with landmark pins and gallery overlay showing 3 images per landmark
6. **Master Plan Overview** (screen 05) — Filterable zoning map with category pills (Residential, Hospitality, Convention Center & Hotel, Residential/Mixed-use)
7. **Asset Specifications** (screen 06) — Horizontal plot selector, Snapshot/Build Potential/Payment Plan tabs, spec tile grid
8. **Gallery** (screen 07) — Hero image with thumbnail strip, Images/Videos tabs
9. **Site Visit Itinerary** (screen 08) — VIP Access badge, schedule prompt, 6-item meeting timeline, Confirm CTA

### Jad's Requirements Applied (from spec/notes.md)

10. **Landing redesigned** — Removed glass design element and visual clutter; clean minimal layout; reduced margins (notes §1)
11. **Navigation restructured** — Sidebar now: Overview → Master Plan → Categories → ROI Explain → ROI Tool → Example Deal → Gallery → Next Steps → Final Offer (notes §Implementation Translation)
12. **Land categories by TYPE** — New /categories page with Residential, Commercial, Industrial, Mixed-use; each links to /categories/[type] listing (notes §3)
13. **Dedicated asset pages** — Each plot opens at /assets/[id] as a full page (no pop-up modals); clean structured spec list with Plot Size, Max Height, FAR, GFA, Zoning, Infrastructure Access (notes §4)
14. **ROI Explanation page** — Step-by-step formula: Development Assumptions → Construction Cost → Sellable Area → Sale Price → Profit Margin (notes §5)
15. **Interactive ROI Tool** — Live sliders for construction cost/sq ft, sale price/sq ft, NSA%, profit margin; auto-calculates ROI, Total Development Value, Maximum Land Price, GFA Price (notes §6)
16. **Example Deal (RAK Central)** — Demonstrates the ROI tool with realistic assumptions; construction cost corrected to $800/sq ft (notes §7)
17. **Namu Lands Gallery** — Existing gallery page updated with land photos placeholder (notes §8)
18. **CTA / Next Steps page** — Schedule site visit, book call, video meeting, submit offer (notes §9)
19. **Final Offer page** — Displays calculated GFA price, total land value, ROI; submit offer generates deal reference link (notes §10)
20. **Overview page** — Investment positioning statement with category navigation grid (notes §1)

### Technical Notes

- All data is mock (JSON fixtures in `src/data/mock.ts`) — no backend
- Maps are static placeholders (satellite and zoning); ready for future Mango platform integration
- ROI calculations are pure client-side JS
- Gallery images are placeholder SVGs; ready for real image assets
- Submit Offer generates a mock deal reference (no real signing integration)
