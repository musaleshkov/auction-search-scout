# Barnebys Auction Search

Mini auction search interface built for the Barnebys Senior Fullstack Developer technical assessment.

The application allows users to browse, search, filter, sort, paginate, and inspect auction lots through a clean
responsive interface.

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express
* TypeScript

### Testing

* Vitest

---

## Features

* Search auction lots by title or description
* Filter lots by category
* Filter lots by country edition
* Sort lots by estimate price

    * Low to high
    * High to low
* Paginated results
* Responsive card-based layout
* Lot detail modal
* Basic modal accessibility

    * `role="dialog"`
    * `aria-modal`
    * Escape key close
    * Close button focus management
    * Body scroll lock while modal is open
* Express API serving the dataset
* TypeScript used across frontend and backend
* Basic unit test coverage for backend filtering/sorting/pagination logic

---

## Project Structure

```txt
barnebys-auction-search/
  apps/
    api/
      data/
        lots.json
      src/
        lots.service.ts
        lots.service.test.ts
        server.ts
        types.ts
      package.json
      tsconfig.json

    web/
      src/
        app/
          layout.tsx
          page.tsx
          globals.css
        lib/
          api.ts
        types/
          lot.ts
      package.json
      postcss.config.mjs
      tsconfig.json

  README.md
```

---

## Architecture Overview

The project is split into two separate applications:

```txt
apps/api  -> Express backend API
apps/web  -> Next.js frontend
```

This separation was chosen because the assignment requires a dedicated Node.js/Express API instead of hardcoding data
directly in the frontend.

The backend loads the static JSON dataset and exposes API endpoints for auction lot data. The frontend communicates with
the backend through HTTP requests and renders the search interface.

---

## Backend Responsibilities

The backend is responsible for:

* Loading auction lot data from JSON
* Serving lot data through REST endpoints
* Handling search
* Handling category filtering
* Handling country filtering
* Handling estimate sorting
* Handling pagination
* Returning available filter options

The main endpoint is:

```txt
GET /lots
```

It supports query parameters:

```txt
search
category
country
sort
page
limit
```

Example:

```txt
/lots?search=desk&category=Furniture&country=SE&sort=estimate-asc&page=1&limit=12
```

---

## Frontend Responsibilities

The frontend is responsible for:

* Rendering the auction search UI
* Managing user input state
* Calling the backend API
* Displaying loading, error, empty, and success states
* Rendering responsive auction lot cards
* Opening a detail modal when a card is selected
* Handling pagination controls

---

## API Response Shape

The `/lots` endpoint returns:

```ts
{
	data: Lot[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	}
	;
	filters: {
		categories: string[];
		countries: string[];
	}
	;
}
```

Example:

```json
{
  "data": [],
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
	  "Jewellery"
	],
	"countries": [
	  "DE",
	  "FR",
	  "SE",
	  "UK",
	  "US"
	]
  }
}
```

---

## Prerequisites

Before running the project, install:

* Node.js LTS
* npm
* Git

Recommended Node version:

```txt
Node.js 20+
```

Check your installed versions:

```bash
node -v
npm -v
git --version
```

---

## Environment Variables

### Backend

Create this file:

```txt
apps/api/.env
```

Add:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

### Frontend

Create this file:

```txt
apps/web/.env.local
```

Add:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

---

## Running the Project Locally

You need to run the backend and frontend in separate terminals.

---

### 1. Start the Backend API

Open terminal 1:

```bash
cd apps/api
npm install
npm run dev
```

The backend will run on:

```txt
http://localhost:4000
```

Test the backend health endpoint:

```txt
http://localhost:4000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

Test the lots endpoint:

```txt
http://localhost:4000/lots
```

Expected response:

```json
{
  "data": [],
  "meta": {},
  "filters": {}
}
```

The actual `data` array should contain auction lots.

---

### 2. Start the Frontend

Open terminal 2:

```bash
cd apps/web
npm install
npm run dev
```

The frontend will run on:

```txt
http://localhost:3000
```

Open the browser and visit:

```txt
http://localhost:3000
```

---

## Common Local URLs

```txt
Frontend:
http://localhost:3000

Backend:
http://localhost:4000

Health check:
http://localhost:4000/health

