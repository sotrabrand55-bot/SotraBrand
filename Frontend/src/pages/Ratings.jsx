import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiStar } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import { ShimmerImage } from "../componens/Skeletons";
import { ProductReviewsModal } from "../componens/ProductReviewPanel";
import {
  getEffectiveProductPrice,
  getPrimaryProductImage,
} from "../utils/productMapping";

const Ratings = () => {
  const { products, productsLoading, currency } = useContext(ShopContext);
  const [reviewProduct, setReviewProduct] = useState(null);

  const ratedProducts = useMemo(
    () =>
      (products || [])
        .filter((product) => product?.active !== false)
        .map((product) => {
          const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
          const rating = Math.max(0, Math.min(5, Number(product?.rating) || 0));
          const reviewCount = Math.max(
            0,
            Number(product?.reviewCount ?? product?.reviewsCount ?? reviews.length) || 0
          );
          return { ...product, _ratingValue: rating, _reviewCount: reviewCount };
        })
        .sort((a, b) => {
          if (b._ratingValue !== a._ratingValue) return b._ratingValue - a._ratingValue;
          if (b._reviewCount !== a._reviewCount) return b._reviewCount - a._reviewCount;
          return Number(b?.date || 0) - Number(a?.date || 0);
        }),
    [products]
  );

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-black/15 px-5 py-12 text-center sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">
          Be Radiant By Nancy
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-6xl">
          Top Rated
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/55">
          Real product ratings sorted from the highest loved products to the newest discoveries.
        </p>
      </header>

      <section className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {productsLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-52 bg-[#EAEAEA] skeleton-shimmer" />
            ))}
          </div>
        ) : ratedProducts.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {ratedProducts.map((product, index) => {
              const reviews = Array.isArray(product.reviews) ? product.reviews : [];
              const latestReview = reviews[0];
              const price = getEffectiveProductPrice(product);

              return (
                <article
                  key={product._id}
                  className="grid grid-cols-[96px_1fr] gap-4 border border-black/15 bg-white p-3 sm:grid-cols-[132px_1fr] sm:p-4"
                >
                  <Link
                    to={`/Product/${product._id}`}
                    className="relative aspect-[3/4] overflow-hidden bg-white"
                    aria-label={`View ${product.name}`}
                  >
                    <span className="absolute left-2 top-2 z-10 bg-black px-2 py-1 text-[9px] font-bold text-white">
                      #{index + 1}
                    </span>
                    <ShimmerImage
                      src={getPrimaryProductImage(product)}
                      alt={product.name}
                      className="h-full w-full object-contain"
                      wrapperClassName="h-full w-full"
                      skeletonClassName="bg-[#EAEAEA]"
                      loading="lazy"
                    />
                  </Link>

                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">
                      {product.category || "Be Radiant"}
                    </p>
                    <Link to={`/Product/${product._id}`}>
                      <h2 className="mt-1 line-clamp-2 text-base font-black uppercase leading-5 sm:text-xl sm:leading-6">
                        {product.name}
                      </h2>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setReviewProduct(product)}
                      className="mt-3 flex flex-wrap items-center gap-1 text-left transition hover:opacity-70"
                      aria-label={`Open ${product.name} reviews`}
                    >
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <FiStar
                          key={starIndex}
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${
                            starIndex < Math.round(product._ratingValue)
                              ? "fill-black text-black"
                              : "text-black/20"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-black/55">
                        {product._ratingValue ? product._ratingValue.toFixed(1) : "0.0"} /{" "}
                        {product._reviewCount}{" "}
                        {product._reviewCount === 1 ? "review" : "reviews"}
                      </span>
                    </button>

                    <p className="mt-2 text-lg font-light tracking-[0.04em]">
                      {currency}{price.toFixed(2)} USD
                    </p>

                    {latestReview?.comment ? (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-black/55">
                        "{latestReview.comment}"
                      </p>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-black/45">
                        Click the reviews to add the first product review.
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        to={`/Product/${product._id}`}
                        className="inline-flex items-center gap-2 border border-black px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white"
                      >
                        See Product
                        <FiArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setReviewProduct(product)}
                        className="border border-black/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition hover:border-black"
                      >
                        Write Review
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border border-black/15 px-5 py-16 text-center">
            <p className="text-sm uppercase tracking-[0.18em] text-black/45">
              Ratings will appear when products are active.
            </p>
          </div>
        )}
      </section>

      <ProductReviewsModal
        product={reviewProduct}
        open={Boolean(reviewProduct)}
        onClose={() => setReviewProduct(null)}
      />
    </main>
  );
};

export default Ratings;
