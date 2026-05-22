import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import { AdminFormPreviewSkeleton } from "../components/AdminSkeletons";

const fieldClass =
  "min-h-11 w-full rounded-md border border-[#dfd1c1] bg-[#fffdf9] px-3 py-2 text-sm text-[#1f1b17] outline-none transition placeholder:text-[#a49181] focus:border-[#c49a5e] focus:ring-2 focus:ring-[#c49a5e]/15";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase leading-4 tracking-[0.14em] text-[#7d6756]";

const emptySlots = [
  {
    slot: 1,
    productId: "",
    title: "",
    subtitle: "",
    buttonText: "Shop Set",
    image: "",
    linkTo: "",
    active: true,
    clearImage: false,
  },
  {
    slot: 2,
    productId: "",
    title: "",
    subtitle: "",
    buttonText: "Shop Set",
    image: "",
    linkTo: "",
    active: true,
    clearImage: false,
  },
  {
    slot: 3,
    productId: "",
    title: "",
    subtitle: "",
    buttonText: "Shop Set",
    image: "",
    linkTo: "",
    active: true,
    clearImage: false,
  },
];

const fallbackPanels = [
  {
    slot: 1,
    title: "Discovery Ritual Set",
    subtitle: "Curated perfume ritual",
    buttonText: "Shop Set",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
    linkTo: "/gift-sets",
    active: true,
  },
  {
    slot: 2,
    title: "For Her Gift Set",
    subtitle: "Elegant. Feminine. Timeless.",
    buttonText: "Shop Set",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1400&q=85",
    linkTo: "/collection?cat=Gift%20Sets&sub=For%20Her",
    active: true,
  },
  {
    slot: 3,
    title: "For Him Gift Set",
    subtitle: "Bold. Refined. Confident.",
    buttonText: "Shop Set",
    image:
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1400&q=85",
    linkTo: "/collection?cat=Gift%20Sets&sub=For%20Him",
    active: true,
  },
];

const buttonLinkOptions = [
  { label: "Discovery Set", value: "/gift-sets" },
  { label: "For Her", value: "/collection?cat=Gift%20Sets&sub=For%20Her" },
  { label: "For Him", value: "/collection?cat=Gift%20Sets&sub=For%20Him" },
];

const normalizeButtonLink = (value, slotNumber = 1) => {
  const match = buttonLinkOptions.find((option) => option.value === value);
  if (match) return match.value;
  return fallbackPanels[slotNumber - 1]?.linkTo || buttonLinkOptions[0].value;
};

const pickImage = (image) => {
  if (Array.isArray(image)) {
    const first = image[0];
    return typeof first === "string" ? first : first?.url || first?.path || "";
  }
  if (typeof image === "string") return image;
  return image?.url || image?.path || "";
};

const getStockCount = (product) => {
  if (product?.stock === undefined || product?.stock === null || product?.stock === "") {
    return null;
  }
  const stock = Number(product.stock);
  return Number.isFinite(stock) ? stock : null;
};

const hasValidDiscount = (product) => {
  const price = Number(product?.price || 0);
  const discount = Number(product?.discountPrice);
  return Number.isFinite(discount) && discount > 0 && discount < price;
};

const formatPrice = (value) => {
  const amount = Number(value);
  return `${currency}${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
};

const normalizeSlots = (slots = []) => {
  const bySlot = new Map();
  slots.forEach((slot) => {
    const slotNumber = Number(slot.slot);
    if (slotNumber >= 1 && slotNumber <= 3) bySlot.set(slotNumber, slot);
  });

  return emptySlots.map((fallback) => {
    const slot = bySlot.get(fallback.slot) || {};
    const productId =
      typeof slot.productId === "object"
        ? slot.productId?._id || ""
        : slot.productId || "";

    return {
      ...fallback,
      ...slot,
      productId: String(productId || ""),
      slot: fallback.slot,
      buttonText: slot.buttonText || "Shop Set",
      active: slot.active === undefined ? true : Boolean(slot.active),
      linkTo: normalizeButtonLink(slot.linkTo, fallback.slot),
      clearImage: false,
    };
  });
};

const SlotUploadPreview = ({ file, fallback, alt }) => {
  const [source, setSource] = useState("");

  useEffect(() => {
    if (!file) {
      setSource("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setSource(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!source && !fallback) {
    return (
      <div className="grid h-full w-full place-items-center bg-[#eee4d9] text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a49181]">
        Add image
      </div>
    );
  }

  return (
    <img
      src={source || fallback}
      alt={alt}
      className="h-full w-full object-cover"
    />
  );
};

const getProductSubtitle = (product) =>
  product?.subCategory ||
  product?.concentration ||
  (Array.isArray(product?.sizes) ? product.sizes.slice(0, 2).join(" / ") : "") ||
  "Gift Set";

const GiftSetsManager = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [slots, setSlots] = useState(emptySlots);
  const [slotFiles, setSlotFiles] = useState([null, null, null]);

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((product) => map.set(String(product._id), product));
    return map;
  }, [products]);

  const giftSets = useMemo(
    () =>
      products
        .filter((product) => product.category === "Gift Sets")
        .sort((a, b) => Number(b.date || 0) - Number(a.date || 0)),
    [products]
  );

  const resolveSlot = (slot) => {
    const product = productMap.get(String(slot.productId || ""));
    const fallback = fallbackPanels[slot.slot - 1];
    const title = slot.title || product?.name || fallback.title;
    const subtitle = slot.subtitle || getProductSubtitle(product) || fallback.subtitle;
    const image = slot.image || pickImage(product?.image) || fallback.image;
    const linkTo = normalizeButtonLink(slot.linkTo, slot.slot);

    return {
      ...slot,
      product,
      title,
      subtitle,
      image,
      linkTo,
      buttonText: slot.buttonText || "Shop Set",
    };
  };

  const resolvedSlots = useMemo(
    () => slots.map((slot) => resolveSlot(slot)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slots, productMap]
  );

  const stats = useMemo(() => {
    const usedProductIds = new Set(slots.map((slot) => slot.productId).filter(Boolean));
    return [
      { label: "Slot 1 Featured", value: slots[0]?.productId ? "Set" : "Open" },
      { label: "Slot 2 Secondary", value: slots[1]?.productId ? "Set" : "Open" },
      { label: "Slot 3 Secondary", value: slots[2]?.productId ? "Set" : "Open" },
      { label: "Live Products", value: giftSets.length },
      { label: "Active Display", value: slots.filter((slot) => slot.active).length },
      { label: "Needs Review", value: Math.max(0, 3 - usedProductIds.size) },
    ];
  }, [giftSets.length, slots]);

  const loadPage = async () => {
    setLoading(true);
    try {
      const [productRes, displayRes] = await Promise.all([
        axios.get(`${backendUrl}/api/product/list`, { headers: { token } }),
        axios.get(`${backendUrl}/api/gift-set-display`),
      ]);

      if (productRes.data?.success) {
        setProducts(productRes.data.products || []);
      } else {
        toast.error(productRes.data?.message || "Failed to load gift sets");
      }

      if (displayRes.data?.success) {
        setSlots(normalizeSlots(displayRes.data.display?.slots));
        setSlotFiles([null, null, null]);
      } else {
        toast.error(displayRes.data?.message || "Failed to load display slots");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSlot = (slotNumber, updates) => {
    setSlots((current) =>
      current.map((slot) =>
        slot.slot === slotNumber ? { ...slot, ...updates } : slot
      )
    );
  };

  const selectProduct = (slotNumber, productId) => {
    const product = productMap.get(String(productId));
    updateSlot(slotNumber, {
      productId,
      title: product?.name || "",
      subtitle: getProductSubtitle(product),
      buttonText: "Shop Set",
      linkTo: normalizeButtonLink("", slotNumber),
      clearImage: false,
    });
  };

  const setSlotImage = (slotNumber, file) => {
    setSlotFiles((current) => {
      const next = [...current];
      next[slotNumber - 1] = file || null;
      return next;
    });
    updateSlot(slotNumber, { clearImage: false });
  };

  const clearSlotImage = (slotNumber) => {
    setSlotFiles((current) => {
      const next = [...current];
      next[slotNumber - 1] = null;
      return next;
    });
    updateSlot(slotNumber, { image: "", clearImage: true });
  };

  const saveDisplay = async () => {
    try {
      setSaving(true);
      const body = new FormData();
      body.append(
        "slots",
        JSON.stringify(
          slots.map((slot) => ({
            slot: slot.slot,
            productId: slot.productId || "",
            title: slot.title || "",
            subtitle: slot.subtitle || "",
            buttonText: slot.buttonText || "Shop Set",
            image: slot.image || "",
            linkTo: normalizeButtonLink(slot.linkTo, slot.slot),
            active: Boolean(slot.active),
            clearImage: Boolean(slot.clearImage),
          }))
        )
      );

      slotFiles.forEach((file, index) => {
        if (file) body.append(`image${index + 1}`, file);
      });

      const res = await axios.post(`${backendUrl}/api/gift-set-display/update`, body, {
        headers: { token },
      });

      if (res.data?.success) {
        toast.success("Gift Sets display saved");
        setSlots(normalizeSlots(res.data.display?.slots));
        setSlotFiles([null, null, null]);
      } else {
        toast.error(res.data?.message || "Failed to save display");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  const useProductInSlot = (product, slotNumber) => {
    selectProduct(slotNumber, product._id);
    toast.success(`${product.name} assigned to Slot ${slotNumber}`);
  };

  if (loading) return <AdminFormPreviewSkeleton />;

  return (
    <main className="mx-auto w-full max-w-[1480px] text-[#1f1b17]">
      <div className="mb-5 flex flex-col gap-3 border-b border-[#eadfd2] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b9945d]">
            Gift Sets Manager
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none text-[#1f1b17]">
            Gift Sets Display
          </h1>
          <p className="mt-2 text-sm text-[#7d6756]">
            Choose the 3 featured gift set pictures shown on Home and Gift Sets page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadPage}
            className="rounded-full border border-[#d8c2a5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
          >
            Refresh
          </button>
          <Link
            to="/products"
            className="rounded-full border border-[#d8c2a5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
          >
            Products
          </Link>
          <button
            type="button"
            onClick={saveDisplay}
            disabled={saving}
            className="rounded-full bg-[#1f1b17] px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c49a5e] disabled:cursor-wait disabled:bg-[#7d6756]"
          >
            {saving ? "Saving..." : "Save Display"}
          </button>
        </div>
      </div>

      <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_14px_34px_rgba(62,45,28,0.06)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
              {stat.label}
            </p>
            <p className="mt-2 font-serif text-2xl leading-none text-[#1f1b17]">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
                Feature Slots
              </p>
              <h2 className="font-serif text-2xl text-[#1f1b17]">
                Three controlled pictures
              </h2>
            </div>
            <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
              Syncs Home + /gift-sets
            </span>
          </div>

          <div className="space-y-4">
            {slots.map((slot) => {
              const resolved = resolveSlot(slot);
              const file = slotFiles[slot.slot - 1];
              return (
                <article
                  key={slot.slot}
                  className={`grid gap-4 rounded-md border bg-[#fffdf9] p-3 ${
                    slot.slot === 1
                      ? "border-[#c49a5e] lg:grid-cols-[190px_minmax(0,1fr)]"
                      : "border-[#eadfd2] lg:grid-cols-[150px_minmax(0,1fr)]"
                  }`}
                >
                  <div
                    className={`relative overflow-hidden rounded-md bg-[#eee4d9] ${
                      slot.slot === 1 ? "aspect-[4/3]" : "aspect-[4/3]"
                    }`}
                  >
                    <SlotUploadPreview
                      file={file}
                      fallback={slot.clearImage ? pickImage(resolved.product?.image) : resolved.image}
                      alt={`Slot ${slot.slot}`}
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f1b17]">
                      Slot {slot.slot}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#1f1b17]">
                          {slot.slot === 1 ? "Featured large panel" : "Right stacked panel"}
                        </p>
                        <p className="text-xs text-[#7d6756]">
                          Controls picture {slot.slot} on both frontend Gift Sets areas.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateSlot(slot.slot, { active: !slot.active })}
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                          slot.active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-[#dfd1c1] bg-[#fffaf4] text-[#6f5844]"
                        }`}
                      >
                        {slot.active ? "Active" : "Hidden"}
                      </button>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div>
                        <label className={labelClass}>Product</label>
                        <select
                          value={slot.productId}
                          onChange={(event) => selectProduct(slot.slot, event.target.value)}
                          className={fieldClass}
                        >
                          <option value="">Choose gift set product</option>
                          {giftSets.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Button Link</label>
                        <select
                          value={normalizeButtonLink(slot.linkTo, slot.slot)}
                          onChange={(event) =>
                            updateSlot(slot.slot, { linkTo: event.target.value })
                          }
                          className={fieldClass}
                        >
                          {buttonLinkOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Display Title</label>
                        <input
                          value={slot.title}
                          onChange={(event) =>
                            updateSlot(slot.slot, { title: event.target.value })
                          }
                          className={fieldClass}
                          placeholder={resolved.title}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Subtitle</label>
                        <input
                          value={slot.subtitle}
                          onChange={(event) =>
                            updateSlot(slot.slot, { subtitle: event.target.value })
                          }
                          className={fieldClass}
                          placeholder={resolved.subtitle}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="cursor-pointer rounded-full border border-[#d8c2a5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => setSlotImage(slot.slot, event.target.files?.[0])}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => clearSlotImage(slot.slot)}
                        className="rounded-full border border-[#d8c2a5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
                      >
                        Use Product Image
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
                  Live Frontend Preview
                </p>
                <h2 className="font-serif text-2xl text-[#1f1b17]">
                  Three-picture layout
                </h2>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Live
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {resolvedSlots.map((slot) => (
                <div
                  key={slot.slot}
                  className={`group relative overflow-hidden rounded-md bg-[#eadfd2] ${
                    slot.slot === 1 ? "col-span-2 min-h-[230px]" : "min-h-[160px]"
                  } ${slot.active ? "" : "opacity-50"}`}
                >
                  <div className="absolute inset-0">
                    <SlotUploadPreview
                      file={slotFiles[slot.slot - 1]}
                      fallback={slot.image}
                      alt={slot.title}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d8b778]">
                      Slot {slot.slot}
                    </p>
                    <h3 className="mt-1 font-serif text-2xl leading-tight">
                      {slot.title}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-[11px] uppercase tracking-[0.14em] text-white/80">
                      {slot.subtitle}
                    </p>
                    <span className="mt-3 inline-flex rounded-full bg-[#fff8ee] px-3 py-1.5 text-[11px] font-semibold text-[#1f1b17]">
                      {slot.buttonText || "Shop Set"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="mt-5 rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
              Available Gift Set Products
            </p>
            <h2 className="font-serif text-2xl text-[#1f1b17]">
              Choose from backend products
            </h2>
          </div>
          <span className="w-fit rounded-full border border-[#dfd1c1] bg-[#fffdf9] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d6756]">
            {giftSets.length} products
          </span>
        </div>

        {giftSets.length === 0 ? (
          <div className="rounded-md border border-[#eadfd2] bg-[#fffdf9] p-8 text-center">
            <p className="font-serif text-2xl text-[#1f1b17]">No gift set products yet</p>
            <p className="mt-2 text-sm text-[#7d6756]">
              Add or edit products with category Gift Sets, then assign them to display slots.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {giftSets.map((product) => {
              const stock = getStockCount(product);
              const soldOut = product.outOfStock || (stock !== null && stock <= 0);
              const discount = hasValidDiscount(product);

              return (
                <article
                  key={product._id}
                  className="grid gap-3 rounded-md border border-[#eadfd2] bg-[#fffdf9] p-3 lg:grid-cols-[72px_minmax(0,1fr)_190px_310px]"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-[#eee4d9]">
                    {pickImage(product.image) ? (
                      <img
                        src={pickImage(product.image)}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-serif text-xl text-[#1f1b17]">
                      {product.name}
                    </p>
                    <p className="mt-1 truncate text-[11px] uppercase tracking-[0.15em] text-[#8a7b6b]">
                      {[product.subCategory, product.concentration].filter(Boolean).join(" / ")}
                    </p>
                    <p className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                      soldOut ? "text-[#7b2d2d]" : "text-[#6f5844]"
                    }`}>
                      {soldOut ? "Out of stock" : stock !== null ? `${stock} in stock` : "Stock not set"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm font-semibold ${discount ? "text-[#7b2d2d]" : "text-[#1f1b17]"}`}>
                        {formatPrice(discount ? product.discountPrice : product.price)}
                      </span>
                      {discount && (
                        <span className="text-xs text-[#a69888] line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-[#7d6756]">
                      {product.active === false ? "Hidden" : "Active"} product
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {[1, 2, 3].map((slotNumber) => (
                      <button
                        key={slotNumber}
                        type="button"
                        onClick={() => useProductInSlot(product, slotNumber)}
                        className="rounded-full border border-[#d8c2a5] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
                      >
                        Slot {slotNumber}
                      </button>
                    ))}
                    <Link
                      to={`/edit/${product._id}`}
                      className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#c49a5e]"
                    >
                      Edit
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default GiftSetsManager;
