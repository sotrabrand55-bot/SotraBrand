/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { FiStar, FiX } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";

const ProductReviewPanel = ({ product, onReviewed }) => {
  const { backendUrl, getProductsData } = useContext(ShopContext);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
  const displayRating = Math.max(0, Math.min(5, Number(product?.rating) || 0));
  const reviewCount = Math.max(
    0,
    Number(product?.reviewCount) || reviews.length || 0
  );

  const submitReview = async (event) => {
    event.preventDefault();
    if (!product?._id || !backendUrl || submitting) return;
    if (!rating) {
      setMessage("Please choose a star rating first.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`${backendUrl}/api/product/${product._id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, name, comment }),
      });
      const data = await response.json();
      if (!data?.success) throw new Error(data?.message || "Review could not be saved");
      setRating(0);
      setHoverRating(0);
      setName("");
      setComment("");
      setMessage("Thank you. Your review was added.");
      getProductsData?.({ silent: true });
      onReviewed?.();
    } catch (error) {
      setMessage(error.message || "Review could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">
          Product Rating
        </p>
        <h3 className="mt-2 line-clamp-2 text-2xl font-black uppercase">
          {product?.name || "Product"}
        </h3>
        <div className="mt-4 flex items-center gap-1" aria-label={`${displayRating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <FiStar
              key={index}
              className={`h-6 w-6 ${
                index < Math.round(displayRating)
                  ? "fill-black text-black"
                  : "text-black/20"
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-3xl font-light tracking-[0.08em]">
          {displayRating ? displayRating.toFixed(1) : "0.0"}
        </p>
        <p className="mt-1 text-sm text-black/55">
          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </p>

        <div className="mt-6 space-y-4">
          {reviews.length ? (
            reviews.slice(0, 3).map((review) => (
              <article key={review._id || review.date} className="border-t border-black/10 pt-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FiStar
                      key={index}
                      className={`h-4 w-4 ${
                        index < Number(review.rating || 0)
                          ? "fill-black text-black"
                          : "text-black/20"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em]">
                  {review.name || "Customer"}
                </p>
                {review.comment && (
                  <p className="mt-1 text-sm leading-6 text-black/60">{review.comment}</p>
                )}
              </article>
            ))
          ) : (
            <p className="border-t border-black/10 pt-4 text-sm leading-6 text-black/50">
              No written reviews yet. Be the first to review this product.
            </p>
          )}
        </div>
      </div>

      <form onSubmit={submitReview} className="border border-black/15 p-4">
        <p className="text-sm font-black uppercase tracking-[0.16em]">
          Write a Review
        </p>
        <div
          className="mt-4 flex gap-2"
          onMouseLeave={() => setHoverRating(0)}
          aria-label="Choose review stars"
        >
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            const active = value <= (hoverRating || rating);
            return (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHoverRating(value)}
                onFocus={() => setHoverRating(value)}
                onClick={() => setRating(value)}
                className="rounded-full p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-black/20"
                aria-label={`${value} stars`}
              >
                <FiStar
                  className={`h-8 w-8 transition ${
                    active ? "fill-black text-black" : "text-black/25"
                  }`}
                />
              </button>
            );
          })}
        </div>
        <input
          className="mt-4 min-h-11 w-full border border-black/20 px-3 text-sm outline-none focus:border-black"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name optional"
        />
        <textarea
          className="mt-3 min-h-28 w-full resize-none border border-black/20 px-3 py-2 text-sm outline-none focus:border-black"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share your experience optional"
        />
        {message && <p className="mt-3 text-sm text-black/60">{message}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#222] disabled:opacity-45"
        >
          {submitting ? "Sending..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export const ProductReviewsModal = ({ product, open, onClose }) => {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-[1300] bg-black/55 px-4 py-5 backdrop-blur-sm sm:px-6">
      <button
        type="button"
        aria-label="Close review panel"
        onClick={onClose}
        className="absolute inset-0 h-full w-full"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} reviews`}
        className="relative mx-auto flex max-h-[calc(100vh-2.5rem)] w-full max-w-4xl flex-col overflow-hidden bg-white text-black shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-black/15 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
              Product Reviews
            </p>
            <h2 className="mt-1 text-xl font-black uppercase sm:text-2xl">
              {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f1f1f1] transition hover:bg-black hover:text-white"
            aria-label="Close reviews"
          >
            <FiX className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto px-4 py-5 sm:px-6">
          <ProductReviewPanel product={product} />
        </div>
      </section>
    </div>
  );
};

export default ProductReviewPanel;
