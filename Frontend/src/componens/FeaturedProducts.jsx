/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiArrowRight,
  FiChevronRight,
  FiHeart,
  FiPlus,
  FiSearch,
  FiShoppingCart,
  FiStar,
  FiX,
} from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import { FeaturedProductSkeleton, ShimmerImage } from "./Skeletons";
import LuxuryVideoGallery from "./LuxuryVideoGallery";
import FireworksOverlay from "./FireworksOverlay";
import { ProductReviewsModal } from "./ProductReviewPanel";
import { customerPreviewLocked } from "../lib/customerPreview";

const isRealOption = (value) =>
  Boolean(value) &&
  !["default", "_default", "_no_perfume_type"].includes(String(value).toLowerCase());

const getImages = (item) => {
  const images = Array.isArray(item?.image)
    ? item.image
    : Array.isArray(item?.images)
      ? item.images
      : [item?.image1, item?.image2, item?.image3, item?.image4, item?.image];

  return images.filter(Boolean);
};

const getShadeOptions = (item) => {
  if (Array.isArray(item?.shadeOptions) && item.shadeOptions.length) {
    return item.shadeOptions
      .filter((option) => option?.image || option?.label || option?.cartValue)
      .map((option, index) => ({
        id: option.id || `${item._id}-shade-${index}`,
        label: option.label || getOptionLabel(item, index),
        cartValue: option.cartValue || option.label || getOptionLabel(item, index),
        image: option.image || "",
        description: option.description || item.description,
      }));
  }

  return [];
};

const normalizeStoryImage = (story, index) => {
  if (typeof story === "string") {
    return {
      id: `story-${index}`,
      image: story,
      alt: "",
      source: "story",
    };
  }

  return {
    id: story?.id || `story-${index}`,
    image: story?.image || story?.url || "",
    alt: story?.alt || "",
    source: "story",
  };
};

const getStoryImages = (product, shadeOptions) => {
  const shadeStories = shadeOptions
    .filter((option) => option.image)
    .map((option, index) => ({
      id: `shade-story-${option.id || index}`,
      image: option.image,
      alt: option.label,
      source: "shade",
      shadeOptionId: option.id,
    }));

  const standaloneStories = (Array.isArray(product?.storyImages)
    ? product.storyImages
    : Array.isArray(product?.galleryImages)
      ? product.galleryImages
      : []
  )
    .map(normalizeStoryImage)
    .filter((story) => story.image);

  const seen = new Set(shadeStories.map((story) => story.image));
  const uniqueStandaloneStories = standaloneStories.filter((story) => {
    if (seen.has(story.image)) return false;
    seen.add(story.image);
    return true;
  });

  const stories = [...shadeStories, ...uniqueStandaloneStories];
  return stories.length
    ? stories
    : getImages(product).map((image, index) => ({
        id: `fallback-story-${index}`,
        image,
        alt: product?.name || "",
        source: "fallback",
      }));
};

const getDisplayPrice = (item) => {
  const price = Number(item?.price) || 0;
  const discountPrice = Number(item?.discountPrice);
  const hasDiscount =
    Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < price;

  return {
    price,
    displayPrice: hasDiscount ? discountPrice : price,
    hasDiscount,
  };
};

const getOptionLabel = (product, index) => {
  const color = Array.isArray(product.colors) ? product.colors[index] : "";
  const fallback = product.concentration || product.subCategory || "Option";
  return color ? `${fallback} - ${String(color).toUpperCase()}` : `${fallback} ${index + 1}`;
};

