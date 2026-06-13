/* eslint-disable react/prop-types */
import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiShoppingBag, FiStar } from "react-icons/fi";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { ShimmerImage } from "./Skeletons";
import FireworksOverlay from "./FireworksOverlay";
import { ProductReviewsModal } from "./ProductReviewPanel";
import { customerPreviewLocked } from "../lib/customerPreview";
import {
  getEffectiveProductPrice,
  getPrimaryProductImage,
} from "../utils/productMapping";

const SubcategoryProductResults = ({ products, subcategory, title }) => {
  const { addToCart, currency, navigate, openCart } = useContext(ShopContext);
  const [addedId, setAddedId] = useState("");
  const [reviewProduct, setReviewProduct] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const timersRef = useRef([]);
  const visibleProducts = products.slice(0, 4);
  const collectionHref = `/collection?cat=${encodeURIComponent(
    subcategory?.groupLabel || ""
  )}&sub=${encodeURIComponent(subcategory?.label || "")}`;

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  const quickAdd = (product) => {
    if (addedId) return;

    const stock = Number(product.stock);
    const soldOut =
      Boolean(product.outOfStock) ||
      (Number.isFinite(stock) && product.stock !== "" && stock <= 0);
    if (soldOut) {
      toast.info("This product is out of stock.");
      return;
    }

    const sizes = Array.isArray(product.sizes)
      ? product.sizes.filter((size) => size && String(size).toLowerCase() !== "default")
      : [];
    const perfumeTypes = Array.isArray(product.perfumeTypes)
      ? product.perfumeTypes.filter((type) => type && !["default", "_no_perfume_type"].includes(String(type).toLowerCase()))
      : [];
    const perfumeTypeLabel = perfumeTypes[0] || product.concentration || "";
    if (sizes.length) {
      toast.info("Please choose a size first.", {
        position: "top-center",
        autoClose: 1400,
        hideProgressBar: true,
      });
      navigate(`/Product/${product._id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!customerPreviewLocked) {
      addToCart?.(product._id, null, null, 1, perfumeTypeLabel || null);
    }
    setAddedId(product._id);

    timersRef.current.push(
      window.setTimeout(() => setCelebrating(true), 1180),
      window.setTimeout(() => {
        setAddedId("");
        setCelebrating(false);
        if (!customerPreviewLocked) openCart?.();
      }, 2200)
    );
  };

  if (!visibleProducts.length) return null;

  return (
    <section className="bg-white px-4 pb-16 pt-12 sm:px-6 lg:px-10 lg:pb-20">
      <div className="mx-auto max-w-[1480px]">
        <h2 className="text-center text-3xl font-black uppercase leading-tight sm:text-4xl lg:text-5xl">
          {title || subcategory.label}
        </h2>

        <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {visibleProducts.map((product) => {
            const image = getPrimaryProductImage(product);
            const productImages = Array.isArray(product.image) ? product.image : [];
            const price = getEffectiveProductPrice(product);
            const stock = Number(product.stock);
            const soldOut =
              Boolean(product.outOfStock) ||
              (Number.isFinite(stock) && product.stock !== "" && stock <= 0);
            const sizes = Array.isArray(product.sizes)
              ? product.sizes.filter((size) => size && String(size).toLowerCase() !== "default")
              : [];
            const perfumeTypes = Array.isArray(product.perfumeTypes)
              ? product.perfumeTypes.filter((type) => type && !["default", "_no_perfume_type"].includes(String(type).toLowerCase()))
              : [];
            const perfumeTypeLabel = perfumeTypes[0] || product.concentration || "";
            const rating = Math.max(0, Math.min(5, Number(product?.rating) || 0));
            const reviewCount = Math.max(
              0,
              Number(product?.reviewCount ?? product?.reviewsCount ?? product?.reviews?.length) || 0
            );

            return (
              <article key={product._id} className="min-w-0 bg-white">
                <div className="relative aspect-[3/4] overflow-hidden bg-white">
                  <Link to={`/Product/${product._id}`} className="block h-full w-full">
                    <ShimmerImage
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-contain"
                      wrapperClassName="h-full w-full"
                      skeletonClassName="bg-[#EAEAEA]"
                      loading="lazy"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() => quickAdd(product)}
                    disabled={soldOut || Boolean(addedId)}
                    className={`absolute bottom-3 right-3 grid h-12 w-12 place-items-center rounded-full bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 lg:h-14 lg:w-14 ${
                      addedId === product._id ? "scale-110 ring-4 ring-black/15" : ""
                    }`}
                    aria-label={soldOut ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
                  >
                    {addedId === product._id ? (
                      <FiCheck className="h-5 w-5" />
                    ) : (
                      <FiShoppingBag className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {productImages.length > 0 && (
                  <div className="mt-3 flex min-h-5 items-center gap-2">
                    {productImages.slice(0, 4).map((item, index) => (
                      <span
                        key={`${product._id}-choice-${index}`}
                        className="grid h-5 w-5 place-items-center overflow-hidden rounded-full border border-black/50 bg-white p-0.5"
                      >
                        <img src={item} alt="" className="h-full w-full rounded-full object-cover" />
                      </span>
                    ))}
                    {productImages.length > 4 && (
                      <span className="text-xs text-black/70">+{productImages.length - 4}</span>
                    )}
                  </div>
                )}

                <Link to={`/Product/${product._id}`} className="mt-4 block">
                  <h3 className="line-clamp-2 text-sm uppercase tracking-[0.2em] text-black sm:text-base">
                    {product.name}
                  </h3>
                </Link>
                <button
                  type="button"
                  onClick={() => setReviewProduct(product)}
                  className="mt-2 flex items-center gap-1 text-left transition hover:opacity-70"
                  aria-label={`Open ${product.name} reviews`}
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FiStar
                      key={index}
                      className={`h-3.5 w-3.5 ${
                        index < Math.round(rating)
                          ? "fill-black text-black"
                          : "text-black/20"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-[10px] uppercase tracking-[0.1em] text-black/45">
                    {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </button>
                <p className="mt-2 text-xl font-light tracking-[0.05em] text-black sm:text-2xl">
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
                  {perfumeTypeLabel ? ` / ${perfumeTypeLabel}` : ""}
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
      {celebrating && <FireworksOverlay />}
      <ProductReviewsModal
        product={reviewProduct}
        open={Boolean(reviewProduct)}
        onClose={() => setReviewProduct(null)}
      />
    </section>
  );
};

export default SubcategoryProductResults;
