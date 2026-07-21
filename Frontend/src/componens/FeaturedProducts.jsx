/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiPlus,
  FiSearch,
  FiShoppingCart,
} from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import { FeaturedProductSkeleton, ShimmerImage } from "./Skeletons";
import LuxuryVideoGallery from "./LuxuryVideoGallery";
import FireworksOverlay from "./FireworksOverlay";
import { customerPreviewLocked } from "../lib/customerPreview";
import ProductMediaViewer from "./ProductMediaViewer";
import ProductSetContents from "./ProductSetContents";

const isRealOption = (value) =>
  Boolean(value) &&
  !["default", "_default", "_no_perfume_type"].includes(String(value).toLowerCase());

const isSeasonLabel = (value) => /^(SS|FW)\d{2}$/i.test(String(value || "").trim());

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
    return [...item.shadeOptions]
      .sort((a, b) => {
        const aOrder = Number.isFinite(Number(a?.order)) ? Number(a.order) : 9999;
        const bOrder = Number.isFinite(Number(b?.order)) ? Number(b.order) : 9999;
        return aOrder - bOrder;
      })
      .filter((option) => option?.image || option?.label || option?.cartValue)
      .map((option, index) => ({
        id: option.id || `${item._id}-shade-${index}`,
        label: option.label || getOptionLabel(item, index),
        cartValue: option.cartValue || option.label || getOptionLabel(item, index),
        image: option.image || "",
        description: option.description || item.description,
        order: option.order ?? index + 1,
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
    order: story?.order ?? index + 1,
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
      order: option.order ?? index + 1,
    }));

  const standaloneStories = (Array.isArray(product?.storyImages)
    ? product.storyImages
    : Array.isArray(product?.galleryImages)
      ? product.galleryImages
      : []
  )
    .map(normalizeStoryImage)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    .filter((story) => story.image);

  const seen = new Set();
  const uniqueShadeStories = shadeStories.filter((story) => {
    if (seen.has(story.image)) return false;
    seen.add(story.image);
    return true;
  });
  const uniqueStandaloneStories = standaloneStories.filter((story) => {
    if (seen.has(story.image)) return false;
    seen.add(story.image);
    return true;
  });

  const stories = [...uniqueShadeStories, ...uniqueStandaloneStories];
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
  const fallback = product.subCategory || product.category || "Option";
  return color ? `${fallback} - ${String(color).toUpperCase()}` : `${fallback} ${index + 1}`;
};

