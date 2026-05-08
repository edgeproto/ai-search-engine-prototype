import type { Product } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

type ResultsGridProps = {
  products: Product[];
};

export function ResultsGrid({ products }: ResultsGridProps) {
  return (
    <section className="resultsGrid" aria-live="polite">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}
