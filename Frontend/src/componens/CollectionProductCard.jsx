/* eslint-disable react/prop-types */
import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiHeart, FiShoppingBag, FiStar } from "react-icons/fi";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import {
  getEffectiveProductPrice,
  getPrimaryProductImage,
  getProductImages,
} from "../utils/productMapping";
import { ShimmerImage } from "./Skeletons";
import { ProductReviewsModal } from "./ProductReviewPanel";
import FireworksOverlay from "./FireworksOverlay";
import { customerPreviewLocked } from "../lib/customerPreview";

const getStockState = (product) => {
  const stock = Number(product?.stock);
  const hasStockCount =
    product?.stock !== undefined &&
    product?.stock !== null &&
    product?.stock !== "" &&
    Number.isFinite(stock);
  const soldOut = Boolean(product?.outOfStock) || (hasStockCount && stock <= 0);
  const lowStock = !soldOut && hasStockCount && stock <= 5;

  return { stock, hasStockCount, soldOut, lowStock };
};

const CollectionProductCard = ({ product }) => {
  const {
    addToCart,
    currency,
    navigate,
    openCart,
    toggleFavorite,
    isFavorite,
  } = useContext(ShopContext);
  const [added, setAdded] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const timersRef = useRef([]);

  const images = getProductImages(product);
  const image = getPrimaryProductImage(product);
  const price = Number(product?.price) || 0;
  const effectivePrice = getEffectiveProductPrice(product);
  const discounted = effectivePrice > 0 && effectivePrice < price;
  const favorite = isFavorite?.(product?._id);
  const rating = Math.max(0, Math.min(5, Number(product?.rating) || 0));
  const reviewCount = Math.max(
    0,
    Number(product?.reviewCount ?? product?.reviewsCount ?? product?.reviews?.length) || 0
  );
  const { stock, hasStockCount, soldOut, lowStock } = getStockState(product);
  const sizes = Array.isArray(product?.sizes)
    ? product.sizes.filter((size) => size && String(size).toLowerCase() !== "default")
    : [];
  const perfumeTypes = Array.isArray(product?.perfumeTypes)
    ? product.perfumeTypes.filter((type) => type && !["default", "_no_perfume_type"].includes(String(type).toLowerCase()))
    : [];
  const perfumeTypeLabel = perfumeTypes[0] || product?.concentration || "";

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  const quickAdd = () => {
    if (added) return;
    if (soldOut) {
      toast.info("This product is out of stock.");
      return;
    }

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
    setAdded(true);

    timersRef.current.push(
      window.setTimeout(() => setCelebrating(true), 1180),
      window.setTimeout(() => {
        setAdded(false);
        setCelebrating(false);
        if (!customerPreviewLocked) openCart?.();
      }, 2200)
    );
  };

  return (
    <article className="group min-w-0 bg-white text-black">
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        <Link
          to={`/Product/${product._id}`}
          aria-label={`View ${product.name}`}
          className="block h-full w-full"
        >
          <ShimmerImage
            src={image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.025]"
            wrapperClassName="h-full w-full"
            skeletonClassName="bg-[#EAEAEA]"
            loading="lazy"
          />
        </Link>

        <button
          type="button"
          onClick={() => {
            toggleFavorite?.(product._id);
          }}
          className="absolute right-2 top-2 grid h-9 w-9 place-items-center border border-black/15 bg-white/95 text-black backdrop-blur-sm transition hover:border-black sm:right-3 sm:top-3 sm:h-10 sm:w-10"
          aria-label={favorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
        >
          <FiHeart className={`h-4 w-4 ${favorite ? "fill-black" : ""}`} />
        </button>

        {(product?.newArrival || discounted) && (
          <div className="absolute left-0 top-3 flex flex-col items-start gap-1">
            {product?.newArrival && (
              <span className="bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-black sm:text-[10px]">
                New
              </span>
            )}
            {discounted && (
              <span className="bg-black px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white sm:text-[10px]">
                Sale
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={quickAdd}
          disabled={soldOut || added}
          className={`absolute bottom-2 right-2 grid h-12 w-12 place-items-center rounded-full bg-black text-white transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 sm:bottom-3 sm:right-3 sm:h-14 sm:w-14 ${
            added ? "scale-110 ring-4 ring-black/15" : ""
          }`}
          aria-label={soldOut ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
        >
          {added ? (
            <FiCheck className="h-5 w-5" />
          ) : (
            <FiShoppingBag className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="pt-3">
        <div className="flex min-h-5 items-center gap-1.5">
          {images.slice(0, 4).map((item, index) => (
            <span
              key={`${product._id}-image-${index}`}
              className="grid h-5 w-5 place-items-center overflow-hidden rounded-full border border-black/35 bg-white p-0.5"
            >
              <img src={item} alt="" className="h-full w-full rounded-full object-cover" />
            </span>
          ))}
          {images.length > 4 && (
            <span className="ml-1 text-[10px] text-black/55">+{images.length - 4}</span>
          )}
        </div>

        <Link to={`/Product/${product._id}`} className="mt-3 block">
          <h2 className="line-clamp-2 text-[11px] font-semibold uppercase leading-5 tracking-[0.16em] sm:text-sm">
            {product.name}
          </h2>
        </Link>

        <button
          type="button"
          onClick={() => setReviewsOpen(true)}
          className="mt-2 flex items-center gap-1 text-left transition hover:opacity-70"
          aria-label={`Open ${product.name} reviews`}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <FiStar
              key={index}
              className={`h-3.5 w-3.5 ${
                index < Math.round(rating) ? "fill-black text-black" : "text-black/20"
              }`}
            />
          ))}
          <span className="ml-1 text-[10px] uppercase tracking-[0.1em] text-black/45">
            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </button>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-base font-light tracking-[0.04em] sm:text-xl">
            {currency}{effectivePrice.toFixed(2)} USD
          </p>
          {discounted && (
            <p className="text-xs text-black/40 line-through sm:text-sm">
              {currency}{price.toFixed(2)}
            </p>
          )}
        </div>

        <p
          className={`mt-2 text-[9px] font-semibold uppercase tracking-[0.15em] sm:text-[10px] ${
            soldOut ? "text-black/40" : lowStock ? "text-[#a24c68]" : "text-black/55"
          }`}
        >
          {soldOut
            ? "Out of stock"
            : hasStockCount
              ? lowStock
                ? `Only ${stock} left`
                : `${stock} in stock`
              : "Available"}
          {perfumeTypeLabel ? ` / ${perfumeTypeLabel}` : ""}
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

      </div>

      {celebrating && <FireworksOverlay />}
      <ProductReviewsModal
        product={product}
        open={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
      />
    </article>
  );
};

export default CollectionProductCard;
