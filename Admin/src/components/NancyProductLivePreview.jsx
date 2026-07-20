import React, { useEffect, useMemo, useState } from "react";

const mediaSrc = (item) =>
  item?._preview || item?._filePreview || item?.image || item?.src || "";

const getPreviewMedia = (shadeOptions = [], storyImages = []) => {
  const shades = shadeOptions
    .map((item, index) => ({
      ...item,
      src: mediaSrc(item),
      type: "shade",
      index,
    }))
    .filter((item) => item.src || item.label || item.cartValue);
  const stories = storyImages
    .map((item, index) => ({
      ...item,
      src: mediaSrc(item),
      type: "story",
      index,
    }))
    .filter((item) => item.src);

  return { shades, stories, all: [...shades, ...stories] };
};

const previewKey = (item) => `${item?.type || "media"}-${item?.id || item?.index || 0}`;

const NancyProductLivePreview = ({
  name,
  description,
  price,
  discountPrice,
  stock,
  category,
  subCategory,
  concentration,
  perfumeTypes = [],
  sizes = [],
  newArrival,
  onSales,
  active,
  outOfStock,
  showSmallImages,
  shadeOptions,
  storyImages,
}) => {
  const { shades, stories, all } = useMemo(
    () => getPreviewMedia(shadeOptions, storyImages),
    [shadeOptions, storyImages]
  );
  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    if (!all.length) {
      if (selectedKey) setSelectedKey("");
      return;
    }

    if (!all.some((item) => previewKey(item) === selectedKey)) {
      setSelectedKey(previewKey(all[0]));
    }
  }, [all, selectedKey]);

  const selected = all.find((item) => previewKey(item) === selectedKey) || all[0];
  const basePrice = Number(price);
  const salePrice = Number(discountPrice);
  const hasDiscount =
    Number.isFinite(basePrice) &&
    Number.isFinite(salePrice) &&
    salePrice > 0 &&
    salePrice < basePrice;
  const displayPrice = hasDiscount
    ? salePrice
    : Number.isFinite(basePrice)
      ? basePrice
      : 0;

  return (
    <section className="rounded-md border border-[#e5e5e5] bg-white p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c47b92]">
        Live Product Preview
      </p>

      <div className="mt-4 overflow-hidden border border-[#e5e5e5] bg-white">
        <div className="relative aspect-[4/5] bg-white">
          {selected?.src ? (
            <img
              src={selected.src}
              alt={selected.label || selected.alt || name || "Product preview"}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-[#EAEAEA] text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#9ca3af]">
              Add shade or story image
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {newArrival && (
              <span className="w-fit bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-black shadow-sm">
                New
              </span>
            )}
            {onSales && hasDiscount && (
              <span className="w-fit bg-black px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
                Sale
              </span>
            )}
          </div>

          <span className="absolute right-3 top-3 border border-black/15 bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-black">
            {active === false ? "Hidden" : outOfStock ? "Out" : "Live"}
          </span>
        </div>

        <div className="p-4">
          {shades.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">
                  Small Images
                </p>
                {showSmallImages === false && (
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-black/35">
                    Hidden on featured card
                  </span>
                )}
              </div>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {shades.map((shade) => {
                  const key = previewKey(shade);
                  const selectedShade = key === previewKey(selected);

                  return (
                    <button
                      key={shade.id || `${shade.label}-${shade.index}`}
                      type="button"
                      onClick={() => setSelectedKey(key)}
                      className={`grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border bg-white p-0.5 transition ${
                        selectedShade
                          ? "border-black shadow-[0_0_0_2px_rgba(0,0,0,0.08)]"
                          : "border-black/25"
                      }`}
                      title={shade.label || "Shade option"}
                    >
                      {shade.src ? (
                        <img src={shade.src} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center rounded-full bg-[#f4f4f4] px-1 text-center text-[8px] font-bold uppercase leading-3 text-black/60">
                          {shade.label || shade.cartValue || `Option ${shade.index + 1}`}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {selected?.type === "shade" && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/60">
                  {selected.label || selected.cartValue || "Selected shade"}
                </p>
              )}
            </div>
          )}

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/45">
            {category || "Category"} / {subCategory || "Subcategory"}
          </p>
          <h3 className="mt-3 text-2xl font-black uppercase leading-tight tracking-[0.06em] text-black">
            {name || "Product Name"}
          </h3>
          <div className="mt-3 flex items-center gap-1 text-black" aria-label="5 star preview">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className="text-lg leading-none">★</span>
            ))}
            <span className="ml-1 text-sm text-black/55">preview</span>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-2">
            <span className={`sotra-price text-2xl font-bold ${hasDiscount ? "sotra-sale-price" : ""}`}>
              ${displayPrice.toFixed(2)} USD
            </span>
            {hasDiscount && (
              <span className="sotra-old-price text-sm">
                ${basePrice.toFixed(2)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-black/45">
            Shipping calculated at checkout.
          </p>

          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/55">
            {outOfStock ? "Out of stock" : `${stock || 0} in stock`}
            {concentration && !perfumeTypes.length ? ` / ${concentration}` : ""}
          </p>

          {Array.isArray(perfumeTypes) && perfumeTypes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {perfumeTypes.map((type) => (
                <span
                  key={type}
                  className="border border-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-black/55"
                >
                  {type}
                </span>
              ))}
            </div>
          )}

          {Array.isArray(sizes) && sizes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
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

          <p className="mt-4 line-clamp-4 text-sm leading-6 text-black/60">
            {description || "Write a product description to preview it here."}
          </p>

          {stories.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {stories.slice(0, 4).map((story) => {
                const key = previewKey(story);
                return (
                  <button
                    key={story.id || story.index}
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    className={`aspect-[9/12] overflow-hidden border bg-[#EAEAEA] ${
                      key === previewKey(selected) ? "border-black" : "border-black/10"
                    }`}
                    title={story.alt || "Story image"}
                  >
                    <img src={story.src} alt="" className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NancyProductLivePreview;
