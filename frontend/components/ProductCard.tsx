import Image from "next/image";
import type { KeyboardEvent } from "react";
import type { Product } from "@/lib/api";

type ProductCardProps = {
  product: Product;
  variant?: "grid" | "list";
  onView?: (product: Product) => void;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80";

export function ProductCard({ product, variant = "grid", onView }: ProductCardProps) {
  const isList = variant === "list";

  function handleActivate() {
    onView?.(product);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  }

  const cardContent = (
    <>
      <div className="productImageWrap">
        <Image
          className="productImage"
          src={product.image_url ?? fallbackImage}
          alt={product.name}
          fill
          sizes={
            isList
              ? "(max-width: 680px) 112px, 160px"
              : "(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw"
          }
        />
      </div>
      <div className="productBody">
        <p className="productCategory">{product.category ?? "General"}</p>
        <h3 className="productName">{product.name}</h3>
        <p className="productDescription">{product.description}</p>
        <div className="productMetaRow">
          <strong className="productPrice">${product.price.toFixed(2)}</strong>
          {product.color ? <span className="productColor">{product.color}</span> : null}
        </div>
      </div>
    </>
  );

  if (!onView) {
    return (
      <article className={`productCard productCard--${variant}`}>{cardContent}</article>
    );
  }

  return (
    <button
      type="button"
      className={`productCard productCard--${variant} productCard--clickable`}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      aria-label={`View ${product.name}`}
    >
      {cardContent}
    </button>
  );
}
