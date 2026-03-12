# Jad Requirements — Deck / UI Structure (Implementation Notes)

## Goal (what this becomes in code)
This “deck” should behave less like a brochure and more like an **interactive deal-structuring web app**:
- **Simple** (minimal UI clutter)
- **Interactive** (ROI calculated live during the call)
- **Educational** (teach ROI like a formula)
- **Transactional** (drive toward submitting an offer)

---

## 1) Landing / Overview
**Purpose:** introduce the opportunity and orient the client.

**Design rules**
- Remove unnecessary borders and visual clutter
- No “glass” design element
- Reduce margin thickness to maximize content space
- Keep a clean, modern interface similar to the website layout with navigation on the left

**Content**
- Namu/NEMU land investment overview
- Brief positioning statement
- Navigation to land categories

---

## 2) Master Plan Overview
**Purpose:** show the full development vision (keep it simple).

**Key changes**
- Simplify the master plan view
- Use an interactive map via Mango platform instead of heavy static zoom features
- Users should be able to zoom/explore themselves

**Content**
- Master plan map
- Highlight major districts
- Ability to filter by land type

---

## 3) Land Categories (bundle by TYPE, not by area)
**Purpose:** avoid clutter and make navigation + comparison easier.

**Categories**
- Residential
- Commercial
- Industrial
- Mixed-use

**Notes**
- This enables easier comparisons, standardized ROI calculations, and simpler navigation.
- Each category should list available plots within that type.

---

## 4) Individual Asset Pages (one page per plot)
**Purpose:** provide clear details for each specific plot.

**Key requirement**
- No pop-up asset specs
- Clicking an asset opens a dedicated page

**Content**
- Plot overview
- Location map
- Key metrics
- Development potential

**Asset specs section**
Use a clean structured list (not messy blocks), showing:
- Plot size
- Max height
- Floor Area Ratio (FAR)
- GFA
- Zoning
- Infrastructure access

**Important**
- Avoid “sales narration” of technical details — they should be clearly visible.

---

## 5) ROI Explanation (teach it like a formula)
**Purpose:** teach the investor the logic behind the deal.

**Style**
- Explain ROI like a specialist teaching a formula step-by-step.

**Slides/sections should explain**
1) Development assumptions  
2) Construction cost  
3) Sellable area  
4) Sale price assumptions  
5) Profit margin  

This should flow directly into the interactive calculation tool.

---

## 6) Interactive ROI Tool (core feature)
**Most important section of the entire experience.**
Instead of static numbers, the specialist changes variables live during the call.

**Adjustable variables**
- Construction cost per sq ft
- Expected sale price per sq ft
- Net sellable area percentage (NSA)
- Target developer profit margin

**Tool outputs (auto-calculated)**
- ROI
- Total development value
- Maximum land price
- GFA price

**Goal**
Reverse engineer the land price the investor is willing to offer.

---

## 7) Example Deal (RAK Central case)
Use one real example to demonstrate the ROI tool.

**Key correction**
- Construction cost should be ~ **$800/sq ft** (high-end tower), not $220/sq ft.

**Purpose**
- Demonstrate ROI tool operation
- Show realistic assumptions

---

## 8) Namu Lands Gallery
New section to show the plots visually.

**Content**
- Land photos
- Drone shots
- Area highlights

**Format**
- Gallery-style layout

---

## 9) Call-to-Action (strong action tools)
Deck/UI should lead to immediate next steps:
- Schedule a site visit
- Book another call
- Schedule a video meeting
- Submit an offer

**Submit Offer feature must**
- Generate a deal link
- Allow client to sign and secure the opportunity

---

## 10) Final Offer Calculation (closing)
End with:
“Based on your assumptions, your land offer would be:”

Display:
- Calculated GFA price
- Total land value
- ROI

Then move directly to **Submit Offer**.

---

## Implementation Translation (how this maps to the app)
- Left nav with sections: Overview → Master Plan → Categories → Asset → ROI Explain → ROI Tool → Example → Gallery → CTA → Final Offer
- Asset click routes to a dedicated page (no modal spec popups)
- ROI tool is interactive, stateful, and updates derived values instantly
- Keep UI minimal, clean, and consistent