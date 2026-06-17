# Barnebys Auction Search

Technical assessment for the Senior Fullstack Developer role.

## Overview

This project is a mini auction search interface built with:

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Node.js, Express, TypeScript, Zod
- **Testing:** Vitest, Testing Library
- **Validation:** Zod (API query parameters)
- **Security:** Rate limiting (express-rate-limit), CORS

The app allows users to browse, search, filter, sort, and inspect 60 curated auction lots across multiple categories and
countries.

## Features

- Real-time search by title and description (debounced 300ms)
- Filter by category (dropdown, dynamically populated from results)
- Filter by country (dropdown with full country names)
- Sort by estimate price (ascending / descending)
- Server-side pagination with previous/next controls
- Responsive auction lot cards with image, title, estimate, and description
- Detail modal on card click with keyboard support (Escape to close, focus trapping)
- Loading skeleton cards during data fetch
- Full Suspense boundary (`loading.tsx`)
- Image skeleton loading state inside the modal
- API validation with Zod + detailed error messages
- Rate limiting (100 requests per 15-second window)
- Cache-Control headers for CDN/browser caching
- Accessibility: ARIA labels, roles, focus management, aria-live regions
- Error boundary wrapping the entire app
- Custom 404 and error pages
- Open Graph metadata for SEO
- Graceful shutdown (SIGTERM/SIGINT handling)
- Structured API error responses with timeout handling on the frontend

## Project Structure

```
barnebys-auction-search/
├── apps/
│   ├── api/                  # Express backend
│   │   ├── data/lots.json    # 60 auction lots
│   │   ├── src/
│   │   │   ├── server.ts           # Express app, routes, middleware, graceful shutdown
│   │   │   ├── lots.service.ts     # Filtering, sorting, pagination logic
│   │   │   ├── lots.service.test.ts
│   │   │   └── types.ts            # Lot, SortOption, LotsQuery, LotsResponse
│   │   └── .env.example
│   └── web/                  # Next.js frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx        # Root layout with fonts + ErrorBoundary
│       │   │   ├── page.tsx          # Main page
│       │   │   ├── loading.tsx       # Suspense fallback (skeleton page)
│       │   │   ├── not-found.tsx     # Custom 404 page
│       │   │   ├── error.tsx         # Custom error page with reset
│       │   │   └── globals.css
│       │   ├── components/
│       │   │   ├── Header.tsx         # Hero banner with stat cards
│       │   │   ├── FilterBar.tsx      # Search + category/country/sort selects
│       │   │   ├── LotCard.tsx        # Single auction lot card (next/image)
│       │   │   ├── LotCardSkeleton.tsx  # Animated loading placeholder
│       │   │   ├── LotModal.tsx       # Detail modal with focus trapping + image skeleton
│       │   │   ├── Pagination.tsx     # Previous/Next controls
│       │   │   ├── SelectField.tsx    # Reusable dropdown (listbox pattern)
│       │   │   └── ErrorBoundary.tsx  # React error boundary
│       │   ├── hooks/
│       │   │   ├── useDebounce.ts          # Generic debounce hook
│       │   │   ├── useAuctionFilters.ts    # Query, category, country, sort, page state
│       │   │   ├── useLotsApi.ts           # API fetching, loading/error, filter options
│       │   │   ├── useLotSearch.ts         # Composition hook (filters + api)
│       │   │   ├── useLotSearch.types.ts   # Shared return type
│       │   │   └── useLotSearch.test.ts    # Unit tests
│       │   ├── lib/
│       │   │   ├── api.ts            # API client (fetch wrapper with timeout)
│       │   │   ├── constants.ts      # PAGE_SIZE, PLACEHOLDER_IMAGE, KEY, COUNTRY_NAMES
│       │   │   └── formatEstimate.ts # Currency + estimate formatting (handles equal low/high)
│       │   └── types/
│       │       └── lot.ts            # Lot, SortOption, LotsResponse types
│       ├── next.config.ts            # Remote image patterns for next/image
│       ├── vitest.config.mts
│       └── .env.example
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install

```bash
# Install API dependencies
cd apps/api && npm install

# Install Web dependencies
cd apps/web && npm install
```

### Environment Variables

Copy the example files and customize if needed:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

| Variable                   | Default                 | Description               |
|----------------------------|-------------------------|---------------------------|
| `PORT`                     | `4000`                  | API server port           |
| `CORS_ORIGIN`              | `http://localhost:3000` | Allowed CORS origin       |
| `LOTS_DATA_PATH`           | `../data/lots.json`     | Path to auction lots JSON |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | API URL for the frontend  |
| `NEXT_PUBLIC_PAGE_SIZE`    | `12`                    | Number of lots per page   |

### Development

Start the API and Web apps in separate terminals:

```bash
# Terminal 1 — API at http://localhost:4000
cd apps/api && npm run dev

# Terminal 2 — Web at http://localhost:3000
cd apps/web && npm run dev
```

### Build

```bash
cd apps/api && npm run build
cd apps/web && npm run build
```

### Test

```bash
cd apps/api && npm test    # 4 tests (lots.service)
cd apps/web && npm test    # Tests (useLotSearch hook)
```

## API Endpoints

### `GET /health`

Health check. Returns `{ "status": "ok" }`.

### `GET /lots`

Paginated, filtered, sorted auction lots.

| Parameter  | Type                                        | Default | Description                            |
|------------|---------------------------------------------|---------|----------------------------------------|
| `search`   | string                                      | —       | Search in title and description        |
| `category` | string                                      | —       | Filter by category                     |
| `country`  | string                                      | —       | Filter by country code (SE, UK, FR...) |
| `sort`     | `none` \| `estimate-asc` \| `estimate-desc` | `none`  | Sort order                             |
| `page`     | number                                      | `1`     | Page number                            |
| `limit`    | number                                      | `12`    | Items per page (max 60)                |

Response:

```json
{
  "data": [
    {
      "id": "lot_001",
      "title": "18th Century Oak Writing Desk",
      "description": "...",
      "category": "Furniture",
      "country": "SE",
      "country_name": "Sweden",
      "auction_house": "Stockholms Auktionsverk",
      "estimate_low": 4500,
      "estimate_high": 6000,
      "currency": "SEK",
      "image_url": "https://..."
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
    "categories": ["Art", "Furniture", "Jewellery", "..."],
    "countries": ["DE", "FR", "SE", "UK", "US", "..."]
  }
}
```

### `GET /lots/:id`

Single lot by ID. Returns the `Lot` object (with `country_name` included) or `404`.

## Architecture Decisions

- **Server-side filtering & pagination** — all data processing happens in the API. The frontend is a thin presentation
  layer.
- **Object.freeze on cache** — the in-memory lot data is frozen at startup to prevent accidental mutation.
- **Country name mapping** — the API returns `country_name` alongside `country` (ISO code) so the frontend never needs
  to map codes.
- **Filter options loaded once** — category and country dropdown options are loaded from an unfiltered API call on mount
  and never narrow, ensuring all options remain visible regardless of active filters.
- **Zod validation** — query parameters are validated with detailed error messages before processing.
- **Separate apps** — the API and Web are standalone applications started independently (no monorepo tooling or shared
  packages).
- **Graceful shutdown** — the API handles SIGTERM/SIGINT to close connections properly (important for containerized
  deployments).
- **Request timeout** — the frontend API client uses AbortController with a 15-second timeout to prevent hanging
  requests.
- **Hook composition** — `useLotSearch` is a thin composition over `useAuctionFilters` (filter state + debounce) and
  `useLotsApi` (data fetching), keeping each hook focused and testable.