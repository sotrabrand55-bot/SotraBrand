/* eslint-disable no-empty */
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { AdminFormPreviewSkeleton } from "../components/AdminSkeletons";
import ProductSotraMediaEditor, {
  stripProductMediaPrivateFields,
} from "../components/ProductSotraMediaEditor";
import SotraProductLivePreview from "../components/SotraProductLivePreview";
import {
  defaultCategoryGroups,
  getActiveCategoryGroups,
  getAllSubcategories,
  getCategoryNames,
  getSubcategoriesForCategory,
} from "../lib/categoryOptions";

const fieldClass =
  "min-h-12 w-full rounded-md border border-[#d4d4d4] bg-[#ffffff] px-3 py-2 text-sm text-[#000000] outline-none transition placeholder:text-[#9ca3af] focus:border-[#000000] focus:ring-2 focus:ring-[#000000]/15";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase leading-4 tracking-[0.14em] text-[#4b5563]";

const hasFitRange = (min, max) => String(min || "").trim() !== "" && String(max || "").trim() !== "";
const perfumeTypeOptions = ["Eau de Parfum", "Eau de Toilette", "Parfum"];

const placementOptions = [
  {
    id: "active",
    title: "Active",
    text: "Visible in the storefront.",
  },
  {
    id: "newArrival",
    title: "New Arrival",
    text: "Marks this product as new across catalog cards.",
  },
  {
    id: "onSales",
    title: "On Sale",
    text: "Marks this product as part of the sale collection.",
  },
  {
    id: "outOfStock",
    title: "Out of Stock",
    text: "Disables purchase and shows sold-out state.",
  },
];

const normalizeVolumeSize = (value) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  const compact = text.toLowerCase().replace(/\s+/g, "");

  if (compact === "30ml") return "30ML";
  if (compact === "50ml") return "50ML";
  if (compact === "100ml") return "100ML";
  if (compact === "120ml") return "120ML";
  if (compact === "150ml") return "150ML";
  if (compact === "10ml") return "10ML";
  if (compact === "default") return "";

  return text;
};

