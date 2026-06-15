import type { Product } from "@/lib/api";

export type ResultSortOption = "relevance" | "price-asc" | "price-desc" | "name-asc";

export const SORT_OPTIONS: { value: ResultSortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

export function sortProducts(
  products: Product[],
  sort: ResultSortOption,
): Product[] {
  if (sort === "relevance") {
    return products;
  }

  const sorted = [...products];

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return products;
  }
}
