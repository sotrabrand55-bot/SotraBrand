/* eslint-disable no-empty */
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { AdminFormPreviewSkeleton } from "../components/AdminSkeletons";
import ProductNancyMediaEditor, {
  stripProductMediaPrivateFields,
} from "../components/ProductNancyMediaEditor";
import NancyProductLivePreview from "../components/NancyProductLivePreview";
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

const volumeOptions = ["100ML", "120ML", "150ML", "30ML", "50ML", "10ML"];
const perfumeTypeOptions = ["Eau de Parfum", "Eau de Toilette", "Perfume"];

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

  const [newArrival, setNewArrival] = useState(false);
  const [onSales, setOnSales] = useState(false);
  const [active, setActive] = useState(true);
  const [outOfStock, setOutOfStock] = useState(false);
  const [featuredSlot, setFeaturedSlot] = useState("");
  const [showSmallImages, setShowSmallImages] = useState(true);
  const [shadeOptions, setShadeOptions] = useState([]);
  const [storyImages, setStoryImages] = useState([]);

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
    setColors(Array.isArray(product.colors) ? product.colors : []);
    setNewArrival(Boolean(product.newArrival));
    setOnSales(Boolean(product.onSales));
    setActive(product.active !== false);
    setOutOfStock(Boolean(product.outOfStock));
    setFeaturedSlot(product.featuredSlot ? String(product.featuredSlot) : "");
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

  const toggleSize = (value) =>
    setSizes((prev) =>
      prev.includes(value) ? prev.filter((size) => size !== value) : [...prev, value]
    );

  const togglePerfumeType = (value) =>
    setPerfumeTypes((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );

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
      toast.error("Please select a subcategory.");
      return;
    }

    const stockNum = stock === "" ? 0 : Number(stock);
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      toast.error("Please enter a valid stock count.");
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
      form.append("colors", JSON.stringify(colors));
      form.append("newArrival", String(newArrival));
      form.append("onSales", String(onSales));
      form.append("active", String(active));
      form.append("outOfStock", String(outOfStock));
      form.append("featuredSlot", featuredSlot);
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
            Update this perfume product and keep storefront placement aligned.
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
                      getSubcategoriesForCategory(categoryGroups, nextCategory)?.[0]?.label || ""
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
                <label className={labelClass}>Subcategory</label>
                <select
                  onChange={(event) => setSubCategory(event.target.value)}
                  value={subCategory}
                  className={fieldClass}
                >
                  {visibleScentFamilies.map((family) => (
                    <option key={family.slug || family.label} value={family.label}>
                      {family.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="rounded-md border border-black/10 bg-[#f7f7f7] px-3 py-2 text-xs leading-5 text-[#4b5563] sm:col-span-2">
                Category and subcategory options come from{" "}
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
                placeholder="Write the perfume story, main notes, and feeling."
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
            <label className={labelClass}>Perfume Type</label>
            <p className="mb-3 text-xs leading-5 text-[#4b5563]">
              Optional. Select when this product should display Eau de Parfum, Eau de Toilette, or Perfume.
            </p>
            <div className="flex flex-wrap gap-2">
              {perfumeTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => togglePerfumeType(type)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                    perfumeTypes.includes(type)
                      ? "border-[#000000] bg-[#000000] text-white"
                      : "border-[#d4d4d4] bg-[#ffffff] text-[#374151] hover:border-[#000000]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
            <label className={labelClass}>Size / Volume</label>
            <p className="mb-3 text-xs leading-5 text-[#4b5563]">
              Optional. Leave empty when this product has no selectable size.
            </p>
            <div className="flex flex-wrap gap-2">
              {volumeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                    sizes.includes(size)
                      ? "border-[#000000] bg-[#000000] text-white"
                      : "border-[#d4d4d4] bg-[#ffffff] text-[#374151] hover:border-[#000000]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
            <div className="mb-3">
              <p className={labelClass}>Featured Product Placement</p>
              <p className="text-xs leading-5 text-[#4b5563]">
                Slots 1-3 appear together before Luxury Video. Slot 4 appears after Luxury Video.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
              <select
                value={featuredSlot}
                onChange={(event) => setFeaturedSlot(event.target.value)}
                className={fieldClass}
              >
                <option value="">No featured slot</option>
                <option value="1">FeaturedProducts 1</option>
                <option value="2">FeaturedProducts 2</option>
                <option value="3">FeaturedProducts 3</option>
                <option value="4">FeaturedProducts 4</option>
              </select>
            </div>
          </div>

          <ProductNancyMediaEditor
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
          <NancyProductLivePreview
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

