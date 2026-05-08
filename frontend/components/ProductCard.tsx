import Image from "next/image";
import type { Product } from "@/lib/api";

type ProductCardProps = {
  product: Product;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80";

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="productCard">
      <div className="productImageWrap">
        <Image
          className="productImage"
          src={product.image_url ?? fallbackImage}
          alt={product.name}
          fill
          sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw"
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
        {product.tags.length > 0 ? (
          <ul className="tagList">
            {product.tags.map((tag) => (
              <li key={`${product.id}-${tag}`} className="tag">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
