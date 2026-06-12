import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import {
  defaultCategoryGroups,
  getActiveCategoryGroups,
  getAllSubcategories,
  getCategoryNames,
  getSubcategoriesForCategory,
} from "../lib/categoryOptions";
import ProductNancyMediaEditor, {
  stripProductMediaPrivateFields,
} from "../components/ProductNancyMediaEditor";

const panelClass =
  "border border-black/15 bg-white p-4 shadow-[0_16px_38px_rgba(0,0,0,0.05)]";
const fieldClass =
  "min-h-11 w-full rounded-none border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10";
const labelClass =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/55";
const buttonLine =
  "border border-black px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white";
const buttonBlack =
  "bg-black px-6 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#222] disabled:opacity-50";

const money = (value) => `$${(Number(value) || 0).toFixed(2)} USD`;
const volumeOptions = ["100ML", "120ML", "150ML", "30ML", "50ML", "10ML"];
const perfumeTypeOptions = ["Eau de Parfum", "Eau de Toilette", "Perfume"];
const defaultNancyAdvice =
  "Nancy's smile tip: apply a small amount first, let it settle with your skin, then build softly where you want more glow and comfort.";
const defaultNancyDetails = [
  {
    title: "How to use",
    text: "Start with clean skin and apply gently until the texture feels smooth and comfortable.",
  },
  {
    title: "Nancy's touch",
    text: "Use a light layer for daytime radiance, then build slowly when you want a deeper finish.",
  },
  {
    title: "Best moment",
    text: "Keep it close after showering or before going out for a simple Be Radiant ritual.",
  },
];

const emptyPage = (subcategory) => ({
  slug: subcategory?.slug || "",
  categoryLabel: subcategory?.groupLabel || "",
  subcategoryLabel: subcategory?.label || "",
  featuredProductId: "",
  advice: "",
  details: [],
  media: { type: "image", src: "", fileId: "", alt: subcategory?.label || "" },
  active: true,
});

const mediaImage = (item) =>
  item?._preview || item?._filePreview || item?.image || item?.url || "";

const firstProductImage = (product) =>
  mediaImage(product?.storyImages?.find((item) => mediaImage(item))) ||
  mediaImage(product?.shadeOptions?.find((item) => mediaImage(item))) ||
  (Array.isArray(product?.image) ? product.image[0] : product?.image) ||
  (Array.isArray(product?.images) ? product.images[0] : product?.images) ||
  "";

const getProductPreviewImages = (product) => {
  const shadeImages = Array.isArray(product?.shadeOptions)
    ? product.shadeOptions
        .map((option, index) => ({
          id: `shade-${option.id || index}`,
          image: mediaImage(option),
          alt: option.label || product?.name || "",
          source: "shade",
          optionId: option.id || "",
        }))
        .filter((item) => item.image)
    : [];
  const storyImages = Array.isArray(product?.storyImages)
    ? product.storyImages
        .map((story, index) => ({
          id: `story-${story.id || index}`,
          image: mediaImage(story),
          alt: story.alt || product?.name || "",
          source: "story",
        }))
        .filter((item) => item.image)
    : [];
  const productImages = [
    ...(Array.isArray(product?.image) ? product.image : product?.image ? [product.image] : []),
    ...(Array.isArray(product?.images) ? product.images : product?.images ? [product.images] : []),
  ]
    .filter(Boolean)
    .map((image, index) => ({
      id: `product-${index}`,
      image,
      alt: product?.name || "",
      source: "product",
    }));

  const seen = new Set();
  return [...shadeImages, ...storyImages, ...productImages].filter((item) => {
    if (!item.image || seen.has(item.image)) return false;
    seen.add(item.image);
    return true;
  });
};

const normalizeMatchText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getProductSearchText = (product) =>
  normalizeMatchText(
    [
      product?.name,
      product?.category,
      product?.subCategory,
      product?.concentration,
      product?.description,
      ...(Array.isArray(product?.colors) ? product.colors : []),
      ...(Array.isArray(product?.shadeOptions)
        ? product.shadeOptions.flatMap((option) => [
            option?.label,
            option?.cartValue,
            option?.description,
          ])
        : []),
    ].join(" ")
  );

