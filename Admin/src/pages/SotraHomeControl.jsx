import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { backendUrl } from "../App";
import ProductSotraMediaEditor, {
  stripProductMediaPrivateFields,
} from "../components/ProductSotraMediaEditor";
import {
  defaultCategoryGroups,
  getActiveCategoryGroups,
  getCategoryNames,
  getSubcategoriesForCategory,
} from "../lib/categoryOptions";

const mediaSections = [
  {
    key: "luxury-gallery",
    label: "Luxury Video Gallery",
    hint: "9:16 videos or images. Storefront videos show as 15-second presentation clips.",
  },
];

const featuredSlots = [];
const maxHeaderSlides = 4;
const volumeOptions = ["100ML", "120ML", "150ML", "30ML", "50ML", "10ML"];
const perfumeTypeOptions = ["Eau de Parfum", "Eau de Toilette", "Parfum"];

const emptySettings = {
  delivery_fee: 5,
  announcementEnabled: true,
  announcementItems: ["Welcome to our store", "Cash On Delivery", "Tripoli Delivery Only $2"],
  freeShippingEnabled: true,
  freeShippingText: "Delivery $5 All Over Lebanon",
  availableNowText: "AVAILABLE NOW",
  brandEmail: "sotrabrand7@gmail.com",
  socialLinks: {
    instagram: "https://www.instagram.com/sotra_brand_hijab?igsh=MWZiNzdkM3BuZnVndA%3D%3D&utm_source=qr",
    facebook: "https://www.facebook.com/share/1Cnd12KNGw/?mibextid=wwXIfr",
    tiktok: "https://www.tiktok.com/@sotrabrand133?_r=1&_t=ZS-98BbAHXPjTc",
    whatsapp: "https://wa.me/96171872919",
    email: "sotrabrand7@gmail.com",
    phone: "71872919",
  },
};

const emptySlideDraft = {
  image: null,
  desktopImage: null,
  existingImage: "",
  existingDesktopImage: "",
  title: "SOTRA\nBringing Modesty to Every Wardrobe",
  buttonLabel: "Discover More",
  to: "/collection",
  order: 0,
  active: true,
  _imagePreview: "",
  _desktopPreview: "",
};

const fieldClass =
  "min-h-11 w-full rounded-none border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none transition placeholder:text-black/30 focus:border-black focus:ring-2 focus:ring-black/10";

const labelClass =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/50";

const panelClass =
  "border border-black/15 bg-white p-4 shadow-[0_16px_38px_rgba(0,0,0,0.05)]";

const buttonBlack =
  "bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#222] disabled:cursor-wait disabled:opacity-45";

const buttonLine =
  "border border-black px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-35";

const buttonGreen =
  "bg-[#0f7a3d] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#0c6533] disabled:cursor-wait disabled:opacity-45";

const money = (value) => {
  const amount = Number(value);
  return `$${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
};

const clamp = (number, min, max) => Math.min(Math.max(number, min), max);

const calcDiscountPrice = (price, percent) => {
  const basePrice = Number(price);
  const discountPercent = Number(percent);
  if (!Number.isFinite(basePrice) || !Number.isFinite(discountPercent) || basePrice <= 0) {
    return "";
  }
  return (basePrice * (1 - clamp(discountPercent, 0, 100) / 100)).toFixed(2);
};

const normalizeSettings = (settings = {}) => ({
  ...emptySettings,
  ...settings,
  socialLinks: {
    ...emptySettings.socialLinks,
    ...(settings.socialLinks || {}),
  },
});

const cloneSection = (section) => ({
  key: section.key,
  title: section.title || "",
  active: section.active !== false,
  preferredSizeNote: section.preferredSizeNote || "",
  items: (section.items || []).map((item, index) => ({
    id: item.id || `${section.key}-${index}`,
    type: item.type === "video" ? "video" : "image",
    src: item.src || "",
    fileId: item.fileId || "",
    desktopSrc: item.desktopSrc || "",
    desktopFileId: item.desktopFileId || "",
    poster: item.poster || "",
    posterFileId: item.posterFileId || "",
    alt: item.alt || "",
    label: item.label || "",
    buttonLabel: item.buttonLabel ?? "See Full Collections",
    productId: item.productId || "",
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : index,
    active: item.active !== false,
  })),
});

const newMediaItem = (key, index) => ({
  id: `${key}-${Date.now()}-${index}`,
  type: "image",
  src: "",
  fileId: "",
  desktopSrc: "",
  desktopFileId: "",
  poster: "",
  posterFileId: "",
  alt: "",
  label: "",
  buttonLabel: "See Full Set",
  productId: "",
  order: index,
  active: true,
  _file: null,
  _desktopFile: null,
  _posterFile: null,
  _filePreview: "",
  _desktopPreview: "",
  _posterPreview: "",
});

const stripPrivateMedia = (item) => {
  const {
    _file,
    _desktopFile,
    _posterFile,
    _filePreview,
    _desktopPreview,
    _posterPreview,
    ...publicItem
  } = item;
  return publicItem;
};

const getImages = (product) => {
  const images = Array.isArray(product?.image) ? product.image : [product?.image];
  return images.filter(Boolean);
};

const mediaImage = (item) =>
  item?._preview || item?._filePreview || item?.image || item?.url || "";

const sortMediaByOrder = (items = []) =>
  [...items].sort((a, b) => {
    const aOrder = Number.isFinite(Number(a?.order)) ? Number(a.order) : 9999;
    const bOrder = Number.isFinite(Number(b?.order)) ? Number(b.order) : 9999;
    return aOrder - bOrder;
  });

const firstProductImage = (product) => {
  const story = mediaImage(sortMediaByOrder(product?.storyImages).find((item) => mediaImage(item)));
  const shade = mediaImage(sortMediaByOrder(product?.shadeOptions).find((item) => mediaImage(item)));
  return story || shade || getImages(product)[0] || "";
};

const getProductPreviewImages = (product) => {
  const shadeImages = Array.isArray(product?.shadeOptions)
    ? sortMediaByOrder(product.shadeOptions)
        .map((option, index) => ({
          id: `shade-${option.id || index}`,
          image: mediaImage(option),
          alt: option.label || product?.name || "",
          source: "shade",
          optionId: option.id || "",
          order: option.order ?? index + 1,
        }))
        .filter((item) => item.image)
    : [];
  const storyImages = Array.isArray(product?.storyImages)
    ? sortMediaByOrder(product.storyImages)
        .map((story, index) => ({
          id: `story-${story.id || index}`,
          image: mediaImage(story),
          alt: story.alt || product?.name || "",
          source: "story",
          order: story.order ?? index + 1,
        }))
        .filter((item) => item.image)
    : [];
  const productImages = getImages(product).map((image, index) => ({
    id: `product-${index}`,
    image,
    alt: product?.name || "",
    source: "product",
  }));

  const seen = new Set();
  return [...storyImages, ...shadeImages, ...productImages].filter((item) => {
    if (!item.image || seen.has(item.image)) return false;
    seen.add(item.image);
    return true;
  });
};

const normalizeProductSize = (value) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  const compact = text.toLowerCase().replace(/\s+/g, "");

  if (!compact || compact === "default") return "";
  if (compact === "100ml") return "100ML";
  if (compact === "120ml") return "120ML";
  if (compact === "150ml") return "150ML";
  if (compact === "50ml") return "50ML";
  if (compact === "30ml") return "30ML";
  if (compact === "10ml") return "10ML";

  return text;
};

const getProductSizes = (product) => [
  ...new Set(
    (Array.isArray(product?.sizes) ? product.sizes : [])
      .map(normalizeProductSize)
      .filter(Boolean)
  ),
];

const getProductPerfumeTypes = (product) => [
  ...new Set(
    [
      ...(Array.isArray(product?.perfumeTypes) ? product.perfumeTypes : []),
      perfumeTypeOptions.includes(product?.concentration) ? product.concentration : "",
    ].filter(Boolean)
  ),
];

const productToDraft = (product) => ({
  name: product?.name || "",
  description: product?.description || "",
  price: product?.price ?? "",
  discountPrice: product?.discountPrice ?? "",
  stock: product?.stock ?? "",
  active: product?.active !== false,
  outOfStock: Boolean(product?.outOfStock),
  showSmallImages: product?.showSmallImages !== false,
  category: product?.category || "",
  subCategory: product?.subCategory || "",
  concentration: product?.concentration || "",
  perfumeTypes: getProductPerfumeTypes(product),
  sizes: getProductSizes(product),
});

const emptyProductMediaDraft = () => ({ shadeOptions: [], storyImages: [] });

const productToMediaDraft = (product) => ({
  shadeOptions: Array.isArray(product?.shadeOptions)
    ? product.shadeOptions.map((item, index) => ({
        id: item.id || `shade-${product?._id || "product"}-${index}`,
        label: item.label || "",
        cartValue: item.cartValue || item.label || "",
        description: item.description || "",
        image: item.image || "",
        fileId: item.fileId || "",
        order: item.order ?? index + 1,
        _file: null,
        _preview: "",
      }))
    : [],
  storyImages: Array.isArray(product?.storyImages)
    ? product.storyImages.map((item, index) => ({
        id: item.id || `story-${product?._id || "product"}-${index}`,
        alt: item.alt || "",
        image: item.image || "",
        fileId: item.fileId || "",
        order: item.order ?? index + 1,
        _file: null,
        _preview: "",
      }))
    : [],
});

const sortByOrder = (items = []) =>
  [...items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

const getMediaPreviewSrc = (item) =>
  item?._filePreview || item?.src || item?._posterPreview || item?.poster || "";

const SetPicturePreview = ({ entry, section, products = [] }) => {
  const orderedItems = sortByOrder(section?.items || []);
  const item =
    orderedItems.find((media) => media.active !== false && getMediaPreviewSrc(media)) ||
    orderedItems.find((media) => media.active !== false) ||
    orderedItems[0];
  const linkedProduct = products.find((product) => product._id === item?.productId);
  const buttonLabel = String(item?.buttonLabel ?? "See Full Set").trim();

  return (
    <section className="bg-white px-3 py-7">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
        {entry.label}
      </p>
      <div className="relative mt-4 overflow-hidden bg-[#EAEAEA]">
        <MiniMedia item={item} className="aspect-[9/16] w-full md:aspect-[2/1]" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em]">
            {item?.label || "Be Radiant Set"}
          </p>
          {buttonLabel && (
            <p className="mt-2 inline-flex border-b border-white pb-1 text-[10px] font-bold uppercase tracking-[0.18em]">
              {buttonLabel}
            </p>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-black/45">
        Link: {linkedProduct?.name || "Choose a product"}
      </p>
    </section>
  );
};

const MiniMedia = ({ item, className = "" }) => {
  const src = getMediaPreviewSrc(item);

  return (
    <div className={`overflow-hidden bg-[#EAEAEA] ${className}`}>
      {src ? (
        item?.type === "video" && !item?._filePreview ? (
          <video src={src} poster={item.poster} muted playsInline className="h-full w-full object-cover" />
        ) : (
          <img src={src} alt={item?.alt || item?.label || ""} className="h-full w-full object-cover" />
        )
      ) : (
        <div className="grid h-full w-full place-items-center text-[9px] font-bold uppercase tracking-[0.16em] text-black/35">
          Media
        </div>
      )}
    </div>
  );
};

