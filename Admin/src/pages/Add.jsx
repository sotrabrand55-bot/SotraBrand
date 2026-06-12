import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { Link, useLocation } from "react-router-dom";
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

const Add = ({ token }) => {
  const location = useLocation();
  const presetCategory = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      category: params.get("category") || "",
      subCategory: params.get("subCategory") || "",
    };
  }, [location.search]);
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

  const [newArrival, setnewArrival] = useState(false);
  const [onSales, setonSales] = useState(false);
  const [active, setActive] = useState(true);
  const [outOfStock, setOutOfStock] = useState(false);
  const [featuredSlot, setFeaturedSlot] = useState("");
  const [showSmallImages, setShowSmallImages] = useState(true);
  const [shadeOptions, setShadeOptions] = useState([]);
  const [storyImages, setStoryImages] = useState([]);
  const visibleSubcategories = useMemo(
    () => getSubcategoriesForCategory(categoryGroups, category),
    [categoryGroups, category]
  );

  useEffect(() => {
    let alive = true;
    const loadCategories = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/categories/list`);
        if (!alive || !res.data?.success) return;
        const nextGroups = getActiveCategoryGroups(res.data.groups);
        setCategoryGroups(nextGroups.length ? nextGroups : defaultCategoryGroups);
      } catch {
        if (alive) setCategoryGroups(defaultCategoryGroups);
      }
    };

    loadCategories();
    const interval = setInterval(loadCategories, 8000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!categoryOptions.length) return;
    if (presetCategory.category && categoryOptions.includes(presetCategory.category)) {
      const presetSubcategories = getSubcategoriesForCategory(categoryGroups, presetCategory.category);
      const nextSubcategory = presetSubcategories.some(
        (item) => item.label === presetCategory.subCategory
      )
        ? presetCategory.subCategory
        : presetSubcategories[0]?.label || "";
      setCategory(presetCategory.category);
      setSubCategory(nextSubcategory);
      return;
    }

    if (!categoryOptions.includes(category)) {
      setCategory(categoryOptions[0]);
      return;
    }

    if (!visibleSubcategories.some((item) => item.label === subCategory)) {
      setSubCategory(visibleSubcategories[0]?.label || allSubcategories[0]?.label || "");
    }
  }, [allSubcategories, category, categoryGroups, categoryOptions, presetCategory, subCategory, visibleSubcategories]);

  const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

  const calcDiscountPrice = (p, pct) => {
    const P = Number(p);
    const R = Number(pct);
    if (!Number.isFinite(P) || !Number.isFinite(R)) return "";
    if (P <= 0) return "";
    const rr = clamp(R, 0, 100);
    const out = P * (1 - rr / 100);
    return out.toFixed(2);
  };

  const handlePriceChange = (v) => {
    setPrice(v);
    if (discountPercent !== "") {
      setDiscountPrice(calcDiscountPrice(v, discountPercent));
    }
  };

  const handlePercentChange = (v) => {
    if (v === "") {
      setDiscountPercent("");
      setDiscountPrice("");
      return;
    }
    const num = clamp(Number(v), 0, 100);
    setDiscountPercent(String(num));
    setDiscountPrice(calcDiscountPrice(price, num));
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setDiscountPercent("");
    setDiscountPrice("");
    setCategory(categoryOptions[0] || "");
    setSubCategory(
      getSubcategoriesForCategory(categoryGroups, categoryOptions[0])?.[0]?.label ||
        allSubcategories[0]?.label ||
        ""
    );
    setConcentration("");
    setPerfumeTypes([]);
    setSizes([]);
    setnewArrival(false);
    setonSales(false);
    setActive(true);
    setOutOfStock(false);
    setFeaturedSlot("");
    setShowSmallImages(true);
    setShadeOptions([]);
    setStoryImages([]);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const priceNumber = Number(price);
    if (Number.isNaN(priceNumber) || price === "") {
      toast.error("Please enter a valid numeric price.");
      return;
    }

    if (!subCategory) {
      toast.error("Please select a subcategory.");
      return;
    }

    const stockNumber = stock === "" ? 0 : Number(stock);
    if (!Number.isFinite(stockNumber) || stockNumber < 0) {
      toast.error("Please enter a valid stock count.");
      return;
    }

    let finalDiscount = undefined;
    if (discountPercent !== "") {
      const dp = Number(calcDiscountPrice(priceNumber, discountPercent));
      if (Number.isFinite(dp) && dp < priceNumber) finalDiscount = dp;
    } else if (discountPrice !== "") {
      const dp = Number(discountPrice);
      if (!Number.isFinite(dp) || dp < 0 || dp >= priceNumber) {
        toast.error("Discount price must be valid and less than base price.");
        return;
      }
      finalDiscount = dp;
    }

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", String(priceNumber));
      formData.append("stock", String(Math.floor(stockNumber)));

      if (finalDiscount !== undefined) {
        formData.append("discountPrice", String(finalDiscount));
      }

      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("concentration", perfumeTypes[0] || concentration || "");
      formData.append("perfumeTypes", JSON.stringify(perfumeTypes));
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("newArrival", newArrival ? "true" : "false");
      formData.append("onSales", onSales ? "true" : "false");
      formData.append("active", active ? "true" : "false");
      formData.append("outOfStock", outOfStock ? "true" : "false");
      formData.append("featuredSlot", featuredSlot);
      formData.append("showSmallImages", "true");
      formData.append(
        "shadeOptions",
        JSON.stringify(shadeOptions.map(stripProductMediaPrivateFields))
      );
      formData.append(
        "storyImages",
        JSON.stringify(storyImages.map(stripProductMediaPrivateFields))
      );
      shadeOptions.forEach((option, index) => {
        if (option._file) formData.append(`shadeImage${index}`, option._file);
      });
      storyImages.forEach((story, index) => {
        if (story._file) formData.append(`storyImage${index}`, story._file);
      });

      const res = await axios.post(backendUrl + "/api/product/add", formData, {
        headers: { token },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        resetForm();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message || err?.response?.data || err.message;
      toast.error(`Failed to add product: ${serverMsg}`);
    }
  };

  const toggleSize = (val) =>
    setSizes((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );

  const togglePerfumeType = (val) =>
    setPerfumeTypes((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );

  const updatePlacement = (id) => {
    if (id === "active") setActive((prev) => !prev);
    if (id === "newArrival") setnewArrival((prev) => !prev);
    if (id === "onSales") setonSales((prev) => !prev);
    if (id === "outOfStock") setOutOfStock((prev) => !prev);
  };

  const placementState = {
    active,
    newArrival,
    onSales,
    outOfStock,
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="mx-auto w-full max-w-[1480px] text-[#000000]"
    >
      <div className="mb-5 flex flex-col gap-3 border-b border-[#e5e5e5] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c47b92]">
            Product Manager
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none text-[#000000]">
            Add Product
          </h1>
          <p className="mt-2 text-sm text-[#4b5563]">
            Create Be Radiant products for the live collection.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-[#d4d4d4] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#374151] transition hover:border-[#000000] hover:text-[#000000]"
          >
            Reset
          </button>
          <button
            type="submit"
            className="rounded-full bg-[#000000] px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#000000]"
          >
            Add Product
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
              Required
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className={labelClass}>Product Name</label>
              <input
                onChange={(e) => setName(e.target.value)}
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
                  onChange={(e) => {
                    const nextCategory = e.target.value;
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
                  onChange={(e) => setSubCategory(e.target.value)}
                  value={subCategory}
                  className={fieldClass}
                >
                  {visibleSubcategories.map((family) => (
                    <option key={family.slug || family.label} value={family.label}>
                      {family.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="rounded-md border border-black/10 bg-[#f7f7f7] px-3 py-2 text-xs leading-5 text-[#4b5563] sm:col-span-2">
                These options come from{" "}
                <Link to="/categories" className="font-semibold text-black underline underline-offset-2">
                  Category Manager
                </Link>
                . Add or rename categories there, then choose them here for each product.
              </p>
            </div>

            <div className="lg:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                className={`${fieldClass} min-h-24 resize-none`}
                placeholder="Write the perfume story, main notes, and feeling."
                required
              />
            </div>

            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
              <div>
                <label className={labelClass}>Price</label>
                <input
                  onChange={(e) => handlePriceChange(e.target.value)}
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
                  onChange={(e) => setStock(e.target.value)}
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
                  onChange={(e) => handlePercentChange(e.target.value)}
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
                  onChange={(e) => setDiscountPrice(e.target.value)}
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

          <div className="mt-5 grid gap-4">
            <div className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
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

            <div className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
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
          </div>

          <div className="mt-5 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
            <div className="mb-3">
              <p className={labelClass}>Frontend Placement</p>
              <p className="text-xs leading-5 text-[#4b5563]">
                These toggles control Nancy catalog badges and storefront states.
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
};

export default Add;

