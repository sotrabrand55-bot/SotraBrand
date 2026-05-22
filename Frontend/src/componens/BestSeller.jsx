// src/components/BestSeller.jsx
/* eslint-disable no-unused-vars */
import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiHeart } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import { ProductRailSkeleton, ShimmerImage } from "./Skeletons";

const BestSeller = () => {
  const { products, productsLoading, toggleFavorite, isFavorite } =
    useContext(ShopContext);
  const best = useMemo(() => products.filter((p) => p.bestseller), [products]);

  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncEdgeState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setAtStart(scrollLeft <= 4);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 4);
  }, []);

  useEffect(() => {
    syncEdgeState();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => syncEdgeState();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [best.length, syncEdgeState]);

  const scrollByOne = (dir = 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const gap = 24;
    const step = card ? card.clientWidth + gap : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const firstImage = (item) =>
    item?.image?.[0] ||
    item?.images?.[0] ||
    item?.image1 ||
    item?.image2 ||
    item?.image3 ||
    item?.image4 ||
    item?.image ||
    "";

  const getDiscountInfo = (item) => {
    const price = Number(item?.price) || 0;
    const discountPrice = Number(item?.discountPrice);
    const hasDiscount =
      Number.isFinite(discountPrice) &&
      discountPrice > 0 &&
      discountPrice < price;
    const percent = hasDiscount
      ? Math.round(((price - discountPrice) / price) * 100)
      : null;
    return { price, discountPrice, hasDiscount, percent };
  };

  const getStockCount = (item) => {
    if (item?.stock === undefined || item?.stock === null || item?.stock === "") return null;
    const value = Number(item.stock);
    return Number.isFinite(value) ? value : null;
  };

  if (productsLoading) return <ProductRailSkeleton titleWidth="w-44" />;
  if (!best.length) return null;

  return (
    <section className="my-0 py-5 sm:py-6" id="best-seller">
      <div className="mb-9 text-center">
        <div className="mx-auto mb-3 flex w-fit items-center gap-3 text-[#c49a5e]">
          <span className="h-px w-10 bg-current" />
          <span className="h-2.5 w-2.5 rotate-45 bg-current" />
          <span className="h-px w-10 bg-current" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a8068]">
          Customer Favorites
        </p>
        <h2 className="mt-2 font-serif text-5xl leading-none text-[#1f1b17] sm:text-6xl">
          Best Sellers
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#8a7462] sm:text-base">
          Signature perfumes chosen again and again for their lasting trail.
        </p>
      </div>

      <div className="mb-5 flex justify-end px-1">
        <Link
          to="/collection"
          className="hidden items-center gap-3 rounded-full border border-[#1f1b17]/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f1b17] transition hover:border-[#1f1b17] hover:bg-[#1f1b17] hover:text-white sm:inline-flex"
        >
          View all
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollByOne(-1)}
          disabled={atStart}
          className="absolute left-2 top-[42%] z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[#d8c2a5] bg-[#fffaf4]/95 text-[#1f1b17] shadow-[0_14px_32px_rgba(62,45,28,0.16)] backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 md:grid"
          aria-label="Previous"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>

        <div ref={trackRef} className="overflow-x-auto no-scrollbar">
          <div className="flex gap-6 px-2 pb-2">
            {best.slice(0, 50).map((item) => {
              const img = firstImage(item);
              const { price, discountPrice, hasDiscount, percent } =
                getDiscountInfo(item);
              const stock = getStockCount(item);
              const out = Boolean(item?.outOfStock) || (stock !== null && stock <= 0);
              const lowStock = !out && stock !== null && stock <= 5;
              const favorite = isFavorite?.(item._id);
              const sizes = (item.sizes || []).slice(0, 3);

              return (
                <Link
                  to={`/product/${item._id}`}
                  key={item._id}
                  data-card
                  className="group flex-shrink-0 w-[82vw] sm:w-[46vw] lg:w-[31%]"
                >
                  <article
                    className={`relative h-full rounded-md bg-[#fffaf4] p-3 shadow-[0_18px_45px_rgba(62,45,28,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_rgba(62,45,28,0.16)] ${
                      out ? "opacity-70" : ""
                    }`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded bg-[#eadfd2]">
                      <ShimmerImage
                        src={img}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        wrapperClassName="absolute inset-0 w-full h-full"
                        skeletonClassName="bg-[#E9DFD3]"
                        loading="lazy"
                        draggable="false"
                      />
                      {hasDiscount ? (
                        <span className="absolute left-4 top-4 rounded-full bg-[#1f1b17] px-3 py-1.5 text-xs font-semibold text-white">
                          -{percent}%
                        </span>
                      ) : (
                        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1f1b17]">
                          BEST SELLER
                        </span>
                      )}
                      {out && (
                        <div className="absolute inset-0 bg-black/40 grid place-items-center">
                          <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                      {!out && stock !== null && (
                        <span
                          className={`absolute right-4 top-4 rounded-full border border-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] shadow-sm backdrop-blur ${
                            lowStock
                              ? "bg-amber-50/95 text-amber-700"
                              : "bg-[#e5f1e8]/95 text-[#2f6c4d]"
                          }`}
                        >
                          In Stock
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex min-h-8 flex-wrap items-center gap-2">
                      {item.concentration && (
                        <span className="rounded-full border border-[#d8c2a5] px-3 py-1 text-xs font-medium text-[#6f5844]">
                          {item.concentration}
                        </span>
                      )}
                      {sizes.length ? (
                        sizes.map((size) => (
                          <span
                            key={size}
                            className="rounded-full border border-[#d8c2a5] px-3 py-1 text-xs font-medium text-[#6f5844]"
                          >
                            {size}
                          </span>
                        ))
                      ) : !item.concentration ? (
                        <span className="rounded-full border border-[#d8c2a5] px-3 py-1 text-xs font-medium text-[#6f5844]">
                          Eau de Parfum
                        </span>
                      ) : null}
                    </div>

                    {stock !== null && (
                      <p
                        className={`mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                          out
                            ? "text-[#7b2d2d]"
                            : lowStock
                              ? "text-[#a16f2b]"
                              : "text-[#6f5844]"
                        }`}
                      >
                        {out ? "Out of stock" : `${stock} in stock`}
                      </p>
                    )}

                    <div className="mt-3 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-2xl leading-tight text-[#1f1b17]">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b28b55]">
                          {item.subCategory || item.category}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-3">
                        {hasDiscount ? (
                          <div className="text-right">
                            <p className="text-base font-semibold text-[#1f1b17]">
                              ${discountPrice.toFixed(2)}
                            </p>
                            <p className="text-sm text-[#9a8068] line-through">
                              ${price.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-base font-semibold text-[#1f1b17]">
                            ${price.toFixed(2)}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleFavorite?.(item._id);
                          }}
                          className={`grid h-10 w-10 place-items-center rounded-full border shadow-sm transition ${
                            favorite
                              ? "border-[#7b2d2d] bg-[#7b2d2d] text-white"
                              : "border-[#eadfd2] bg-[#fffaf4] text-[#7b6047] hover:border-[#c49a5e]"
                          }`}
                          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <FiHeart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => scrollByOne(1)}
          disabled={atEnd}
          className="absolute right-2 top-[42%] z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[#d8c2a5] bg-[#fffaf4]/95 text-[#1f1b17] shadow-[0_14px_32px_rgba(62,45,28,0.16)] backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 md:grid"
          aria-label="Next"
        >
          <FiArrowRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
};

export default BestSeller;
