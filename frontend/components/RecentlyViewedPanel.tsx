import type { Product } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

type RecentlyViewedPanelProps = {
  products: Product[];
  onView?: (product: Product) => void;
};

export function RecentlyViewedPanel({ products, onView }: RecentlyViewedPanelProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="recentlyViewedPanel" aria-label="Recently viewed products">
      <h2 className="recentlyViewedHeading">Recently Viewed</h2>
      <div className="recentlyViewedRow">
        {products.map((product) => (
          <div key={product.id} className="recentlyViewedItem">
            <ProductCard product={product} variant="grid" onView={onView} />
          </div>
        ))}
      </div>
    </section>
  );
}
