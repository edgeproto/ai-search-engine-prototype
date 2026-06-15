export type Product = {
  id: string;
  name: string;
  description: string;
  color: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  tags: string[];
};

export type SearchIntent = {
  keywords: string[];
  color: string | null;
  max_price: number | null;
  product_type: string | null;
  style: string | null;
  attributes: string[];
};

export type SearchResponse = {
  query: string;
  intent: SearchIntent;
  results: Product[];
  total: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type RecentViewsResponse = {
  products: Product[];
};

function sessionHeaders(sessionId: string): HeadersInit {
  return {
    Accept: "application/json",
    "X-Session-Id": sessionId,
  };
}

export async function searchProducts(
  query: string,
  sessionId: string,
): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Search query is required.");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/search?q=${encodeURIComponent(trimmed)}`,
    {
      method: "GET",
      headers: sessionHeaders(sessionId),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Search request failed with status ${response.status}.`);
  }

  return (await response.json()) as SearchResponse;
}

export async function recordProductView(
  productId: string,
  sessionId: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/views`, {
    method: "POST",
    headers: {
      ...sessionHeaders(sessionId),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ product_id: productId }),
  });

  if (!response.ok) {
    throw new Error(`View request failed with status ${response.status}.`);
  }
}

export async function getRecentViews(
  sessionId: string,
): Promise<RecentViewsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/views/recent`, {
    method: "GET",
    headers: sessionHeaders(sessionId),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Recent views request failed with status ${response.status}.`);
  }

  return (await response.json()) as RecentViewsResponse;
}
