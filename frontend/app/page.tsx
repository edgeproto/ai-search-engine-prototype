"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PaginationControls } from "@/components/PaginationControls";
import { RecentlyViewedPanel } from "@/components/RecentlyViewedPanel";
import { ResultsGrid } from "@/components/ResultsGrid";
import { SearchBar } from "@/components/SearchBar";
import { ViewModeToggle, type ResultViewMode } from "@/components/ViewModeToggle";
import {
  getRecentViews,
  recordProductView,
  searchProducts,
  type Product,
  type SearchResponse,
} from "@/lib/api";
import { getOrCreateSessionId } from "@/lib/session";

const defaultQuery = "black running shoes under 100";
const PAGE_SIZE = 12;

export default function HomePage() {
  const [query, setQuery] = useState(defaultQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [resultView, setResultView] = useState<ResultViewMode>("grid");
  const [recentViews, setRecentViews] = useState<Product[]>([]);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const loadRecentViews = useCallback(async () => {
    const id = sessionId || getOrCreateSessionId();
    if (!id) {
      return;
    }

    try {
      const response = await getRecentViews(id);
      setRecentViews(response.products);
    } catch {
      setRecentViews([]);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    void loadRecentViews();
  }, [sessionId, loadRecentViews]);

  const handleProductView = useCallback(
    async (product: Product) => {
      const id = sessionId || getOrCreateSessionId();
      if (!id) {
        return;
      }

      try {
        await recordProductView(product.id, id);
        await loadRecentViews();
      } catch {
        // View tracking is best-effort; search UI should stay usable.
      }
    },
    [sessionId, loadRecentViews],
  );

  const statusText = useMemo(() => {
    if (loading) {
      return "Searching products...";
    }
    if (error) {
      return error;
    }
    if (!data) {
      return "Search for products to see results.";
    }
    if (data.total === 0) {
      return `No results found for "${data.query}".`;
    }
    return `${data.total} result${data.total === 1 ? "" : "s"} for "${data.query}".`;
  }, [data, error, loading]);

  const totalPages = useMemo(() => {
    if (!data?.results.length) {
      return 1;
    }
    return Math.max(1, Math.ceil(data.results.length / PAGE_SIZE));
  }, [data]);

  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedResults = useMemo(() => {
    if (!data?.results.length) {
      return [];
    }
    const start = (safePage - 1) * PAGE_SIZE;
    return data.results.slice(start, start + PAGE_SIZE);
  }, [data, safePage]);

  async function runSearch() {
    const currentQuery = query.trim();
    if (!currentQuery) {
      return;
    }

    setLoading(true);
    setError(null);
    setLastQuery(currentQuery);

    try {
      const id = sessionId || getOrCreateSessionId();
      const response = await searchProducts(currentQuery, id);
      setData(response);
      setPage(1);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while searching. Please try again.";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">AI Product Search Prototype</p>
        <h1>Find products with natural language</h1>
        <p className="subtitle">
          Search by style, budget, product type, or color and get relevance-ranked
          results.
        </p>
      </section>

      <SearchBar value={query} onChange={setQuery} onSubmit={runSearch} disabled={loading} />

      <section className="statusCard" aria-live="polite">
        <p>{statusText}</p>
        {lastQuery && !loading && !error ? (
          <small>Last request: {lastQuery}</small>
        ) : null}
      </section>

      <RecentlyViewedPanel products={recentViews} onView={handleProductView} />

      {data && data.results.length > 0 ? (
        <>
          <div className="resultsToolbar">
            <ViewModeToggle value={resultView} onChange={setResultView} disabled={loading} />
          </div>
          <ResultsGrid
            products={paginatedResults}
            viewMode={resultView}
            onView={handleProductView}
          />
          <PaginationControls
            page={safePage}
            pageSize={PAGE_SIZE}
            totalItems={data.results.length}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </main>
  );
}
