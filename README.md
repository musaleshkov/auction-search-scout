# Barnebys Auction Search

Technical assessment for the Senior Fullstack Developer role.

## Overview

This project is a mini auction search interface built with:

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Node.js, Express, TypeScript, Zod
- **Shared:** TypeScript types via npm workspaces
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
- API validation with Zod + detailed error messages
- Rate limiting (100 requests per 15-second window)
- Cache-Control headers for CDN/browser caching
- Accessibility: ARIA labels, roles, focus management, aria-live regions

## Project Structure

```
barnebys-auction-search/
├── package.json              # Root workspace config with scripts
├── packages/
│   └── shared/               # Shared TypeScript types (Lot, LotsResponse, etc.)
│       └── src/index.ts
├── apps/
│   ├── api/                  # Express backend
│   │   ├── data/lots.json    # 60 auction lots
│   │   ├── src/
│   │   │   ├── server.ts           # Express app, routes, middleware
│   │   │   ├── lots.service.ts     # Filtering, sorting, pagination logic
│   │   │   ├── lots.service.test.ts
│   │   │   └── types.ts            # Re-exports from @barnebys/shared
│   │   └── .env.example
│   └── web/                  # Next.js frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx        # Root layout with fonts
│       │   │   ├── page.tsx          # Thin orchestration (~167 lines)
│       │   │   ├── loading.tsx       # Suspense fallback (skeleton page)
│       │   │   └── globals.css
│       │   ├── components/
│       │   │   ├── Header.tsx        # Hero banner with stat cards
│       │   │   ├── FilterBar.tsx     # Search + category/country/sort selects
│       │   │   ├── LotCard.tsx       # Single auction lot card
│       │   │   ├── LotCardSkeleton.tsx  # Animated loading placeholder
│       │   │   ├── LotModal.tsx      # Detail modal with focus trapping
│       │   │   ├── Pagination.tsx    # Previous/Next controls
│       │   │   └── SelectField.tsx   # Reusable dropdown (listbox pattern)
│       │   ├── hooks/
│       │   │   ├── useDebounce.ts
│       │   │   ├── useLotSearch.ts       # All fetch/state/pagination logic
│       │   │   └── useLotSearch.test.ts  # 5 unit tests
│       │   ├── lib/
│       │   │   ├── api.ts            # API client (fetch wrapper)
│       │   │   ├── constants.ts      # PLACEHOLDER_IMAGE, KEY, COUNTRY_NAMES
│       │   │   └── formatEstimate.ts # Currency + estimate formatting
│       │   └── types/
│       │       └── lot.ts            # Re-exports from @barnebys/shared
│       └── .env.example
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install

```bash
# From the project root, install all workspaces
npm install
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
| `LOTS_DATA_PATH`           | `./data/lots.json`      | Path to auction lots JSON |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | API URL for the frontend  |
| `NEXT_PUBLIC_PAGE_SIZE`    | `12`                    | Number of lots per page   |

### Development

```bash
# Start both API and web concurrently
npm run dev

# Or start individually:
npm run dev -w apps/api   # API at http://localhost:4000
npm run dev -w apps/web   # Web at http://localhost:3000
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
# API: 8 tests (lots.service) | Web: 5 tests (useLotSearch hook)
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
	"categories": [
	  "Art",
	  "Furniture",
	  "Jewellery",
	  "t.c"
	],
	"countries": [
	  "DE",
	  "FR",
	  "SE",
	  "UK",
	  "US",
	  "t.c"
	]
  }
}
```

### `GET /lots/:id`

Single lot by ID. Returns the `Lot` object or `404`.

## Architecture Decisions

- **Server-side filtering & pagination** — all data processing happens in the API. The frontend is a thin presentation
  layer.
- **Object.freeze on cache** — the in-memory lot data is frozen at startup to prevent accidental mutation.
- **Country name mapping** — the API returns `country_name` alongside `country` (ISO code) so the frontend never needs
  to map codes.
- **Filters from filtered results** — the category/country dropdowns reflect only the currently matching lots, not all
  60 items.
- **Zod validation** — query parameters are validated with detailed error messages before processing.