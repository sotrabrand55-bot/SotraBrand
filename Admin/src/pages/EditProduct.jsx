/* eslint-disable no-empty */
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { AdminFormPreviewSkeleton } from "../components/AdminSkeletons";

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

const categoryOptions = ["Fragrance", "Gift Sets", "For Her", "For Him"];

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

const normalizeVolumeSize = (value) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  const compact = text.toLowerCase().replace(/\s+/g, "");

  if (compact === "30ml") return "30ML";
  if (compact === "50ml") return "50ML";
  if (compact === "75ml") return "75ML";
  if (compact === "100ml") return "100ML";
  if (compact === "3x10ml") return "3 x 10ML";

  return text;
};

const normalizeFamilies = (items) => {
  const next = (items || [])
    .map((item) => (typeof item === "string" ? item : item?.name))
    .filter(Boolean);
  return next.length ? [...new Set(next)] : defaultScentFamilies;
};

const slotImage = (slot) => {
  if (!slot) return "";
  if (slot.type === "existing") return slot.url || "";
  return slot.preview || "";
};

export default function EditProduct({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");

  const [scentFamilies, setScentFamilies] = useState(defaultScentFamilies);
  const [category, setCategory] = useState("Fragrance");
  const [subCategory, setSubCategory] = useState(defaultScentFamilies[0]);
  const [concentration, setConcentration] = useState("Eau de Parfum");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const [bestseller, setBestseller] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [onSales, setOnSales] = useState(false);
  const [active, setActive] = useState(true);
  const [outOfStock, setOutOfStock] = useState(false);

  const [slots, setSlots] = useState([null, null, null, null]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  const visibleCategoryOptions = useMemo(
    () => [...new Set([category, ...categoryOptions].filter(Boolean))],
    [category]
  );

  const visibleScentFamilies = useMemo(
    () => [...new Set([subCategory, ...scentFamilies].filter(Boolean))],
    [subCategory, scentFamilies]
  );

  const previewImage = useMemo(() => {
    const first = slots.find(Boolean);
    return slotImage(first);
  }, [slots]);

  const imageCount = slots.filter(Boolean).length;

  const displayPrice = (() => {
    const base = Number(price);
    const discount = Number(discountPrice);
    if (Number.isFinite(discount) && discount > 0 && discount < base) return discount;
    return Number.isFinite(base) ? base : 0;
  })();

  const placementState = {
    active,
    newArrival,
    bestseller,
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

  const fetchScentFamilies = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/scent-families/list`);
      if (res.data?.success) {
        setScentFamilies(normalizeFamilies(res.data.families));
      }
    } catch {
      setScentFamilies(defaultScentFamilies);
    }
  };

  useEffect(() => {
    fetchScentFamilies();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/product/${id}`);
        if (!res.data?.success) throw new Error(res.data?.message || "Failed");
        const product = res.data.product;

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

        setCategory(product.category || "Fragrance");
        setSubCategory(product.subCategory || defaultScentFamilies[0]);
        setConcentration(product.concentration || "Eau de Parfum");
        setSizes(
          Array.isArray(product.sizes)
            ? product.sizes.map(normalizeVolumeSize).filter(Boolean)
            : []
        );
        setColors(Array.isArray(product.colors) ? product.colors : []);
        setBestseller(Boolean(product.bestseller));
        setNewArrival(Boolean(product.newArrival));
        setOnSales(Boolean(product.onSales));
        setActive(product.active !== false);
        setOutOfStock(Boolean(product.outOfStock));

        const existing = Array.isArray(product.image)
          ? product.image
          : product.image
            ? [product.image]
            : [];
        const nextSlots = [null, null, null, null];
        existing.slice(0, 4).forEach((image, index) => {
          nextSlots[index] = {
            type: "existing",
            url: typeof image === "string" ? image : image?.url || "",
          };
        });
        setSlots(nextSlots);
        setImagesToRemove([]);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handlePick = (index, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);

    setSlots((prev) => {
      const next = [...prev];
      if (next[index]?.type === "new" && next[index]?.preview) {
        try {
          URL.revokeObjectURL(next[index].preview);
        } catch {}
      }
      next[index] = { type: "new", file, preview };
      return next;
    });
  };

  const handleRemove = (index) => {
    setSlots((prev) => {
      const next = [...prev];
      const slot = next[index];
      if (!slot) return prev;

      if (slot.type === "existing" && slot.url) {
        setImagesToRemove((items) =>
          items.includes(slot.url) ? items : [...items, slot.url]
        );
      }
      if (slot.type === "new" && slot.preview) {
        try {
          URL.revokeObjectURL(slot.preview);
        } catch {}
      }
      next[index] = null;
      return next;
    });
  };

  const pickInput = (index) => (event) => {
    const file = event.target.files?.[0];
    if (file) handlePick(index, file);
    event.target.value = "";
  };

  const newFilesInOrder = useMemo(
    () => slots.filter((slot) => slot?.type === "new").map((slot) => slot.file),
    [slots]
  );

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

  const updatePlacement = (id) => {
    if (id === "active") setActive((prev) => !prev);
    if (id === "newArrival") setNewArrival((prev) => !prev);
    if (id === "bestseller") setBestseller((prev) => !prev);
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
      toast.error("Please select a scent family.");
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
      form.append("concentration", concentration);
      form.append("sizes", JSON.stringify(sizes));
      form.append("colors", JSON.stringify(colors));
      form.append("bestseller", String(bestseller));
      form.append("newArrival", String(newArrival));
      form.append("onSales", String(onSales));
      form.append("active", String(active));
      form.append("outOfStock", String(outOfStock));

      if (finalDiscount !== undefined) {
        form.append("discountPrice", String(finalDiscount));
      } else if (discountPrice === "") {
        form.append("discountPrice", "");
      }

      if (imagesToRemove.length) {
        form.append("imagesToRemove", JSON.stringify(imagesToRemove));
      }

      newFilesInOrder.slice(0, 4).forEach((file, index) => {
        form.append(`image${index + 1}`, file);
      });

      const res = await axios.put(`${backendUrl}/api/product/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data", token },
      });

      if (res.data?.success) {
        toast.success("Product updated successfully");
        navigate("/products");
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
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-[1480px] text-[#1f1b17]">
      <div className="mb-5 flex flex-col gap-3 border-b border-[#eadfd2] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b9945d]">
            Product Manager
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none text-[#1f1b17]">
            EditProduct
          </h1>
          <p className="mt-2 text-sm text-[#7d6756]">
            Update this perfume product and keep storefront placement aligned.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/products"
            className="rounded-full border border-[#d8c2a5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
          >
            Back to Products
          </Link>
          <Link
            to="/add"
            className="rounded-full border border-[#d8c2a5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
          >
            Add Product
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#1f1b17] px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c49a5e] disabled:cursor-wait disabled:bg-[#7d6756]"
          >
            {saving ? "Saving..." : "Save Changes"}
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
            <p className="mt-1 text-xs leading-5 text-[#7d6756]">
              {imageCount} active {imageCount === 1 ? "image" : "images"}.
              Select a box to replace or add a gallery image.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:w-[520px]">
            {slots.map((slot, index) => {
              const image = slotImage(slot);
              return (
                <div
                  key={`image-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-md border border-dashed border-[#d8c2a5] bg-[#fffdf9]"
                >
                  {image ? (
                    <>
                      <img
                        className="h-full w-full object-cover transition group-hover:scale-105"
                        src={image}
                        alt={`Product image ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#7b2d2d] text-xs font-bold text-white shadow"
                        title="Remove image"
                        aria-label={`Remove image ${index + 1}`}
                      >
                        x
                      </button>
                      <label className="absolute inset-x-2 bottom-2 cursor-pointer rounded-full bg-white/90 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f1b17] shadow-sm">
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={pickInput(index)}
                        />
                      </label>
                    </>
                  ) : (
                    <label className="flex h-full w-full cursor-pointer items-center justify-center">
                      <img
                        className="h-full w-full object-cover opacity-80 transition group-hover:scale-105"
                        src={assets.drag_drop_icon}
                        alt={`Upload ${index + 1}`}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={pickInput(index)}
                      />
                    </label>
                  )}
                </div>
              );
            })}
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
                  onChange={(event) => setCategory(event.target.value)}
                  value={category}
                  className={fieldClass}
                >
                  {visibleCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Scent Family</label>
                <select
                  onChange={(event) => setSubCategory(event.target.value)}
                  value={subCategory}
                  className={fieldClass}
                >
                  {visibleScentFamilies.map((family) => (
                    <option key={family} value={family}>
                      {family}
                    </option>
                  ))}
                </select>
              </div>
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
                <label className={labelClass}>Concentration</label>
                <select
                  onChange={(event) => setConcentration(event.target.value)}
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

          <div className="mt-5 rounded-md border border-[#eadfd2] bg-[#fffdf9] p-4">
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

          <div className="mt-5 rounded-md border border-[#eadfd2] bg-[#fffdf9] p-4">
            <div className="mb-3">
              <p className={labelClass}>Frontend Placement</p>
              <p className="text-xs leading-5 text-[#7d6756]">
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

                {sizes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {sizes.slice(0, 5).map((size) => (
                      <span
                        key={size}
                        className="rounded-full border border-[#dfd1c1] bg-[#fffaf4] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#746657]"
                      >
                        {size}
                      </span>
                    ))}
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
}
