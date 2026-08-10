/* eslint-disable react/prop-types */
import { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import {
  getEffectiveProductPrice,
  getPrimaryProductImage,
} from "../utils/productMapping";
import { ShimmerImage } from "./Skeletons";

const getLimitedStock = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const stock = Number(value);
  return Number.isFinite(stock) ? stock : null;
};

const getStockState = (product) => {
  const mainStock = getLimitedStock(product?.stock);
  const optionStocks = Array.isArray(product?.shadeOptions)
    ? product.shadeOptions.map((option) => getLimitedStock(option?.stock))
    : [];
  const limitedOptionStocks = optionStocks.filter((stock) => stock !== null);
  const allOptionsSoldOut =
    limitedOptionStocks.length > 0 &&
    limitedOptionStocks.length === optionStocks.length &&
    limitedOptionStocks.every((stock) => stock <= 0);
  const availableOptionStocks = limitedOptionStocks.filter((stock) => stock > 0);
  const visibleStock =
    availableOptionStocks.length > 0
      ? Math.min(...availableOptionStocks)
      : mainStock;
  const hasStockCount = visibleStock !== null && Number.isFinite(visibleStock);
  const soldOut =
    Boolean(product?.outOfStock) ||
    (mainStock !== null && mainStock <= 0) ||
    allOptionsSoldOut;
  const lowStock = !soldOut && hasStockCount && visibleStock <= 5;

  return { stock: visibleStock, hasStockCount, soldOut, lowStock };
};

const CollectionProductCard = ({ product }) => {
  const { currency } = useContext(ShopContext);
  const image = getPrimaryProductImage(product);
  const price = Number(product?.price) || 0;
  const effectivePrice = getEffectiveProductPrice(product);
  const discounted = effectivePrice > 0 && effectivePrice < price;
  const { stock, hasStockCount, soldOut, lowStock } = getStockState(product);
  const sizes = Array.isArray(product?.sizes)
    ? product.sizes.filter((size) => size && String(size).toLowerCase() !== "default")
    : [];
  const brandLabel = product?.brand || "SOTRA BRAND";

  return (
    <article className="group min-w-0 bg-white text-black">
      <div className="relative aspect-[2/3] overflow-hidden rounded-[5px] bg-white">
        <Link
          to={`/Product/${product._id}`}
          aria-label={`View ${product.name}`}
          className="block h-full w-full"
        >
          <ShimmerImage
            src={image}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.025]"
            wrapperClassName="h-full w-full"
            skeletonClassName="bg-[#EAEAEA]"
            loading="lazy"
          />
        </Link>

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

      </div>

      <div className="pt-3">
        <Link to={`/Product/${product._id}`} className="block">
          <h2 className="line-clamp-2 text-[10px] font-semibold uppercase leading-5 tracking-[0.14em] sm:text-sm sm:tracking-[0.16em]">
            {product.name}
          </h2>
        </Link>

        <div className="mt-2 flex flex-col items-start gap-1">
          {discounted && (
            <p className="sotra-old-price text-[15px] sm:text-lg">
              {currency}{price.toFixed(2)} USD
            </p>
          )}
          <p className={`sotra-price text-[18px] font-bold leading-none sm:text-2xl ${discounted ? "sotra-sale-price" : ""}`}>
            {currency}{effectivePrice.toFixed(2)} USD
          </p>
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
        </p>

        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-black/45 sm:text-xs">
          {brandLabel}
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
    </article>
  );
};

export default CollectionProductCard;