const MiniProduct = ({ product, title }) => {
  if (!product) {
    return (
      <section className="border-y border-black/10 bg-white px-3 py-7 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
          {title}
        </p>
        <p className="mt-3 text-sm font-semibold text-black">Choose a product</p>
      </section>
    );
  }

  const image = firstProductImage(product);
  const price = Number(product.price) || 0;
  const discount = Number(product.discountPrice);
  const hasDiscount = Number.isFinite(discount) && discount > 0 && discount < price;
  const shadeOptions = Array.isArray(product.shadeOptions)
    ? product.shadeOptions.filter((item) => item.image)
    : [];

  return (
    <section className="border-y border-black/10 bg-white px-3 py-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
        {title}
      </p>
      <div className="mt-3 grid grid-cols-[1fr_0.95fr] gap-3">
        <div className="aspect-[4/5] bg-[#EAEAEA]">
          {image ? (
            <img src={image} alt={product.name} className="h-full w-full object-contain" />
          ) : (
            <div className="grid h-full w-full place-items-center text-[9px] uppercase tracking-[0.18em] text-black/35">
              Product
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <h4 className="text-base font-black uppercase leading-tight tracking-[0.04em]">
            {product.name}
          </h4>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-sm">{money(hasDiscount ? discount : price)} USD</span>
            {hasDiscount && (
              <span className="text-xs text-black/35 line-through">{money(price)}</span>
            )}
          </div>
          <p className="mt-2 line-clamp-3 text-xs leading-5 text-black/55">
            {product.description}
          </p>
          {shadeOptions.length > 0 && (
            <div className="mt-3 flex gap-1.5">
              {shadeOptions.slice(0, 4).map((option) => (
                <span
                  key={option.id || option.image}
                  className="h-8 w-8 overflow-hidden rounded-full border border-black/20 bg-white"
                >
                  <img src={option.image} alt="" className="h-full w-full scale-150 object-cover" />
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 border border-black px-3 py-2 text-center text-[9px] font-bold uppercase tracking-[0.18em] text-black/50">
            Add To Cart Locked
          </div>
        </div>
      </div>
    </section>
  );
};

const CategoryCollectionsPreview = ({ products = [], categoryGroups = defaultCategoryGroups }) => {
  const groups = getActiveCategoryGroups(categoryGroups);
  const fallbackGroups = getActiveCategoryGroups(defaultCategoryGroups);
  const tiles = (groups.length ? groups : fallbackGroups)
    .map((group) => {
      const product = products.find(
        (item) =>
          String(item.category || "").toLowerCase() === String(group.label || "").toLowerCase() ||
          String(item.subCategory || "").toLowerCase() === String(group.label || "").toLowerCase()
      );

      return {
        label: group.label,
        image: group.image || firstProductImage(product),
      };
    })
    .filter((tile) => tile.label)
    .slice(0, 6);

  return (
    <section className="bg-white px-4 py-7">
      <h3 className="font-serif text-3xl leading-none text-black">Collections</h3>
      <div className="mt-5 grid grid-cols-2 gap-x-2 gap-y-5">
        {tiles.map((tile) => (
          <article key={tile.label}>
            <div className="aspect-[4/3] overflow-hidden bg-[#EAEAEA]">
              {tile.image ? (
                <img src={tile.image} alt={tile.label} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center px-3 text-center text-[9px] font-bold uppercase tracking-[0.16em] text-black/35">
                  {tile.label}
                </div>
              )}
            </div>
            <p className="mt-2 font-serif text-lg leading-tight text-black">
              {tile.label} <span aria-hidden="true">-&gt;</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

const HomeSimulator = ({ settings, slides, products, sections, categoryGroups }) => {
  const activeSlides = sortByOrder(slides).filter((slide) => slide.active !== false && slide.image);
  const hero = activeSlides[0];
  const heroImage = hero?.desktopImage || hero?.image || "";
  const [headline, subheadline] = String(
    hero?.title || "SOTRA\nBringing Modesty to Every Wardrobe"
  ).split("\n");
  const luxuryItems = sortByOrder(sections["luxury-gallery"]?.items || []).filter(
    (item) => item.active !== false && getMediaPreviewSrc(item)
  );

  return (
    <div className="overflow-hidden border border-black/15 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
      <div className="bg-black px-3 py-2 text-center text-[8px] font-bold uppercase tracking-[0.18em] text-white">
        {(settings.announcementItems || []).join("  /  ")}
      </div>
      <div className="relative aspect-[9/16] bg-[#EAEAEA] md:aspect-[2/1]">
        {heroImage ? (
          <img src={heroImage} alt="SotraBrand header" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs font-bold uppercase tracking-[0.2em] text-black/35">
            Header Image
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/15 to-transparent" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center text-[#f4efe8] drop-shadow">
          <p className="font-serif text-4xl leading-none">{headline}</p>
          {subheadline && (
            <p className="mx-auto mt-1 max-w-[320px] font-serif text-2xl leading-[0.95]">
              {subheadline}
            </p>
          )}
          <p className="mx-auto mt-4 inline-flex border-2 border-black bg-white px-5 py-2 font-serif text-lg text-black">
            {hero?.buttonLabel || "Discover More"}
          </p>
        </div>
      </div>
      <div className="overflow-hidden border-b border-black/10 bg-white py-3">
        <p className="whitespace-nowrap text-center text-2xl font-black uppercase tracking-[0.05em]">
          {settings.availableNowText || "AVAILABLE NOW"}
        </p>
      </div>

      <CategoryCollectionsPreview products={products} categoryGroups={categoryGroups} />

      <section className="bg-white px-3 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
          Luxury Video Gallery
        </p>
        <div className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-2">
          {(luxuryItems.length ? luxuryItems : [null, null]).map((item, index) => (
            <MiniMedia key={item?.id || index} item={item} className="aspect-[9/16] w-[46%] shrink-0 snap-start" />
          ))}
        </div>
        <div className="mt-2 h-1 bg-black/15">
          <div className="h-full w-1/3 bg-black" />
        </div>
      </section>
    </div>
  );
};

const StudioSection = ({ eyebrow, title, note, preview, children }) => (
  <section className="grid gap-5 border-b border-black/10 pb-8 xl:grid-cols-[minmax(330px,440px)_minmax(0,1fr)]">
    <aside className="xl:sticky xl:top-[96px] xl:self-start">
      <div className="mb-3 border border-black/15 bg-white px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c47b92]">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-xl font-black uppercase tracking-[0.04em]">{title}</h3>
        {note && <p className="mt-2 text-xs leading-5 text-black/55">{note}</p>}
      </div>
      <div className="overflow-hidden border border-black/15 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
        {preview}
      </div>
    </aside>
    <div className="min-w-0">{children}</div>
  </section>
);

const HeaderLivePreview = ({ settings, slides }) => {
  const activeSlides = sortByOrder(slides).filter((slide) => slide.active !== false && slide.image);
  const hero = activeSlides[0];
  const heroImage = hero?.desktopImage || hero?.image || "";
  const [headline, subheadline] = String(
    hero?.title || "SOTRA\nBringing Modesty to Every Wardrobe"
  ).split("\n");

  return (
    <div className="bg-white">
      <div className="bg-black px-3 py-2 text-center text-[8px] font-bold uppercase tracking-[0.18em] text-white">
        {(settings.announcementItems || []).join("  /  ")}
      </div>
      <div className="relative aspect-[9/16] bg-[#EAEAEA] md:aspect-[2/1]">
        {heroImage ? (
          <img src={heroImage} alt="Header preview" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs font-bold uppercase tracking-[0.2em] text-black/35">
            Header Image
          </div>
        )}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center text-[#f4efe8] drop-shadow">
          <p className="font-serif text-4xl leading-none">{headline}</p>
          {subheadline && (
            <p className="mx-auto mt-1 max-w-[320px] font-serif text-2xl leading-[0.95]">
              {subheadline}
            </p>
          )}
          <p className="mx-auto mt-4 inline-flex border-2 border-black bg-white px-5 py-2 font-serif text-lg text-black">
            {hero?.buttonLabel || "Discover More"}
          </p>
        </div>
      </div>
      <div className="border-t border-black/10 px-3 py-3 text-center">
        <p className="text-xl font-black uppercase tracking-[0.05em]">
          {settings.availableNowText || "AVAILABLE NOW"}
        </p>
      </div>
    </div>
  );
};

const FeaturedLivePreview = ({ product, title }) => (
  <div className="bg-white">
    <MiniProduct product={product} title={title} />
  </div>
);

const MediaSectionLivePreview = ({ entry, section, products }) => {
  const items = sortByOrder(section?.items || []).filter(
    (item) => item.active !== false && getMediaPreviewSrc(item)
  );

  return (
    <section className="bg-white px-3 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
        {entry.label}
      </p>
      <div className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-2">
        {(items.length ? items : [null, null]).map((item, index) => (
          <MiniMedia
            key={item?.id || index}
            item={item}
            className="aspect-[9/16] w-[46%] shrink-0 snap-start"
          />
        ))}
      </div>
      <div className="mt-2 h-1 bg-black/15">
        <div className="h-full w-1/3 bg-black" />
      </div>
    </section>
  );
};

const SiteLayerLivePreview = ({ settings, announcementText }) => {
  const lines = announcementText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="bg-white">
      <div className="bg-black px-3 py-2 text-center text-[8px] font-bold uppercase tracking-[0.18em] text-white">
        {(lines.length ? lines : settings.announcementItems || []).join("  /  ")}
      </div>
      <div className="border-b border-black/10 bg-white px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-black">
        {settings.availableNowText || "AVAILABLE NOW"}
      </div>
      <div className="px-4 py-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
          Footer + Socials
        </p>
        <p className="mt-3 text-sm text-black/65">{settings.brandEmail}</p>
        <div className="mt-4 grid gap-2 text-xs uppercase tracking-[0.16em] text-black/60">
          <span>Instagram: {settings.socialLinks?.instagram ? "Connected" : "Empty"}</span>
          <span>Facebook: {settings.socialLinks?.facebook ? "Connected" : "Empty"}</span>
          <span>Tiktok: {settings.socialLinks?.tiktok ? "Connected" : "Empty"}</span>
        </div>
        <div className="mt-5 border-t border-black/15 pt-4 text-xs font-bold uppercase tracking-[0.16em]">
          {settings.freeShippingEnabled !== false
            ? settings.freeShippingText || "Free Shipping On All Orders"
            : "Free shipping hidden"}
        </div>
      </div>
    </div>
  );
};

const SotraHomeControl = ({ token }) => {
  const [settings, setSettings] = useState(emptySettings);
  const [announcementText, setAnnouncementText] = useState(emptySettings.announcementItems.join("\n"));
  const [slides, setSlides] = useState([]);
  const [selectedSlideId, setSelectedSlideId] = useState("new");
  const [slideDraft, setSlideDraft] = useState(emptySlideDraft);
  const [products, setProducts] = useState([]);
  const [categoryGroups, setCategoryGroups] = useState(defaultCategoryGroups);
  const [featuredSelections, setFeaturedSelections] = useState(() =>
    featuredSlots.reduce((entries, slot) => ({ ...entries, [slot]: "" }), {})
  );
  const [productDrafts, setProductDrafts] = useState(() =>
    featuredSlots.reduce((entries, slot) => ({ ...entries, [slot]: productToDraft(null) }), {})
  );
  const [featuredMediaDrafts, setFeaturedMediaDrafts] = useState(() =>
    featuredSlots.reduce((entries, slot) => ({ ...entries, [slot]: emptyProductMediaDraft() }), {})
  );
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  const authHeader = useMemo(() => ({ headers: { token } }), [token]);
  const orderedSlides = sortByOrder(slides);
  const activeHeaderSlides = orderedSlides.filter((slide) => slide.active !== false);
  const canAddHeaderSlide = activeHeaderSlides.length < maxHeaderSlides;

  const load = async () => {
    setLoading(true);
    try {
      const [settingsRes, slidesRes, productsRes, sectionsRes, categoryRes] = await Promise.all([
        axios.get(`${backendUrl}/api/settings/site`),
        axios.get(`${backendUrl}/api/header-slides/list`),
        axios.get(`${backendUrl}/api/product/list`),
        axios.get(`${backendUrl}/api/homepage-sections/list`),
        axios.get(`${backendUrl}/api/categories/list`),
      ]);

      if (settingsRes.data?.success) {
        const next = normalizeSettings(settingsRes.data.settings);
        setSettings(next);
        setAnnouncementText((next.announcementItems || []).join("\n"));
      }

      if (slidesRes.data?.success) {
        const nextSlides = sortByOrder(slidesRes.data.slides || []);
        setSlides(nextSlides);
        const firstVisibleSlide = nextSlides.find((slide) => slide.active !== false) || nextSlides[0];
        if (firstVisibleSlide) {
          setSelectedSlideId(firstVisibleSlide._id);
          setSlideDraft(slideToDraft(firstVisibleSlide));
        }
      }

      if (productsRes.data?.success) {
        const nextProducts = productsRes.data.products || [];
        setProducts(nextProducts);
        const nextSelections = {};
        const nextDrafts = {};
        const nextMediaDrafts = {};
        featuredSlots.forEach((slot, index) => {
          const slotProduct = nextProducts.find((item) => Number(item.featuredSlot) === slot);
          const fallbackProduct = slotProduct || nextProducts[index] || nextProducts[0] || null;
          nextSelections[slot] = fallbackProduct?._id || "";
          nextDrafts[slot] = productToDraft(fallbackProduct);
          nextMediaDrafts[slot] = productToMediaDraft(fallbackProduct);
        });
        setFeaturedSelections(nextSelections);
        setProductDrafts(nextDrafts);
        setFeaturedMediaDrafts(nextMediaDrafts);
      }

      if (sectionsRes.data?.success) {
        const byKey = {};
        (sectionsRes.data.sections || []).forEach((section) => {
          byKey[section.key] = cloneSection(section);
        });
        mediaSections.forEach((entry) => {
          if (!byKey[entry.key]) {
            byKey[entry.key] = cloneSection({
              key: entry.key,
              title: entry.label,
              preferredSizeNote: entry.hint,
              items: [],
            });
          }
        });
        setSections(byKey);
      }

      if (categoryRes.data?.success) {
        const nextGroups = getActiveCategoryGroups(categoryRes.data.groups);
        setCategoryGroups(nextGroups.length ? nextGroups : defaultCategoryGroups);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load Sotra Home Studio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slideToDraft = (slide = {}) => ({
    image: null,
    desktopImage: null,
    existingImage: slide.image || "",
    existingDesktopImage: slide.desktopImage || "",
    title: slide.title || "SOTRA\nBringing Modesty to Every Wardrobe",
    buttonLabel: slide.buttonLabel || "Discover More",
    to: slide.to || "/collection",
    order: Number(slide.order || 0),
    active: slide.active !== false,
    _imagePreview: "",
    _desktopPreview: "",
  });

  const selectedProducts = featuredSlots.reduce((entries, slot) => {
    entries[slot] = products.find((item) => item._id === featuredSelections[slot]) || null;
    return entries;
  }, {});
  const previewHeaderSlides = useMemo(() => {
    const draftSlide = {
      _id: selectedSlideId === "new" ? "__draft_header_slide__" : selectedSlideId,
      image: slideDraft._imagePreview || slideDraft.existingImage || "",
      desktopImage:
        slideDraft._desktopPreview ||
        slideDraft.existingDesktopImage ||
        slideDraft._imagePreview ||
        slideDraft.existingImage ||
        "",
      title: slideDraft.title,
      buttonLabel: slideDraft.buttonLabel,
      to: slideDraft.to,
      order: Number(slideDraft.order || 0),
      active: slideDraft.active !== false,
    };

    if (selectedSlideId === "new") {
      return draftSlide.image ? [...slides, draftSlide] : slides;
    }

    return slides.map((slide) =>
      slide._id === selectedSlideId ? { ...slide, ...draftSlide } : slide
    );
  }, [selectedSlideId, slideDraft, slides]);
  const featuredPreviewProducts = featuredSlots.reduce((entries, slot) => {
    const product = selectedProducts[slot];
    entries[slot] = product
      ? {
          ...product,
          ...(productDrafts[slot] || {}),
          ...(featuredMediaDrafts[slot] || emptyProductMediaDraft()),
        }
      : null;
    return entries;
  }, {});

  const updateSetting = (key, value) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const updateSocial = (key, value) =>
    setSettings((current) => ({
      ...current,
      socialLinks: { ...(current.socialLinks || {}), [key]: value },
    }));

  const saveSettings = async () => {
    setSaving("settings");
    try {
      const payload = {
        ...settings,
        announcementItems: announcementText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      };
      const res = await axios.post(`${backendUrl}/api/settings/site`, payload, authHeader);
      if (res.data?.success) {
        const next = normalizeSettings(res.data.settings);
        setSettings(next);
        setAnnouncementText((next.announcementItems || []).join("\n"));
        toast.success("Home settings updated");
      } else {
        toast.error(res.data?.message || "Settings update failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving("");
    }
  };

  const selectSlide = (id) => {
    setSelectedSlideId(id);
    if (id === "new") {
      setSlideDraft({
        ...emptySlideDraft,
        order: activeHeaderSlides.length,
      });
      return;
    }
    const slide = slides.find((item) => item._id === id);
    setSlideDraft(slideToDraft(slide));
  };

  const chooseSlideFile = (field, file) => {
    if (!file) return;
    const previewField = field === "image" ? "_imagePreview" : "_desktopPreview";
    setSlideDraft((current) => ({
      ...current,
      [field]: file,
      [previewField]: URL.createObjectURL(file),
    }));
  };

  const clearLaptopSlideImage = async () => {
    if (selectedSlideId === "new" || !slideDraft.existingDesktopImage) {
      setSlideDraft((current) => ({
        ...current,
        desktopImage: null,
        existingDesktopImage: "",
        _desktopPreview: "",
      }));
      return;
    }

    if (!confirm("Delete only the laptop header image for this slide?")) return;
    setSaving("slide-clear-desktop");
    try {
      const form = new FormData();
      form.append("clearDesktopImage", "true");
      const res = await axios.post(
        `${backendUrl}/api/header-slides/update/${selectedSlideId}`,
        form,
        { headers: { token, "Content-Type": "multipart/form-data" } }
      );
      if (!res.data?.success) throw new Error(res.data?.message || "Laptop image delete failed");
      toast.success("Laptop header image deleted");
      await refreshSlides(selectedSlideId);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving("");
    }
  };

  const refreshSlides = async (nextSelectedId = selectedSlideId) => {
    const slidesRes = await axios.get(`${backendUrl}/api/header-slides/list`);
    const nextSlides = sortByOrder(slidesRes.data?.slides || []);
    setSlides(nextSlides);
    const nextSlide =
      nextSlides.find((item) => item._id === nextSelectedId) ||
      nextSlides.find((item) => item.active !== false) ||
      nextSlides[0];
    const nextId = nextSlide?._id || "new";
    setSelectedSlideId(nextId);
    setSlideDraft(nextSlide ? slideToDraft(nextSlide) : emptySlideDraft);
    return nextSlides;
  };

  const saveSlide = async () => {
    const isNew = selectedSlideId === "new";
    const activeCountWithoutCurrent = activeHeaderSlides.filter(
      (slide) => slide._id !== selectedSlideId
    ).length;
    if (slideDraft.active !== false && activeCountWithoutCurrent >= maxHeaderSlides) {
      toast.error(`Header can use up to ${maxHeaderSlides} pictures.`);
      return;
    }

    setSaving("slide");
    try {
      const form = new FormData();
      if (slideDraft.image) form.append("image", slideDraft.image);
      if (slideDraft.desktopImage) form.append("desktopImage", slideDraft.desktopImage);
      form.append("title", slideDraft.title || "");
      form.append("buttonLabel", slideDraft.buttonLabel || "");
      form.append("to", slideDraft.to || "/collection");
      form.append("order", String(slideDraft.order || 0));
      form.append("active", String(slideDraft.active !== false));

      const url = isNew
        ? `${backendUrl}/api/header-slides/add`
        : `${backendUrl}/api/header-slides/update/${selectedSlideId}`;

      const res = await axios.post(url, form, {
        headers: { token, "Content-Type": "multipart/form-data" },
      });

      if (!res.data?.success) throw new Error(res.data?.message || "Slide save failed");

      toast.success(isNew ? "Header slide added" : "Header slide updated");
      await refreshSlides(res.data.slide?._id);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving("");
    }
  };

  const deleteSlideById = async (id = selectedSlideId) => {
    if (!id || id === "new") return;
    if (!confirm("Delete this header slide?")) return;
    setSaving("slide-delete");
    try {
      const res = await axios.post(`${backendUrl}/api/header-slides/remove/${id}`, {}, authHeader);
      if (!res.data?.success) throw new Error(res.data?.message || "Delete failed");
      toast.success("Header slide deleted");
      const remaining = slides.filter((item) => item._id !== id);
      const nextSlide = sortByOrder(remaining).find((item) => item.active !== false) || remaining[0];
      await refreshSlides(nextSlide?._id || "new");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving("");
    }
  };

  const deleteSlide = () => deleteSlideById(selectedSlideId);

  const moveSlide = async (id, direction) => {
    const currentIndex = activeHeaderSlides.findIndex((slide) => slide._id === id);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= activeHeaderSlides.length) return;

    const current = activeHeaderSlides[currentIndex];
    const target = activeHeaderSlides[targetIndex];
    const hasDistinctOrders = Number(current.order) !== Number(target.order);
    const currentOrder = hasDistinctOrders && Number.isFinite(Number(current.order)) ? Number(current.order) : currentIndex;
    const targetOrder = hasDistinctOrders && Number.isFinite(Number(target.order)) ? Number(target.order) : targetIndex;

    const updateOrder = (slide, order) => {
      const form = new FormData();
      form.append("order", String(order));
      return axios.post(`${backendUrl}/api/header-slides/update/${slide._id}`, form, {
        headers: { token, "Content-Type": "multipart/form-data" },
      });
    };

    setSaving(`slide-move-${id}`);
    try {
      await Promise.all([updateOrder(current, targetOrder), updateOrder(target, currentOrder)]);
      await refreshSlides(id);
      toast.success("Header order updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving("");
    }
  };

  const selectFeaturedProduct = (slot, productId) => {
    const product = products.find((item) => item._id === productId);
    setFeaturedSelections((current) => ({ ...current, [slot]: productId }));
    setProductDrafts((current) => ({ ...current, [slot]: productToDraft(product) }));
    setFeaturedMediaDrafts((current) => ({
      ...current,
      [slot]: productToMediaDraft(product),
    }));
  };

  const updateProductDraft = (slot, key, value) =>
    setProductDrafts((current) => ({
      ...current,
      [slot]: { ...(current[slot] || {}), [key]: value },
    }));

  const toggleFeaturedProductSize = (slot, size) =>
    setProductDrafts((current) => {
      const draft = current[slot] || {};
      const sizes = Array.isArray(draft.sizes) ? draft.sizes : [];
      const nextSizes = sizes.includes(size)
        ? sizes.filter((item) => item !== size)
        : [...sizes, size];
      return {
        ...current,
        [slot]: { ...draft, sizes: nextSizes },
      };
    });

  const toggleFeaturedProductPerfumeType = (slot, type) =>
    setProductDrafts((current) => {
      const draft = current[slot] || {};
      const perfumeTypes = Array.isArray(draft.perfumeTypes) ? draft.perfumeTypes : [];
      const nextPerfumeTypes = perfumeTypes.includes(type)
        ? perfumeTypes.filter((item) => item !== type)
        : [...perfumeTypes, type];
      return {
        ...current,
        [slot]: { ...draft, perfumeTypes: nextPerfumeTypes },
      };
    });

  const changeFeaturedProductCategory = (slot, category) => {
    const firstSubcategory =
      getSubcategoriesForCategory(categoryGroups, category)?.[0]?.label || "";
    setProductDrafts((current) => ({
      ...current,
      [slot]: {
        ...(current[slot] || {}),
        category,
        subCategory: firstSubcategory,
      },
    }));
  };

  const setFeaturedShadeOptions = (slot, updater) =>
    setFeaturedMediaDrafts((current) => {
      const media = current[slot] || emptyProductMediaDraft();
      const nextShadeOptions =
        typeof updater === "function" ? updater(media.shadeOptions || []) : updater;
      return {
        ...current,
        [slot]: { ...media, shadeOptions: nextShadeOptions },
      };
    });

  const setFeaturedStoryImages = (slot, updater) =>
    setFeaturedMediaDrafts((current) => {
      const media = current[slot] || emptyProductMediaDraft();
      const nextStoryImages =
        typeof updater === "function" ? updater(media.storyImages || []) : updater;
      return {
        ...current,
        [slot]: { ...media, storyImages: nextStoryImages },
      };
    });

  const appendProductMediaDraft = (form, mediaDraft = emptyProductMediaDraft()) => {
    const shadeOptions = mediaDraft.shadeOptions || [];
    const storyImages = mediaDraft.storyImages || [];
    form.append(
      "shadeOptions",
      JSON.stringify(shadeOptions.map(stripProductMediaPrivateFields))
    );
    form.append(
      "storyImages",
      JSON.stringify(storyImages.map(stripProductMediaPrivateFields))
    );
    shadeOptions.forEach((option, index) => {
      if (option._file) form.append(`shadeImage${index}`, option._file);
    });
    storyImages.forEach((story, index) => {
      if (story._file) form.append(`storyImage${index}`, story._file);
    });
  };

  const appendProductDraft = (form, product, draft, slot) => {
    form.append("name", draft.name || product.name || "SotraBrand Product");
    form.append("description", draft.description || product.description || "SotraBrand product.");
    form.append("price", String(Number(draft.price) || 0));
    form.append("stock", draft.stock === "" ? "" : String(Math.max(0, Number(draft.stock) || 0)));
    form.append("discountPrice", draft.discountPrice === "" ? "" : String(Number(draft.discountPrice) || 0));
    form.append("category", draft.category || product.category || "Pheromone Touch");
    form.append("subCategory", draft.subCategory || product.subCategory || "Pheromone Touch");
    const perfumeTypes = Array.isArray(draft.perfumeTypes) ? draft.perfumeTypes : [];
    form.append("concentration", perfumeTypes[0] || draft.concentration || product.concentration || "");
    form.append("perfumeTypes", JSON.stringify(perfumeTypes));
    form.append("sizes", JSON.stringify(Array.isArray(draft.sizes) ? draft.sizes : []));
    form.append("active", String(draft.active !== false));
    form.append("outOfStock", String(Boolean(draft.outOfStock)));
    form.append("featuredSlot", String(slot));
    form.append("showSmallImages", "true");
  };

  const saveFeaturedProduct = async (slot) => {
    const product = selectedProducts[slot];
    if (!product) {
      toast.error("Choose a product first");
      return;
    }

    setSaving(`product-${slot}`);
    try {
      const previousSlotProducts = products.filter(
        (item) => Number(item.featuredSlot) === Number(slot) && item._id !== product._id
      );

      await Promise.all(
        previousSlotProducts.map((item) => {
          const clearForm = new FormData();
          clearForm.append("featuredSlot", "");
          return axios.put(`${backendUrl}/api/product/${item._id}`, clearForm, {
            headers: { token, "Content-Type": "multipart/form-data" },
          });
        })
      );

      const form = new FormData();
      appendProductDraft(form, product, productDrafts[slot], slot);
      appendProductMediaDraft(form, featuredMediaDrafts[slot]);
      const res = await axios.put(`${backendUrl}/api/product/${product._id}`, form, {
        headers: { token, "Content-Type": "multipart/form-data" },
      });

      if (!res.data?.success) throw new Error(res.data?.message || "Product update failed");
      toast.success(`Featured Product ${slot} updated`);
      const productRes = await axios.get(`${backendUrl}/api/product/list`);
      if (productRes.data?.success) setProducts(productRes.data.products || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving("");
    }
  };

  const clearFeaturedProduct = async (slot) => {
    const slotProducts = products.filter((item) => Number(item.featuredSlot) === Number(slot));
    if (!slotProducts.length && !featuredSelections[slot]) {
      setFeaturedSelections((current) => ({ ...current, [slot]: "" }));
      setProductDrafts((current) => ({ ...current, [slot]: productToDraft(null) }));
      setFeaturedMediaDrafts((current) => ({ ...current, [slot]: emptyProductMediaDraft() }));
      return;
    }

    setSaving(`product-clear-${slot}`);
    try {
      await Promise.all(
        slotProducts.map((item) => {
          const clearForm = new FormData();
          clearForm.append("featuredSlot", "");
          return axios.put(`${backendUrl}/api/product/${item._id}`, clearForm, {
            headers: { token, "Content-Type": "multipart/form-data" },
          });
        })
      );
      setFeaturedSelections((current) => ({ ...current, [slot]: "" }));
      setProductDrafts((current) => ({ ...current, [slot]: productToDraft(null) }));
      setFeaturedMediaDrafts((current) => ({ ...current, [slot]: emptyProductMediaDraft() }));
      const productRes = await axios.get(`${backendUrl}/api/product/list`);
      if (productRes.data?.success) setProducts(productRes.data.products || []);
      toast.success(`Featured Product ${slot} cleared`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving("");
    }
  };

  const updateSection = (key, patch) =>
    setSections((current) => ({
      ...current,
      [key]: { ...current[key], ...patch },
    }));

  const updateItem = (key, index, patch) =>
    setSections((current) => {
      const section = current[key];
      const items = [...(section.items || [])];
      items[index] = { ...(items[index] || newMediaItem(key, index)), ...patch };
      return { ...current, [key]: { ...section, items } };
    });

  const chooseSectionFile = (key, index, field, file) => {
    if (!file) return;
    const sectionEntry = mediaSections.find((entry) => entry.key === key);
    const previewField = {
      _file: "_filePreview",
      _desktopFile: "_desktopPreview",
      _posterFile: "_posterPreview",
    }[field];
    updateItem(key, index, {
      [field]: file,
      [previewField]: URL.createObjectURL(file),
      ...(field === "_file"
        ? { type: sectionEntry?.singleItem ? "image" : file.type.startsWith("video/") ? "video" : "image" }
        : {}),
    });
  };

  const addMediaItem = (key) =>
    setSections((current) => {
      const section = current[key];
      const items = [...(section.items || []), newMediaItem(key, section.items?.length || 0)];
      return { ...current, [key]: { ...section, items } };
    });

  const removeMediaItem = (key, index) =>
    setSections((current) => {
      const section = current[key];
      const items = (section.items || []).filter((_, itemIndex) => itemIndex !== index);
      return { ...current, [key]: { ...section, items } };
    });

  const saveSection = async (key) => {
    const section = sections[key];
    if (!section) return;
    setSaving(`section-${key}`);
    try {
      const sectionEntry = mediaSections.find((entry) => entry.key === key);
      const sectionItems = sectionEntry?.singleItem
        ? (section.items || []).slice(0, 1).map((item) => ({ ...item, type: "image" }))
        : section.items || [];
      const form = new FormData();
      form.append("title", section.title || "");
      form.append("active", String(section.active !== false));
      form.append("preferredSizeNote", section.preferredSizeNote || "");
      form.append("items", JSON.stringify(sectionItems.map(stripPrivateMedia)));

      sectionItems.forEach((item, index) => {
        if (item._file) form.append(`itemFile${index}`, item._file);
        if (item._desktopFile) form.append(`desktopFile${index}`, item._desktopFile);
        if (item._posterFile) form.append(`posterFile${index}`, item._posterFile);
      });

      const res = await axios.post(`${backendUrl}/api/homepage-sections/upsert/${key}`, form, {
        headers: { token, "Content-Type": "multipart/form-data" },
      });

      if (!res.data?.success) throw new Error(res.data?.message || "Section update failed");
      toast.success(`${section.title || key} updated`);
      setSections((current) => ({ ...current, [key]: cloneSection(res.data.section) }));
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving("");
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-[1480px]">
        <div className="admin-skeleton h-44 w-full" />
        <div className="mt-5 grid gap-5 xl:grid-cols-[470px_1fr]">
          <div className="admin-skeleton h-[720px]" />
          <div className="admin-skeleton h-[720px]" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1480px] text-black">
      <div className="mb-5 flex flex-col gap-3 border-b border-black/15 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#c47b92]">
            SotraBrand
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none">Sotra Home Studio</h1>
          <p className="mt-2 max-w-3xl text-sm text-black/55">
            A mini homepage simulator for the live storefront. Menubar, footer, and purchase actions stay locked; content, media, product details, and prices are editable.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/products" className={buttonLine}>
            Products
          </Link>
          <button type="button" onClick={load} className={buttonLine}>
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-8 border border-black/15 bg-white p-4">
        <SectionTitle eyebrow="Locked Overview" title="Full Mini Homepage" />
        <div className="mx-auto max-w-[520px]">
          <HomeSimulator
            settings={settings}
            slides={previewHeaderSlides}
            products={products}
            sections={sections}
            categoryGroups={categoryGroups}
          />
        </div>
      </div>

      <div className="space-y-8">
        <StudioSection
          eyebrow="Homepage Header"
          title="Fade Header"
          note="Edit the header pictures and order while seeing only the header slice live."
          preview={<HeaderLivePreview settings={settings} slides={previewHeaderSlides} />}
        >
          <section className={panelClass}>
            <SectionTitle eyebrow="Edit Header" title="Header Pictures" />
            <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className={labelClass}>Header Pictures</label>
                    <p className="text-xs text-black/45">
                      {activeHeaderSlides.length}/{maxHeaderSlides} active
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectSlide("new")}
                    disabled={!canAddHeaderSlide}
                    className="border border-black px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {activeHeaderSlides.map((slide, index) => (
                    <article
                      key={slide._id}
                      className={`grid grid-cols-[64px_1fr] gap-2 border p-2 transition ${
                        selectedSlideId === slide._id ? "border-black bg-black/[0.03]" : "border-black/15"
                      }`}
                    >
                      <button type="button" onClick={() => selectSlide(slide._id)} className="block">
                        <MiniMedia item={{ src: slide.image }} className="aspect-[9/16]" />
                      </button>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => selectSlide(slide._id)}
                          className="block w-full truncate text-left text-xs font-bold uppercase tracking-[0.14em]"
                        >
                          Slide {index + 1}
                        </button>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/45">
                          {slide.title ? slide.title.split("\n")[0] : `Order ${index + 1}`}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveSlide(slide._id, -1)}
                            disabled={index === 0 || saving === `slide-move-${slide._id}`}
                            className="border border-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em] disabled:opacity-30"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSlide(slide._id, 1)}
                            disabled={index === activeHeaderSlides.length - 1 || saving === `slide-move-${slide._id}`}
                            className="border border-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em] disabled:opacity-30"
                          >
                            Down
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSlideById(slide._id)}
                            disabled={saving === "slide-delete"}
                            className="border border-[#7b2d2d] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#7b2d2d] disabled:opacity-30"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                  {!activeHeaderSlides.length && (
                    <div className="border border-dashed border-black/20 p-4 text-center text-xs text-black/45">
                      Add the first header picture.
                    </div>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <MiniMedia item={{ src: slideDraft._imagePreview || slideDraft.existingImage }} className="aspect-[9/16]" />
                  <MiniMedia item={{ src: slideDraft._desktopPreview || slideDraft.existingDesktopImage || slideDraft._imagePreview || slideDraft.existingImage }} className="aspect-[9/16]" />
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <label className={labelClass}>Hero Title</label>
                  <textarea
                    className={`${fieldClass} min-h-24 resize-none`}
                    value={slideDraft.title}
                    placeholder={"SOTRA\nBringing Modesty to Every Wardrobe"}
                    onChange={(event) =>
                      setSlideDraft((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                  <p className="mt-1 text-[11px] text-black/45">
                    Use a new line between SOTRA and the subtitle.
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Button Text</label>
                  <input
                    className={fieldClass}
                    value={slideDraft.buttonLabel}
                    placeholder="Discover More"
                    onChange={(event) =>
                      setSlideDraft((current) => ({
                        ...current,
                        buttonLabel: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Button Link</label>
                  <input
                    className={fieldClass}
                    value={slideDraft.to}
                    placeholder="/collection"
                    onChange={(event) =>
                      setSlideDraft((current) => ({
                        ...current,
                        to: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Order</label>
                  <input type="number" className={fieldClass} value={slideDraft.order} onChange={(event) => setSlideDraft((current) => ({ ...current, order: Number(event.target.value) }))} />
                </div>
                <label className="mt-5 flex items-center gap-3 border border-black/15 px-3 py-3">
                  <input type="checkbox" className="h-4 w-4 accent-black" checked={slideDraft.active !== false} onChange={(event) => setSlideDraft((current) => ({ ...current, active: event.target.checked }))} />
                  <span className="text-xs font-bold uppercase tracking-[0.16em]">Active</span>
                </label>
                <div>
                  <label className={labelClass}>Mobile 9:16 Image</label>
                  <input type="file" accept="image/*" className={fieldClass} onChange={(event) => chooseSlideFile("image", event.target.files?.[0])} />
                </div>
                <div>
                  <label className={labelClass}>Laptop 2:1 Image</label>
                  <input type="file" accept="image/*" className={fieldClass} onChange={(event) => chooseSlideFile("desktopImage", event.target.files?.[0])} />
                  {(slideDraft._desktopPreview || slideDraft.existingDesktopImage || slideDraft.desktopImage) && (
                    <button
                      type="button"
                      onClick={clearLaptopSlideImage}
                      disabled={saving === "slide-clear-desktop"}
                      className="mt-2 border border-[#7b2d2d] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b2d2d] transition hover:bg-[#7b2d2d] hover:text-white disabled:opacity-40"
                    >
                      {saving === "slide-clear-desktop" ? "Deleting..." : "Delete Laptop Image"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={deleteSlide} disabled={selectedSlideId === "new" || saving === "slide-delete"} className={buttonLine}>
                Delete
              </button>
              <button type="button" onClick={saveSlide} disabled={saving === "slide"} className={buttonBlack}>
                {saving === "slide" ? "Saving..." : "Save Header"}
              </button>
            </div>
          </section>
        </StudioSection>

        <StudioSection
          eyebrow="Homepage Collections"
          title="Collection Tiles"
          note="This follows the live Sotra homepage: header first, then category collection pictures."
          preview={<CategoryCollectionsPreview products={products} categoryGroups={categoryGroups} />}
        >
          <section className={panelClass}>
            <SectionTitle eyebrow="Automatic Section" title="Sotra Categories" />
            <p className="text-sm leading-6 text-black/55">
              Category tiles pull their pictures from live products in each category. Edit the product pictures or category names to update this homepage section.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/products" className={buttonLine}>
                Products
              </Link>
              <Link to="/categories" className={buttonBlack}>
                Categories
              </Link>
            </div>
          </section>
        </StudioSection>

        {["luxury-gallery"].map((key) => {
          const entry = mediaSections.find((item) => item.key === key);
          return (
          <StudioSection
            key={entry.key}
            eyebrow="Editable Media"
            title={entry.label}
            note={entry.hint}
            preview={<MediaSectionLivePreview entry={entry} section={sections[entry.key]} products={products} />}
          >
            <MediaSectionEditor
              entry={entry}
              section={sections[entry.key]}
              products={products}
              saving={saving === `section-${entry.key}`}
              onSectionChange={(patch) => updateSection(entry.key, patch)}
              onItemChange={(index, patch) => updateItem(entry.key, index, patch)}
              onFile={(index, field, file) => chooseSectionFile(entry.key, index, field, file)}
              onAdd={() => addMediaItem(entry.key)}
              onRemove={(index) => removeMediaItem(entry.key, index)}
              onSave={() => saveSection(entry.key)}
            />
          </StudioSection>
          );
        })}

        <StudioSection
          eyebrow="Site Layer"
          title="Footer + Announcement"
          note="Footer, social links, delivery, announcement, and free-shipping controls sit at the bottom like the storefront."
          preview={<SiteLayerLivePreview settings={settings} announcementText={announcementText} />}
        >
          <section className={panelClass}>
            <SectionTitle eyebrow="Edit Footer" title="Announcement + Socials" />
            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <label className={labelClass}>Delivery Fee</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={fieldClass}
                  value={settings.delivery_fee}
                  onChange={(event) => updateSetting("delivery_fee", Number(event.target.value))}
                />
              </div>
              <div>
                <label className={labelClass}>Available Now Text</label>
                <input
                  className={fieldClass}
                  value={settings.availableNowText}
                  onChange={(event) => updateSetting("availableNowText", event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Sotra Email</label>
                <input
                  className={fieldClass}
                  value={settings.brandEmail}
                  onChange={(event) => updateSetting("brandEmail", event.target.value)}
                />
              </div>
              <label className="flex items-center gap-3 border border-black/15 px-3 py-3">
                <input
                  type="checkbox"
                  checked={settings.announcementEnabled !== false}
                  onChange={(event) => updateSetting("announcementEnabled", event.target.checked)}
                  className="h-4 w-4 accent-black"
                />
                <span className="text-xs font-bold uppercase tracking-[0.16em]">Announcement active</span>
              </label>
              <label className="flex items-center gap-3 border border-black/15 px-3 py-3">
                <input
                  type="checkbox"
                  checked={settings.freeShippingEnabled !== false}
                  onChange={(event) => updateSetting("freeShippingEnabled", event.target.checked)}
                  className="h-4 w-4 accent-black"
                />
                <span className="text-xs font-bold uppercase tracking-[0.16em]">Free shipping active</span>
              </label>
              <div>
                <label className={labelClass}>Free Shipping Text</label>
                <input
                  className={fieldClass}
                  value={settings.freeShippingText}
                  onChange={(event) => updateSetting("freeShippingText", event.target.value)}
                />
              </div>
              <div className="lg:col-span-3">
                <label className={labelClass}>Announcement Lines</label>
                <textarea
                  className={`${fieldClass} min-h-24`}
                  value={announcementText}
                  onChange={(event) => setAnnouncementText(event.target.value)}
                />
              </div>
              {["instagram", "facebook", "tiktok", "whatsapp", "email", "phone"].map((key) => (
                <div key={key}>
                  <label className={labelClass}>{key}</label>
                  <input
                    className={fieldClass}
                    value={settings.socialLinks?.[key] || ""}
                    onChange={(event) => updateSocial(key, event.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={saveSettings} disabled={saving === "settings"} className={buttonBlack}>
                {saving === "settings" ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </section>
        </StudioSection>
      </div>
    </main>
  );
};

const SectionTitle = ({ eyebrow, title, children }) => (
  <div className="mb-4 flex flex-col gap-2 border-b border-black/15 pb-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c47b92]">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-black uppercase">{title}</h2>
    </div>
    {children}
  </div>
);

const FeaturedEditor = ({
  slot,
  products,
  selectedProduct,
  selectedId,
  draft,
  saving,
  clearing,
  onSelect,
  onChange,
  onCategoryChange,
  onToggleSize,
  onTogglePerfumeType,
  onSave,
  onClear,
  mediaDraft,
  setShadeOptions,
  setStoryImages,
  categoryGroups,
}) => {
  const [chooserOpen, setChooserOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");
  const categoryOptions = getCategoryNames(categoryGroups);
  const subcategoryOptions = getSubcategoriesForCategory(categoryGroups, draft?.category || "");

  const handlePriceChange = (value) => {
    onChange("price", value);
    if (discountPercent !== "") {
      onChange("discountPrice", calcDiscountPrice(value, discountPercent));
    }
  };

  const handlePercentChange = (value) => {
    if (value === "") {
      setDiscountPercent("");
      onChange("discountPrice", "");
      return;
    }
    const nextPercent = clamp(Number(value), 0, 100);
    setDiscountPercent(String(nextPercent));
    onChange("discountPrice", calcDiscountPrice(draft?.price, nextPercent));
  };

  return (
    <section className={panelClass}>
      <SectionTitle eyebrow="Editable Product" title={`Featured Product ${slot}`}>
        <button
          type="button"
          onClick={onClear}
          disabled={clearing}
          className="border border-[#7b2d2d] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#7b2d2d] transition hover:bg-[#7b2d2d] hover:text-white disabled:opacity-40"
        >
          {clearing ? "Clearing..." : "Clear Product"}
        </button>
      </SectionTitle>

      <div className="grid gap-4 lg:grid-cols-[minmax(220px,320px)_1fr]">
        <div>
          <label className={labelClass}>Featured Product</label>
          <SelectedProductSummary product={selectedProduct} emptyText="Choose the product shown in this homepage slot." />
          <button
            type="button"
            onClick={() => setChooserOpen((open) => !open)}
            className={`${buttonBlack} mt-3 w-full`}
          >
            {chooserOpen ? "Close Products" : "Choose Product"}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className={labelClass}>Product Name</label>
            <input className={fieldClass} value={draft?.name || ""} onChange={(event) => onChange("name", event.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Price</label>
            <input type="number" min="0" step="0.01" className={fieldClass} value={draft?.price ?? ""} onChange={(event) => handlePriceChange(event.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Discount %</label>
            <input type="number" min="0" max="100" step="1" className={fieldClass} value={discountPercent} onChange={(event) => handlePercentChange(event.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Discount Price</label>
            <input type="number" min="0" step="0.01" className={fieldClass} value={draft?.discountPrice ?? ""} onChange={(event) => onChange("discountPrice", event.target.value)} />
          </div>
          {draft?.price && discountPercent !== "" && (
            <p className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 lg:col-span-2">
              After {discountPercent}% of ${Number(draft.price).toFixed(2)} - final price $
              {draft?.discountPrice || calcDiscountPrice(draft.price, discountPercent)}
            </p>
          )}
          <div>
            <label className={labelClass}>Stock</label>
            <input type="number" min="0" step="1" className={fieldClass} value={draft?.stock ?? ""} onChange={(event) => onChange("stock", event.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              className={fieldClass}
              value={draft?.category || ""}
              onChange={(event) => onCategoryChange(event.target.value)}
            >
              <option value="">Choose category</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Subcategory</label>
            <select
              className={fieldClass}
              value={draft?.subCategory || ""}
              onChange={(event) => onChange("subCategory", event.target.value)}
            >
              <option value="">Choose subcategory</option>
              {subcategoryOptions.map((option) => (
                <option key={option.slug || option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea className={`${fieldClass} min-h-28`} value={draft?.description || ""} onChange={(event) => onChange("description", event.target.value)} />
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Perfume Type</label>
            <p className="mb-3 text-xs leading-5 text-black/45">
              Optional. Select when this product should display a perfume type.
            </p>
            <div className="flex flex-wrap gap-2">
              {perfumeTypeOptions.map((type) => {
                const selected = Array.isArray(draft?.perfumeTypes) && draft.perfumeTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onTogglePerfumeType(type)}
                    className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                      selected
                        ? "border-black bg-black text-white"
                        : "border-black/20 bg-white text-black hover:border-black"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className={labelClass}>Size / Volume</label>
            <p className="mb-3 text-xs leading-5 text-black/45">
              Optional. Select sizes only when this product needs a required size choice.
            </p>
            <div className="flex flex-wrap gap-2">
              {volumeOptions.map((size) => {
                const selected = Array.isArray(draft?.sizes) && draft.sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onToggleSize(size)}
                    className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                      selected
                        ? "border-black bg-black text-white"
                        : "border-black/20 bg-white text-black hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-center gap-3 border border-black/15 px-3 py-3">
            <input type="checkbox" className="h-4 w-4 accent-black" checked={draft?.active !== false} onChange={(event) => onChange("active", event.target.checked)} />
            <span className="text-xs font-bold uppercase tracking-[0.16em]">Active</span>
          </label>
          <button type="button" onClick={onSave} disabled={!selectedProduct || saving} className={`${buttonBlack} lg:col-span-2`}>
            {saving ? "Saving..." : `Save Featured Product ${slot}`}
          </button>
        </div>
      </div>

      {chooserOpen && (
        <ProductChoiceGrid
          products={products}
          selectedId={selectedId || ""}
          onSelect={(productId) => {
            onSelect(productId);
            setChooserOpen(false);
          }}
        />
      )}

      {selectedProduct && (
        <div className="mt-5 border-t border-black/10 pt-4">
          <button
            type="button"
            onClick={() => setMediaOpen((open) => !open)}
            className="flex w-full items-center justify-between border border-black/15 bg-white px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] transition hover:border-black"
          >
            Story Images + Small Images
            <span className="text-lg leading-none">{mediaOpen ? "-" : "+"}</span>
          </button>
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ${
              mediaOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <ProductSotraMediaEditor
                shadeOptions={mediaDraft?.shadeOptions || []}
                setShadeOptions={setShadeOptions}
                storyImages={mediaDraft?.storyImages || []}
                setStoryImages={setStoryImages}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const SelectedProductSummary = ({ product, emptyText = "Choose a product." }) => {
  if (!product) {
    return (
      <div className="grid min-h-24 place-items-center border border-dashed border-black/20 bg-white p-4 text-center text-sm text-black/45">
        {emptyText}
      </div>
    );
  }

  const price = Number(product.price) || 0;
  const discount = Number(product.discountPrice);
  const hasDiscount = Number.isFinite(discount) && discount > 0 && discount < price;

  return (
    <div className="grid grid-cols-[78px_1fr] gap-3 border border-black/15 bg-white p-2">
      <div className="aspect-square bg-[#EAEAEA]">
        {firstProductImage(product) ? (
          <img src={firstProductImage(product)} alt={product.name} className="h-full w-full object-contain" />
        ) : (
          <div className="grid h-full w-full place-items-center text-[8px] font-bold uppercase tracking-[0.12em] text-black/35">
            Product
          </div>
        )}
      </div>
      <div className="min-w-0 py-1">
        <p className="truncate text-xs font-black uppercase tracking-[0.14em]">
          {product.name}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-sm text-black">{money(hasDiscount ? discount : price)}</span>
          {hasDiscount && <span className="text-[10px] text-black/35 line-through">{money(price)}</span>}
        </div>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black/40">
          {product.outOfStock ? "Out of stock" : `${product.stock || 0} in stock`}
        </p>
      </div>
    </div>
  );
};

const ProductChoiceGrid = ({ products, selectedId, onSelect }) => (
  <div className="mt-5">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className={labelClass}>Visual Product Chooser</p>
        <p className="text-xs text-black/45">Pick by product image, price, and stock.</p>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/35">
        {products.length} products
      </span>
    </div>
    <div className="grid max-h-[420px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const selected = product._id === selectedId;
        const basePrice = Number(product.price) || 0;
        const discount = Number(product.discountPrice);
        const hasDiscount = Number.isFinite(discount) && discount > 0 && discount < basePrice;

        return (
          <button
            key={product._id}
            type="button"
            onClick={() => onSelect(product._id)}
            className={`group grid grid-cols-[72px_1fr] gap-3 border bg-white p-2 text-left transition ${
              selected
                ? "border-black shadow-[0_0_0_2px_rgba(0,0,0,0.08)]"
                : "border-black/10 hover:border-black/45"
            }`}
          >
            <div className="aspect-square bg-[#EAEAEA]">
              {firstProductImage(product) ? (
                <img
                  src={firstProductImage(product)}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-[8px] font-bold uppercase tracking-[0.12em] text-black/35">
                  Product
                </div>
              )}
            </div>
            <div className="min-w-0 py-1">
              <p className="truncate text-xs font-black uppercase tracking-[0.12em]">
                {product.name}
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
                <span className="text-sm text-black">{money(hasDiscount ? discount : basePrice)}</span>
                {hasDiscount && (
                  <span className="text-[10px] text-black/35 line-through">{money(basePrice)}</span>
                )}
              </div>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-black/40">
                {product.outOfStock ? "Out of stock" : `${product.stock || 0} in stock`}
              </p>
              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#c47b92]">
                {selected ? "Selected" : "Choose"}
              </p>
            </div>
          </button>
        );
      })}
      {!products.length && (
        <div className="border border-dashed border-black/20 p-6 text-center text-sm text-black/45 sm:col-span-2 xl:col-span-3">
          No products available yet.
        </div>
      )}
    </div>
  </div>
);

const ProductFeaturePreview = ({ product, title = "Featured Product" }) => {
  const railRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedShadeKey, setSelectedShadeKey] = useState("");

  const previewImages = useMemo(() => getProductPreviewImages(product), [product]);

  useEffect(() => {
    setSelectedIndex(0);
    setSelectedShadeKey("");
  }, [product?._id, previewImages.length]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left: selectedIndex * rail.clientWidth, behavior: "smooth" });
  }, [selectedIndex]);

  if (!product) {
    return (
      <div className="grid min-h-[420px] place-items-center bg-white p-6 text-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35">
            {title}
          </p>
          <p className="mt-3 text-sm font-semibold text-black">Choose a product</p>
        </div>
      </div>
    );
  }

  const price = Number(product.price) || 0;
  const discount = Number(product.discountPrice);
  const hasDiscount = Number.isFinite(discount) && discount > 0 && discount < price;
  const shadeOptions = Array.isArray(product.shadeOptions)
    ? product.shadeOptions.filter((item) => mediaImage(item) || item?.label)
    : [];
  const syncVisible = () => {
    const rail = railRef.current;
    if (!rail) return;
    const next = Math.round(rail.scrollLeft / rail.clientWidth);
    setSelectedIndex(Math.max(0, Math.min(next, previewImages.length - 1)));
  };

  const chooseShade = (option) => {
    const optionImage = mediaImage(option);
    if (!optionImage) return;
    const next = previewImages.findIndex((image) => image.image === optionImage);
    setSelectedShadeKey(option.id || option.image || option.label || optionImage);
    if (next >= 0) setSelectedIndex(next);
  };

  return (
    <section className="bg-white p-5">
      <div
        ref={railRef}
        onScroll={syncVisible}
        className="no-scrollbar flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto scroll-smooth bg-[#EAEAEA]"
      >
        {previewImages.length ? (
          previewImages.map((image) => (
            <button
              key={image.id || image.image}
              type="button"
              onClick={() =>
                setSelectedIndex((current) =>
                  previewImages.length ? (current + 1) % previewImages.length : 0
                )
              }
              className="h-full w-full shrink-0 snap-start bg-white"
              title="Tap to preview next image"
            >
              <img src={image.image} alt={image.alt || product.name} className="h-full w-full object-contain" />
            </button>
          ))
        ) : (
          <div className="grid h-full w-full shrink-0 place-items-center text-xs font-bold uppercase tracking-[0.18em] text-black/35">
            Product
          </div>
        )}
      </div>
      {previewImages.length > 1 && (
        <div className="mt-3 h-1 bg-black/15">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{
              width: `${100 / previewImages.length}%`,
              transform: `translateX(${selectedIndex * 100}%)`,
            }}
          />
        </div>
      )}
      {shadeOptions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Shade option preview controls">
          {shadeOptions.slice(0, 5).map((option, index) => (
            <button
              type="button"
              key={option.id || option.image || option.label || index}
              onClick={() => chooseShade(option)}
              className={`grid h-9 w-9 place-items-center overflow-hidden rounded-full border bg-white text-[9px] font-bold uppercase transition ${
                selectedShadeKey === (option.id || option.image || option.label || mediaImage(option))
                  ? "border-black shadow-[0_0_0_2px_rgba(0,0,0,0.08)]"
                  : "border-black/20"
              }`}
              title={option.label || "Shade option"}
            >
              {mediaImage(option) ? (
                <img src={mediaImage(option)} alt="" className="h-full w-full scale-150 object-cover" />
              ) : (
                (option.label || "?").slice(0, 2)
              )}
            </button>
          ))}
        </div>
      )}
      <p className="mt-5 text-[10px] font-light uppercase tracking-[0.22em] text-black/45">
        {[product.category, product.subCategory].filter(Boolean).join(" / ") || "SotraBrand"}
      </p>
      <h3 className="mt-2 text-2xl font-black uppercase leading-tight tracking-[0.08em]">
        {product.name}
      </h3>
      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-light">{money(hasDiscount ? discount : price)}</span>
        {hasDiscount && <span className="text-sm text-black/35 line-through">{money(price)}</span>}
      </div>
      {Array.isArray(product.sizes) && product.sizes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="border border-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-black/55"
            >
              {size}
            </span>
          ))}
        </div>
      )}
      {Array.isArray(product.perfumeTypes) && product.perfumeTypes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.perfumeTypes.map((type) => (
            <span
              key={type}
              className="border border-black/20 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-black/55"
            >
              {type}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-black/60">
        {product.description}
      </p>
      <div className="mt-5 border border-black px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
        Add To Cart Locked
      </div>
    </section>
  );
};

const MediaSectionEditor = ({
  entry,
  section,
  products = [],
  saving,
  onSectionChange,
  onItemChange,
  onFile,
  onAdd,
  onRemove,
  onSave,
}) => {
  const items = (section?.items || []).length
    ? section.items
    : entry.singleItem
      ? [newMediaItem(entry.key, 0)]
      : [];
  const [productChooserOpen, setProductChooserOpen] = useState({});

  return (
    <section className={panelClass}>
      <SectionTitle eyebrow="Editable Media" title={entry.label}>
        <div className="flex flex-wrap gap-2">
          {!entry.singleItem && (
            <button type="button" onClick={onAdd} className={buttonLine}>
              Add Media
            </button>
          )}
        </div>
      </SectionTitle>
      <p className="mb-4 text-xs leading-5 text-black/55">{entry.hint}</p>
      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_140px]">
        <div>
          <label className={labelClass}>Admin Title</label>
          <input className={fieldClass} value={section?.title || ""} onChange={(event) => onSectionChange({ title: event.target.value })} />
        </div>
        <label className="mt-5 flex items-center gap-3 border border-black/15 px-3 py-3">
          <input type="checkbox" className="h-4 w-4 accent-black" checked={section?.active !== false} onChange={(event) => onSectionChange({ active: event.target.checked })} />
          <span className="text-xs font-bold uppercase tracking-[0.16em]">Active</span>
        </label>
        <div className="lg:col-span-2">
          <label className={labelClass}>Preferred Size Note</label>
          <input className={fieldClass} value={section?.preferredSizeNote || ""} onChange={(event) => onSectionChange({ preferredSizeNote: event.target.value })} />
        </div>
      </div>
      {entry.allowProductLink && (
        <div className="mb-5 border border-black/10 bg-white p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
            Live Picture Preview
          </p>
          <SetPicturePreview
            entry={entry}
            section={{ ...(section || {}), items }}
            products={products}
          />
        </div>
      )}
      <div className="space-y-3">
        {items.map((item, index) => (
          <React.Fragment key={item.id || index}>
          <article className="grid gap-3 border border-black/10 p-3 lg:grid-cols-[74px_120px_1fr_1fr_86px]">
            <MiniMedia item={item} className="aspect-[9/16] w-full" />
            <div>
              <label className={labelClass}>Type</label>
              <select
                className={fieldClass}
                value={entry.singleItem ? "image" : item.type}
                disabled={entry.singleItem}
                onChange={(event) => onItemChange(index, { type: event.target.value })}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <label className="mt-3 flex items-center gap-2 text-xs text-black/65">
                <input type="checkbox" className="h-4 w-4 accent-black" checked={item.active !== false} onChange={(event) => onItemChange(index, { active: event.target.checked })} />
                Active
              </label>
            </div>
            <div className="grid gap-3">
              <div>
                <label className={labelClass}>Label</label>
                <input className={fieldClass} value={item.label} onChange={(event) => onItemChange(index, { label: event.target.value })} />
              </div>
              {entry.allowProductLink && (
                <div>
                  <label className={labelClass}>Button Label</label>
                  <input
                    className={fieldClass}
                    value={item.buttonLabel ?? ""}
                    onChange={(event) => onItemChange(index, { buttonLabel: event.target.value })}
                  />
                </div>
              )}
              <div>
                <label className={labelClass}>Main File</label>
                <input type="file" accept={entry.singleItem ? "image/*" : "image/*,video/*"} className={fieldClass} onChange={(event) => onFile(index, "_file", event.target.files?.[0])} />
              </div>
            </div>
            <div className="grid gap-3">
              <div>
                <label className={labelClass}>Alt Text</label>
                <input className={fieldClass} value={item.alt} onChange={(event) => onItemChange(index, { alt: event.target.value })} />
              </div>
              {entry.allowProductLink && (
                <div className="sm:col-span-2">
                  <label className={labelClass}>Linked Product</label>
                  <SelectedProductSummary
                    product={products.find((product) => product._id === item.productId)}
                    emptyText="Choose the product opened by See Full Set."
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setProductChooserOpen((current) => ({
                          ...current,
                          [index]: !current[index],
                        }))
                      }
                      className={buttonBlack}
                    >
                      {productChooserOpen[index] ? "Close Products" : "Choose Product"}
                    </button>
                    {item.productId && (
                      <button
                        type="button"
                        onClick={() => onItemChange(index, { productId: "" })}
                        className={buttonLine}
                      >
                        Clear Link
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Desktop</label>
                  <input type="file" accept={entry.singleItem ? "image/*" : "image/*,video/*"} className={fieldClass} onChange={(event) => onFile(index, "_desktopFile", event.target.files?.[0])} />
                </div>
                {!entry.singleItem && (
                  <div>
                  <label className={labelClass}>Poster</label>
                  <input type="file" accept="image/*" className={fieldClass} onChange={(event) => onFile(index, "_posterFile", event.target.files?.[0])} />
                  </div>
                )}
              </div>
            </div>
            <div className="grid content-between gap-3">
              <div>
                <label className={labelClass}>Order</label>
                <input type="number" className={fieldClass} value={item.order} onChange={(event) => onItemChange(index, { order: Number(event.target.value) })} />
              </div>
              <button type="button" onClick={() => onRemove(index)} className="border border-[#7b2d2d] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7b2d2d] transition hover:bg-[#7b2d2d] hover:text-white">
                Remove
              </button>
            </div>
          </article>
          {entry.allowProductLink && productChooserOpen[index] && (
            <div className="border border-black/10 p-3">
              <ProductChoiceGrid
                products={products}
                selectedId={item.productId || ""}
                onSelect={(productId) => {
                  onItemChange(index, { productId });
                  setProductChooserOpen((current) => ({ ...current, [index]: false }));
                }}
              />
            </div>
          )}
          </React.Fragment>
        ))}
        {!items.length && (
          <div className="border border-dashed border-black/20 py-10 text-center text-sm text-black/45">
            Add media to control this section. Storefront fallback media remains until you save.
          </div>
        )}
      </div>
      <div className="mt-5 flex justify-end">
        <button type="button" onClick={onSave} disabled={saving} className={buttonGreen}>
          {saving ? "Saving..." : `Save ${entry.label}`}
        </button>
      </div>
    </section>
  );
};

export default SotraHomeControl;
