/* eslint-disable react/prop-types */
import { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { ShimmerImage } from "./Skeletons";
import {
  getEffectiveProductPrice,
  getPrimaryProductImage,
} from "../utils/productMapping";

const SubcategoryProductResults = ({ products, subcategory, title }) => {
  const { currency } = useContext(ShopContext);
  const visibleProducts = products.slice(0, 4);
  const collectionHref = `/collection?cat=${encodeURIComponent(
    subcategory?.groupLabel || ""
  )}&sub=${encodeURIComponent(subcategory?.label || "")}`;

  if (!visibleProducts.length) return null;

  return (
    <section className="bg-white px-4 pb-16 pt-12 sm:px-6 lg:px-10 lg:pb-20">
      <div className="mx-auto max-w-[1480px]">
        <h2 className="text-center text-3xl font-black uppercase leading-tight sm:text-4xl lg:text-5xl">
          {title || subcategory.label}
        </h2>

        <div className="mt-9 grid grid-cols-2 gap-x-2 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {visibleProducts.map((product) => {
            const image = getPrimaryProductImage(product);
            const price = getEffectiveProductPrice(product);
            const stock = Number(product.stock);
            const soldOut =
              Boolean(product.outOfStock) ||
              (Number.isFinite(stock) && product.stock !== "" && stock <= 0);
            const sizes = Array.isArray(product.sizes)
              ? product.sizes.filter((size) => size && String(size).toLowerCase() !== "default")
              : [];
            const brandLabel = product?.brand || "SOTRA BRAND";
            return (
              <article key={product._id} className="min-w-0 bg-white">
                <div className="relative aspect-[2/3] overflow-hidden rounded-[5px] bg-white">
                  <Link to={`/Product/${product._id}`} className="block h-full w-full">
                    <ShimmerImage
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-cover object-center"
                      wrapperClassName="h-full w-full"
                      skeletonClassName="bg-[#EAEAEA]"
                      loading="lazy"
                    />
                  </Link>

                </div>

                <Link to={`/Product/${product._id}`} className="mt-4 block">
                  <h3 className="line-clamp-2 text-sm uppercase tracking-[0.2em] text-black sm:text-base">
                    {product.name}
                  </h3>
                </Link>
                <p className="sotra-price mt-2 text-[18px] font-bold leading-none text-black sm:text-2xl">
                  {currency}{price.toFixed(2)} USD
                </p>
                {sizes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {sizes.map((size) => (
                      <span
                        key={size}
                        className="border border-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-black/55"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45">
                  {soldOut ? "Out of stock" : "Available"}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-black/45">
                  {brandLabel}
                </p>
              </article>
            );
          })}
        </div>

        <Link
          to={collectionHref}
          className="mt-12 flex h-16 w-full items-center justify-center bg-black text-sm font-semibold uppercase tracking-[0.34em] text-white transition hover:bg-[#242424] active:scale-[0.99]"
        >
          View All
        </Link>
      </div>
    </section>
  );
};

export default SubcategoryProductResults;
