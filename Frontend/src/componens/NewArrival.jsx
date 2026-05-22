// remove wheel handler and keep arrows only
// eslint-disable-next-line no-unused-vars
import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import { normalizeColor } from "../utils/colorUtils";
import { ProductRailSkeleton, ShimmerImage } from "./Skeletons";

const NewArrival = () => {
  const { products, productsLoading } = useContext(ShopContext);
  const newArrival = useMemo(
    () => products.filter((p) => p.newArrival),
    [products]
  );

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
  }, [newArrival.length, syncEdgeState]);

  const scrollByOne = (dir = 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 240, behavior: "smooth" }); // nudge by 240px
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

  if (productsLoading) return <ProductRailSkeleton titleWidth="w-44" />;
  if (!newArrival.length) return null;

  return (
    <section className="my-12" id="new-arrival">
      <div className="flex items-end justify-between mb-6">
        <div className="text-3xl">
          <Title text1={"New"} text2={"Arrivals"} />
        </div>
        <Link
          to="/collection"
          className="hidden sm:inline-flex items-center gap-2 text-sm hover:opacity-80 transition"
        >
          View all
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="opacity-70"
          >
            <path
              d="M5 12h14M13 5l7 7-7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      <div className="relative">
        {/* left arrow (optional to keep) */}
        <button
          onClick={() => scrollByOne(-1)}
          disabled={atStart}
          className="hidden md:grid absolute left-2 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/90 backdrop-blur shadow place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Prev"
        >
          <span className="text-2xl">‹</span>
        </button>

        {/* track */}
        <div ref={trackRef} className="overflow-x-auto no-scrollbar">
          <div className="flex gap-6 px-2">
            {newArrival.slice(0, 50).map((item) => {
              const img = firstImage(item);
              const { price, discountPrice, hasDiscount, percent } =
                getDiscountInfo(item);
              const out = Boolean(item?.outOfStock);

              return (
                <Link
                  to={`/product/${item._id}`}
                  key={item._id}
                  data-card
                  className="flex-shrink-0 w-[82vw] sm:w-[46vw] lg:w-[32%] group"
                >
                  <article
                    className={`group relative ${out ? "opacity-70" : ""}`}
                  >
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100">
                      <ShimmerImage
                        src={img}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        wrapperClassName="absolute inset-0 w-full h-full"
                        skeletonClassName="bg-[#E9DFD3]"
                        loading="lazy"
                        draggable="false"
                      />

                      {hasDiscount ? (
                        <span className="absolute left-4 top-4 bg-black text-white px-2 py-1 text-xs rounded">
                          -{percent}%
                        </span>
                      ) : (
                        <span className="absolute left-4 top-4 text-white/90 tracking-wide text-sm">
                          NEW IN
                        </span>
                      )}

                      {out && (
                        <div className="absolute inset-0 bg-black/40 grid place-items-center">
                          <span className="px-3 py-2 bg-white text-black text-xs font-semibold rounded">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      {(item.colors || ["off white", "biege rose", "black"])
                        .slice(0, 3)
                        .map((c, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 rounded-full border border-black/10"
                            style={{ backgroundColor: normalizeColor(c) }}
                            title={c}
                          />
                        ))}

                      {item.colors && item.colors.length > 3 && (
                        <span className="text-sm text-gray-500">
                          +{item.colors.length - 3}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-lg">{item.name}</h3>

                    {hasDiscount ? (
                      <div className="mt-0.5 flex items-baseline gap-2">
                        <span className="text-base font-semibold">
                          ${discountPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ${price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <p className="text-gray-500">${price.toFixed(2)}</p>
                    )}
                  </article>
                </Link>
              );
            })}
          </div>
        </div>

        {/* right arrow */}
        <button
          onClick={() => scrollByOne(1)}
          disabled={atEnd}
          className="hidden md:grid absolute right-2 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/90 backdrop-blur shadow place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next"
        >
          <span className="text-2xl">›</span>
        </button>
      </div>
    </section>
  );
};

export default NewArrival;