const productMatchesSubcategory = (product, subcategory) => {
  if (!product || !subcategory) return false;

  const target = normalizeMatchText(subcategory.label);
  const groupTarget = normalizeMatchText(subcategory.groupLabel);
  const productSubcategory = normalizeMatchText(product.subCategory);
  const productCategory = normalizeMatchText(product.category);

  if (productSubcategory === target) return true;
  if (productCategory === target) return true;
  if (target === groupTarget && productCategory === groupTarget) return true;

  const searchText = getProductSearchText(product);
  if (!target || !searchText) return false;
  if (searchText.includes(target)) return true;

  return target
    .split(" ")
    .filter(Boolean)
    .every((word) => searchText.includes(word));
};

const newestFirst = (items = []) =>
  [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || 0).getTime();
    const dateB = new Date(b.createdAt || b.date || 0).getTime();
    return dateB - dateA;
  });

const clamp = (number, min, max) => Math.min(Math.max(number, min), max);

const calcDiscountPrice = (price, percent) => {
  const basePrice = Number(price);
  const discountPercent = Number(percent);
  if (!Number.isFinite(basePrice) || !Number.isFinite(discountPercent) || basePrice <= 0) {
    return "";
  }
  return (basePrice * (1 - clamp(discountPercent, 0, 100) / 100)).toFixed(2);
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
  category: product?.category || "",
  subCategory: product?.subCategory || "",
  concentration: product?.concentration || "",
  perfumeTypes: getProductPerfumeTypes(product),
  sizes: getProductSizes(product),
  active: product?.active !== false,
  outOfStock: Boolean(product?.outOfStock),
  showSmallImages: product?.showSmallImages !== false,
});

const applyProductDraft = (product, draft) =>
  product
    ? {
        ...product,
        ...draft,
      }
    : null;

const normalizePage = (page, subcategory) => ({
  ...emptyPage(subcategory),
  ...(page || {}),
  media: {
    ...emptyPage(subcategory).media,
    ...(page?.media || {}),
  },
  details: Array.isArray(page?.details)
    ? page.details.map((item, index) => ({
        title: item.title || "",
        text: item.text || "",
        order: Number.isFinite(Number(item.order)) ? Number(item.order) : index,
      }))
    : [],
});

