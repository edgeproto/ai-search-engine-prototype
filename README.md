# AI Product Search Prototype

A monorepo MVP with a FastAPI backend and a Next.js frontend for natural-language product search.

## What this includes

- Backend API with `GET /api/search?q=...` and a health endpoint at `GET /health`
- View tracking with `POST /api/views` and `GET /api/views/recent` (session-scoped via `X-Session-Id`)
- Search intent parsing via OpenAI (with local parsing fallback)
- Relevance-first ranking over local mock product data, with a small preference boost from view history
- Simple responsive frontend for query input, product cards, and a recently viewed panel

## Tech stack

- Backend: FastAPI, Pydantic, OpenAI Python SDK
- Frontend: Next.js (App Router), React, TypeScript
- Data: local JSON datasets in `backend/data/products.json` and `backend/data/views.json`

## Prerequisites

- Python 3.11+ (recommended)
- Node.js 20+ and npm

## Environment setup

### Backend

1. Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

2. Set `OPENAI_API_KEY` in `backend/.env` (optional for local-only parsing, recommended for better query understanding).

### Frontend

1. Copy the example environment file:

```bash
cp frontend/.env.example frontend/.env.local
```

2. Keep `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` unless your backend runs elsewhere.

## Run locally

Open two terminals from the repo root.

### 1) Start backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`.

## API usage

All view endpoints and optional search personalization require an anonymous `X-Session-Id` header. The frontend generates a UUID on first visit and stores it in `localStorage`, then sends it on every search and view request.

### Health check

```bash
curl "http://localhost:8000/health"
```

### Search endpoint

```bash
curl --get "http://localhost:8000/api/search" \
  --data-urlencode "q=black running shoes under 100" \
  -H "X-Session-Id: demo-session-123"
```

Response shape:

- `query`: original user query
- `intent`: parsed structured intent (`keywords`, `color`, `max_price`, `product_type`, `style`, `attributes`)
- `results`: ranked product array
- `total`: number of results

When `X-Session-Id` is provided, results may receive a small ranking boost based on that session's view history. Relevance remains primary.

### Record a product view

```bash
curl -X POST "http://localhost:8000/api/views" \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: demo-session-123" \
  -d '{"product_id": "prod-001"}'
```

### Get recently viewed products

Returns the last 8 viewed products (newest first) for the session:

```bash
curl "http://localhost:8000/api/views/recent" \
  -H "X-Session-Id: demo-session-123"
```

Response shape:

- `products`: array of full product objects

## Features

### Recently Viewed Products

Clicking a product card on the search page records a view for the current session. A **Recently Viewed** panel appears between the status card and search results when history exists, showing up to 8 products in a horizontally scrollable row. History persists across page refreshes via `localStorage` (session id) and `backend/data/views.json` (view records).

### Preference Ranking

Search ranking stays relevance-first. After base scoring, products can receive a small additive boost (capped at +5.0) when they match signals from the session's view history—previously viewed products, matching category/color, or overlapping tags. A strong keyword match still outranks a weak match with high view history.

## Manual test plan

1. Open the app fresh — no **Recently Viewed** panel appears.
2. Search for products and click 3–4 cards — the panel shows them newest-first (max 8).
3. Refresh the page — the panel persists (backend `views.json` + `localStorage` session).
4. Search again for a broad query — previously viewed or same-category products rank slightly higher among similar-scoring items.
5. Verify relevance is preserved — a strong keyword match still beats a weak match with high view history.
6. Resize to mobile — the recently viewed row scrolls horizontally without layout breakage.

## Example queries to try

- `black running shoes under $100`
- `wireless gaming mouse`
- `minimalist white hoodie`

## Notes and limitations

- Product data is mock local JSON; view history is stored in `backend/data/views.json`.
- Sessions are anonymous (`X-Session-Id` header only); there is no user auth.
- No payment, admin workflows, or production infrastructure is included.
