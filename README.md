# AI Product Search Prototype

A monorepo MVP with a FastAPI backend and a Next.js frontend for natural-language product search.

## What this includes

- Backend API with `GET /api/search?q=...` and a health endpoint at `GET /health`
- Search intent parsing via OpenAI (with local parsing fallback)
- Relevance-first ranking over local mock product data
- Simple responsive frontend for query input and product cards

## Tech stack

- Backend: FastAPI, Pydantic, OpenAI Python SDK
- Frontend: Next.js (App Router), React, TypeScript
- Data: local JSON dataset in `backend/data/products.json`

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

### Health check

```bash
curl "http://localhost:8000/health"
```

### Search endpoint

```bash
curl --get "http://localhost:8000/api/search" --data-urlencode "q=black running shoes under 100"
```

Response shape:

- `query`: original user query
- `intent`: parsed structured intent (`keywords`, `color`, `max_price`, `product_type`, `style`, `attributes`)
- `results`: ranked product array
- `total`: number of results

## Example queries to try

- `black running shoes under $100`
- `wireless gaming mouse`
- `minimalist white hoodie`

## Notes and limitations

- Product data is mock local JSON.
- No auth, payment, admin workflows, or production infrastructure is included.
