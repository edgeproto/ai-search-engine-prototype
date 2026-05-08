"use client";

import { useMemo, useState } from "react";
import { ResultsGrid } from "@/components/ResultsGrid";
import { SearchBar } from "@/components/SearchBar";
import { searchProducts, type SearchResponse } from "@/lib/api";

const defaultQuery = "black running shoes under 100";

export default function HomePage() {
  const [query, setQuery] = useState(defaultQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

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
    return `Showing ${data.total} result${data.total === 1 ? "" : "s"} for "${data.query}".`;
  }, [data, error, loading]);

  async function runSearch() {
    const currentQuery = query.trim();
    if (!currentQuery) {
      return;
    }

    setLoading(true);
    setError(null);
    setLastQuery(currentQuery);

    try {
      const response = await searchProducts(currentQuery);
      setData(response);
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

      {data && data.results.length > 0 ? <ResultsGrid products={data.results} /> : null}
    </main>
  );
}
