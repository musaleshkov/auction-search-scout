# Auction Scout — Comprehensive Project Description

> A walkthrough of every decision, feature, and line of code in this full-stack auction search application.

---

## Table of Contents

1. [Project Vision & Purpose](#1-project-vision--purpose)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Tech Stack & Justifications](#3-tech-stack--justifications)
4. [Backend Deep Dive](#4-backend-deep-dive)
5. [Frontend Deep Dive](#5-frontend-deep-dive)
6. [Data Flow & State Management](#6-data-flow--state-management)
7. [Key Design Decisions & Rationale](#7-key-design-decisions--rationale)
8. [Component API Reference](#8-component-api-reference)
9. [Security & Performance](#9-security--performance)
10. [Testing Strategy](#10-testing-strategy)
11. [Assumptions & Trade-offs](#11-assumptions--trade-offs)
12. [Future Enhancements](#12-future-enhancements)

---

## 1. Project Vision & Purpose

This project is a **mini auction search interface** built to demonstrate a full-stack auction discovery platform where users can browse, search, filter, sort, and inspect 60 curated auction lots from international auction houses across art, antiques, jewellery, furniture, and collectibles.

### Core Problem It Solves

A user (collector, dealer, or enthusiast) arrives at an auction platform wanting to find specific items. They need to:

- **Search** by title or description to find relevant lots quickly
- **Filter** by category (Art, Furniture, Jewellery, etc.) and country of the auction house
- **Sort** by estimated price (low-to-high or high-to-low) to find items in their budget
- **Paginate** through results without overwhelming the UI
- **Inspect** a single lot in a detailed modal view

The application serves this use case with a clean, responsive, accessible interface backed by a performant REST API, while demonstrating professional-grade engineering practices.

---

## 2. High-Level Architecture

### Monorepo Structure

```
auction-scout/
├── apps/
│   ├── api/                     # Express backend (Node.js + TypeScript)
│   │   ├── data/lots.json       # Static dataset: 60 auction lots
│   │   ├── src/
│   │   │   ├── server.ts        # Express app, routes, middleware
│   │   │   ├── lots.service.ts  # Filter → Sort → Paginate pipeline
│   │   │   ├── lots.service.test.ts
│   │   │   └── types.ts         # Lot, LotsQuery, LotsResponse types
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                     # Next.js frontend (React 19 + TypeScript)
│       ├── src/
│       │   ├── app/             # Next.js App Router: layout, page, loading
│       │   ├── components/      # Header, FilterBar, LotCard, LotModal, etc.
│       │   ├── hooks/           # useLotSearch, useDebounce
│       │   ├── lib/             # api client, constants, formatters
│       │   └── types/           # Frontend type definitions
│       ├── vitest.config.mts
│       ├── next.config.ts
│       └── package.json
├── README.md
└── PROJECT_DESCRIPTION.md       # This document
```

### Data Flow Diagram

```
┌─────────────┐     HTTP (REST)      ┌──────────────┐
│             │ ◄─────────────────► │              │
│  Next.js    │    GET /lots         │  Express API │
│  Frontend   │    GET /lots/:id     │  Backend     │
│  :3000      │    GET /health       │  :4000       │
│             │                      │              │
└──────┬──────┘                      └──────┬───────┘
       │                                    │
       │ debounced user input               │ in-memory Lot[] cache
       │ (search, category, country,        │ (Object.freeze, loaded from
       │  sort, page, limit)                │  lots.json at startup)
       │                                    │
       ▼                                    ▼
┌──────────────┐                   ┌──────────────┐
│  useLotSearch│                   │ buildLots    │
│  hook        │                   │ Response()   │
│              │                   │              │
│ - state mgmt│                   │ 1. Filter    │
│ - debounce  │                   │ 2. Sort      │
│ - fetch     │                   │ 3. Paginate  │
│ - merge     │                   │ 4. Enrich    │
│   filters   │                   └──────────────┘
└──────────────┘
```

### Separation of Concerns

| Layer | Responsibility | Technologies |
|-------|---------------|-------------|
| **Data** | Static JSON dataset with 60 auction lots | `lots.json` |
| **API** | Input validation, business logic (filter/sort/paginate), caching headers, rate limiting | Express, Zod, express-rate-limit, CORS |
| **Client** | User interface, state management, debounced input, accessibility | Next.js, React, Tailwind CSS, custom hooks |

The frontend is a **thin presentation layer** — all data processing (filtering, sorting, pagination) happens server-side. The frontend's job is to capture user intent, send it as query parameters, and render the response.

---

## 3. Tech Stack & Justifications

### Frontend

| Technology | Why It Was Chosen |
|-----------|-------------------|
| **Next.js 16** | App Router with React Server Components, Suspense boundaries (`loading.tsx`), SSR/SSG capabilities for future enhancements, file-based routing that eliminates boilerplate |
| **React 19** | Latest React with improved hooks, concurrent features, and `<Suspense>` for graceful loading states |
| **TypeScript** | Type safety across the entire codebase — catches bugs at compile time, documents component interfaces, enables safe refactoring |
| **Tailwind CSS 4** | Utility-first CSS that keeps styles co-located with components, eliminates CSS specificity wars, produces tiny production bundles via tree-shaking, and enables rapid iteration on visual design |
| **Vitest + Testing Library** | Fast, Vite-native test runner; Testing Library encourages testing behavior over implementation details |

### Backend

| Technology | Why It Was Chosen |
|-----------|-------------------|
| **Express** | Minimal, unopinionated Node.js framework — perfect for a small API; enormous ecosystem |
| **TypeScript** | Same type safety benefits as frontend; shared mental model across the stack |
| **Zod** | Schema-based runtime validation with detailed error messages; catches malformed query parameters before they reach business logic |
| **express-rate-limit** | Simple, configurable rate limiting to prevent API abuse |
| **CORS** | Restricts cross-origin requests to the known frontend origin only |

### Key Libraries Not Used (Deliberate Omissions)

- **No state management library** (Redux, Zustand, etc.) — the app's state is simple enough for `useState` + `useEffect` in a single custom hook
- **No UI component library** (MUI, shadcn/ui, etc.) — every component is hand-built to demonstrate component design and accessibility skills
- **No shared types package** — types are intentionally co-located per app to keep each app self-contained without monorepo workspace tooling
- **No database** — the 60-item dataset fits comfortably in memory for this project

---

## 4. Backend Deep Dive

### File: `apps/api/src/server.ts`

This is the Express application entry point. It sets up all middleware, routes, and the startup sequence.

#### Middleware Stack (Applied in Order)

```
Request
  │
  ├── 1. CORS ──────────── Allows only configured origin (default: localhost:3000)
  │
  ├── 2. express.json() ── Parses JSON request bodies (not used by current routes, but
  │                         available for future POST/PATCH endpoints)
  │
  ├── 3. Rate Limiter ──── 100 requests per 15-second window per IP
  │                         Returns 429 with { error: "Too many requests..." }
  │
  ├── 4. Route Handlers ── /health, /lots, /lots/:id (described below)
  │
  └── 5. Global Error ──── Catches unhandled errors, logs them, returns 500
       Handler             with { error: "Internal server error" }
```

#### Why Rate Limiting of 100 req / 15s?

This is intentionally generous for a development/demo app. In production, this would be tighter (e.g., 30 req / 60s). The 15-second window was chosen so a user rapidly paginating, searching, and filtering doesn't hit the limit during normal use. The `standardHeaders: true` option sends `RateLimit-*` headers so the client can inspect remaining quota.

#### Startup: `loadLotsAtStartup()`

```typescript
async function loadLotsAtStartup(): Promise<void> {
  const dataPath = process.env.LOTS_DATA_PATH || path.resolve(__dirname, "../data/lots.json");
  const json = await fs.readFile(dataPath, "utf-8");
  const data = JSON.parse(json) as Lot[] | { lots: Lot[] };

  let raw: Lot[] = [];
  if (Array.isArray(data)) {
    raw = data;
  } else if ("lots" in data && Array.isArray(data.lots)) {
    raw = data.lots;
  }

  cachedLots = Object.freeze(raw) as readonly Lot[];
}
```

**Key decisions:**

1. **Async file read** — uses `fs/promises` (non-blocking). The server doesn't start listening until data is loaded, but the read itself doesn't block the event loop.
2. **Flexible JSON parsing** — accepts both `[...]` (array at root) and `{ lots: [...] }` (object wrapper). This makes the data file format resilient to upstream changes.
3. **`Object.freeze`** — freezes the array in-place. Any accidental mutation attempt (e.g., `cachedLots[0].title = "x"`) throws in strict mode. This protects the shared in-memory cache across all requests. The `as readonly Lot[]` type assertion ensures TypeScript also prevents mutations at compile time.

#### Routes

##### `GET /health`

Returns `{ "status": "ok" }`. Used by load balancers, container orchestrators (Kubernetes), and monitoring tools to verify the service is alive. No caching headers — health checks should always hit the server.

##### `GET /lots` — The Main Endpoint

```
Request: GET /lots?search=desk&category=Furniture&country=SE&sort=estimate-desc&page=1&limit=12

Step 1: Zod Validation (ListLotsQuerySchema)
  ├── search:     string | undefined
  ├── category:   string | undefined
  ├── country:    string | undefined
  ├── sort:       "none" | "estimate-asc" | "estimate-desc"  (default: "none")
  ├── page:       number, integer, >= 1  (default: 1, coerced from string)
  └── limit:      number, integer, >= 1, <= 60  (default: 12, coerced from string)

Step 2: If validation fails → 400 with detailed field errors
  Example: { error: "Invalid query parameters", details: { page: ["Expected number, got 'abc'"] } }

Step 3: Pass validated query + frozen lots to buildLotsResponse()

Step 4: Set Cache-Control header → "public, max-age=30, stale-while-revalidate=300"
        CDN/browser caches for 30 seconds; serves stale for up to 5 minutes while revalidating

Step 5: Return JSON response
```

**Why `z.coerce.number()` for page and limit?** Query parameters arrive as strings in Express. `z.coerce.number()` automatically converts `"1"` → `1` and `"12"` → `12` before validation. This means the client doesn't need to manually parse integers.

**Why `max: 60` on limit?** Prevents a single request from returning all lots at once (which would defeat the purpose of pagination and could strain the client). Since the dataset has exactly 60 lots, this is also the maximum meaningful page size.

##### `GET /lots/:id` — Single Lot Detail

```
Request: GET /lots/lot_042

Step 1: Array.find() on cachedLots by id
Step 2: If found → set Cache-Control: max-age=60, return lot object
Step 3: If not found → 404 with { error: "Lot not found" }
```

This endpoint exists for future use (deep linking, SSR detail pages) but is **not currently called by the frontend**. The modal receives lot data in-memory from the already-fetched list — an intentional design choice explained in [§7](#7-key-design-decisions--rationale).

---

### File: `apps/api/src/lots.service.ts` — The Business Logic Engine

This is where all data transformation happens. The function `buildLotsResponse(lots, query)` implements a **cascading pipeline**:

```
Input: readonly Lot[] (all 60 lots, frozen) + validated LotsQuery

┌─────────────────────────────────────────────────────────┐
│ PHASE 1: FILTER                                         │
│ ────────────────                                        │
│ For each lot, check:                                    │
│   ✓ search match?   (case-insensitive, title OR desc)   │
│     - If search is empty/undefined → always match       │
│     - Otherwise: lot.title.includes(search) OR          │
│                   lot.description.includes(search)      │
│                                                         │
│   ✓ category match? (exact match or undefined)          │
│   ✓ country match?  (exact match or undefined)          │
│                                                         │
│ All three must pass (AND logic)                         │
└───────────────────────────┬─────────────────────────────┘
                            │ filteredLots (subset of all lots)
                            ▼
┌─────────────────────────────────────────────────────────┐
│ PHASE 2: SORT                                           │
│ ──────────────                                          │
│ If sort === "estimate-asc":                             │
│   → Create shallow copy, sort by estimate_low ASC       │
│                                                         │
│ If sort === "estimate-desc":                            │
│   → Create shallow copy, sort by estimate_high DESC     │
│                                                         │
│ If sort === "none":                                     │
│   → Preserve original order (as loaded from JSON)       │
│                                                         │
│ NOTE: Uses [...filteredLots].sort() — spreads into new  │
│ array to avoid mutating the original filteredLots       │
└───────────────────────────┬─────────────────────────────┘
                            │ sortedLots
                            ▼
┌─────────────────────────────────────────────────────────┐
│ PHASE 3: PAGINATE                                       │
│ ─────────────────                                       │
│ limit  = clamp(query.limit,  1, 60) → default 12       │
│ page   = clamp(query.page,   1, totalPages)            │
│          This prevents "page=999" from returning empty  │
│                                                         │
│ startIndex = (page - 1) * limit                         │
│ paginatedLots = filteredLots.slice(start, start+limit)  │
└───────────────────────────┬─────────────────────────────┘
                            │ paginatedLots
                            ▼
┌─────────────────────────────────────────────────────────┐
│ PHASE 4: ENRICH                                          │
│ ────────────────                                        │
│ Map each lot to include country_name:                   │
│   "SE" → "Sweden", "UK" → "United Kingdom", etc.       │
│ Uses a static COUNTRY_NAMES lookup table                │
└───────────────────────────┬─────────────────────────────┘
                            │ enriched data
                            ▼
┌─────────────────────────────────────────────────────────┐
│ PHASE 5: COMPUTE FILTERS                                │
│ ─────────────────────────                               │
│ Extract unique categories from ALL filtered lots (not   │
│ just the paginated page):                               │
│   new Set(filteredLots.map(lot => lot.category)).sort() │
│                                                         │
│ Extract unique countries from ALL filtered lots:        │
│   new Set(filteredLots.map(lot => lot.country)).sort()  │
│                                                         │
│ This enables dynamic dropdowns that reflect the         │
│ currently matching results, not all 60 lots globally    │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
                    LotsResponse {
                      data:      EnrichedLot[],
                      meta:      { total, page, limit, totalPages, hasNextPage, hasPreviousPage },
                      filters:   { categories, countries }
                    }
```

#### Important: Filters Come from Filtered Results, Not All Lots

The `categories` and `countries` arrays in the response are computed from the **filtered** (but pre-pagination) lot set. This means:

- If you search "diamond" and only Jewellery lots match → the category dropdown shows only "Jewellery", not "Furniture" or "Art"
- If you filter by country "SE" (Sweden) → the country dropdown still shows all countries present in the Sweden-filtered results

This is the standard UX pattern for faceted search: **filters show what's available given the current constraints.**

#### The Sort Creates a Copy — Why?

```typescript
filteredLots = [...filteredLots].sort((a, b) => a.estimate_low - b.estimate_low);
```

`Array.sort()` mutates in-place. Creating a shallow copy with `[...filteredLots]` prevents side effects. The original `filteredLots` array (and by extension `cachedLots`, since `filter()` creates a new array) remains unmodified. This is defensive programming — if the pipeline were extended later, the original order would still be available.

---

### File: `apps/api/src/types.ts` — Backend Type Definitions

```typescript
export type Lot = {
  id: string;              // e.g., "lot_001"
  title: string;           // e.g., "18th Century Oak Writing Desk"
  description: string;     // Detailed description
  category: string;        // e.g., "Furniture", "Art", "Jewellery"
  country: string;         // ISO 3166-1 alpha-2 code: "SE", "UK", "FR"
  country_name: string;    // Resolved by the API: "Sweden", "United Kingdom"
  auction_house: string;   // e.g., "Stockholms Auktionsverk"
  estimate_low: number;    // Lower estimate in the lot's native currency
  estimate_high: number;   // Upper estimate in the lot's native currency
  currency: string;        // "SEK", "GBP", "EUR", "USD"
  image_url: string;       // URL to lot image (Unsplash)
};

export type LotsResponse = {
  data: Lot[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    categories: string[];   // Available categories in current result set
    countries: string[];    // Available country codes in current result set
  };
};
```

**Note on co-located types:** These types are duplicated in the frontend (`apps/web/src/types/lot.ts`). This is intentional — each app is self-contained and can be deployed independently. A monorepo workspace with a shared `@auction-scout/types` package would be the production approach (listed in Future Enhancements).

---

## 5. Frontend Deep Dive

### App Router Structure

```
apps/web/src/app/
├── layout.tsx       # Root layout: <html>, <body>, fonts, metadata
├── page.tsx         # Home page (client component): orchestrates all UI
├── loading.tsx      # Suspense fallback: full-page skeleton during initial load
├── globals.css      # Tailwind v4 import + CSS custom properties
└── favicon.ico
```

#### `layout.tsx` — Root Layout

Uses Next.js 14+ `next/font/google` with Geist and Geist Mono (Vercel's typefaces, optimized for UI). The `variable` font approach injects CSS custom properties (`--font-geist-sans`, `--font-geist-mono`) that can be used in Tailwind classes.

The `lang="en"` attribute on `<html>` is critical for screen reader pronunciation. `antialiased` enables subpixel font smoothing.

```typescript
export const metadata: Metadata = {
  title: "Auction Scout",
  description: "Search, filter, and explore auction lots from international auction houses",
};
```

This metadata is used by search engines and social media previews. In a production app, this would include OpenGraph tags.

#### `loading.tsx` — Suspense Boundary (Full-Page Skeleton)

Next.js App Router automatically wraps `page.tsx` in a `<Suspense>` boundary using `loading.tsx`. While the page is loading (on first navigation or hard refresh), this component renders a **skeleton version of the entire page**:

- Skeleton header with animated pulse placeholders for the hero banner, title, and stat cards
- Skeleton filter bar with four animated rectangles matching the four filter inputs
- Grid of `PAGE_SIZE` (12) `<LotCardSkeleton />` components

This provides instant visual feedback — users see the page structure immediately rather than a blank screen. The skeleton matches the real layout pixel-for-pixel, reducing layout shift when real content arrives.

---

### Component Tree

```
<main> (page.tsx)
├── <Header>
│     Shows hero banner with stat cards (total lots, categories, countries)
├── <FilterBar>
│   ├── <input type="text">          # Search (title + description)
│   ├── <SelectField label="Category">  # Custom listbox dropdown
│   ├── <SelectField label="Country">   # Custom listbox dropdown
│   └── <SelectField label="Sort">      # Custom listbox dropdown
├── Status bar (results count + "Clear filters" button)
├── Error banner (conditional, role="alert")
├── Empty state (conditional)
├── Grid of <LotCard> or <LotCardSkeleton>
│   └── <button> → onClick opens <LotModal>
└── <Pagination>
      Previous | Page X of Y | Next
```

#### `Header.tsx` — Hero Banner with Stats

A decorative header that serves three purposes:

1. **Branding** — "Auction Scout" badge + "Open Source" badge
2. **Value proposition** — Hero headline "Discover auction lots across global markets" with supporting copy
3. **Live statistics** — Three stat cards showing:
   - **Auction lots**: Current `total` from the API (changes with filters)
   - **Categories**: Number of distinct categories in the current result set
   - **Countries**: Number of distinct countries in the current result set

The stat cards show `"—"` (em dash) when the value is zero (e.g., before first load), preventing "0 auction lots" from flashing. Stats update in real-time as filters change.

The right-side amber gradient (`.bg-linear-to-l from-amber-100/70 to-transparent`) is a purely decorative element visible only on large screens (`lg:block`).

#### `FilterBar.tsx` — Search + Filter + Sort Controls

A controlled component that receives all state and callbacks via props. It contains:

1. **Search input** (`<input>`) — uncontrolled in the traditional sense (value is controlled by React state, but typing is handled natively). Every keystroke fires `onQueryChange`, which updates `query` in `useLotSearch`. The actual API call happens after 300ms debounce.

2. **Category select** — `<SelectField>` with dynamically populated options. Options come from the `useMemo` in `page.tsx` that maps `categories` (accumulated from API responses) to `{ value, label }` pairs, prepended with "All categories" (empty string value).

3. **Country select** — Same pattern as Category, but options are mapped through `COUNTRY_NAMES` lookup to show full names ("Sweden" instead of "SE").

4. **Sort select** — Three fixed options: "No sorting", "Estimate: Low to high", "Estimate: High to low".

All filter changes call `setPage(1)` — any change to search/filter/sort resets pagination to the first page. This prevents a "page 5 of 2" scenario where changing filters reduces the total page count.

#### `SelectField.tsx` — Custom Listbox Dropdown

**Why custom instead of native `<select>`?** Native `<select>` elements are notoriously difficult to style consistently across browsers and operating systems. The custom implementation provides:

**ARIA Compliance (Listbox Pattern):**
- `role="listbox"` on the dropdown container
- `role="option"` on each item
- `aria-selected` on the currently selected option
- `aria-expanded` on the trigger button (toggles `true`/`false`)
- `aria-haspopup="listbox"` tells screen readers a listbox will appear
- `aria-controls` links the button to the listbox by ID
- `sr-only` `<span>` provides a text label for screen readers

**Keyboard & Mouse Interaction:**
- **Click outside** — a `document.addEventListener("click", ...)` listener detects clicks outside the wrapper and closes the dropdown
- **Escape key** — a `window.addEventListener("keydown", ...)` listener closes the dropdown on Escape
- **Click to select** — clicking an option calls `onChange` and closes the dropdown
- **Click toggle** — clicking the trigger button toggles the dropdown open/closed

**Visual Feedback:**
- Chevron SVG rotates 180° when open (CSS `rotate-180` transition)
- Selected option shows in the trigger with text truncation
- Hover state on options: amber-tinted background
- Selected option: dark background (`bg-stone-950`) with white text and "Selected" indicator
- Hover on trigger: amber border + amber background tint

**`useId()`** generates a unique ID for the `aria-controls`/`id` relationship, preventing ID collisions if multiple `SelectField` components exist on the page.

#### `LotCard.tsx` — Auction Lot Card

Each card is a `<button>` wrapped in an `<article>`, making the entire card clickable and keyboard-accessible. Key details:

**Image Handling:**
1. **Unsplash optimization** — `getOptimizedImageUrl()` parses the image URL. If it's from `images.unsplash.com`, it appends `?w=600` to request a 600px-wide version instead of the original (likely much larger). This saves bandwidth.
2. **Lazy loading** — `loading={isPriority ? "eager" : "lazy"}` loads only the first 4 cards eagerly (above the fold); the rest are lazy-loaded.
3. **`fetchPriority="high"`** — browser hint for the first 4 images to prioritize their download.
4. **Error fallback** — `onError` handler swaps `src` to a `PLACEHOLDER_IMAGE` (generic Unsplash image) if the original fails to load.

**Content Structure:**
- Category + Country (top row, small text)
- Title (2-line clamp with `line-clamp-2`, min 56px height to prevent layout shift)
- Auction house name (1 line, `line-clamp-1`)
- Estimate price (amber-colored, formatted via `formatEstimate()`)
- Description (3-line clamp with `line-clamp-3`, min 72px height)

The fixed card height (`h-[520px]`) and `min-height` values on text elements ensure all cards are the same size regardless of content length, maintaining a clean grid.

**Keyboard Support:**
- `Enter` or `Space` on the focused card opens the modal (prevented default Space scroll)
- `onClick` handles mouse/touch activation

#### `LotCardSkeleton.tsx` — Animated Loading Placeholder

Six animated rectangles (`animate-pulse`) that mirror the exact layout of `<LotCard>`:
- Image area (224px = `h-56`)
- Category + Country row
- Title area (56px = `h-14`, matching `min-h-14`)
- Auction house area
- Estimate price area
- Description area (72px = `h-18`, matching `min-h-18`)

`aria-hidden="true"` hides these from screen readers (loading indicators are purely visual; the `aria-busy="true"` on the grid container and `aria-live` status text handle the loading announcement).

#### `Pagination.tsx` — Previous/Next Controls

A simple navigation component that:
- **Hides entirely** when `totalPages <= 1` (no pagination needed for a single page)
- **Disables** Previous when on page 1 / Next when on the last page
- **Disables both** while loading (preventing race conditions from rapid clicks)
- Uses `Math.max(1, page - 1)` and `Math.min(totalPages, page + 1)` for safe boundary clamping
- `aria-live="polite"` announces page changes to screen readers

#### `LotModal.tsx` — Detail Modal with Focus Trapping

The most accessibility-focused component in the application.

**Opening the Modal:**
1. Sets `document.body.style.overflow = "hidden"` to prevent background scrolling
2. After a microtask (`setTimeout 0`), focuses the close button — this ensures the DOM has rendered before attempting focus

**Closing the Modal:**
1. Restores `document.body.style.overflow` to its previous value (saved in a closure)
2. Removes the keydown event listener
3. Triggered by: Close button click, backdrop click, or Escape key

**Focus Trapping (Tab / Shift+Tab):**
```typescript
if (event.key === KEY.Tab && modalRef.current) {
  const focusable = modalRef.current.querySelectorAll<HTMLElement>(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])",
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();  // Wrap from first → last
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault();
      first.focus(); // Wrap from last → first
    }
  }
}
```

This queries all focusable elements within the modal and implements a circular tab order. When Tab is pressed on the last focusable element, focus wraps to the first. When Shift+Tab is pressed on the first element, focus wraps to the last. This keeps keyboard focus locked inside the modal (WCAG 2.1 Success Criterion 2.4.3).

**Backdrop Click:**
- `onClick={onClose}` on the outer overlay div closes the modal
- `onClick={(e) => e.stopPropagation()}` on the inner content div prevents closing when clicking the modal itself
- This is the standard modal dismissal pattern

**ARIA:**
- `role="dialog"` and `aria-modal="true"` announce the modal to screen readers
- `aria-labelledby="lot-modal-title"` links to the `<h2>` for the accessible name

**Why Modal Gets Data In-Memory:**
The lot data is passed as a prop from the already-fetched `lots` array in `page.tsx`. The modal does NOT call `GET /lots/:id`. This is instantaneous (no loading state needed) and avoids a redundant network request. See [§7](#7-key-design-decisions--rationale) for the full reasoning.

---

### Custom Hooks

#### `useDebounce.ts` — Generic Debounce Hook

```typescript
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**How it works:**
1. Takes a `value` (generic type `T`) and optional `delay` (default 300ms)
2. Every time `value` changes, a new timeout is set
3. If `value` changes again before the timeout fires, the cleanup function clears the previous timeout
4. Only after `delay` ms of inactivity does `debouncedValue` update

**Why 300ms?** This is the sweet spot between responsiveness and API load:
- Too fast (100ms): fires API calls during mid-typing, wasteful
- Too slow (500ms): feels sluggish, users notice the delay
- 300ms: users perceive near-instant results while eliminating unnecessary intermediate calls

#### `useLotSearch.ts` — The Central State Hook

This is the brain of the frontend. It encapsulates all fetch logic, state management, and filter coordination.

**State Variables:**
| State | Type | Purpose |
|-------|------|---------|
| `lots` | `Lot[]` | Current page of auction lots |
| `query` | `string` | Raw search input (before debounce) |
| `category` | `string` | Selected category filter |
| `country` | `string` | Selected country filter |
| `sort` | `SortOption` | Current sort order |
| `page` | `number` | Current page number |
| `categories` | `string[]` | Accumulated categories across searches |
| `countries` | `string[]` | Accumulated country codes across searches |
| `total` | `number` | Total matching lots count |
| `totalPages` | `number` | Total pages for current query |
| `isLoading` | `boolean` | Is a fetch in progress? |
| `error` | `string` | Error message (empty string = no error) |

**The `isMounted` Pattern:**
```typescript
let isMounted = true;

// ... after await:
if (!isMounted) return;

return () => {
  isMounted = false;
};
```

This prevents **state updates on unmounted components**. If the user navigates away while a fetch is in-flight, the component cleanup sets `isMounted = false`. When the fetch resolves, the `if (!isMounted) return` guard prevents calling `setLots`, `setCategories`, etc. on an unmounted component (which would cause a React warning).

**Merged Filter Accumulation (Key Design Pattern):**
```typescript
setCategories((prev) => {
  const merged = new Set([...prev, ...response.filters.categories]);
  return Array.from(merged);
});
```

This is NOT a simple replacement (`setCategories(response.filters.categories)`). Instead, it **merges** new categories into previously seen categories. This means:

1. User searches "diamond" → categories dropdown shows ["Jewellery"]
2. User clears search → categories dropdown now shows ["Jewellery", "Art", "Furniture", ...]
3. The "Jewellery" value persists even though it wasn't in the second response

**Why merge?** If we replaced categories on every request, the dropdown would shrink and grow as filters change, potentially removing a filter the user was about to select. The merge strategy ensures dropdowns only grow — values are never lost. This is documented as a deliberate assumption in the README.

**useEffect Dependencies:**
```typescript
useEffect(() => {
  loadLots();
  return () => { isMounted = false; };
}, [debouncedQuery, category, country, sort, page]);
```

The effect re-runs whenever any filter changes. Since `debouncedQuery` only updates after 300ms of typing inactivity, rapid typing doesn't trigger excessive API calls.

**`clearFilters()`:**
Resets `query`, `category`, `country`, `sort`, and `page` to their defaults. Wrapped in `useCallback` to maintain reference stability (though in this simple app, it doesn't make a practical difference — it's a best-practice habit).

---

### Utility Modules

#### `lib/api.ts` — API Client

A thin `fetch` wrapper that:
1. Constructs a URL with query parameters using the `URL` and `URLSearchParams` APIs (safer than string concatenation)
2. Only appends parameters when they have values (no `?search=&category=`)
3. Throws descriptive errors on non-OK responses, attempting to extract the API error message
4. Returns the parsed JSON response

The base URL comes from `NEXT_PUBLIC_API_BASE_URL` environment variable (default: `http://localhost:4000`).

#### `lib/constants.ts` — Shared Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `PLACEHOLDER_IMAGE` | Unsplash URL | Fallback image when a lot's image fails to load |
| `PAGE_SIZE` | 12 (configurable via env) | Items per page, used for both API requests and skeleton grid count |
| `KEY` | Object with Enter, Space, Escape, Tab | Keyboard key constants — avoids magic strings and typos |
| `COUNTRY_NAMES` | Record mapping ISO codes to names | Used by the frontend for displaying full country names in dropdowns |

The `KEY` object uses `as const` (const assertion) so TypeScript infers literal types:
```typescript
// Without as const: KEY.Enter → string (too broad)
// With as const:    KEY.Enter → "Enter" (exact literal)
```

This enables exhaustiveness checks if needed and prevents accidentally passing wrong values.

#### `lib/formatEstimate.ts` — Currency + Estimate Formatting

```typescript
export function formatEstimate(lot: Lot): string {
  return `${lot.currency} ${lot.estimate_low.toLocaleString()} – ${lot.estimate_high.toLocaleString()}`;
}
```

`toLocaleString()` adds thousands separators according to the user's locale (e.g., "4,500" in en-US, "4 500" in fr-FR, "4.500" in de-DE). The en dash (`–`) is typographically correct for ranges (vs. hyphen `-` or minus `−`).

---

## 6. Data Flow & State Management

### Complete Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│ USER ACTION                                                         │
│ Types "desk" in the search input                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │ onChange → onQueryChange("desk")
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ useLotSearch                                                        │
│ setQuery("desk")  →  query state updates immediately               │
│                       ↓                                             │
│ useDebounce("desk", 300) → starts 300ms timer                      │
│                       ↓ (user stops typing)                        │
│                       ↓ (300ms passes with no new keystrokes)      │
│ debouncedQuery = "desk"                                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │ debouncedQuery changes
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ useEffect([debouncedQuery, category, country, sort, page])         │
│                                                                     │
│ 1. setIsLoading(true)                                               │
│ 2. setError("")                                                     │
│ 3. getLots({ search: "desk", category: "", country: "",            │
│              sort: "none", page: 1, limit: 12 })                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP GET
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ fetch("http://localhost:4000/lots?search=desk&page=1&limit=12")    │
└────────────────────────────┬────────────────────────────────────────┘
                             │ Network
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ EXPRESS API (server.ts: GET /lots)                                  │
│                                                                     │
│ 1. Rate limiter: check IP quota                                     │
│ 2. Zod validation: parse & validate query params                   │
│    search="desk", page=1, limit=12 → valid                         │
│ 3. buildLotsResponse(cachedLots, validatedQuery)                   │
│ 4. Set Cache-Control header                                         │
│ 5. res.json(response)                                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │ JSON Response
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ buildLotsResponse():                                                │
│   Filter → Sort → Paginate → Enrich → Compute Filters              │
│                                                                     │
│ Returns:                                                            │
│ {                                                                   │
│   data: [ { id: "lot_001", title: "18th Century Oak Writing Desk", │
│             ... country_name: "Sweden" }, ... ],                    │
│   meta: { total: 3, page: 1, limit: 12, totalPages: 1, ... },     │
│   filters: { categories: ["Furniture"], countries: ["SE"] }       │
│ }                                                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP Response
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ useLotSearch (continued)                                            │
│                                                                     │
│ if (!isMounted) return;  ← guard against unmount                   │
│                                                                     │
│ setLots(response.data)          → 3 lots                           │
│ setCategories(prev → merge)     → ["Furniture"]                    │
│ setCountries(prev → merge)      → ["SE"]                           │
│ setTotal(3)                                                         │
│ setTotalPages(1)                                                    │
│ setIsLoading(false)                                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │ State updates trigger re-render
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ page.tsx Re-renders                                                 │
│                                                                     │
│ isLoading = false → show LotCard components instead of skeletons   │
│ Header receives total={3}, categoryCount={1}, countryCount={1}    │
│ Status bar shows "Showing 3 of 3 auction lots"                     │
│ Grid renders 3 <LotCard> components                                │
│ Filter dropdowns updated with merged categories/countries          │
└─────────────────────────────────────────────────────────────────────┘
```

### Page Reset on Filter Change

Every filter change handler in `page.tsx` follows this pattern:
```typescript
onCategoryChange={(value) => {
  setCategory(value);
  setPage(1);  // ← always reset to page 1
}}
```

This is critical for correctness. Without it, imagine:
1. User is on page 5 of 6 (browsing all lots)
2. User filters by "Jewellery" (only 3 results, 1 page)
3. Frontend requests `?category=Jewellery&page=5`
4. API returns 0 results (page 5 exceeds total pages for the filtered set)
5. User sees "No auction lots match your filters" — confusing!

Resetting to page 1 on any filter change prevents this entire class of bugs.

---

## 7. Key Design Decisions & Rationale

### 1. Server-Side Filtering & Pagination

**Decision:** All data processing (filter, sort, paginate) happens in the Express API. The frontend is a thin presentation layer.

**Rationale:**
- **Single source of truth** — business logic lives in one place
- **Reduced client bundle** — no filtering/sorting libraries needed on the frontend
- **Scalability** — when the dataset grows beyond 60 items, the backend can switch to database queries without a single frontend change
- **Network efficiency** — only the needed page of results travels over the wire

### 2. `Object.freeze` on the In-Memory Cache

**Decision:** The loaded lot data is frozen at startup with `Object.freeze(raw)`.

**Rationale:**
- Prevents accidental mutation of shared state across requests
- In a single-threaded Node.js environment, accidental mutation would persist for all subsequent requests
- `Object.freeze` throws in strict mode if mutation is attempted, catching bugs immediately
- The `readonly Lot[]` type assertion provides compile-time enforcement

### 3. Country Name Resolution in the API

**Decision:** The API enriches each lot with `country_name` (e.g., "Sweden" for "SE") rather than leaving it to the frontend.

**Rationale:**
- **Single source of truth** — the country-to-name mapping lives only in `lots.service.ts`
- **Avoids duplication** — the frontend's `COUNTRY_NAMES` constant exists only for dropdown display (country codes → labels), not for per-lot enrichment
- **Future-proof** — if country names need to be localized (English vs. French vs. Swedish names), the API can handle it without frontend changes
- The `COUNTRY_NAMES` in `constants.ts` uses the fallback `COUNTRY_NAMES[code] ?? code` — if a new country code appears, it displays the raw code instead of crashing

### 4. Merged Filter Accumulation

**Decision:** The category and country dropdowns **merge** new values with previously seen values (via `Set`), rather than replacing on each API response.

**Rationale:**
- **UX stability** — dropdowns only grow, never shrink, preventing options from disappearing while the user is interacting with them
- **Discovery** — users can see all categories they've stumbled upon during their session, even if their current search doesn't match them
- **Trade-off acknowledged** — this means the dropdown may show categories/countries that don't exist in the current filtered results. Selecting one would show zero results, which is handled by the empty state UI. For 60 items, this is acceptable; for larger datasets, a traditional faceted search with counts would be better (listed in Future Enhancements)

### 5. Offset Pagination

**Decision:** Page-based pagination (`page` + `limit` parameters) instead of cursor-based.

**Rationale:**
- Simpler to implement and reason about
- Works well for a small dataset (60 items)
- Users intuitively understand "Page 3 of 5"
- **Trade-off acknowledged** — offset pagination can miss items if data is added/removed between requests. For a static dataset, this isn't an issue. For a production database, cursor-based pagination is listed as a future enhancement.

### 6. Co-Located Types (No Shared Package)

**Decision:** Each app has its own copy of type definitions (`apps/api/src/types.ts` and `apps/web/src/types/lot.ts`).

**Rationale:**
- **Independence** — each app can be built, tested, and deployed without the other
- **Simplicity** — no monorepo workspace configuration, no package build step, no import aliases
- **Deliberate trade-off** — the types are duplicated. In production, a shared `@auction-scout/types` package would be the right call (listed in Future Enhancements). For this portfolio project, co-location was chosen to keep the project simple to set up and run.

### 7. Modal Data from In-Memory State

**Decision:** `<LotModal>` receives the lot object as a prop from the already-fetched `lots` array. It does NOT call `GET /lots/:id`.

**Rationale:**
- **Instant** — no loading spinner, no network delay, no error handling needed
- **Offline-friendly** — the modal works even with a flaky connection (data is already in memory)
- **Reduced API load** — one fewer request per modal open
- **Trade-off** — this only works because the list endpoint returns full lot objects. If the list endpoint returned summary objects (title + estimate only), the modal would need to fetch `/lots/:id`. The `/lots/:id` endpoint exists for this future scenario.

### 8. Custom SelectField Over Native Select

**Decision:** Built a custom listbox component instead of using `<select>`.

**Rationale:**
- **Styling** — native selects are notoriously inconsistent across browsers and OS; custom implementation guarantees pixel-perfect design
- **Accessibility** — the custom implementation follows the WAI-ARIA Listbox Pattern exactly, providing the same (arguably better) accessibility as a native select
- **Demonstration** — building a custom accessible form control demonstrates understanding of ARIA, focus management, and keyboard interaction patterns

### 9. Suspense Boundary via `loading.tsx`

**Decision:** Using Next.js App Router's built-in Suspense with a dedicated `loading.tsx` file.

**Rationale:**
- **Zero configuration** — Next.js automatically wraps `page.tsx` in `<Suspense>`, no manual setup
- **Streaming SSR-ready** — when/if the app moves to SSR, the loading skeleton will stream immediately while data fetches
- **Consistent UX** — the skeleton page matches the real layout, providing a seamless transition

---

## 8. Component API Reference

### `Header`
```typescript
type HeaderProps = {
  total: number;           // Total matching lots (0 before first load)
  categoryCount: number;   // Number of distinct categories
  countryCount: number;    // Number of distinct countries
};
```

### `FilterBar`
```typescript
type Option = { value: string; label: string };

type FilterBarProps = {
  query: string;                              // Current search input value
  onQueryChange: (value: string) => void;     // Called on every keystroke
  category: string;                           // Selected category (empty = all)
  categoryOptions: Option[];                  // Dynamically populated options
  onCategoryChange: (value: string) => void;
  country: string;                            // Selected country (empty = all)
  countryOptions: Option[];                   // Dynamically populated options
  onCountryChange: (value: string) => void;
  sort: SortOption;                           // "none" | "estimate-asc" | "estimate-desc"
  sortOptions: Option[];                      // Fixed sort options
  onSortChange: (value: SortOption) => void;
};
```

### `LotCard`
```typescript
type LotCardProps = {
  lot: Lot;                       // Lot data to display
  onClick: (lot: Lot) => void;    // Called on click/Enter/Space
  isPriority?: boolean;           // If true, image loads eagerly (above fold)
};
```

### `LotCardSkeleton`
No props — always renders the same 6 animated placeholder rectangles.

### `LotModal`
```typescript
type LotModalProps = {
  lot: Lot;              // Lot data (from in-memory state, not fetched)
  onClose: () => void;   // Called on Escape, backdrop click, or Close button
};
```

### `Pagination`
```typescript
type PaginationProps = {
  page: number;                          // Current page (1-based)
  totalPages: number;                    // Total available pages
  isLoading: boolean;                    // Disables buttons while fetching
  onPageChange: (page: number) => void;  // Called with safe page number
};
```

### `SelectField`
```typescript
type SelectOption = { value: string; label: string };

type SelectFieldProps = {
  label: string;                       // Screen-reader-visible label
  value: string;                       // Currently selected value
  options: SelectOption[];             // Dropdown options
  onChange: (value: string) => void;   // Called when option is selected
  disabled?: boolean;                  // Optional disabled state
};
```

### `useLotSearch` Return Type
```typescript
type UseLotSearchReturn = {
  lots: Lot[];                          // Current page lots
  isLoading: boolean;                   // Fetch in progress
  error: string;                        // Error message (empty = none)
  query: string;                        // Raw search input
  setQuery: (value: string) => void;    // Update search (triggers debounce)
  category: string;                     // Selected category
  setCategory: (value: string) => void;
  country: string;                      // Selected country
  setCountry: (value: string) => void;
  sort: SortOption;                     // Current sort
  setSort: (value: SortOption) => void;
  page: number;                         // Current page
  setPage: (value: number) => void;
  categories: string[];                 // Accumulated available categories
  countries: string[];                  // Accumulated available country codes
  total: number;                        // Total matching lots
  totalPages: number;                   // Total pages for current query
  clearFilters: () => void;             // Reset all filters to defaults
};
```

### `useDebounce`
```typescript
function useDebounce<T>(value: T, delay?: number): T;
```
Returns `value` after `delay` ms of no changes. Generic type `T` works with any value type.

### API Request Shapes

**`GET /lots`**
```
Query Parameters:
  search?:   string          // Search in title and description
  category?: string          // Exact category match
  country?:  string          // ISO 3166-1 alpha-2 country code
  sort?:     "none" | "estimate-asc" | "estimate-desc"  (default: "none")
  page?:     number          // >= 1 (default: 1)
  limit?:    number          // 1–60 (default: 12)
```

**`GET /lots/:id`**
```
Path Parameter:
  id: string                 // Lot identifier (e.g., "lot_042")
```

### API Response Shapes

**`GET /lots` Success (200)**
```json
{
  "data": [
    {
      "id": "lot_001",
      "title": "18th Century Oak Writing Desk",
      "description": "A beautifully preserved...",
      "category": "Furniture",
      "country": "SE",
      "country_name": "Sweden",
      "auction_house": "Stockholms Auktionsverk",
      "estimate_low": 4500,
      "estimate_high": 6000,
      "currency": "SEK",
      "image_url": "https://images.unsplash.com/..."
    }
  ],
  "meta": {
    "total": 60,
    "page": 1,
    "limit": 12,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "filters": {
    "categories": ["Art", "Collectibles", "Furniture", "Jewellery"],
    "countries": ["BE", "DE", "ES", "FR", "IT", "SE", "UK", "US"]
  }
}
```

**`GET /lots` Validation Error (400)**
```json
{
  "error": "Invalid query parameters",
  "details": {
    "page": ["Expected number, received nan"],
    "sort": ["Invalid enum value. Expected 'none' | 'estimate-asc' | 'estimate-desc', received 'price'"]
  }
}
```

**`GET /lots/:id` Success (200)**
```json
{
  "id": "lot_042",
  "title": "Art Deco Diamond Brooch",
  "description": "...",
  "category": "Jewellery",
  "country": "FR",
  "country_name": "France",
  "auction_house": "Paris Auctions",
  "estimate_low": 8000,
  "estimate_high": 12000,
  "currency": "EUR",
  "image_url": "https://images.unsplash.com/..."
}
```

**`GET /lots/:id` Not Found (404)**
```json
{
  "error": "Lot not found"
}
```

**Rate Limit Exceeded (429)**
```json
{
  "error": "Too many requests, please try again later."
}
```

**`GET /health`**
```json
{
  "status": "ok"
}
```

---

## 9. Security & Performance

### Security Measures

| Measure | Implementation | Purpose |
|---------|---------------|---------|
| **Input Validation** | Zod schemas on all query parameters | Prevents malformed input from reaching business logic; rejects invalid types, ranges, and enum values before processing |
| **Rate Limiting** | express-rate-limit: 100 req / 15s per IP | Protects against brute-force enumeration and accidental/malicious API abuse |
| **CORS** | Whitelist: only configured origin (default: localhost:3000) | Prevents unauthorized cross-origin requests from other domains |
| **Global Error Handler** | Express error middleware catches unhandled errors | Prevents stack traces from leaking to clients; returns generic 500 message |
| **Immutable Cache** | `Object.freeze` on in-memory data | Prevents accidental data corruption that could persist across requests |

### Performance Optimizations

| Optimization | Implementation | Impact |
|-------------|---------------|--------|
| **Debounced Search** | 300ms debounce via custom `useDebounce` hook | Reduces API calls by ~70% during typing (only fires when user pauses) |
| **Server-Side Pagination** | Only 12 lots per request (configurable) | Minimizes response payload size; client never loads all 60 lots at once |
| **Cache-Control Headers** | `max-age=30, stale-while-revalidate=300` on `/lots` and `/lots/:id` | CDN/browser caches results; stale-while-revalidate allows serving cached data while refreshing in background |
| **Image Lazy Loading** | `loading="lazy"` for below-fold cards, `loading="eager"` + `fetchPriority="high"` for first 4 | Above-fold images load immediately; below-fold images load on scroll; reduces initial page weight |
| **Unsplash Image Optimization** | Appends `?w=600` to Unsplash URLs | Requests appropriately-sized images instead of full resolution; ~80% bandwidth savings on images |
| **Suspense (loading.tsx)** | Full-page skeleton during initial load | Perceived performance: users see page structure immediately; Largest Contentful Paint (LCP) improved |
| **Skeleton Placeholders** | `LotCardSkeleton` + skeleton header/filter bar | Layout stability: skeleton matches real layout exactly, preventing Cumulative Layout Shift (CLS) |
| **In-Memory Modal** | Lot data passed as prop, no `/lots/:id` fetch | Zero latency when opening detail modal; no loading spinner needed |
| **Object.freeze** | Frozen lot data at startup | Prevents accidental mutations; enables V8 engine optimizations for frozen objects |
| **Static Filter Options** | Sort options defined with `useMemo([], [])` | Never recalculated; empty dependency array means it's computed once |

### Accessibility Features

| Feature | Implementation | WCAG Criterion |
|---------|---------------|----------------|
| **Semantic HTML** | `<main>`, `<header>`, `<article>`, `<nav>`, `<h1>`–`<h2>`, `<button>`, `<dl>`/`<dt>`/`<dd>` | 1.3.1 Info and Relationships |
| **ARIA Labels** | `aria-label` on search input, lot grid; `aria-labelledby` on modal; `sr-only` on SelectField | 4.1.2 Name, Role, Value |
| **ARIA Live Regions** | `aria-live="polite"` on status bar; `aria-live="polite"` on pagination | 4.1.3 Status Messages |
| **Focus Trapping** | Circular Tab/Shift+Tab in LotModal | 2.4.3 Focus Order |
| **Keyboard Navigation** | Enter/Space on cards; Escape to close modal/select; Tab through focusable elements | 2.1.1 Keyboard |
| **Focus Management** | Auto-focus close button on modal open via `setTimeout` | 2.4.3 Focus Order |
| **ARIA Busy** | `aria-busy={isLoading}` on lot grid | 4.1.2 Name, Role, Value |
| **Error Announcement** | `role="alert"` on error banner | 4.1.3 Status Messages |
| **Listbox Pattern** | Full WAI-ARIA Listbox implementation in SelectField | 1.3.1, 4.1.2 |
| **Color Contrast** | Tailwind defaults meet WCAG AA (e.g., `text-stone-950` on white = 16:1 ratio) | 1.4.3 Contrast (Minimum) |

---

## 10. Testing Strategy

### Backend Tests (`apps/api/src/lots.service.test.ts`) — 4 Tests

| Test | What It Verifies | Why It Matters |
|------|-----------------|----------------|
| "filters lots by search query" | Searching "desk" returns only the desk lot (1 result) | Validates case-insensitive substring matching across title and description |
| "filters lots by category and country" | Category "Jewellery" + Country "UK" returns the ring lot | Validates AND logic: multiple filters must all match |
| "sorts lots by estimate high descending" | Sort "estimate-desc" puts the highest-estimate lot first | Validates sort direction and that `.sort()` works correctly with estimate values |
| "paginates lots" | Page 2 with limit 2 returns 1 lot, correct meta | Validates pagination math, `hasNextPage`/`hasPreviousPage`, and edge case (partial last page) |

**Test data:** 3 hardcoded lots (Furniture/SE, Jewellery/UK, Art/FR) — small enough to reason about, diverse enough to cover all filtering dimensions.

### Frontend Tests (`apps/web/src/hooks/useLotSearch.test.ts`) — 5 Tests

| Test | What It Verifies | Why It Matters |
|------|-----------------|----------------|
| "returns initial loading state" | `isLoading=true`, `lots=[]`, `error=""` before first fetch | Validates initial render state — critical for skeleton display |
| "loads lots on mount" | After fetch resolves, lots populated with correct data, categories/countries accumulated | Validates the full fetch → state update lifecycle |
| "handles API error" | When `getLots` rejects, `error` is set, `lots=[]`, `isLoading=false` | Validates error recovery — user sees error message, not blank screen |
| "clearFilters resets all filters" | After changing all filters, `clearFilters()` resets everything to defaults | Validates the escape hatch for users — one click to start over |
| "resets page when filters change" | Changing category after navigating to page 3 resets page to 1 | Validates the page-reset-on-filter-change pattern (critical for correctness) |

**Mocking strategy:** `vi.mock("@/src/lib/api")` replaces the API module. `mockGetLots.mockResolvedValue(mockResponse)` provides a consistent test response. `vi.clearAllMocks()` in `beforeEach` ensures test isolation.

### What's Not Tested (Yet)

- **SelectField** component (click outside, Escape, click-to-select) — requires DOM interaction testing with `@testing-library/react`
- **LotModal** focus trapping and Escape-to-close — requires DOM interaction testing
- **API route handlers** (Express integration tests with supertest) — tests cover the service layer; route handlers are thin wrappers
- **E2E** (Playwright/Cypress) — listed as a future enhancement for critical user journeys

---

## 11. Assumptions & Trade-offs

### Assumptions Made During Development

| Assumption | Why It Was Made | Production Alternative |
|-----------|----------------|----------------------|
| **Dataset is static and small (60 items)** | The dataset includes 60 curated lots | Would use PostgreSQL with full-text search indexes |
| **In-memory filtering is acceptable** | 60 items filter in microseconds | Would use database `WHERE` clauses with GIN indexes |
| **Offset pagination is sufficient** | 60 items won't have insert/delete race conditions | Would use cursor-based pagination for consistency |
| **300ms debounce is the right balance** | Common UX pattern; tested and felt responsive | Could be A/B tested; might be personalized based on user typing speed |
| **Country filter refers to auction house location** | The `country` field in the data represents the auction house's country | Would clarify with product team; might add separate "item origin" and "auction location" fields |
| **Estimates shown in native currency** | Simplest approach; no exchange rate dependency | Would add currency conversion with live rates and user preference |
| **Modern browsers only (last 2 versions)** | Target audience is collectors/dealers using modern devices | Would add polyfills if IE11 support is required by business |
| **Filter dropdowns merge (accumulate)** | Prevents UX jarring of options disappearing | For large datasets, would use faceted search with counts and a "show all" toggle |
| **Types are co-located per app** | Keeps each app self-contained and simple to set up | Would extract to `@auction-scout/types` shared package in a monorepo |
| **API and frontend are separate processes** | Demonstrates full-stack separation | In production, could be behind the same reverse proxy or use API routes within Next.js |

### Trade-offs Made

| Trade-off | What We Gained | What We Lost |
|-----------|---------------|--------------|
| **Custom select over native** | Complete styling control, ARIA compliance demonstration | More code to maintain; more testing surface area |
| **In-memory modal vs. API fetch** | Instant open, no loading state, offline-friendly | Can't show fresh data if it changed since list load; modal always shows list snapshot |
| **Client-side rendering only** | Simpler deployment, faster development | No SEO for lot detail pages; slower Time to Interactive on slow connections |
| **No shared types package** | No monorepo workspace complexity; easy setup | Duplicated type definitions; risk of drift between API and frontend types |
| **`Object.freeze` at startup** | Data integrity guarantee | If hot-reloading data were needed, would require a restart or different caching strategy |

---

## 12. Future Enhancements

If this were a production system with more development time, here's what would be built next:

### Database & Queries
- **PostgreSQL with Full-Text Search** — Replace the in-memory array with `tsvector` columns on `title` and `description`; GIN indexes for sub-100ms searches on millions of lots
- **Cursor-Based Pagination** — Replace offset pagination with cursor-based (keyset) pagination for consistent results when data changes between requests
- **Faceted Search** — Return facet counts (`{ "Furniture": 12, "Art": 8, ... }`) alongside filtered results; display counts in the dropdown

### Frontend Features
- **SSR/SSG** — Server-Side Render the initial page load with data fetched at request time; improves SEO and Time to First Byte
- **Currency Conversion** — Add a currency selector; fetch live exchange rates from an API; display estimates in the user's preferred currency
- **URL Sync** — Reflect search/filter/sort/page state in the URL query string (`?search=desk&category=Furniture&page=2`); enables sharing and browser back/forward navigation
- **Virtualized Grid** — If the dataset grows, use `react-window` or `react-virtuoso` for efficient rendering of large result sets
- **Image CDN** — Replace raw Unsplash URLs with Next.js `<Image>` component and a proper image optimization CDN (e.g., Cloudinary, imgix)

### Testing
- **E2E Tests (Playwright)** — Test critical user journeys: search → filter → sort → paginate → open modal → close modal → clear filters
- **Component Tests** — Test `SelectField` (open/close/select), `LotModal` (focus trapping, Escape), `FilterBar` integration
- **API Integration Tests** — Use `supertest` to test Express routes end-to-end (not just the service layer)

### DevOps & Architecture
- **Shared Types Package** — Extract `Lot`, `LotsResponse`, `LotsQuery` into `@auction-scout/types` as a monorepo workspace package; eliminates type duplication
- **API Versioning** — Prefix routes with `/v1/` to allow future breaking changes without disrupting existing clients
- **Monitoring & Observability** — Add structured logging, request tracing (OpenTelemetry), and metrics (Prometheus) for production monitoring
- **Docker Compose** — Containerize both apps with a single `docker-compose up` command for zero-config local development

### UX Polish
- **Loading State for Modal** — If the modal switches to fetching `/lots/:id`, add a skeleton loader inside the modal
- **Search Suggestions** — As the user types, show autocomplete suggestions for known titles/categories
- **Saved Searches** — Allow users to save filter configurations; notify when new lots match
- **Dark Mode** — Add a theme toggle; Tailwind's `dark:` variant makes this straightforward
- **Mobile-Optimized Filters** — On small screens, collapse filters into a slide-out panel or bottom sheet

---

## Appendix: Environment Variables

| Variable | App | Default | Description |
|----------|-----|---------|-------------|
| `PORT` | API | `4000` | Express server port |
| `CORS_ORIGIN` | API | `http://localhost:3000` | Allowed CORS origin |
| `LOTS_DATA_PATH` | API | `./data/lots.json` | Path to auction lots JSON file |
| `NEXT_PUBLIC_API_BASE_URL` | Web | `http://localhost:4000` | API base URL for the frontend |
| `NEXT_PUBLIC_PAGE_SIZE` | Web | `12` | Number of lots per page |

---

## Appendix: File Reference Table

| File | Lines | Purpose |
|------|-------|---------|
| `apps/api/data/lots.json` | — | 60 curated auction lots (source data) |
| `apps/api/src/server.ts` | 131 | Express app: middleware stack, routes, startup |
| `apps/api/src/lots.service.ts` | 81 | Filter → Sort → Paginate pipeline + filter computation |
| `apps/api/src/lots.service.test.ts` | 105 | 4 unit tests for the service layer |
| `apps/api/src/types.ts` | 40 | Backend type definitions |
| `apps/web/src/app/layout.tsx` | 33 | Root layout: fonts, metadata, HTML structure |
| `apps/web/src/app/page.tsx` | 170 | Home page: component orchestration, state wiring |
| `apps/web/src/app/loading.tsx` | 44 | Full-page skeleton (Suspense fallback) |
| `apps/web/src/app/globals.css` | 16 | Tailwind v4 import + CSS custom properties |
| `apps/web/src/components/Header.tsx` | 62 | Hero banner with live stat cards |
| `apps/web/src/components/FilterBar.tsx` | 75 | Search input + 3 SelectField dropdowns |
| `apps/web/src/components/SelectField.tsx` | 126 | Custom ARIA listbox dropdown |
| `apps/web/src/components/LotCard.tsx` | 79 | Auction lot card with image optimization |
| `apps/web/src/components/LotCardSkeleton.tsx` | 20 | Animated loading placeholder card |
| `apps/web/src/components/LotModal.tsx` | 117 | Detail modal with focus trapping |
| `apps/web/src/components/Pagination.tsx` | 41 | Previous/Next page controls |
| `apps/web/src/hooks/useLotSearch.ts` | 124 | Central state hook: fetch, state, filter accumulation |
| `apps/web/src/hooks/useLotSearch.test.ts` | 131 | 5 unit tests for the search hook |
| `apps/web/src/hooks/useDebounce.ts` | 17 | Generic debounce hook |
| `apps/web/src/lib/api.ts` | 39 | Fetch wrapper for the `/lots` endpoint |
| `apps/web/src/lib/constants.ts` | 22 | Shared constants (images, keys, country names) |
| `apps/web/src/lib/formatEstimate.ts` | 5 | Currency + estimate range formatter |
| `apps/web/src/types/lot.ts` | 31 | Frontend type definitions |
| `README.md` | 258 | Project overview, setup, API docs |
| `PROJECT_DESCRIPTION.md` | — | This document |

---

*Generated as a full-stack portfolio project — June 2026.*