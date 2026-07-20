/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiHeart } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import { normalizeColor } from "../utils/colorUtils";
import { getPrimaryProductImage } from "../utils/productMapping";
import { ShimmerImage } from "./Skeletons";

// Map a few common color names -> hex (fallback: use the value as-is)


const ProductItem = ({
  id,
  name,
  image,
  price,
  discountPrice,
  onSales,
  outOfStock,
  colors = [],
  sizes = [],
  category,
  subCategory,
  concentration,
  perfumeTypes = [],
  stock,
}) => {
  const { toggleFavorite, isFavorite } = useContext(ShopContext);
  const finalImage = getPrimaryProductImage({ image });
  const hasDiscount = Number(discountPrice) > 0 && Number(discountPrice) < Number(price);
  const pct =
    hasDiscount ? Math.round((1 - Number(discountPrice) / Number(price)) * 100) : 0;
  const metaLabel = subCategory || category;
  const hasStock = stock !== undefined && stock !== null && stock !== "";
  const stockNumber = Number(stock);
  const hasValidStock = hasStock && Number.isFinite(stockNumber);
  const isSoldOut = Boolean(outOfStock) || (hasValidStock && stockNumber <= 0);
  const isLowStock = hasValidStock && stockNumber > 0 && stockNumber <= 5;
  const stockLabel = isSoldOut
    ? "Out of stock"
    : hasValidStock
      ? `${stockNumber} in stock`
      : "";
  const stockBadgeLabel = isSoldOut
    ? "Out of stock"
    : hasValidStock
      ? isLowStock
        ? `${stockNumber} left`
        : `${stockNumber} in stock`
      : "";
  const favorite = isFavorite?.(id);
  const perfumeLabels = Array.isArray(perfumeTypes) && perfumeTypes.length
    ? perfumeTypes
    : concentration
      ? [concentration]
      : [];

  return (
    <div
      className="group relative overflow-hidden rounded-md border border-[#e5e5e5] bg-white shadow-[0_14px_34px_rgba(43,32,22,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#d4b47a] hover:shadow-[0_22px_45px_rgba(43,32,22,0.11)]"
      title={name}
    >
      <Link to={`/Product/${id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-white">
          {pct > 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-[#7b2d2d] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
              -{pct}%
            </span>
          )}
          {isSoldOut && (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-black/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
              {stockBadgeLabel}
            </span>
          )}
          {!isSoldOut && hasValidStock && (
            <span className="absolute right-3 top-3 z-10 rounded-full border border-black/15 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black shadow-sm backdrop-blur">
              {stockBadgeLabel}
            </span>
          )}

          {finalImage ? (
            <ShimmerImage
              src={finalImage}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              wrapperClassName="h-full w-full"
              skeletonClassName="bg-[#EAEAEA]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full skeleton-shimmer" />
          )}

          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
            {metaLabel && (
              <span className="rounded-full bg-white/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b6047] shadow-sm backdrop-blur">
                {metaLabel}
              </span>
            )}
            <span className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-[#000000]/88 text-white shadow-sm transition group-hover:bg-[#000000]">
              <FiArrowUpRight className="h-4 w-4" />
            </span>
          </div>

          {onSales && !hasDiscount && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-[#000000]/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              Sale
            </span>
          )}
        </div>
      </Link>

      <div className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/Product/${id}`} className="min-w-0">
            <p className="line-clamp-1 font-serif text-[17px] leading-tight text-[#000000] sm:text-lg">
              {name}
            </p>
          </Link>
          <button
            type="button"
            onClick={() => toggleFavorite?.(id)}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border shadow-sm transition ${
              favorite
                ? "border-[#7b2d2d] bg-[#7b2d2d] text-white"
                : "border-[#e5e5e5] bg-white text-[#7b6047] hover:border-[#000000] hover:text-[#000000]"
            }`}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            title={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <FiHeart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
          </button>
        </div>

          <div className="mt-2 flex min-h-6 flex-wrap items-center gap-2">
            {perfumeLabels.slice(0, 2).map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-[#d8c8b5] bg-white px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[#374151]"
                >
                  {type}
                </span>
              ))}
            {Array.isArray(sizes) && sizes.length > 0 ? (
              sizes.slice(0, 2).map((size) => (
                <span
                  key={size}
                  className="rounded-full border border-[#e5e5e5] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[#8a715a]"
                >
                  {size}
                </span>
              ))
            ) : Array.isArray(colors) && colors.length > 0 ? (
              colors.slice(0, 4).map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className="h-4 w-4 rounded-full ring-2 ring-[#ffffff] shadow-sm"
                  style={{ backgroundColor: normalizeColor(c) }}
                  title={String(c)}
                />
              ))
            ) : null}
          </div>

          {stockLabel && (
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  isSoldOut ? "bg-black/35" : "bg-black"
                }`}
              />
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                  isLowStock || isSoldOut ? "text-black" : "text-black/55"
                }`}
              >
                {stockLabel}
              </p>
            </div>
          )}

          <div className="mt-3 flex items-end gap-2">
            {hasDiscount ? (
              <>
                <span className="sotra-price sotra-sale-price text-base font-bold">
                  ${Number(discountPrice).toFixed(2)}
                </span>
                <span className="sotra-old-price text-sm">
                  ${Number(price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="sotra-price text-base font-bold text-[#000000]">
                ${Number(price).toFixed(2)}
              </span>
            )}
          </div>
        </div>
    </div>
  );
};

export default ProductItem;
