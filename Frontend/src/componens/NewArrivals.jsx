import { useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiHeart, FiShoppingBag } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import { ProductRailSkeleton, ShimmerImage } from "./Skeletons";

const defaultFilters = ["Amber", "Oud", "Floral", "Fresh"];
const maxVisibleSizes = 5;

const firstImage = (item) =>
  item?.image?.[0] ||
  item?.images?.[0] ||
  item?.image1 ||
  item?.image2 ||
  item?.image3 ||
  item?.image4 ||
  item?.image ||
  "";

const getStockCount = (item) => {
  if (item?.stock === undefined || item?.stock === null || item?.stock === "") return null;
  const value = Number(item.stock);
  return Number.isFinite(value) ? value : null;
};

const NewArrivals = () => {
  const {
    products,
    productsLoading,
    navigate,
    toggleFavorite,
    isFavorite,
    scentFamilies,
    getScentFamilies,
  } = useContext(ShopContext);

  useEffect(() => {
    getScentFamilies?.({ silent: true });

    const interval = setInterval(() => {
      getScentFamilies?.({ silent: true });
    }, 3000);

    const onFocus = () => getScentFamilies?.({ silent: true });
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productPool = useMemo(() => {
    const activeProducts = products.filter((item) => item.active !== false);
    const preferred = activeProducts.filter((item) => item.newArrival);
    return preferred.length ? preferred : activeProducts;
  }, [products]);

  const filters = useMemo(() => {
    const allowedFamilies =
      Array.isArray(scentFamilies) && scentFamilies.length
        ? scentFamilies
        : defaultFilters;
    const poolFamilies = productPool
      .map((item) => item?.subCategory)
      .filter(Boolean);
    const nextFamilies = allowedFamilies.filter((family) =>
      poolFamilies.includes(family)
    );

    return ["All", ...nextFamilies];
  }, [productPool, scentFamilies]);

  const visibleProducts = useMemo(() => productPool.slice(0, 4), [productPool]);

  if (productsLoading) return <ProductRailSkeleton titleWidth="w-56" />;
  if (!productPool.length) return null;

  return (
    <section id="new-arrival" className="relative left-1/2 w-screen -translate-x-1/2 bg-[#fffaf4] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-[#eadfd2] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b9945d] sm:text-xs sm:tracking-[0.32em]">
              Levon Selection
            </p>
            <h2 className="font-serif text-[2.65rem] leading-none text-[#1f1b17] sm:text-5xl sm:leading-tight">
              New Arrival Edit
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#6a6258] sm:mt-4 sm:text-base">
              Fresh Levon signatures, mapped live from the Admin product catalog.
            </p>
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {filters.map((filter) => (
              <Link
                key={filter}
                to={
                  filter === "All"
                    ? "/collection"
                    : `/collection?sub=${encodeURIComponent(filter)}&cat=Fragrance`
                }
                className="shrink-0 rounded-full border border-[#dfd1c1] bg-white/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#655a4f] transition hover:border-[#1f1b17] hover:bg-[#1f1b17] hover:text-white sm:text-xs"
              >
                {filter}
              </Link>
            ))}
          </div>
        </div>

        {visibleProducts.length ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 lg:grid-cols-4">
            {visibleProducts.map((item) => {
              const price = Number(item.price) || 0;
              const discountPrice = Number(item.discountPrice);
              const hasDiscount =
                Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < price;
              const displayPrice = hasDiscount ? discountPrice : price;
              const stock = getStockCount(item);
              const soldOut = Boolean(item.outOfStock) || (stock !== null && stock <= 0);
              const lowStock = !soldOut && stock !== null && stock <= 5;
              const favorite = isFavorite?.(item._id);

              return (
                <article
                  key={item._id}
                  className="group relative overflow-hidden rounded-sm border border-[#eadfd2] bg-white shadow-[0_14px_32px_rgba(62,45,28,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(62,45,28,0.13)] sm:shadow-[0_18px_45px_rgba(62,45,28,0.08)]"
                >
                  <Link to={`/Product/${item._id}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#eee4d9]">
                      <ShimmerImage
                        src={firstImage(item)}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        wrapperClassName="h-full w-full"
                        skeletonClassName="bg-[#E9DFD3]"
                        draggable="false"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#51483f] backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                        {item.subCategory || item.category || "Fragrance"}
                      </span>
                      {stock !== null && (
                        <span
                          className={`absolute right-3 top-3 rounded-full border border-white/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] shadow-sm backdrop-blur sm:right-4 sm:top-4 sm:px-3 sm:text-[10px] ${
                            soldOut
                              ? "bg-[#1f1b17]/85 text-white"
                              : lowStock
                                ? "bg-amber-50/95 text-amber-700"
                                : "bg-[#e5f1e8]/95 text-[#2f6c4d]"
                          }`}
                        >
                          {soldOut ? "Out" : "In Stock"}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <Link to={`/Product/${item._id}`} className="min-w-0">
                        <h3 className="truncate font-serif text-lg text-[#1f1b17] sm:text-xl">
                          {item.name}
                        </h3>
                        <p className="mt-1 truncate text-[10px] uppercase tracking-[0.14em] text-[#8a7b6b] sm:text-xs sm:tracking-[0.16em]">
                          {[item.concentration, item.subCategory || "Signature"].filter(Boolean).join(" / ")}
                        </p>
                      </Link>

                      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/Product/${item._id}`)}
                          aria-label={`View ${item.name}`}
                          className="grid h-8 w-8 place-items-center rounded-full border border-[#e2d5c6] bg-[#fffaf4] text-[#2b241d] transition hover:border-[#b9945d] hover:bg-[#1f1b17] hover:text-white sm:h-10 sm:w-10"
                        >
                          <FiShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFavorite?.(item._id)}
                          className={`grid h-8 w-8 place-items-center rounded-full border shadow-sm transition sm:h-10 sm:w-10 ${
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

                    {stock !== null && (
                      <p
                        className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-[11px] ${
                          soldOut
                            ? "text-[#7b2d2d]"
                            : lowStock
                              ? "text-[#a16f2b]"
                              : "text-[#6f5844]"
                        }`}
                      >
                        {soldOut ? "Out of stock" : `${stock} in stock`}
                      </p>
                    )}

                    <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-[#1f1b17] sm:text-base">
                          ${displayPrice.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-[#a69888] line-through sm:text-sm">
                            ${price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:justify-end">
                        {item.concentration && (
                          <span className="rounded-full border border-[#dfd1c1] bg-[#fffaf4] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#746657] sm:text-[10px]">
                            {item.concentration}
                          </span>
                        )}
                        {(item.sizes || []).slice(0, maxVisibleSizes).map((size, index) => (
                          <span
                            key={`${size}-${index}`}
                            className="rounded-full border border-[#dfd1c1] bg-[#fffaf4] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#746657] sm:text-[10px]"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-sm border border-[#eadfd2] bg-white p-8 text-center text-sm text-[#6a6258]">
            No new fragrances are available yet.
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            to="/collection"
            className="inline-flex items-center gap-3 rounded-full border border-[#1f1b17] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#1f1b17] transition hover:bg-[#1f1b17] hover:text-white"
          >
            View Collection
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