const StoryImageViewer = ({ product, images, initialIndex, onClose }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusImage = window.requestAnimationFrame(() => {
      const target = viewerRef.current?.querySelector(
        `[data-story-viewer-index="${initialIndex}"]`
      );
      target?.scrollIntoView({ block: "start" });
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusImage);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [initialIndex, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={viewerRef}
      className="fixed inset-0 z-[1200] overflow-y-auto overscroll-contain bg-white"
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} story images`}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed right-3 top-3 z-[1210] grid h-11 w-11 place-items-center rounded-full bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition hover:bg-[#262626] active:scale-95 sm:right-5 sm:top-5"
        aria-label="Close story images"
      >
        <FiX className="h-5 w-5" />
      </button>

      <div className="mx-auto w-full max-w-[52rem] bg-white">
        {images.map((image, index) => (
          <div
            key={image.id || `${image.image}-${index}`}
            data-story-viewer-index={index}
            className="aspect-[4/5] w-full bg-white"
          >
            <ShimmerImage
              src={image.image}
              alt={image.alt || `${product.name} story ${index + 1}`}
              className="h-full w-full object-contain"
              wrapperClassName="h-full w-full"
              skeletonClassName="nancy-cool-shimmer bg-[#EAEAEA]"
              loading={Math.abs(index - initialIndex) <= 1 ? "eager" : "lazy"}
              draggable="false"
            />
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
};

const ProductGallery = ({ product, storyImages, targetIndex, targetVersion }) => {
  const images = storyImages;
  const railRef = useRef(null);
  const [visibleIndex, setVisibleIndex] = useState(targetIndex);
  const [viewerIndex, setViewerIndex] = useState(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left: targetIndex * rail.clientWidth, behavior: "smooth" });
    setVisibleIndex(targetIndex);
  }, [targetIndex, targetVersion]);

  const syncVisible = () => {
    const rail = railRef.current;
    if (!rail) return;
    const next = Math.round(rail.scrollLeft / rail.clientWidth);
    setVisibleIndex(Math.max(0, Math.min(next, images.length - 1)));
  };

  const goTo = (index) => {
    const rail = railRef.current;
    if (!rail) return;
    const next = Math.max(0, Math.min(index, images.length - 1));
    rail.scrollTo({ left: next * rail.clientWidth, behavior: "smooth" });
    setVisibleIndex(next);
  };

  if (!images.length) {
    return <div className="aspect-[4/5] bg-[#fafafa]" />;
  }

  return (
    <div className="relative bg-white lg:flex lg:min-h-[42rem] lg:items-center lg:justify-center">
      <Link
        to={`/Product/${product._id}`}
        onClick={(event) => {
          if (customerPreviewLocked) event.preventDefault();
        }}
        className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-black shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition hover:bg-black hover:text-white"
      >
        <FiSearch className="h-4 w-4" />
      </Link>

      <div
        ref={railRef}
        onScroll={syncVisible}
        className="flex aspect-[4/5] w-full snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar lg:aspect-auto lg:h-[42rem] lg:max-h-[72vh]"
      >
        {images.map((image, index) => (
          <button
            key={image.id || `${image.image}-${index}`}
            type="button"
            onClick={() => setViewerIndex(index)}
            className="relative h-full w-full shrink-0 snap-center bg-white"
            aria-label={`Open all ${product.name} story images from image ${index + 1}`}
          >
            <ShimmerImage
              src={image.image}
              alt={image.alt || `${product.name} story ${index + 1}`}
              className="h-full w-full object-contain"
              wrapperClassName="h-full w-full"
              skeletonClassName="nancy-cool-shimmer bg-[#EAEAEA]"
              draggable="false"
            />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
          <button
            type="button"
            disabled={visibleIndex <= 0}
            onClick={() => goTo(visibleIndex - 1)}
            className="grid h-7 w-7 place-items-center rounded-full text-black transition disabled:cursor-not-allowed disabled:opacity-25"
            aria-label="Previous product image"
          >
            <FiArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={visibleIndex >= images.length - 1}
            onClick={() => goTo(visibleIndex + 1)}
            className="grid h-7 w-7 place-items-center rounded-full text-black transition disabled:cursor-not-allowed disabled:opacity-25"
            aria-label="Next product image"
          >
            <FiArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {images.length > 1 && (
        <div className="nancy-story-progress absolute inset-x-0 bottom-0 z-20" aria-hidden="true">
          <span
            style={{
              width: `${100 / images.length}%`,
              transform: `translateX(${visibleIndex * 100}%)`,
            }}
          />
        </div>
      )}

      {viewerIndex !== null && (
        <StoryImageViewer
          product={product}
          images={images}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

    </div>
  );
};

const FeaturedProductCard = ({
  product,
  showSmallImages = true,
  showSocialProof = false,
  hideFullDetails = false,
}) => {
  const { currency, addToCart, openCart, toggleFavorite, isFavorite } = useContext(ShopContext);
  const { price, displayPrice, hasDiscount } = getDisplayPrice(product);
  const availableSizes = Array.isArray(product.sizes)
    ? product.sizes.filter((size) => size && String(size).toLowerCase() !== "default")
    : [];
  const availablePerfumeTypes = Array.isArray(product.perfumeTypes)
    ? product.perfumeTypes.filter(isRealOption)
    : [];
  const perfumeTypeLabel = availablePerfumeTypes[0] || product.concentration || "";
  const shadeOptions = getShadeOptions(product);
  const storyImages = getStoryImages(product, shadeOptions);
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryTarget, setGalleryTarget] = useState({ index: 0, version: 0 });
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantityPulse, setQuantityPulse] = useState(false);
  const [adding, setAdding] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const quantityPulseTimer = useRef(null);
  const selectedOption =
    selectedImage === null ? null : shadeOptions[selectedImage] || null;
  const selectedOptionLabel =
    selectedOption?.label || (selectedImage === null ? "" : getOptionLabel(product, selectedImage));
  const selectedDescription = selectedOption?.description || product.description;
  const totalDisplayPrice = displayPrice * quantity;
  const totalOriginalPrice = price * quantity;
  const hasSmallImageChoices = showSmallImages && shadeOptions.length > 0;
  const favorite = isFavorite?.(product._id);
  const rating = Math.max(0, Math.min(5, Number(product.rating) || 5));
  const reviewCount = Math.max(
    0,
    Number(product.reviewCount ?? product.reviewsCount ?? product.reviews?.length) || 0
  );
  const stockNumber =
    product?.stock === undefined || product?.stock === null || product?.stock === ""
      ? null
      : Number(product.stock);
  const hasStockCount = stockNumber !== null && Number.isFinite(stockNumber);
  const isSoldOut =
    Boolean(product?.outOfStock) || (hasStockCount && stockNumber <= 0);
  const hasSizes = availableSizes.length > 0;
  const canSubmitOptions = !isSoldOut;
  const isLowStock = hasStockCount && stockNumber > 0 && stockNumber <= 5;
  const maximumQuantity = hasStockCount ? Math.max(1, stockNumber) : 99;

  const selectOption = (index) => {
    if (selectedImage === index) {
      setSelectedImage(null);
      const firstNonShadeIndex = storyImages.findIndex(
        (story) => story.source !== "shade"
      );
      if (firstNonShadeIndex >= 0) {
        setGalleryTarget((prev) => ({
          index: firstNonShadeIndex,
          version: prev.version + 1,
        }));
      }
      return;
    }

    setSelectedImage(index);
    const shadeId = shadeOptions[index]?.id;
    const storyIndex = storyImages.findIndex(
      (story) => story.shadeOptionId === shadeId
    );

    setGalleryTarget((prev) => ({
      index: storyIndex >= 0 ? storyIndex : prev.index,
      version: prev.version + 1,
    }));
  };

  useEffect(() => {
    setSelectedSize("");
    setSelectedImage(null);
  }, [product._id]);

  useEffect(() => {
    return () => {
      if (quantityPulseTimer.current) {
        window.clearTimeout(quantityPulseTimer.current);
      }
    };
  }, []);

  const changeQuantity = (nextQuantity) => {
    setQuantity((prev) => {
      const rawNext =
        typeof nextQuantity === "function" ? nextQuantity(prev) : nextQuantity;
      const next = Math.max(1, Math.min(maximumQuantity, rawNext));
      if (next !== prev) {
        if (quantityPulseTimer.current) {
          window.clearTimeout(quantityPulseTimer.current);
        }
        setQuantityPulse(true);
        quantityPulseTimer.current = window.setTimeout(() => {
          setQuantityPulse(false);
        }, 320);
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    if (hasSizes && !selectedSize) {
      toast.info("Please choose a size first.", {
        position: "top-center",
        autoClose: 1400,
        hideProgressBar: true,
      });
      return;
    }
    if (adding) return;
    setAdding(true);

    if (!customerPreviewLocked) {
      addToCart?.(
        product._id,
        hasSizes ? selectedSize : null,
        selectedOption?.cartValue || null,
        quantity,
        perfumeTypeLabel || null
      );
    }

    window.setTimeout(() => {
      setCelebrating(true);
    }, 1180);

    window.setTimeout(() => {
      setAdding(false);
      setCelebrating(false);
      if (!customerPreviewLocked) openCart?.();
    }, 2200);
  };

  return (
    <article
      data-product-card
      className="w-[min(100%,25rem)] shrink-0 snap-center bg-white text-black sm:w-[24rem] lg:grid lg:w-full lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-12 lg:px-10"
    >
      <ProductGallery
        product={product}
        storyImages={storyImages}
        targetIndex={galleryTarget.index}
        targetVersion={galleryTarget.version}
      />

      <div className="px-4 pb-6 pt-4 sm:px-5 lg:max-w-[42rem] lg:px-0 lg:py-12">
        <h3 className="text-sm font-black uppercase tracking-[0.02em] lg:text-4xl">
          {product.name}
        </h3>

        {showSocialProof && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 lg:mt-7">
            <button
              type="button"
              onClick={() => setReviewsOpen(true)}
              className="flex items-center gap-1 text-left transition hover:opacity-70"
              aria-label={`Open ${product.name} reviews`}
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <FiStar
                  key={index}
                  className={`h-4 w-4 lg:h-6 lg:w-6 ${
                    index < Math.round(rating) ? "fill-black text-black" : "text-black/20"
                  }`}
                />
              ))}
              <span className="ml-2 text-xs text-black/55 lg:text-base">
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                toggleFavorite?.(product._id);
              }}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-medium transition lg:h-12 lg:px-5 lg:text-base ${
                favorite
                  ? "border-black bg-black text-white"
                  : "border-black bg-white text-black hover:bg-black hover:text-white"
              }`}
              aria-pressed={favorite}
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FiHeart className={`h-4 w-4 lg:h-5 lg:w-5 ${favorite ? "fill-current" : ""}`} />
              {favorite ? "Added to Favorites" : "Add to Favorites"}
            </button>
          </div>
        )}

        <div className="mt-3 flex items-baseline gap-2 lg:mt-8">
          <span
            className={`nancy-price-value text-sm font-medium lg:text-3xl lg:font-normal lg:tracking-[0.08em] ${
              quantityPulse ? "is-changing" : ""
            }`}
          >
            {currency}
            {totalDisplayPrice.toFixed(2)} USD
          </span>
          {hasDiscount && (
            <span
              className={`nancy-price-value text-xs text-black/40 line-through ${
                quantityPulse ? "is-changing" : ""
              }`}
            >
              {currency}
              {totalOriginalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <p className="mt-1 w-fit text-[9px] uppercase tracking-[0.06em] text-black/50 lg:text-lg lg:normal-case lg:tracking-[0.08em]">
          <Link
            to="/shippingpolicy"
            className="underline decoration-black/50 underline-offset-2 transition hover:text-black"
          >
            Shipping
          </Link>{" "}
          calculated at checkout.
        </p>

        {hasStockCount && (
          <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] lg:text-base">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isSoldOut ? "bg-black/35" : "bg-black"
              }`}
            />
            <span className={isLowStock || isSoldOut ? "text-black" : "text-black/55"}>
              {isSoldOut
                ? "Out of stock"
                : isLowStock
                  ? `${stockNumber} left in stock`
                  : `${stockNumber} in stock`}
              {perfumeTypeLabel ? ` / ${perfumeTypeLabel}` : ""}
            </span>
          </div>
        )}

        {!hasStockCount && perfumeTypeLabel && (
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55 lg:text-base">
            {perfumeTypeLabel}
          </p>
        )}

        <p className="mt-5 text-xs leading-5 text-black/65 lg:mt-10 lg:text-2xl lg:leading-8">
          {selectedDescription}
        </p>

        {hasSmallImageChoices && (
          <p className="mt-4 text-xs uppercase tracking-[0.08em] text-black/80 lg:mt-4 lg:text-xl">
            PRODUCT: {selectedOptionLabel || "Choose option"}
          </p>
        )}

        {hasSmallImageChoices && (
          <>
            <div className="-mx-2 mt-3 flex items-center gap-3 overflow-x-auto px-2 py-2 no-scrollbar lg:mt-7 lg:gap-5">
              {shadeOptions.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectOption(index)}
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border bg-white p-0.5 transition sm:h-14 sm:w-14 ${
                    selectedImage === index
                      ? "border-[#8e8e8e] ring-2 ring-[#8e8e8e] ring-offset-2 ring-offset-white"
                      : "border-[#dddddd] shadow-[0_4px_14px_rgba(0,0,0,0.05)] hover:border-[#9c9c9c]"
                  }`}
                  aria-label={`Select ${option.label}`}
                >
                  <span className="block h-full w-full overflow-hidden rounded-full bg-white">
                    {option.image ? (
                      <img
                        src={option.image}
                        alt=""
                        className="h-full w-full scale-150 object-cover"
                        draggable="false"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center rounded-full bg-[#f4f4f4] px-1 text-center text-[8px] font-bold uppercase leading-3 tracking-[0.06em] text-black/65">
                        {option.label || `Option ${index + 1}`}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>

            {shadeOptions.length > 1 && (
              <div className="nancy-shade-progress" aria-hidden="true">
                <span
                  style={{
                    width: `${100 / shadeOptions.length}%`,
                    transform: `translateX(${(selectedImage ?? 0) * 100}%)`,
                  }}
                />
              </div>
            )}
          </>
        )}

        {availableSizes.length > 0 && (
          <div className="mt-5 lg:mt-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/55 lg:text-base">
              SIZE: {selectedSize || "Choose size"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-h-9 border px-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition lg:min-h-11 lg:px-5 lg:text-sm ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-black/25 bg-white text-black hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="lg:mt-10 lg:flex lg:items-center lg:gap-8">
          <div className="mt-5 flex items-center gap-3 lg:mt-0 lg:gap-8">
            <button
              type="button"
              onClick={() => changeQuantity((prev) => prev - 1)}
              disabled={quantity <= 1}
              className="grid h-8 w-8 place-items-center rounded-full bg-[#f4f4f4] text-black/45 transition duration-200 hover:bg-[#e9e9e9] active:scale-90 disabled:cursor-not-allowed disabled:opacity-35 lg:h-12 lg:w-12"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span
              className={`nancy-quantity-value min-w-4 text-center text-xs text-black/60 lg:min-w-6 lg:text-base ${
                quantityPulse ? "is-changing" : ""
              }`}
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => changeQuantity((prev) => prev + 1)}
              disabled={hasStockCount && quantity >= stockNumber}
              className="grid h-8 w-8 place-items-center rounded-full bg-[#f4f4f4] text-black/70 transition duration-200 hover:bg-[#e9e9e9] active:scale-90 lg:h-12 lg:w-12"
              aria-label="Increase quantity"
            >
              <FiPlus className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || !canSubmitOptions}
            className={`nancy-water-add relative mt-5 flex h-11 w-full items-center justify-center overflow-hidden border border-black bg-white text-[10px] font-semibold uppercase tracking-[0.22em] text-black transition hover:text-white lg:mt-0 lg:h-[4.4rem] lg:flex-1 lg:text-2xl ${
              adding ? "is-filling" : ""
            } ${!canSubmitOptions ? "cursor-not-allowed opacity-45" : ""}`}
          >
            <span className="relative z-10">
              {isSoldOut
                ? "Out Of Stock"
                : hasSizes && !selectedSize
                  ? "Choose Size"
                  : adding
                    ? "Added To Cart"
                    : "Add To Cart"}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding || !canSubmitOptions}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 bg-black text-[11px] font-semibold text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-45 lg:mt-8 lg:h-[4.6rem] lg:text-2xl"
        >
          <FiShoppingCart className="h-4 w-4" />
          {isSoldOut
            ? "Out Of Stock"
            : hasSizes && !selectedSize
              ? "Choose Size"
              : "Buy with Cash on Delivery"}
        </button>

        <div className="mt-5 flex items-center gap-2 text-[11px] text-black/60 lg:mt-10 lg:text-2xl">
          <span className="text-base leading-none">Share</span>
        </div>

        {!hideFullDetails && (
          <Link
            to={`/Product/${product._id}`}
            onClick={(event) => {
              if (customerPreviewLocked) event.preventDefault();
            }}
            className="mt-5 flex h-11 items-center justify-between border-t border-black/25 text-[10px] uppercase tracking-[0.28em] text-black/55 transition hover:text-black lg:mt-10 lg:h-16 lg:border-b lg:text-xl"
          >
            View Full Details
            <FiChevronRight className="h-4 w-4" />
          </Link>
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

const FeaturedProducts = ({
  slot = 1,
  showSmallImages,
  includeVideoGallery,
  sectionId,
  productsOverride,
  showSocialProof = true,
  ariaLabel,
  hideFullDetails = false,
  showNavigation = true,
}) => {
  const { products, productsLoading } = useContext(ShopContext);
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const resolvedSectionId = sectionId || (slot === 1 ? "featured-products" : `featured-products-${slot}`);
  const shouldShowVideoGallery = includeVideoGallery ?? slot === 1;

  const productPool = useMemo(() => {
    if (Array.isArray(productsOverride)) {
      return productsOverride.filter((item) => item?.active !== false);
    }

    const activeProducts = products.filter((item) => item.active !== false);
    const assignedProduct = activeProducts.find(
      (item) => Number(item.featuredSlot) === Number(slot)
    );

    if (assignedProduct) return [assignedProduct];

    const preferred =
      slot === 1
        ? activeProducts.filter((item) => item.newArrival)
        : activeProducts.filter((item) => item.onSales);
    const candidates = preferred.length ? preferred : activeProducts;
    const fallback = candidates[Math.min(Math.max(slot - 1, 0), candidates.length - 1)];
    return fallback ? [fallback] : [];
  }, [products, productsOverride, slot]);

  const syncRailState = () => {
    const rail = trackRef.current;
    if (!rail) return;
    setAtStart(rail.scrollLeft <= 4);
    setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4);
  };

  const scrollProducts = (direction) => {
    const rail = trackRef.current;
    if (!rail) return;
    const card = rail.querySelector("[data-product-card]");
    const step = card ? card.clientWidth + 20 : rail.clientWidth * 0.85;
    rail.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  useEffect(() => {
    syncRailState();
  }, [productPool.length]);

  if (productsLoading) return <FeaturedProductSkeleton />;
  if (!productPool.length) return null;

  return (
    <section
      id={resolvedSectionId}
      aria-label={ariaLabel || `Featured Product ${slot}`}
      className="relative left-1/2 w-screen -translate-x-1/2 bg-white pb-8 pt-0 sm:pb-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showNavigation && productPool.length > 1 && (
          <div className="mb-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => scrollProducts(-1)}
              disabled={atStart}
              className="grid h-9 w-9 place-items-center rounded-full text-black transition disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Previous product"
            >
              <FiArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollProducts(1)}
              disabled={atEnd}
              className="grid h-9 w-9 place-items-center rounded-full text-black transition disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Next product"
            >
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div
          ref={trackRef}
          onScroll={syncRailState}
          className="-mx-4 overflow-x-auto scroll-smooth no-scrollbar sm:mx-0"
        >
          <div className="flex snap-x snap-mandatory gap-5 px-4 pb-2 sm:px-0 lg:gap-7">
            {productPool.map((product) => (
              <FeaturedProductCard
                key={product._id}
                product={product}
                showSmallImages={showSmallImages ?? true}
                showSocialProof={showSocialProof}
                hideFullDetails={hideFullDetails}
              />
            ))}
          </div>
        </div>
      </div>

      {shouldShowVideoGallery && <LuxuryVideoGallery />}
    </section>
  );
};

export default FeaturedProducts;
