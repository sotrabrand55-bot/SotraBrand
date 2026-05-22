/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiHeart } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../componens/RelatedProducts";
import { ShimmerImage } from "../componens/Skeletons";

const toArray = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v;
  const s = String(v).trim();
  if (!s) return [];
  if (s.startsWith("[") || s.startsWith("{")) {
    try {
      const j = JSON.parse(s);
      return Array.isArray(j) ? j : [];
    } catch {}
  }
  return s.split(",").map((x) => x.trim()).filter(Boolean);
};

const isNumericSize = (x) => /^[0-9]+(?:\.[0-9]+)?$/.test(String(x));

const TOAST_OPTS = {
  autoClose: 1000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: false,
  closeButton: false,
  position: "top-center",
};

const getStockCount = (product) => {
  if (
    product?.stock === undefined ||
    product?.stock === null ||
    product?.stock === ""
  ) {
    return null;
  }
  const value = Number(product?.stock);
  return Number.isFinite(value) ? value : null;
};

const SkeletonBlock = ({ className = "" }) => (
  <div className={`skeleton-shimmer rounded-md ${className}`} />
);

const ProductSkeleton = () => (
  <main className="bg-[#fffaf4] px-4 py-10 sm:px-[5vw] md:px-[7vw] lg:px-[3vw]">
    <div className="mx-auto grid max-w-[1480px] gap-8 lg:grid-cols-[1.04fr_0.96fr]">
      <SkeletonBlock className="aspect-[4/5] rounded-md" />
      <div className="space-y-5">
        <SkeletonBlock className="h-5 w-48 rounded-full" />
        <SkeletonBlock className="h-14 w-3/4" />
        <SkeletonBlock className="h-8 w-36" />
        <SkeletonBlock className="h-24 w-full" />
        <SkeletonBlock className="h-12 w-48 rounded-full" />
      </div>
    </div>
  </main>
);

