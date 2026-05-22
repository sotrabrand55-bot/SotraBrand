import React, { useEffect, useMemo, useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const fieldClass =
  "min-h-12 w-full rounded-md border border-[#dfd1c1] bg-[#fffdf9] px-3 py-2 text-sm text-[#1f1b17] outline-none transition placeholder:text-[#a49181] focus:border-[#c49a5e] focus:ring-2 focus:ring-[#c49a5e]/15";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase leading-4 tracking-[0.14em] text-[#7d6756]";

const volumeOptions = ["30ML", "50ML", "75ML", "100ML", "3 x 10ML"];

const defaultScentFamilies = [
  "Amber",
  "Floral",
  "Fresh",
  "Woods",
  "Oud",
  "Musk",
  "Citrus",
  "Gift Sets",
];

const placementOptions = [
  {
    id: "active",
    title: "Active",
    text: "Visible in the storefront.",
  },
  {
    id: "newArrival",
    title: "New Arrival",
    text: "Appears in the homepage New Arrivals section.",
  },
  {
    id: "bestseller",
    title: "Best Seller",
    text: "Appears in the Best Sellers rail.",
  },
  {
    id: "onSales",
    title: "On Sale",
    text: "Appears in the On Sale rail.",
  },
  {
    id: "outOfStock",
    title: "Out of Stock",
    text: "Disables purchase and shows sold-out state.",
  },
];

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");

  const [scentFamilies, setScentFamilies] = useState(defaultScentFamilies);
  const [category, setCategory] = useState("Fragrance");
  const [subCategory, setSubCategory] = useState(scentFamilies[0] || "");
  const [customScentFamily, setCustomScentFamily] = useState("");
  const [concentration, setConcentration] = useState("Eau de Parfum");
  const [sizes, setSizes] = useState([]);

  const [bestseller, setBestseller] = useState(false);
  const [newArrival, setnewArrival] = useState(false);
  const [onSales, setonSales] = useState(false);
  const [active, setActive] = useState(true);
  const [outOfStock, setOutOfStock] = useState(false);

  const images = [image1, image2, image3, image4];
  const imageSetters = [setImage1, setImage2, setImage3, setImage4];

  const previewImage = useMemo(() => {
    const first = images.find(Boolean);
    return first ? URL.createObjectURL(first) : "";
  }, [image1, image2, image3, image4]);

  const normalizeFamilies = (items) => {
    const next = (items || [])
      .map((item) =>
        typeof item === "string" ? item : item?.name
      )
      .filter(Boolean);
    return next.length ? [...new Set(next)] : defaultScentFamilies;
  };

  const fetchScentFamilies = async ({ silent = false } = {}) => {
    try {
      const res = await axios.get(`${backendUrl}/api/scent-families/list`);
      if (res.data.success) {
        const nextFamilies = normalizeFamilies(res.data.families);
        setScentFamilies(nextFamilies);
        setSubCategory((prev) =>
          prev && nextFamilies.includes(prev) ? prev : nextFamilies[0] || ""
        );
      } else if (!silent) {
        toast.error(res.data.message || "Failed to load scent families");
      }
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || error.message);
      }
      setScentFamilies(defaultScentFamilies);
    }
  };

  useEffect(() => {
    fetchScentFamilies({ silent: true });
    const interval = setInterval(() => fetchScentFamilies({ silent: true }), 8000);
    return () => clearInterval(interval);
  }, []);

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

  const displayPrice = (() => {
    const base = Number(price);
    const discount = Number(discountPrice);
    if (Number.isFinite(discount) && discount > 0 && discount < base) return discount;
    return Number.isFinite(base) ? base : 0;
  })();

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
    setCategory("Fragrance");
    setSubCategory(scentFamilies[0] || "");
    setConcentration("Eau de Parfum");
    setSizes([]);
    setBestseller(false);
    setnewArrival(false);
    setonSales(false);
    setActive(true);
    setOutOfStock(false);
    setImage1(false);
    setImage2(false);
    setImage3(false);
    setImage4(false);
  };

  const addScentFamily = async () => {
    const next = customScentFamily.trim();
    if (!next) return;

    const exists = scentFamilies.some(
      (item) => item.toLowerCase() === next.toLowerCase()
    );
    if (exists) {
      const existing = scentFamilies.find(
        (item) => item.toLowerCase() === next.toLowerCase()
      );
      setSubCategory(existing || next);
      setCustomScentFamily("");
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/scent-families/add`,
        { name: next, category: "Fragrance", order: scentFamilies.length },
        { headers: { token } }
      );
      if (res.data.success) {
        setSubCategory(res.data.family?.name || next);
        setCustomScentFamily("");
        toast.success(res.data.message || `${next} added to scent families`);
        await fetchScentFamilies({ silent: true });
      } else {
        toast.error(res.data.message || "Failed to add scent family");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const deleteScentFamily = async (family) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/scent-families/remove`,
        { name: family },
        { headers: { token } }
      );

      if (res.data.success) {
        const updated = scentFamilies.filter((item) => item !== family);
        setScentFamilies(updated);
        if (subCategory === family) {
          setSubCategory(updated[0] || "");
        }
        toast.success(res.data.message || `${family} removed`);
        await fetchScentFamilies({ silent: true });
      } else {
        toast.error(res.data.message || "Failed to remove scent family");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const restoreDefaultScentFamilies = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/scent-families/restore-defaults`,
        {},
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Default scent families restored");
        await fetchScentFamilies({ silent: true });
      } else {
        toast.error(res.data.message || "Failed to restore defaults");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const priceNumber = Number(price);
    if (Number.isNaN(priceNumber) || price === "") {
      toast.error("Please enter a valid numeric price.");
      return;
    }

    if (!subCategory) {
      toast.error("Please add or select a scent family.");
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
      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", String(priceNumber));
      formData.append("stock", String(Math.floor(stockNumber)));

      if (finalDiscount !== undefined) {
        formData.append("discountPrice", String(finalDiscount));
      }

      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("concentration", concentration);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("bestseller", bestseller ? "true" : "false");
      formData.append("newArrival", newArrival ? "true" : "false");
      formData.append("onSales", onSales ? "true" : "false");
      formData.append("active", active ? "true" : "false");
      formData.append("outOfStock", outOfStock ? "true" : "false");

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

  const updatePlacement = (id) => {
    if (id === "active") setActive((prev) => !prev);
    if (id === "newArrival") setnewArrival((prev) => !prev);
    if (id === "bestseller") setBestseller((prev) => !prev);
    if (id === "onSales") setonSales((prev) => !prev);
    if (id === "outOfStock") setOutOfStock((prev) => !prev);
  };

  const placementState = {
    active,
    newArrival,
    bestseller,
    onSales,
    outOfStock,
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="mx-auto w-full max-w-[1480px] text-[#1f1b17]"
    >
      <div className="mb-5 flex flex-col gap-3 border-b border-[#eadfd2] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b9945d]">
            Product Manager
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none text-[#1f1b17]">
            AddProduct
          </h1>
          <p className="mt-2 text-sm text-[#7d6756]">
            Create perfume products for the live collection.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-[#d8c2a5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
          >
            Reset
          </button>
          <button
            type="submit"
            className="rounded-full bg-[#1f1b17] px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c49a5e]"
          >
            Add Product
          </button>
        </div>
      </div>

      <section className="mb-5 rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
              Image Upload
            </p>
            <h2 className="mt-1 font-serif text-2xl text-[#1f1b17]">
              Product gallery
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:w-[520px]">
            {images.map((image, index) => (
              <label
                key={`image-${index}`}
                htmlFor={`image${index + 1}`}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border border-dashed border-[#d8c2a5] bg-[#fffdf9]"
              >
                <img
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  src={image ? URL.createObjectURL(image) : assets.drag_drop_icon}
                  alt={`Upload ${index + 1}`}
                />
                <input
                  onChange={(e) => imageSetters[index](e.target.files[0])}
                  type="file"
                  id={`image${index + 1}`}
                  hidden
                />
              </label>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
        <section className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
                Product Details
              </p>
              <h2 className="font-serif text-2xl text-[#1f1b17]">
                Perfume information
              </h2>
            </div>
            <span className="rounded-full border border-[#dfd1c1] bg-[#fffdf9] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7d6756]">
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
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                  className={fieldClass}
                >
                  <option value="Fragrance">Fragrance</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Scent Family</label>
                <select
                  onChange={(e) => setSubCategory(e.target.value)}
                  value={subCategory}
                  className={fieldClass}
                >
                  {scentFamilies.map((family) => (
                    <option key={family} value={family}>
                      {family}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-md border border-[#eadfd2] bg-[#fffdf9] p-3 lg:col-span-2">
              <label className={labelClass}>Add Scent Family</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={customScentFamily}
                  onChange={(e) => setCustomScentFamily(e.target.value)}
                  className={fieldClass}
                  type="text"
                  placeholder="Example: Vanilla, Aquatic, Leather"
                />
                <button
                  type="button"
                  onClick={addScentFamily}
                  className="shrink-0 rounded-md bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c49a5e]"
                >
                  Add Family
                </button>
              </div>
              <div className="mt-2 flex flex-col gap-2 text-xs leading-5 text-[#7d6756] sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Add, select, or delete families one by one. This list now
                  saves to the backend and feeds frontend filters.
                </p>
                <button
                  type="button"
                  onClick={restoreDefaultScentFamilies}
                  className="w-fit rounded-full border border-[#dfd1c1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f5844] transition hover:border-[#c49a5e]"
                >
                  Restore Defaults
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {scentFamilies.map((family) => (
                  <span
                    key={family}
                    className="inline-flex items-center gap-2 rounded-full border border-[#dfd1c1] bg-[#fffaf4] px-3 py-1 text-xs font-semibold text-[#6f5844]"
                  >
                    {family}
                    <button
                      type="button"
                      onClick={() => deleteScentFamily(family)}
                      className="grid h-5 w-5 place-items-center rounded-full text-[#7b2d2d] transition hover:bg-[#7b2d2d] hover:text-white"
                      aria-label={`Delete ${family}`}
                      title={`Delete ${family}`}
                    >
                      x
                    </button>
                  </span>
                ))}
                {!scentFamilies.length && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Add at least one scent family
                  </span>
                )}
              </div>
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
                <label className={labelClass}>Concentration</label>
                <select
                  onChange={(e) => setConcentration(e.target.value)}
                  value={concentration}
                  className={fieldClass}
                >
                  <option value="Eau de Parfum">Eau de Parfum</option>
                  <option value="Eau de Toilette">Eau de Toilette</option>
                </select>
              </div>
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

          <div className="mt-5 grid gap-4">
            <div className="rounded-md border border-[#eadfd2] bg-[#fffdf9] p-4">
              <label className={labelClass}>Size / Volume</label>
              <div className="flex flex-wrap gap-2">
                {volumeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                      sizes.includes(size)
                        ? "border-[#1f1b17] bg-[#1f1b17] text-white"
                        : "border-[#dfd1c1] bg-[#fffaf4] text-[#6f5844] hover:border-[#c49a5e]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-[#eadfd2] bg-[#fffdf9] p-4">
            <div className="mb-3">
              <p className={labelClass}>Frontend Placement</p>
              <p className="text-xs leading-5 text-[#7d6756]">
                These toggles automatically place this product in homepage
                sections and storefront states.
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
                        ? "border-[#c49a5e] bg-[#fff6e8]"
                        : "border-[#eadfd2] bg-[#fffaf4] hover:border-[#d8c2a5]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[#1f1b17]">
                        {option.title}
                      </span>
                      <span
                        className={`h-4 w-8 rounded-full p-0.5 transition ${
                          selected ? "bg-[#1f1b17]" : "bg-[#d8c8b5]"
                        }`}
                      >
                        <span
                          className={`block h-3 w-3 rounded-full bg-white transition ${
                            selected ? "translate-x-4" : ""
                          }`}
                        />
                      </span>
                    </span>
                    <span className="mt-2 block text-[11px] leading-4 text-[#7d6756]">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
              Live Product Preview
            </p>

            <div className="mt-4 overflow-hidden rounded-md border border-[#eadfd2] bg-[#fffdf9]">
              <div className="relative aspect-[4/4.5] bg-[#eee4d9]">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#a49181]">
                    Add image
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#51483f]">
                  {subCategory || "Amber"}
                </span>
                <span className="absolute right-3 top-3 rounded-full border border-white/70 bg-[#e5f1e8]/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2f6c4d]">
                  {outOfStock ? "Out" : "In Stock"}
                </span>
                {(newArrival || bestseller || onSales) && (
                  <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
                    {newArrival && (
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2f6c4d] shadow-sm">
                        New
                      </span>
                    )}
                    {bestseller && (
                      <span className="rounded-full bg-[#1f1b17]/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
                        Best Seller
                      </span>
                    )}
                    {onSales && (
                      <span className="rounded-full bg-[#7b2d2d]/92 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
                        On Sale
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-xl text-[#1f1b17]">
                      {name || "Noir Ambre Extrait"}
                    </h3>
                    <p className="mt-1 truncate text-[11px] uppercase tracking-[0.15em] text-[#8a7b6b]">
                      {[concentration, subCategory || "Signature"]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#eadfd2] bg-[#fffaf4] text-[#7b6047]">
                    <span className="text-lg leading-none">♡</span>
                  </span>
                </div>

                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f5844]">
                  {outOfStock ? "Out of stock" : `${stock || 0} in stock`}
                </p>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#7d6756]">
                  {description ||
                    "Write a description to preview the perfume story here."}
                </p>

                {(newArrival || bestseller || onSales) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {newArrival && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                        New Arrival
                      </span>
                    )}
                    {bestseller && (
                      <span className="rounded-full border border-[#dfd1c1] bg-[#fffaf4] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f5844]">
                        Best Seller
                      </span>
                    )}
                    {onSales && (
                      <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7b2d2d]">
                        On Sale
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-[#1f1b17]">
                      ${displayPrice.toFixed(2)}
                    </span>
                    {Number(discountPrice) > 0 && Number(discountPrice) < Number(price) && (
                      <span className="text-sm text-[#a69888] line-through">
                        ${Number(price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {concentration && (
                    <span className="rounded-full border border-[#dfd1c1] bg-[#fffaf4] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#746657]">
                      {concentration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
};

export default Add;
