import type { Product } from "@/lib/api";
import type { ResultViewMode } from "@/components/ViewModeToggle";
import { ProductCard } from "@/components/ProductCard";

type ResultsGridProps = {
  products: Product[];
  viewMode: ResultViewMode;
};

export function ResultsGrid({ products, viewMode }: ResultsGridProps) {
  const isList = viewMode === "list";
  return (
    <section
      className={isList ? "resultsList" : "resultsGrid"}
      aria-live="polite"
      aria-label={isList ? "Products as list" : "Products as grid"}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant={viewMode} />
      ))}
    </section>
  );
}