const Product = () => {
  const { productId } = useParams();
  const {
    products,
    productsLoading,
    currency,
    addToCart,
    toggleFavorite,
    isFavorite,
  } = useContext(ShopContext);

  const [productData, setProductData] = useState(false);
  const [Image, setImage] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [Size, setSize] = useState("");
  const [PantsSize, setPantsSize] = useState("");
  const [clicked, setClicked] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const fetchProductData = () => {
    products.forEach((item) => {
      if (item._id === productId) {
        const normalizedImages = Array.isArray(item.image)
          ? item.image
              .map((im) => (typeof im === "string" ? im : im?.url || ""))
              .filter(Boolean)
          : toArray(item.image);

        setProductData({
          ...item,
          sizes: toArray(item.sizes),
          colors: toArray(item.colors),
          image: normalizedImages,
        });
        setImage(normalizedImages[0] || "");
        setImageLoading(Boolean(normalizedImages[0]));
      }
    });
  };

  useEffect(() => {
    fetchProductData();
    scrollTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, products]);

  const letterSizes = (productData?.sizes || []).filter((s) => !isNumericSize(s));
  const pantsSizes = (productData?.sizes || []).filter(isNumericSize);
  const stockCount = getStockCount(productData);
  const hasStockCount = stockCount !== null;
  const isOut = Boolean(productData?.outOfStock) || (hasStockCount && stockCount <= 0);
  const isLowStock = hasStockCount && stockCount > 0 && stockCount <= 5;
  const favorite = productData?._id ? isFavorite?.(productData._id) : false;

  const fullDesc = String(productData?.description || "");
  const SHORT_LEN = 220;
  const isLong = fullDesc.length > SHORT_LEN;
  const shownDesc = descExpanded ? fullDesc : fullDesc.slice(0, SHORT_LEN);

  const hasDiscount =
    typeof productData.discountPrice === "number" &&
    productData.discountPrice > 0 &&
    productData.discountPrice < Number(productData.price);

  const handleAddToCart = () => {
    if (isOut) return;
    const chosenSize = PantsSize || Size;
    const needsSize = letterSizes.length > 0 || pantsSizes.length > 0;

    if (needsSize && !chosenSize) {
      scrollTop();
      toast.warn("Please select a size", TOAST_OPTS);
      return;
    }

    addToCart(productData._id, chosenSize || null, null, 1);
    toast.success("Added to cart", TOAST_OPTS);
    setClicked(true);
    scrollTop();
    setTimeout(() => setClicked(false), 500);
  };

  const toggleLetterSize = (val) => {
    setSize((prev) => (prev === val ? "" : val));
    setPantsSize("");
  };

  const togglePantsSize = (val) => {
    const s = String(val);
    setPantsSize((prev) => (prev === s ? "" : s));
    setSize("");
  };

  if (productsLoading && !productData) return <ProductSkeleton />;

  return productData ? (
    <main className="bg-[#fffaf4] text-[#1f1b17]">
      <section className="border-b border-[#eadfce] px-4 py-10 sm:px-[5vw] md:px-[7vw] lg:px-[3vw] lg:py-14">
        <div className="mx-auto grid max-w-[1480px] gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12">
          <div className="grid gap-4 sm:grid-cols-[86px_1fr]">
            <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
              {productData.image.map((item, index) => (
                <button
                  type="button"
                  onClick={() => {
                    setImageLoading(true);
                    setImage(item);
                  }}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-[#f3eadf] transition sm:h-24 sm:w-full ${
                    Image === item
                      ? "border-[#c49a5e] shadow-[0_10px_24px_rgba(43,32,22,0.12)]"
                      : "border-[#eadfce] hover:border-[#c49a5e]"
                  }`}
                  key={index}
                  aria-label={`View product image ${index + 1}`}
                >
                  <ShimmerImage
                    src={item}
                    className="h-full w-full object-cover"
                    wrapperClassName="h-full w-full"
                    skeletonClassName="bg-[#E9DFD3]"
                    alt=""
                  />
                </button>
              ))}
            </div>

            <div className="order-1 sm:order-2">
              <div className="relative overflow-hidden rounded-md border border-[#eadfce] bg-[#f3eadf] shadow-[0_24px_60px_rgba(43,32,22,0.12)]">
                <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
                  {productData.onSales && (
                    <span className="rounded-full bg-[#7b2d2d] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                      Sale
                    </span>
                  )}
                  {productData.bestseller && (
                    <span className="rounded-full bg-[#1f1b17]/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                      Bestseller
                    </span>
                  )}
                </div>

                <div className="relative aspect-[4/5]">
                  {imageLoading && (
                    <SkeletonBlock className="absolute inset-0 h-full w-full rounded-none" />
                  )}
                  {Image ? (
                    <img
                      className={`h-full w-full object-cover transition duration-500 ${
                        imageLoading ? "opacity-0 scale-[1.01]" : "opacity-100 scale-100"
                      }`}
                      src={Image}
                      alt={productData?.name || "product"}
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
                    />
                  ) : (
                    <SkeletonBlock className="h-full w-full rounded-none" />
                  )}
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1f1b17]/35 to-transparent" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:pl-2">
            <div className="mb-4 flex w-fit items-center gap-3 text-[#c49a5e]">
              <span className="h-px w-10 bg-current" />
              <span className="h-2.5 w-2.5 rotate-45 bg-current" />
              <span className="h-px w-10 bg-current" />
            </div>

            <div className="flex flex-wrap gap-2">
              {productData.category && (
                <span className="rounded-full border border-[#eadfce] bg-[#fffdf9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b6047]">
                  {productData.category}
                </span>
              )}
              {productData.subCategory && (
                <span className="rounded-full border border-[#eadfce] bg-[#fffdf9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b6047]">
                  {productData.subCategory}
                </span>
              )}
              {productData.concentration && (
                <span className="rounded-full border border-[#d8c8b5] bg-[#fffaf4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f5844]">
                  {productData.concentration}
                </span>
              )}
              {productData.newArrival && (
                <span className="rounded-full border border-[#d7eadc] bg-[#eef8f0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2f6c4d]">
                  New
                </span>
              )}
            </div>

            <h1 className="mt-5 font-serif text-4xl leading-none text-[#1f1b17] sm:text-5xl lg:text-6xl">
              {productData.name}
            </h1>

            {hasStockCount && (
              <div
                className={`mt-5 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                  isOut
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : isLowStock
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isOut ? "bg-rose-600" : isLowStock ? "bg-amber-600" : "bg-emerald-600"
                  }`}
                />
                {isOut ? "0 in stock" : `${stockCount} in stock`}
              </div>
            )}

            {hasDiscount ? (
              <p className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-[#7b2d2d]">
                  {currency}
                  {productData.discountPrice}
                </span>
                <span className="text-lg text-[#a59586] line-through">
                  {currency}
                  {productData.price}
                </span>
              </p>
            ) : (
              <p className="mt-6 text-3xl font-semibold text-[#1f1b17]">
                {currency}
                {productData.price}
              </p>
            )}

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#7d6756]">
              {shownDesc}
              {isLong && !descExpanded ? "..." : ""}
            </p>
            {isLong && (
              <button
                onClick={() => setDescExpanded((v) => !v)}
                className="mt-2 w-fit text-xs font-semibold uppercase tracking-[0.14em] text-[#9a8068] underline-offset-4 hover:underline"
              >
                {descExpanded ? "Show less" : "Read more"}
              </button>
            )}

            {letterSizes.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f5844]">
                  Bottle Size
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {letterSizes.map((item, index) => (
                    <button
                      onClick={() => toggleLetterSize(item)}
                      className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                        item === Size
                          ? "border-[#1f1b17] bg-[#1f1b17] text-white"
                          : "border-[#d8c8b5] bg-[#fffdf9] text-[#6f5844] hover:border-[#c49a5e] hover:text-[#1f1b17]"
                      }`}
                      key={index}
                      aria-pressed={item === Size}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pantsSizes.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f5844]">
                  Volume
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pantsSizes.map((n, idx) => {
                    const s = String(n);
                    return (
                      <button
                        onClick={() => togglePantsSize(s)}
                        className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                          s === PantsSize
                            ? "border-[#1f1b17] bg-[#1f1b17] text-white"
                            : "border-[#d8c8b5] bg-[#fffdf9] text-[#6f5844] hover:border-[#c49a5e] hover:text-[#1f1b17]"
                        }`}
                        key={idx}
                        aria-pressed={s === PantsSize}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAddToCart}
                disabled={isOut}
                aria-disabled={isOut}
                title={isOut ? "Out of stock" : "Add to cart"}
                className={`inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] shadow transition ${
                  isOut
                    ? "cursor-not-allowed bg-[#d6cfc5] text-[#83776b]"
                    : `bg-[#1f1b17] text-white hover:bg-[#c49a5e] ${clicked ? "scale-[1.03]" : ""}`
                }`}
              >
                {isOut ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite?.(productData._id)}
                className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] shadow-sm transition ${
                  favorite
                    ? "border-[#7b2d2d] bg-[#7b2d2d] text-white"
                    : "border-[#d8c8b5] bg-[#fffdf9] text-[#1f1b17] hover:border-[#c49a5e]"
                }`}
                aria-pressed={favorite}
              >
                <FiHeart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
                {favorite ? "Saved" : "Favorite"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-[5vw] md:px-[7vw] lg:px-[3vw]">
        <div className="mx-auto max-w-[1480px] border-y border-[#eadfce] py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8068]">
            Description
          </p>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#7d6756] sm:text-base">
            {productData.description}
          </p>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-[5vw] md:px-[7vw] lg:px-[3vw]">
        <div className="mx-auto max-w-[1480px]">
          <RelatedProducts
            category={productData.category}
            subCategory={productData.subCategory}
            currentId={productData._id}
          />
        </div>
      </section>
    </main>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