export default function EditProduct({ token }) {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");

  const [categoryGroups, setCategoryGroups] = useState(defaultCategoryGroups);
  const categoryOptions = useMemo(() => getCategoryNames(categoryGroups), [categoryGroups]);
  const allSubcategories = useMemo(() => getAllSubcategories(categoryGroups), [categoryGroups]);
  const [category, setCategory] = useState(getCategoryNames(defaultCategoryGroups)[0]);
  const [subCategory, setSubCategory] = useState(getAllSubcategories(defaultCategoryGroups)[0]?.label || "");
  const [concentration, setConcentration] = useState("");
  const [perfumeTypes, setPerfumeTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [fitMin, setFitMin] = useState("50");
  const [fitMax, setFitMax] = useState("110");

  const [newArrival, setNewArrival] = useState(false);
  const [onSales, setOnSales] = useState(false);
  const [active, setActive] = useState(true);
  const [outOfStock, setOutOfStock] = useState(false);
  const [showSmallImages, setShowSmallImages] = useState(true);
  const [shadeOptions, setShadeOptions] = useState([]);
  const [storyImages, setStoryImages] = useState([]);
  const [setContents, setSetContents] = useState([]);

  const visibleScentFamilies = useMemo(
    () => getSubcategoriesForCategory(categoryGroups, category),
    [categoryGroups, category]
  );

  const placementState = {
    active,
    newArrival,
    onSales,
    outOfStock,
  };

  const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

  const calcDiscountPrice = (p, pct) => {
    const P = Number(p);
    const R = Number(pct);
    if (!Number.isFinite(P) || P <= 0 || !Number.isFinite(R)) return "";
    const rr = clamp(R, 0, 100);
    return (P * (1 - rr / 100)).toFixed(2);
  };

  const hydrateProduct = (product) => {
    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(String(product.price ?? ""));
    setStock(product.stock === 0 || product.stock ? String(product.stock) : "");
    setDiscountPrice(
      product.discountPrice === 0 || product.discountPrice
        ? String(product.discountPrice)
        : ""
    );
    if (product.price && product.discountPrice && product.discountPrice < product.price) {
      const pct = Math.round((1 - product.discountPrice / product.price) * 100);
      setDiscountPercent(String(clamp(pct, 0, 100)));
    } else {
      setDiscountPercent("");
    }

    setCategory(product.category || categoryOptions[0] || getCategoryNames(defaultCategoryGroups)[0]);
    setSubCategory(product.subCategory || allSubcategories[0]?.label || "");
    const nextPerfumeTypes = Array.isArray(product.perfumeTypes)
      ? product.perfumeTypes.filter(Boolean)
      : [];
    const legacyConcentration = product.concentration || "";
    setConcentration(legacyConcentration);
    setPerfumeTypes(
      nextPerfumeTypes.length
        ? nextPerfumeTypes
        : perfumeTypeOptions.includes(legacyConcentration)
          ? [legacyConcentration]
          : []
    );
    setSizes(
      Array.isArray(product.sizes)
        ? product.sizes.map(normalizeVolumeSize).filter(Boolean)
        : []
    );
    setFitMin(product.fitMin === 0 || product.fitMin ? String(product.fitMin) : "");
    setFitMax(product.fitMax === 0 || product.fitMax ? String(product.fitMax) : "");
    setColors(Array.isArray(product.colors) ? product.colors : []);
    setNewArrival(Boolean(product.newArrival));
    setOnSales(Boolean(product.onSales));
    setActive(product.active !== false);
    setOutOfStock(Boolean(product.outOfStock));
    setShowSmallImages(true);
    setShadeOptions(
      Array.isArray(product.shadeOptions)
        ? product.shadeOptions.map((item, index) => ({
            id: item.id || `shade-${index}`,
            label: item.label || "",
            cartValue: item.cartValue || item.label || "",
            image: item.image || "",
            fileId: item.fileId || "",
            description: item.description || "",
            order: item.order ?? index + 1,
            _file: null,
            _preview: "",
          }))
        : []
    );
    setStoryImages(
      Array.isArray(product.storyImages)
        ? product.storyImages.map((item, index) => ({
            id: item.id || `story-${index}`,
            image: item.image || item.url || "",
            fileId: item.fileId || "",
            alt: item.alt || "",
            order: item.order ?? index + 1,
            _file: null,
            _preview: "",
          }))
        : []
    );
    setSetContents(
      Array.isArray(product.setContents)
        ? product.setContents.map((item, index) => ({
            id: item.id || `set-content-${index}`,
            image: item.image || "",
            fileId: item.fileId || "",
            label: item.label || "",
            description: item.description || "",
            alt: item.alt || item.label || "",
            order: item.order ?? index + 1,
            gallery: Array.isArray(item.gallery)
              ? item.gallery.map((galleryItem, galleryIndex) => ({
                  id: galleryItem.id || `set-detail-${index}-${galleryIndex}`,
                  image: galleryItem.image || "",
                  fileId: galleryItem.fileId || "",
                  alt: galleryItem.alt || item.label || "",
                  order: galleryItem.order ?? galleryIndex + 1,
                  _file: null,
                  _preview: "",
                }))
              : [],
            _file: null,
            _preview: "",
          }))
        : []
    );
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const categoryRes = await axios.get(`${backendUrl}/api/categories/list`);
        if (alive && categoryRes.data?.success) {
          const nextGroups = getActiveCategoryGroups(categoryRes.data.groups);
          setCategoryGroups(nextGroups.length ? nextGroups : defaultCategoryGroups);
        }
      } catch {
        if (alive) setCategoryGroups(defaultCategoryGroups);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/product/${id}`);
        if (!alive) return;
        if (!res.data?.success) throw new Error(res.data?.message || "Failed");
        hydrateProduct(res.data.product);

      } catch (error) {
        toast.error(error.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePriceChange = (value) => {
    setPrice(value);
    if (discountPercent !== "") {
      setDiscountPrice(calcDiscountPrice(value, discountPercent));
    }
  };

  const handlePercentChange = (value) => {
    if (value === "") {
      setDiscountPercent("");
      setDiscountPrice("");
      return;
    }

    const num = clamp(Number(value), 0, 100);
    setDiscountPercent(String(num));
    setDiscountPrice(calcDiscountPrice(price, num));
  };

  const updatePlacement = (id) => {
    if (id === "active") setActive((prev) => !prev);
    if (id === "newArrival") setNewArrival((prev) => !prev);
    if (id === "onSales") setOnSales((prev) => !prev);
    if (id === "outOfStock") setOutOfStock((prev) => !prev);
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || price === "") {
      toast.error("Please enter a valid numeric price.");
      return;
    }

    if (!subCategory) {
      toast.error("Please select a storefront category.");
      return;
    }

    const stockNum = stock === "" ? 0 : Number(stock);
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      toast.error("Please enter a valid stock count.");
      return;
    }
    if ((String(fitMin).trim() || String(fitMax).trim()) && !hasFitRange(fitMin, fitMax)) {
      toast.error("Please enter both minimum and maximum KG, or leave both empty.");
      return;
    }

    let finalDiscount = undefined;
    if (discountPercent !== "") {
      const dp = Number(calcDiscountPrice(priceNum, discountPercent));
      if (Number.isFinite(dp) && dp < priceNum) finalDiscount = dp;
    } else if (discountPrice !== "") {
      const dp = Number(discountPrice);
      if (!Number.isFinite(dp) || dp < 0 || dp >= priceNum) {
        toast.error("Discount price must be valid and less than base price.");
        return;
      }
      finalDiscount = dp;
    }

    try {
      setSaving(true);
      const form = new FormData();

      form.append("name", name);
      form.append("description", description);
      form.append("price", String(priceNum));
      form.append("stock", String(Math.floor(stockNum)));
      form.append("category", category);
      form.append("subCategory", subCategory);
      form.append("concentration", perfumeTypes[0] || concentration || "");
      form.append("perfumeTypes", JSON.stringify(perfumeTypes));
      form.append("sizes", JSON.stringify(sizes));
      form.append("fitMin", hasFitRange(fitMin, fitMax) ? fitMin : "");
      form.append("fitMax", hasFitRange(fitMin, fitMax) ? fitMax : "");
      form.append("fitUnit", "kg");
      form.append("colors", JSON.stringify(colors));
      form.append("newArrival", String(newArrival));
      form.append("onSales", String(onSales));
      form.append("active", String(active));
      form.append("outOfStock", String(outOfStock));
      form.append("showSmallImages", "true");
      form.append(
        "shadeOptions",
        JSON.stringify(shadeOptions.map(stripProductMediaPrivateFields))
      );
      form.append(
        "storyImages",
        JSON.stringify(storyImages.map(stripProductMediaPrivateFields))
      );
      form.append(
        "setContents",
        JSON.stringify([])
      );
      shadeOptions.forEach((option, index) => {
        if (option._file) form.append(`shadeImage${index}`, option._file);
      });
      storyImages.forEach((story, index) => {
        if (story._file) form.append(`storyImage${index}`, story._file);
      });

      if (finalDiscount !== undefined) {
        form.append("discountPrice", String(finalDiscount));
      } else if (discountPrice === "") {
        form.append("discountPrice", "");
      }

      const res = await axios.put(`${backendUrl}/api/product/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data", token },
      });

      if (res.data?.success) {
        toast.success("Product updated successfully");
        if (res.data.product) hydrateProduct(res.data.product);
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminFormPreviewSkeleton />;
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-[1480px] text-[#000000]">
      <div className="mb-5 flex flex-col gap-3 border-b border-[#e5e5e5] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c47b92]">
            Product Manager
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none text-[#000000]">
            Edit Product
          </h1>
          <p className="mt-2 text-sm text-[#4b5563]">
            Update this SotraBrand piece and keep storefront placement aligned.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/products"
            className="rounded-full border border-[#d4d4d4] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#374151] transition hover:border-[#000000] hover:text-[#000000]"
          >
            Back to Products
          </Link>
          <Link
            to="/add"
            className="rounded-full border border-[#d4d4d4] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#374151] transition hover:border-[#000000] hover:text-[#000000]"
          >
            Add Product
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#000000] px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#000000] disabled:cursor-wait disabled:bg-[#4b5563]"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
        <section className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c47b92]">
                Product Details
              </p>
              <h2 className="font-serif text-2xl text-[#000000]">
                Product information
              </h2>
            </div>
            <span className="rounded-full border border-[#d4d4d4] bg-[#ffffff] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4b5563]">
              Editing
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className={labelClass}>Product Name</label>
              <input
                onChange={(event) => setName(event.target.value)}
                value={name}
                className={fieldClass}
                type="text"
                placeholder="Noir Ambre Extrait"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Category</label>
                <select
                  onChange={(event) => {
                    const nextCategory = event.target.value;
                    setCategory(nextCategory);
                    setSubCategory(
                      getSubcategoriesForCategory(categoryGroups, nextCategory)?.[0]?.label || nextCategory
                    );
                  }}
                  value={category}
                  className={fieldClass}
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Storefront Group</label>
                <div className={`${fieldClass} flex items-center text-[#4b5563]`}>
                  {subCategory || category}
                </div>
              </div>
              <p className="rounded-md border border-black/10 bg-[#f7f7f7] px-3 py-2 text-xs leading-5 text-[#4b5563] sm:col-span-2">
                Category options come from{" "}
                <Link to="/categories" className="font-semibold text-black underline underline-offset-2">
                  Category Manager
                </Link>
                . Update the menu there, then assign this product here.
              </p>
            </div>

            <div className="lg:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                onChange={(event) => setDescription(event.target.value)}
                value={description}
                className={`${fieldClass} min-h-24 resize-none`}
                placeholder="Write the fabric, modest fit, styling notes, and care details."
                required
              />
            </div>

            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] lg:col-span-2">
              <div>
                <label className={labelClass}>Price</label>
                <input
                  onChange={(event) => handlePriceChange(event.target.value)}
                  value={price}
                  className={fieldClass}
                  type="number"
                  placeholder="82"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Stock Count</label>
                <input
                  onChange={(event) => setStock(event.target.value)}
                  value={stock}
                  className={fieldClass}
                  type="number"
                  placeholder="18"
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <label className={labelClass}>Discount %</label>
                <input
                  onChange={(event) => handlePercentChange(event.target.value)}
                  value={discountPercent}
                  className={fieldClass}
                  type="number"
                  placeholder="20"
                  min="0"
                  max="100"
                  step="1"
                />
              </div>
              <div>
                <label className={labelClass}>Discount Price</label>
                <input
                  onChange={(event) => setDiscountPrice(event.target.value)}
                  value={discountPrice}
                  className={fieldClass}
                  type="number"
                  placeholder="auto"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {price && discountPercent !== "" && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 lg:col-span-2">
                After {discountPercent}% of ${Number(price).toFixed(2)} - final price $
                {discountPrice || calcDiscountPrice(price, discountPercent)}
              </p>
            )}
          </div>

          <div className="mt-5 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className={labelClass}>Optional KG Fit</p>
                <p className="text-xs leading-5 text-[#4b5563]">
                  Set a range when customers should choose their approximate KG fit. Leave both fields empty to hide it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFitMin("");
                  setFitMax("");
                }}
                className="self-start rounded-full border border-black/15 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55 transition hover:border-black hover:text-black"
              >
                Clear KG
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Minimum KG</label>
                <input
                  value={fitMin}
                  onChange={(event) => setFitMin(event.target.value)}
                  className={fieldClass}
                  type="number"
                  min="1"
                  step="1"
                />
              </div>
              <div>
                <label className={labelClass}>Maximum KG</label>
                <input
                  value={fitMax}
                  onChange={(event) => setFitMax(event.target.value)}
                  className={fieldClass}
                  type="number"
                  min="1"
                  step="1"
                />
              </div>
            </div>
          </div>

          <ProductSotraMediaEditor
            shadeOptions={shadeOptions}
            setShadeOptions={setShadeOptions}
            storyImages={storyImages}
            setStoryImages={setStoryImages}
          />

          <div className="mt-5 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
            <div className="mb-3">
              <p className={labelClass}>Frontend Placement</p>
              <p className="text-xs leading-5 text-[#4b5563]">
                These toggles control where this product appears in the storefront.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {placementOptions.map((option) => {
                const selected = placementState[option.id];
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updatePlacement(option.id)}
                    className={`rounded-md border p-3 text-left transition ${
                      selected
                        ? "border-[#000000] bg-[#fff6e8]"
                        : "border-[#e5e5e5] bg-[#ffffff] hover:border-[#d4d4d4]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[#000000]">
                        {option.title}
                      </span>
                      <span
                        className={`h-4 w-8 rounded-full p-0.5 transition ${
                          selected ? "bg-[#000000]" : "bg-[#d4d4d4]"
                        }`}
                      >
                        <span
                          className={`block h-3 w-3 rounded-full bg-white transition ${
                            selected ? "translate-x-4" : ""
                          }`}
                        />
                      </span>
                    </span>
                    <span className="mt-2 block text-[11px] leading-4 text-[#4b5563]">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <SotraProductLivePreview
            name={name}
            description={description}
            price={price}
            discountPrice={discountPrice}
            stock={stock}
            category={category}
            subCategory={subCategory}
            concentration={perfumeTypes[0] || concentration}
            perfumeTypes={perfumeTypes}
            sizes={sizes}
            fitMin={fitMin}
            fitMax={fitMax}
            fitUnit="kg"
            newArrival={newArrival}
            onSales={onSales}
            active={active}
            outOfStock={outOfStock}
            showSmallImages={true}
            shadeOptions={shadeOptions}
            storyImages={storyImages}
          />
        </aside>
      </div>
    </form>
  );
}