Lots API:
http://localhost:4000/lots
```

---

## Available API Endpoints

### Health Check

```txt
GET /health
```

Returns:

```json
{
  "status": "ok"
}
```

---

### Get Auction Lots

```txt
GET /lots
```

Supported query parameters:

| Parameter  | Example        | Description                      |
|------------|----------------|----------------------------------|
| `search`   | `desk`         | Searches by title or description |
| `category` | `Furniture`    | Filters by category              |
| `country`  | `SE`           | Filters by country edition       |
| `sort`     | `estimate-asc` | Sorts by estimate price          |
| `page`     | `1`            | Current page                     |
| `limit`    | `12`           | Number of results per page       |

Supported sort values:

```txt
none
estimate-asc
estimate-desc
```

Example request:

```txt
http://localhost:4000/lots?search=desk&sort=estimate-asc&page=1&limit=12
```

---

### Get Single Lot by ID

```txt
GET /lots/:id
```

Example:

```txt
http://localhost:4000/lots/lot_001
```

---

## Running Tests

### Backend Tests

```bash
cd apps/api
npm run test
```

The backend test validates:

* Search filtering
* Category filtering
* Country filtering
* Estimate sorting
* Pagination

---

## Production Build Check

Before submitting, run a production build for both applications.

### Backend Build

```bash
cd apps/api
npm run build
```

Start the compiled backend:

```bash
npm start
```

---

### Frontend Build

```bash
cd apps/web
npm run build
```

Start the compiled frontend:

```bash
npm start
```

---

## Manual QA Checklist

Before submitting the project, verify:

* Backend starts without errors
* Frontend starts without errors
* `/health` returns `{ "status": "ok" }`
* `/lots` returns auction data
* Search works by title
* Search works by description
* Category filter works
* Country filter works
* Sorting low to high works
* Sorting high to low works
* Pagination works
* Clear filters works
* Clicking a card opens the detail modal
* Escape key closes the modal
* Close button closes the modal
* Mobile layout works
* No browser console errors
* No terminal errors
* Production build passes

---

## Styling

Tailwind CSS is used for styling because it allows fast, consistent implementation of a responsive UI without adding
additional component libraries.

The UI uses a simple neutral/amber palette to keep the interface clean and lightly aligned with the auction/art
marketplace feel.

---

## Accessibility Notes

The detail modal includes basic accessibility improvements:

* Dialog role
* `aria-modal="true"`
* Modal title connected via `aria-labelledby`
* Escape key support
* Focus moves to the close button when the modal opens
* Page scroll is locked while the modal is open
* Cards can be opened with keyboard using Enter or Space

With more time, I would add a full focus trap inside the modal.

---

## Architectural Decisions

### Separate frontend and backend

The frontend and backend are intentionally kept as separate applications because the assignment requires a Next.js
frontend and a separate Node.js/Express backend API.

### API-level filtering and pagination

Search, filtering, sorting, and pagination are handled by the backend API. This better reflects how the system would
evolve with a larger dataset and keeps the frontend focused on rendering and interaction.

### Static JSON dataset

The dataset is served from a local JSON file because the assignment does not require persistence, mutation,
authentication, or database storage.

### TypeScript throughout

TypeScript is used across both applications to improve maintainability and reduce runtime errors.

### No global state library

No Redux, Zustand, or other global state solution was added because the state requirements are local to a single page.
Adding a global state library would increase complexity without clear value for this scope.

### No database

A database was intentionally avoided because the dataset is static and small. For a production version, the data would
likely be indexed and stored in a database or search engine.

---

## Assumptions

* The dataset is static.
* Authentication is not required.
* Auction lot data does not need to be edited.
* Search should be case-insensitive.
* Search applies to title and description.
* Filtering should support exact category and country matches.
* Pagination is useful even though the dataset contains only 60 lots.
* Sorting by estimate low-to-high uses `estimate_low`.
* Sorting by estimate high-to-low uses `estimate_high`.
* The frontend and backend are expected to run as separate local processes.

---

## What I Would Improve With More Time

* Move shared TypeScript contracts into a dedicated shared package
* Add schema validation for API query parameters and dataset shape
* Add frontend component tests
* Add stronger modal focus trapping
* Add image fallback handling
* Add debounce for search input
* Add URL query parameter synchronization for filters
* Add API-level caching headers
* Add deployment setup for separate frontend and backend environments
* Add CI pipeline for build and test checks

---

## Troubleshooting

### Frontend cannot load data

Make sure the backend is running:

```txt
http://localhost:4000/health
```

Also check:

```txt
apps/web/.env.local
```

It should contain:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Restart the frontend after changing environment variables.

---

### CORS error

Check:

```txt
apps/api/.env
```

It should contain:

```env
CORS_ORIGIN=http://localhost:3000
```

Restart the backend after changing environment variables.

---

### Tailwind/PostCSS error

Make sure `apps/web/postcss.config.mjs` uses:

```js
const config = {
	plugins: {
		"@tailwindcss/postcss": {},
	},
};

export default config;
```

Also make sure `apps/web/src/app/globals.css` starts with:

```css
@import "tailwindcss";
```

---

### Port already in use

If port `3000` or `4000` is already used, stop the running process or change the port.

On Windows, you can usually stop the terminal process with:

```bash
Ctrl + C
```

---

## Submission

Submit the public GitHub repository link.

Before submitting:

```bash
git status
```

Expected result:

```txt
nothing to commit, working tree clean
```

Recommended final checks:

```bash
cd apps/api
npm run test
npm run build
```

```bash
cd apps/web
npm run build
```

---