const SubcategoryStudio = ({ token }) => {
  const [categoryGroups, setCategoryGroups] = useState(defaultCategoryGroups);
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState({});
  const [selectedSlug, setSelectedSlug] = useState("");
  const [draft, setDraft] = useState(emptyPage());
  const [productDraft, setProductDraft] = useState(productToDraft(null));
  const [discountPercent, setDiscountPercent] = useState("");
  const [shadeOptions, setShadeOptions] = useState([]);
  const [storyImages, setStoryImages] = useState([]);
  const [productChooserOpen, setProductChooserOpen] = useState(false);
  const [productMediaOpen, setProductMediaOpen] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const subcategories = useMemo(
    () => getAllSubcategories(categoryGroups),
    [categoryGroups]
  );
  const categoryOptions = useMemo(() => getCategoryNames(categoryGroups), [categoryGroups]);
  const selectedSubcategory = useMemo(
    () =>
      subcategories.find((item) => item.slug === selectedSlug) ||
      subcategories[0] ||
      null,
    [selectedSlug, subcategories]
  );
  const matchingProducts = useMemo(
    () =>
      newestFirst(
        products.filter(
          (product) =>
            product?.active !== false && productMatchesSubcategory(product, selectedSubcategory)
        )
      ),
    [products, selectedSubcategory]
  );
  const featuredProduct =
    matchingProducts.find((product) => product._id === draft.featuredProductId) ||
    matchingProducts[0] ||
    null;
  const relatedProducts = matchingProducts
    .filter((product) => product._id !== featuredProduct?._id)
    .slice(0, 4);
  const featuredPreviewProduct = applyProductDraft(featuredProduct, {
    ...productDraft,
    shadeOptions,
    storyImages,
  });
  const productSubcategoryOptions = useMemo(
    () => getSubcategoriesForCategory(categoryGroups, productDraft.category),
    [categoryGroups, productDraft.category]
  );

  const load = async () => {
    setLoading(true);
    try {
      const [categoryRes, productRes, pagesRes] = await Promise.all([
        axios.get(`${backendUrl}/api/categories/list`),
        axios.get(`${backendUrl}/api/product/list`),
        axios.get(`${backendUrl}/api/subcategory-pages/list`),
      ]);

      const nextGroups = categoryRes.data?.success
        ? getActiveCategoryGroups(categoryRes.data.groups)
        : defaultCategoryGroups;
      const nextPages = {};
      (pagesRes.data?.pages || []).forEach((page) => {
        nextPages[page.slug] = page;
      });

      setCategoryGroups(nextGroups.length ? nextGroups : defaultCategoryGroups);
      setProducts(productRes.data?.products || []);
      setPages(nextPages);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load subcategory studio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selectedSlug && subcategories[0]?.slug) {
      setSelectedSlug(subcategories[0].slug);
    }
  }, [selectedSlug, subcategories]);

  useEffect(() => {
    if (!selectedSubcategory) return;
    setDraft(normalizePage(pages[selectedSubcategory.slug], selectedSubcategory));
    setMediaFile(null);
    setMediaPreview("");
  }, [pages, selectedSubcategory]);

  useEffect(() => {
    setProductDraft({
      ...productToDraft(featuredProduct),
      category: selectedSubcategory?.groupLabel || featuredProduct?.category || "",
      subCategory: selectedSubcategory?.label || featuredProduct?.subCategory || "",
    });
    setDiscountPercent("");
    setShadeOptions(
      Array.isArray(featuredProduct?.shadeOptions)
        ? featuredProduct.shadeOptions.map((item, index) => ({
            id: item.id || `shade-${featuredProduct?._id || "product"}-${index}`,
            label: item.label || "",
            cartValue: item.cartValue || item.label || "",
            description: item.description || "",
            image: item.image || "",
            fileId: item.fileId || "",
            _file: null,
            _preview: "",
          }))
        : []
    );
    setStoryImages(
      Array.isArray(featuredProduct?.storyImages)
        ? featuredProduct.storyImages.map((item, index) => ({
            id: item.id || `story-${featuredProduct?._id || "product"}-${index}`,
            alt: item.alt || "",
            image: item.image || "",
            fileId: item.fileId || "",
            _file: null,
            _preview: "",
          }))
        : []
    );
  }, [featuredProduct?._id, selectedSubcategory?.groupLabel, selectedSubcategory?.label]);

  const updateDraft = (patch) =>
    setDraft((current) => ({
      ...current,
      ...patch,
    }));

  const updateMedia = (patch) =>
    setDraft((current) => ({
      ...current,
      media: { ...(current.media || {}), ...patch },
    }));

  const updateDetail = (index, patch) =>
    setDraft((current) => {
      const details = [...(current.details || [])];
      details[index] = { ...details[index], ...patch };
      return { ...current, details };
    });

  const addDetail = () =>
    updateDraft({
      details: [
        ...(draft.details || []),
        { title: "", text: "", order: draft.details?.length || 0 },
      ],
    });

  const removeDetail = (index) =>
    updateDraft({
      details: (draft.details || []).filter((_, detailIndex) => detailIndex !== index),
    });

  const chooseMedia = (file) => {
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    updateMedia({
      type: file.type.startsWith("video/") ? "video" : "image",
    });
  };

  const buildPageForm = () => {
    const form = new FormData();
    form.append("categoryLabel", selectedSubcategory.groupLabel);
    form.append("subcategoryLabel", selectedSubcategory.label);
    form.append("featuredProductId", draft.featuredProductId || "");
    form.append("advice", draft.advice || "");
    form.append("details", JSON.stringify(draft.details || []));
    form.append("media", JSON.stringify(draft.media || {}));
    form.append("active", String(draft.active !== false));
    if (mediaFile) form.append("mediaFile", mediaFile);
    return form;
  };

  const persistPage = async ({ successMessage = "Subcategory page updated" } = {}) => {
    if (!selectedSubcategory) return null;
    const res = await axios.post(
      `${backendUrl}/api/subcategory-pages/upsert/${selectedSubcategory.slug}`,
      buildPageForm(),
      { headers: { token } }
    );

    if (!res.data?.success) throw new Error(res.data?.message || "Save failed");

    setPages((current) => ({
      ...current,
      [selectedSubcategory.slug]: res.data.page,
    }));
    setMediaFile(null);
    setMediaPreview("");
    if (successMessage) toast.success(successMessage);
    return res.data.page;
  };

  const selectFirstProduct = (productId) => {
    const product = matchingProducts.find((item) => item._id === productId);
    updateDraft({ featuredProductId: productId });
    setProductDraft(productToDraft(product));
    setProductChooserOpen(false);
  };

  const updateProductDraft = (key, value) =>
    setProductDraft((current) => ({
      ...current,
      [key]: value,
    }));

  const handleProductPriceChange = (value) => {
    setProductDraft((current) => ({
      ...current,
      price: value,
      discountPrice:
        discountPercent !== "" ? calcDiscountPrice(value, discountPercent) : current.discountPrice,
    }));
  };

  const handleDiscountPercentChange = (value) => {
    if (value === "") {
      setDiscountPercent("");
      setProductDraft((current) => ({ ...current, discountPrice: "" }));
      return;
    }

    const nextPercent = clamp(Number(value), 0, 100);
    setDiscountPercent(String(nextPercent));
    setProductDraft((current) => ({
      ...current,
      discountPrice: calcDiscountPrice(current.price, nextPercent),
    }));
  };

  const changeProductCategory = (category) => {
    const firstSubcategory =
      getSubcategoriesForCategory(categoryGroups, category)?.[0]?.label || "";
    setProductDraft((current) => ({
      ...current,
      category,
      subCategory: firstSubcategory,
    }));
  };

  const applyCurrentPageCategory = () =>
    setProductDraft((current) => ({
      ...current,
      category: selectedSubcategory?.groupLabel || current.category,
      subCategory: selectedSubcategory?.label || current.subCategory,
    }));

  const toggleProductSize = (size) =>
    setProductDraft((current) => {
      const sizes = Array.isArray(current.sizes) ? current.sizes : [];
      const nextSizes = sizes.includes(size)
        ? sizes.filter((item) => item !== size)
        : [...sizes, size];
      return { ...current, sizes: nextSizes };
    });

  const toggleProductPerfumeType = (type) =>
    setProductDraft((current) => {
      const perfumeTypes = Array.isArray(current.perfumeTypes) ? current.perfumeTypes : [];
      const nextPerfumeTypes = perfumeTypes.includes(type)
        ? perfumeTypes.filter((item) => item !== type)
        : [...perfumeTypes, type];
      return { ...current, perfumeTypes: nextPerfumeTypes };
    });

  const saveFirstProduct = async () => {
    if (!featuredProduct || !selectedSubcategory) {
      toast.error("Choose a product first");
      return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", productDraft.name || featuredProduct.name || "Be Radiant Product");
      form.append(
        "description",
        productDraft.description || featuredProduct.description || "Be Radiant By Nancy product."
      );
      form.append("price", String(Number(productDraft.price) || 0));
      form.append(
        "discountPrice",
        productDraft.discountPrice === "" ? "" : String(Number(productDraft.discountPrice) || 0)
      );
      form.append("stock", productDraft.stock === "" ? "" : String(Math.max(0, Number(productDraft.stock) || 0)));
      form.append("category", productDraft.category || selectedSubcategory.groupLabel || featuredProduct.category || "");
      form.append("subCategory", productDraft.subCategory || selectedSubcategory.label || featuredProduct.subCategory || "");
      const perfumeTypes = Array.isArray(productDraft.perfumeTypes) ? productDraft.perfumeTypes : [];
      form.append("concentration", perfumeTypes[0] || productDraft.concentration || featuredProduct.concentration || "");
      form.append("perfumeTypes", JSON.stringify(perfumeTypes));
      form.append("sizes", JSON.stringify(productDraft.sizes || []));
      form.append("active", String(productDraft.active !== false));
      form.append("outOfStock", String(Boolean(productDraft.outOfStock)));
      form.append("showSmallImages", "true");
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
      if (featuredProduct.featuredSlot !== undefined && featuredProduct.featuredSlot !== null) {
        form.append("featuredSlot", String(featuredProduct.featuredSlot));
      }

      const res = await axios.put(`${backendUrl}/api/product/${featuredProduct._id}`, form, {
        headers: { token, "Content-Type": "multipart/form-data" },
      });
      if (!res.data?.success) throw new Error(res.data?.message || "Product update failed");

      toast.success("First product updated");
      if (draft.featuredProductId) {
        await persistPage({ successMessage: "" });
      }
      const productRes = await axios.get(`${backendUrl}/api/product/list`);
      if (productRes.data?.success) setProducts(productRes.data.products || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!selectedSubcategory) return;
    setSaving(true);
    try {
      await persistPage();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-[1480px]">
        <div className="admin-skeleton h-40" />
        <div className="admin-skeleton mt-5 h-[720px]" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1480px] text-black">
      <div className="mb-5 flex flex-col gap-3 border-b border-black/15 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#c47b92]">
            Collection Pages
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none">Live Subcategory Studio</h1>
          <p className="mt-2 max-w-3xl text-sm text-black/55">
            Swipe between subcategories, choose the first product, edit Nancy advice,
            details, and campaign media. The final product grid auto-fills from stock.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/categories" className={buttonLine}>
            Categories
          </Link>
          <button type="button" onClick={load} className={buttonLine}>
            Refresh
          </button>
          <button type="button" onClick={save} disabled={saving} className={buttonBlack}>
            {saving ? "Saving..." : "Save Page"}
          </button>
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto border-y border-black/10 bg-white py-3">
        {subcategories.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => setSelectedSlug(item.slug)}
            className={`shrink-0 border px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] transition ${
              item.slug === selectedSlug
                ? "border-black bg-black text-white"
                : "border-black/20 bg-white text-black hover:border-black"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-8 border border-black/15 bg-white p-4">
        <SectionTitle eyebrow="Locked Overview" title="Full Subcategory Preview" />
        <div className="mx-auto max-w-[520px]">
          <SubcategoryLivePreview
            subcategory={selectedSubcategory}
            draft={draft}
            mediaPreview={mediaPreview}
            featuredProduct={featuredPreviewProduct}
            relatedProducts={relatedProducts}
          />
        </div>
      </div>

      <div className="space-y-8">
        <StudioSection
          eyebrow={selectedSubcategory?.groupLabel || "Category"}
          title={`${selectedSubcategory?.label || "Subcategory"} First Product`}
          note="Choose the product that appears first, then adjust its customer-facing fields from the same live studio."
          preview={<ProductFeaturePreview product={featuredPreviewProduct} />}
        >
          <section className={panelClass}>
            <SectionTitle eyebrow="First Product" title="Choose + Edit Product" />
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div>
                <label className={labelClass}>First Product</label>
                <SelectedProductSummary product={featuredPreviewProduct} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setProductChooserOpen((open) => !open)}
                    className={buttonBlack}
                  >
                    {productChooserOpen ? "Close Products" : "Choose Product"}
                  </button>
                </div>
              </div>
              <label className="mt-5 flex items-center gap-3 border border-black/15 px-3 py-3">
                <input
                  type="checkbox"
                  checked={draft.active !== false}
                  onChange={(event) => updateDraft({ active: event.target.checked })}
                  className="h-4 w-4 accent-black"
                />
                <span className="text-xs font-bold uppercase tracking-[0.16em]">Page active</span>
              </label>
            </div>

            {productChooserOpen && (
              <ProductChoiceGrid
                products={matchingProducts}
                selectedId={draft.featuredProductId || featuredProduct?._id || ""}
                onSelect={selectFirstProduct}
              />
            )}

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div>
                <label className={labelClass}>Product Name</label>
                <input className={fieldClass} value={productDraft.name || ""} onChange={(event) => updateProductDraft("name", event.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Price</label>
                <input type="number" min="0" step="0.01" className={fieldClass} value={productDraft.price ?? ""} onChange={(event) => handleProductPriceChange(event.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Discount %</label>
                <input type="number" min="0" max="100" step="1" className={fieldClass} value={discountPercent} onChange={(event) => handleDiscountPercentChange(event.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Discount Price</label>
                <input type="number" min="0" step="0.01" className={fieldClass} value={productDraft.discountPrice ?? ""} onChange={(event) => updateProductDraft("discountPrice", event.target.value)} />
              </div>
              {productDraft.price && discountPercent !== "" && (
                <p className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 lg:col-span-2">
                  After {discountPercent}% of ${Number(productDraft.price).toFixed(2)} - final price $
                  {productDraft.discountPrice || calcDiscountPrice(productDraft.price, discountPercent)}
                </p>
              )}
              <div>
                <label className={labelClass}>Stock</label>
                <input type="number" min="0" step="1" className={fieldClass} value={productDraft.stock ?? ""} onChange={(event) => updateProductDraft("stock", event.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select
                  className={fieldClass}
                  value={productDraft.category || ""}
                  onChange={(event) => changeProductCategory(event.target.value)}
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
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">
                    Subcategory
                  </label>
                  <button
                    type="button"
                    onClick={applyCurrentPageCategory}
                    className="text-[9px] font-black uppercase tracking-[0.14em] text-[#c47b92] underline"
                  >
                    Use current page
                  </button>
                </div>
                <select
                  className={fieldClass}
                  value={productDraft.subCategory || ""}
                  onChange={(event) => updateProductDraft("subCategory", event.target.value)}
                >
                  <option value="">Choose subcategory</option>
                  {productSubcategoryOptions.map((option) => (
                    <option key={option.slug || option.label} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea className={`${fieldClass} min-h-28`} value={productDraft.description || ""} onChange={(event) => updateProductDraft("description", event.target.value)} />
              </div>
              <div className="lg:col-span-2">
                <label className={labelClass}>Perfume Type</label>
                <p className="mb-3 text-xs leading-5 text-black/45">
                  Optional. Select when this product should display a perfume type.
                </p>
                <div className="flex flex-wrap gap-2">
                  {perfumeTypeOptions.map((type) => {
                    const selected = Array.isArray(productDraft.perfumeTypes) && productDraft.perfumeTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleProductPerfumeType(type)}
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
                    const selected = Array.isArray(productDraft.sizes) && productDraft.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleProductSize(size)}
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
              {featuredProduct && (
                <div className="lg:col-span-2">
                  <button
                    type="button"
                    onClick={() => setProductMediaOpen((open) => !open)}
                    className="flex w-full items-center justify-between border border-black/15 bg-white px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] transition hover:border-black"
                  >
                    Story Images + Small Images
                    <span className="text-lg leading-none">{productMediaOpen ? "-" : "+"}</span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                      productMediaOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <ProductNancyMediaEditor
                        shadeOptions={shadeOptions}
                        setShadeOptions={setShadeOptions}
                        storyImages={storyImages}
                        setStoryImages={setStoryImages}
                      />
                    </div>
                  </div>
                </div>
              )}
              <label className="flex items-center gap-3 border border-black/15 px-3 py-3">
                <input type="checkbox" className="h-4 w-4 accent-black" checked={productDraft.active !== false} onChange={(event) => updateProductDraft("active", event.target.checked)} />
                <span className="text-xs font-bold uppercase tracking-[0.16em]">Product active</span>
              </label>
              <button type="button" onClick={saveFirstProduct} disabled={!featuredProduct || saving} className={`${buttonBlack} lg:col-span-2`}>
                {saving ? "Saving..." : "Save First Product"}
              </button>
            </div>
          </section>
        </StudioSection>

        <StudioSection
          eyebrow="Nancy Advice"
          title="Advice + Details"
          note="Each subcategory can keep its own advice and dropdown details."
          preview={<AdvicePreview draft={draft} />}
        >
          <section className={panelClass}>
            <SectionTitle eyebrow="Nancy Advice" title="Advice + Details" />
            <label className={labelClass}>Nancy Advice</label>
            <textarea
              className={`${fieldClass} min-h-32`}
              value={draft.advice || ""}
              onChange={(event) => updateDraft({ advice: event.target.value })}
              placeholder="Write Nancy's advice for this subcategory."
            />

            <div className="mt-5 flex items-center justify-between gap-3">
              <div>
                <p className={labelClass}>Details Dropdown</p>
                <p className="text-xs text-black/45">Each row appears inside Details.</p>
              </div>
              <button type="button" onClick={addDetail} className={buttonLine}>
                Add Detail
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {(draft.details || []).map((detail, index) => (
                <div key={index} className="grid gap-3 bg-[#f7f7f7] p-3 lg:grid-cols-[220px_1fr_auto]">
                  <input
                    className={fieldClass}
                    value={detail.title}
                    placeholder="Ideal use"
                    onChange={(event) => updateDetail(index, { title: event.target.value })}
                  />
                  <input
                    className={fieldClass}
                    value={detail.text}
                    placeholder="Explain this detail"
                    onChange={(event) => updateDetail(index, { text: event.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeDetail(index)}
                    className="border border-[#7b2d2d] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7b2d2d] hover:bg-[#7b2d2d] hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={save} disabled={saving} className={buttonBlack}>
                {saving ? "Saving..." : "Save Advice + Details"}
              </button>
            </div>
          </section>
        </StudioSection>

        <StudioSection
          eyebrow="Campaign Media"
          title="Image or Video"
          note="This is the visual break below the product details on the subcategory page."
          preview={<CampaignMediaPreview media={draft.media} mediaPreview={mediaPreview} />}
        >
          <section className={panelClass}>
            <SectionTitle eyebrow="Campaign Media" title="Image or Video" />
            <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
              <div className="aspect-[9/12] bg-[#EAEAEA]">
                <PreviewMedia media={draft.media} preview={mediaPreview} />
              </div>
              <div className="grid gap-4">
                <div>
                  <label className={labelClass}>Media Type</label>
                  <select
                    className={fieldClass}
                    value={draft.media?.type || "image"}
                    onChange={(event) => updateMedia({ type: event.target.value })}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Upload Image or Video</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className={fieldClass}
                    onChange={(event) => chooseMedia(event.target.files?.[0])}
                  />
                </div>
                <div>
                  <label className={labelClass}>Alt / Label</label>
                  <input
                    className={fieldClass}
                    value={draft.media?.alt || ""}
                    onChange={(event) => updateMedia({ alt: event.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={save} disabled={saving} className={buttonBlack}>
                {saving ? "Saving..." : "Save Image / Video"}
              </button>
            </div>
          </section>
        </StudioSection>

        <StudioSection
          eyebrow="Automatic Products"
          title="Subcategory Product Shelf"
          note="The last products are automatic from this subcategory. Add or edit products and they update here."
          preview={<ProductShelfPreview products={relatedProducts} />}
        >
          <section className={panelClass}>
            <SectionTitle eyebrow="Automatic Products" title="Existing Products" />
            <div className="mb-4 flex flex-wrap gap-2">
              <Link
                to={`/add?category=${encodeURIComponent(selectedSubcategory?.groupLabel || "")}&subCategory=${encodeURIComponent(selectedSubcategory?.label || "")}`}
                className={buttonBlack}
              >
                Add Product
              </Link>
              <Link to="/products" className={buttonLine}>
                Products List
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {matchingProducts.map((product) => (
                <ProductMini key={product._id} product={product} />
              ))}
              {!matchingProducts.length && (
                <p className="text-sm text-black/50">
                  Add products to this subcategory and they will appear automatically.
                </p>
              )}
            </div>
          </section>
        </StudioSection>
      </div>
    </main>
  );
};

const SectionTitle = ({ eyebrow, title }) => (
  <div className="mb-4 border-b border-black/15 pb-4">
    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c47b92]">{eyebrow}</p>
    <h2 className="mt-1 text-2xl font-black uppercase">{title}</h2>
  </div>
);

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

const SelectedProductSummary = ({ product }) => {
  if (!product) {
    return (
      <div className="grid min-h-24 place-items-center border border-dashed border-black/20 bg-white p-4 text-center text-sm text-black/45">
        Auto newest matching product will be used until you choose one.
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
          No products match this subcategory yet.
        </div>
      )}
    </div>
  </div>
);

const ProductFeaturePreview = ({ product }) => {
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
            First Product
          </p>
          <p className="mt-3 text-sm font-semibold text-black">Choose or add a product</p>
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
        {[product.category, product.subCategory].filter(Boolean).join(" / ") || "Be Radiant"}
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

const AdvicePreview = ({ draft }) => (
  <section className="bg-white p-5">
    <p className="text-sm font-light uppercase tracking-[0.12em] text-black/55">
      Nancy&apos;s Advice
    </p>
    <p className="mt-4 text-base font-light leading-8 text-black/75">
      {draft.advice || defaultNancyAdvice}
    </p>
    <div className="mt-6 border-t border-black/20 pt-5">
      <div className="flex items-center justify-between">
        <p className="text-lg font-black uppercase">Details</p>
        <span className="text-2xl leading-none">+</span>
      </div>
      <ul className="mt-4 space-y-2 pl-5 text-sm leading-6 text-black/75">
        {((draft.details || []).length ? draft.details : defaultNancyDetails).slice(0, 5).map((detail, index) => (
          <li key={index} className="list-disc">
            <strong>{detail.title || "Detail"}:</strong> {detail.text || "Description"}
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const CampaignMediaPreview = ({ media, mediaPreview }) => (
  <div className="aspect-[9/12] bg-[#EAEAEA]">
    <PreviewMedia media={media} preview={mediaPreview} />
  </div>
);

const ProductShelfPreview = ({ products, title = "Subcategory Products" }) => (
  <section className="bg-white p-5">
    <p className="mb-4 text-center text-xl font-black uppercase">{title}</p>
    <div className="grid grid-cols-2 gap-3">
      {products.slice(0, 4).map((product) => (
        <ProductMini key={product._id} product={product} />
      ))}
      {!products.length && (
        <div className="col-span-2 border border-dashed border-black/20 p-6 text-center text-sm text-black/45">
          Products appear here automatically.
        </div>
      )}
    </div>
  </section>
);

const PreviewMedia = ({ media, preview }) => {
  const src = preview || media?.src || "";
  if (!src) {
    return (
      <div className="grid h-full w-full place-items-center text-center text-xs font-bold uppercase tracking-[0.18em] text-black/35">
        Campaign Media
      </div>
    );
  }

  if (media?.type === "video") {
    return <video src={src} className="h-full w-full object-cover" muted loop playsInline controls />;
  }

  return <img src={src} alt={media?.alt || ""} className="h-full w-full object-cover" />;
};

const ProductMini = ({ product }) => (
  <article className="border border-black/10 bg-white p-3">
    <div className="aspect-[4/5] bg-[#EAEAEA]">
      {firstProductImage(product) && (
        <img src={firstProductImage(product)} alt={product.name} className="h-full w-full object-contain" />
      )}
    </div>
    <p className="mt-3 truncate text-xs font-bold uppercase tracking-[0.14em]">{product.name}</p>
    <p className="mt-1 text-sm text-black/60">${Number(product.price || 0).toFixed(2)} USD</p>
  </article>
);

const SubcategoryLivePreview = ({
  subcategory,
  draft,
  mediaPreview,
  featuredProduct,
  relatedProducts,
}) => (
  <section className="border border-black/15 bg-white shadow-[0_16px_38px_rgba(0,0,0,0.05)]">
    <div className="border-b border-black/15 px-5 py-8 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
        {subcategory?.groupLabel || "Category"}
      </p>
      <h3 className="mt-2 font-serif text-4xl leading-tight">{subcategory?.label || "Subcategory"}</h3>
    </div>

    <div className="p-4">
      <ProductMini product={featuredProduct || { name: "First Product", price: 0 }} />
    </div>

    <div className="border-y border-black/25 p-5">
      <p className="text-sm font-light uppercase tracking-[0.12em] text-black/55">Nancy&apos;s Advice</p>
      <p className="mt-4 text-base font-light leading-8 text-black/75">
        {draft.advice || defaultNancyAdvice}
      </p>
      <div className="mt-5 border-t border-black/20 pt-4">
        <p className="text-lg font-black uppercase">Details</p>
        <ul className="mt-3 space-y-2 pl-5 text-sm leading-6 text-black/75">
          {((draft.details || []).length ? draft.details : defaultNancyDetails).slice(0, 5).map((detail, index) => (
            <li key={index} className="list-disc">
              <strong>{detail.title || "Detail"}:</strong> {detail.text || "Description"}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="aspect-[9/12] bg-[#EAEAEA]">
      <PreviewMedia media={draft.media} preview={mediaPreview} />
    </div>

    <div className="p-4">
      <p className="mb-3 text-center text-xl font-black uppercase">
        {subcategory?.label || "Subcategory Products"}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {relatedProducts.slice(0, 4).map((product) => (
          <ProductMini key={product._id} product={product} />
        ))}
      </div>
    </div>
  </section>
);

export default SubcategoryStudio;