const ProductGallery = ({ product, storyImages, targetIndex, targetVersion }) => {
  const images = storyImages;
  const railRef = useRef(null);
  const programmaticScrollRef = useRef(false);
  const programmaticScrollTimer = useRef(null);
  const [visibleIndex, setVisibleIndex] = useState(targetIndex);
  const [viewerIndex, setViewerIndex] = useState(null);

  const finishProgrammaticScroll = () => {
    if (programmaticScrollTimer.current) {
      window.clearTimeout(programmaticScrollTimer.current);
    }
    programmaticScrollTimer.current = window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 420);
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    programmaticScrollRef.current = true;
    rail.scrollTo({ left: targetIndex * rail.clientWidth, behavior: "smooth" });
    setVisibleIndex(targetIndex);
    finishProgrammaticScroll();
  }, [targetIndex, targetVersion]);

  useEffect(() => {
    return () => {
      if (programmaticScrollTimer.current) {
        window.clearTimeout(programmaticScrollTimer.current);
      }
    };
  }, []);

  const syncVisible = () => {
    const rail = railRef.current;
    if (!rail) return;
    if (programmaticScrollRef.current) return;
    const next = Math.round(rail.scrollLeft / rail.clientWidth);
    setVisibleIndex(Math.max(0, Math.min(next, images.length - 1)));
  };

  const goTo = (index) => {
    const rail = railRef.current;
    if (!rail) return;
    const next = Math.max(0, Math.min(index, images.length - 1));
    programmaticScrollRef.current = true;
    rail.scrollTo({ left: next * rail.clientWidth, behavior: "smooth" });
    setVisibleIndex(next);
    finishProgrammaticScroll();
  };

  if (!images.length) {
    return <div className="aspect-[4/5] bg-[#fafafa]" />;
  }

  return (
    <div className="relative bg-white py-4 lg:flex lg:min-h-[42rem] lg:items-center lg:justify-center lg:py-8">
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
              skeletonClassName="sotra-cool-shimmer bg-[#EAEAEA]"
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
        <div className="sotra-story-progress absolute inset-x-0 bottom-0 z-20" aria-hidden="true">
          <span
            style={{
              width: `${100 / images.length}%`,
              transform: `translate3d(${visibleIndex * 100}%, 0, 0)`,
            }}
          />
        </div>
      )}

      {viewerIndex !== null && (
        <ProductMediaViewer
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
  hideFullDetails = false,
  showSetContents = false,
}) => {
  const { currency, addToCart, openCart } = useContext(ShopContext);
  const { price, displayPrice, hasDiscount } = getDisplayPrice(product);
  const availableSizes = Array.isArray(product.sizes)
    ? product.sizes.filter((size) => size && String(size).toLowerCase() !== "default")
    : [];
  const availablePerfumeTypes = Array.isArray(product.perfumeTypes)
    ? product.perfumeTypes.filter(isRealOption)
    : [];
  const perfumeTypeLabel =
    availablePerfumeTypes[0] ||
    (isSeasonLabel(product.concentration) ? "" : product.concentration || "");
  const brandLabel = product?.brand || "SOTRA BRAND";
  const shadeOptions = getShadeOptions(product);
  const storyImages = getStoryImages(product, shadeOptions);
  const [selectedImage, setSelectedImage] = useState(0);
  const [galleryTarget, setGalleryTarget] = useState({ index: 0, version: 0 });
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedFitKg, setSelectedFitKg] = useState("");
  const [quantityPulse, setQuantityPulse] = useState(false);
  const [adding, setAdding] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [fitPickerOpen, setFitPickerOpen] = useState(false);
  const quantityPulseTimer = useRef(null);
  const hasSmallImageChoices = showSmallImages && shadeOptions.length > 0;
  const selectedOption = shadeOptions[selectedImage] || null;
  const selectedOptionLabel =
    selectedOption?.label || (hasSmallImageChoices ? getOptionLabel(product, selectedImage) : "");
  const selectedDescription = selectedOption?.description || product.description;
  const totalDisplayPrice = displayPrice * quantity;
  const totalOriginalPrice = price * quantity;
  const stockNumber =
    product?.stock === undefined || product?.stock === null || product?.stock === ""
      ? null
      : Number(product.stock);
  const hasStockCount = stockNumber !== null && Number.isFinite(stockNumber);
  const isSoldOut =
    Boolean(product?.outOfStock) || (hasStockCount && stockNumber <= 0);
  const hasSizes = availableSizes.length > 0;
  const fitMin = Number(product?.fitMin);
  const fitMax = Number(product?.fitMax);
  const hasFitSelection =
    Number.isFinite(fitMin) && Number.isFinite(fitMax) && fitMin > 0 && fitMax >= fitMin;
  const selectedFitNumber = Number(selectedFitKg);
  const hasValidFit =
    !hasFitSelection ||
    (Number.isFinite(selectedFitNumber) &&
      selectedFitNumber >= fitMin &&
      selectedFitNumber <= fitMax);
  const selectedFitLabel =
    hasFitSelection && selectedFitKg ? `${selectedFitNumber} ${product?.fitUnit || "kg"}` : "";
  const fitOptions = hasFitSelection
    ? Array.from({ length: fitMax - fitMin + 1 }, (_, index) => fitMin + index)
    : [];
  const canSubmitOptions = !isSoldOut;
  const isLowStock = hasStockCount && stockNumber > 0 && stockNumber <= 5;
  const maximumQuantity = hasStockCount ? Math.max(1, stockNumber) : 99;

  const selectOption = (index) => {
    if (selectedImage === index) {
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
    setSelectedFitKg("");
    setSelectedImage(0);
    setGalleryTarget((prev) => ({
      index: 0,
      version: prev.version + 1,
    }));
    setDescriptionOpen(false);
    setFitPickerOpen(false);
  }, [product._id]);

  useEffect(() => {
    if (selectedImage >= shadeOptions.length) {
      setSelectedImage(0);
      setGalleryTarget((prev) => ({
        index: 0,
        version: prev.version + 1,
      }));
    }
  }, [selectedImage, shadeOptions.length]);

  useEffect(() => {
    setDescriptionOpen(false);
  }, [selectedImage]);

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
    if (hasFitSelection && !hasValidFit) {
      toast.info(`Please choose her fit between ${fitMin} kg and ${fitMax} kg.`, {
        position: "top-center",
        autoClose: 1600,
        hideProgressBar: true,
      });
      return;
    }
    if (adding) return;
    setAdding(true);

    if (!customerPreviewLocked) {
      addToCart?.(
        product._id,
        hasSizes ? selectedSize : selectedFitLabel || null,
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

        <div className="mt-3 flex items-center justify-between gap-4 lg:mt-8">
          <div className="min-w-0">
            <span
              className={`sotra-price-value sotra-price block text-sm font-bold lg:text-3xl lg:font-bold ${
                hasDiscount ? "sotra-sale-price" : ""
              } ${
                quantityPulse ? "is-changing" : ""
              }`}
            >
              {currency}
              {totalDisplayPrice.toFixed(2)} USD
            </span>
            {hasDiscount && (
              <span
                className={`sotra-price-value sotra-old-price mt-1 block text-xs ${
                  quantityPulse ? "is-changing" : ""
                }`}
              >
                {currency}
                {totalOriginalPrice.toFixed(2)} USD
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => changeQuantity((prev) => prev - 1)}
              disabled={quantity <= 1}
              className="grid h-11 w-11 place-items-center rounded-full bg-[#f7f6f3] text-[20px] leading-none text-black/45 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition hover:bg-[#efebe4] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 lg:h-12 lg:w-12"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span
              className={`sotra-quantity-value min-w-5 text-center text-[12px] font-semibold text-black/70 lg:min-w-7 lg:text-base ${
                quantityPulse ? "is-changing" : ""
              }`}
              aria-label={`Quantity ${quantity}`}
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => changeQuantity((prev) => prev + 1)}
              disabled={hasStockCount && quantity >= stockNumber}
              className="grid h-11 w-11 place-items-center rounded-full bg-[#f7f6f3] text-black/70 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition hover:bg-[#efebe4] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 lg:h-12 lg:w-12"
              aria-label="Increase quantity"
            >
              <FiPlus className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            </button>
          </div>
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

        {hasSmallImageChoices && (
          <p className="mt-4 text-xs uppercase tracking-[0.08em] text-black/80 lg:mt-4 lg:text-xl">
            Choose A Color{selectedOptionLabel ? `: ${selectedOptionLabel}` : ""}
          </p>
        )}

        {hasSmallImageChoices && (
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
        )}

        {hasStockCount && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] lg:text-base">
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
            <Link
              to="/terms"
              className="mt-2 inline-flex border-b border-black/45 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/55 transition hover:text-black lg:text-sm"
            >
              Exchange Policy
            </Link>
          </div>
        )}

        {!hasStockCount && perfumeTypeLabel && (
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55 lg:text-base">
            {perfumeTypeLabel}
          </p>
        )}

        {!perfumeTypeLabel && brandLabel && (
          <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-black/45 lg:text-base">
            {brandLabel}
          </p>
        )}

        {selectedDescription && (
          <div className="mt-5 lg:mt-10">
            <p
              className={`text-xs leading-5 text-black/65 lg:text-2xl lg:leading-8 ${
                descriptionOpen ? "" : "line-clamp-5"
              }`}
            >
              {selectedDescription}
            </p>
            {String(selectedDescription).length > 180 && (
              <button
                type="button"
                onClick={() => setDescriptionOpen((open) => !open)}
                className="mt-2 border-b border-black pb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-black transition hover:text-black/60 lg:mt-4 lg:text-sm"
              >
                {descriptionOpen ? "Read Less" : "Read More"}
              </button>
            )}
          </div>
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

        {hasFitSelection && (
          <div className="mt-5 border-t border-black/10 pt-5 lg:mt-8 lg:pt-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black lg:text-base">
                  Choose Your Fit
                </p>
                <p className="mt-1 text-[11px] text-black/45 lg:text-sm">
                  Weight range: {fitMin}-{fitMax} kg
                </p>
              </div>
              {selectedFitLabel && (
                <span className="font-serif text-[18px] leading-none text-black lg:text-2xl">
                  {selectedFitLabel}
                </span>
              )}
            </div>

            <div className="relative mt-3">
              <button
                type="button"
                onClick={() => setFitPickerOpen((open) => !open)}
                className="flex h-11 w-full items-center justify-between border border-black/25 bg-white px-4 text-left font-serif text-[18px] text-black transition hover:border-black lg:h-12 lg:text-xl"
                aria-expanded={fitPickerOpen}
                aria-controls={`fit-options-${product._id}`}
              >
                <span>{selectedFitLabel || "Choose KG"}</span>
                <FiChevronDown
                  className={`h-4 w-4 stroke-[1.4] transition-transform duration-300 ${
                    fitPickerOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                id={`fit-options-${product._id}`}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  fitPickerOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="mt-2 max-h-44 overflow-y-auto border border-black/10 bg-white p-2 no-scrollbar lg:max-h-56">
                    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                      {fitOptions.map((value) => {
                        const valueString = String(value);
                        const selected = selectedFitKg === valueString;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setSelectedFitKg(valueString);
                              setFitPickerOpen(false);
                            }}
                            className={`flex h-8 items-center justify-center gap-1 border text-[11px] font-semibold uppercase tracking-[0.06em] transition lg:h-10 lg:text-sm ${
                              selected
                                ? "border-black bg-black text-white"
                                : "border-black/15 bg-white text-black hover:border-black"
                            }`}
                          >
                            {selected && <FiCheck className="h-3.5 w-3.5" />}
                            {value} kg
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSetContents && <ProductSetContents product={product} />}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding || !canSubmitOptions}
          className={`sotra-water-add relative mt-5 flex h-11 w-full items-center justify-center overflow-hidden border border-black bg-white text-[10px] font-semibold uppercase tracking-[0.22em] text-black transition hover:text-white lg:mt-7 lg:h-[4.4rem] lg:text-2xl ${
            adding ? "is-filling" : ""
          } ${!canSubmitOptions ? "cursor-not-allowed opacity-45" : ""}`}
        >
          <span className="relative z-10">
            {isSoldOut
              ? "Out Of Stock"
              : hasSizes && !selectedSize
                ? "Choose Size"
                : hasFitSelection && !hasValidFit
                  ? "Choose Fit"
                : adding
                  ? "Added To Cart"
                  : "Add To Cart"}
          </span>
        </button>

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
              : hasFitSelection && !hasValidFit
                ? "Choose Fit"
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
    </article>
  );
};

const FeaturedProducts = ({
  slot = 1,
  showSmallImages,
  includeVideoGallery,
  sectionId,
  productsOverride,
  ariaLabel,
  hideFullDetails = false,
  showNavigation = true,
  showSetContents = false,
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
                hideFullDetails={hideFullDetails}
                showSetContents={showSetContents}
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
