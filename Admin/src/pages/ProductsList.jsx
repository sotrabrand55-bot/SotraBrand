import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { AdminProductsSkeleton } from "../components/AdminSkeletons";

const perfumeSizeOptions = ["100ML", "120ML", "150ML", "30ML", "50ML", "10ML"];

const statClass =
  "rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[0_14px_34px_rgba(62,45,28,0.06)]";

const normalizeSize = (value) => {
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

const getImages = (product) => {
  const image = Array.isArray(product?.image) ? product.image : [];
  return image
    .map((item) => (typeof item === "string" ? item : item?.url || ""))
    .filter(Boolean);
};

const getSizes = (product) => {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const normalized = [...new Set(sizes.map(normalizeSize).filter(Boolean))];
  const order = new Map(perfumeSizeOptions.map((size, index) => [size, index]));

  return normalized.sort((a, b) => {
    const aOrder = order.has(a) ? order.get(a) : Number.MAX_SAFE_INTEGER;
    const bOrder = order.has(b) ? order.get(b) : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.localeCompare(b);
  });
};

const getPerfumeTypes = (product) => {
  const explicit = Array.isArray(product?.perfumeTypes) ? product.perfumeTypes : [];
  const legacy = product?.concentration ? [product.concentration] : [];
  return [...new Set([...explicit, ...legacy].filter(Boolean))];
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

const newestFirst = (products = []) =>
  [...products].sort((a, b) => {
    const dateA = Number(a?.date) || new Date(a?.createdAt || 0).getTime();
    const dateB = Number(b?.date) || new Date(b?.createdAt || 0).getTime();
    if (dateA !== dateB) return dateB - dateA;
    return String(b?._id || "").localeCompare(String(a?._id || ""));
  });

const ProductsList = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/product/list`, {
        headers: { token },
      });
      if (res.data?.success) {
        setItems(newestFirst(res.data.products || []));
      } else {
        toast.error(res.data?.message || "Failed to load products");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const active = items.filter((item) => item.active !== false).length;
    const newArrival = items.filter((item) => item.newArrival).length;
    const onSales = items.filter((item) => item.onSales).length;
    const outOfStock = items.filter((item) => {
      const stock = getStockCount(item);
      return item.outOfStock || (stock !== null && stock <= 0);
    }).length;

    return [
      { label: "Total Products", value: items.length },
      { label: "Active", value: active },
      { label: "New Arrivals", value: newArrival },
      { label: "On Sale", value: onSales },
      { label: "Out of Stock", value: outOfStock },
    ];
  }, [items]);

  const newestItems = useMemo(() => newestFirst(items), [items]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );
      if (res.data?.success) {
        toast.success("Product deleted");
        setItems((prev) => prev.filter((p) => p._id !== id));
      } else {
        toast.error(res.data?.message || "Delete failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  };

  const toggleFlag = async (id, field, current) => {
    try {
      const res = await axios.put(
        `${backendUrl}/api/product/${id}`,
        { [field]: !current },
        { headers: { token } }
      );
      if (res.data?.success) {
        setItems((prev) =>
          prev.map((p) => (p._id === id ? { ...p, [field]: !current } : p))
        );
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  };

  if (loading) {
    return <AdminProductsSkeleton />;
  }

  return (
    <main className="mx-auto w-full max-w-[1480px] text-[#000000]">
      <div className="mb-5 flex flex-col gap-3 border-b border-[#e5e5e5] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c47b92]">
            Product Manager
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none text-[#000000]">
            Products
          </h1>
          <p className="mt-2 text-sm text-[#4b5563]">
            Manage the live perfume catalog and storefront placement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/categories"
            className="rounded-full border border-[#d4d4d4] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#374151] transition hover:border-[#000000] hover:text-[#000000]"
          >
            Categories
          </Link>
          <button
            type="button"
            onClick={fetchProducts}
            className="rounded-full border border-[#d4d4d4] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#374151] transition hover:border-[#000000] hover:text-[#000000]"
          >
            Refresh
          </button>
          <Link
            to="/add"
            className="rounded-full bg-[#000000] px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#000000]"
          >
            Add Product
          </Link>
        </div>
      </div>

      <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className={statClass}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
              {stat.label}
            </p>
            <p className="mt-2 font-serif text-3xl leading-none text-[#000000]">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {items.length === 0 ? (
        <section className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-10 text-center shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
          <p className="font-serif text-3xl text-[#000000]">No products yet</p>
          <p className="mt-3 text-sm text-[#4b5563]">
            Add the first Be Radiant product to start building the catalog.
          </p>
          <Link
            to="/add"
            className="mt-6 inline-flex rounded-full bg-[#000000] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#000000]"
          >
            Add Product
          </Link>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {newestItems.map((product) => {
            const images = getImages(product);
            const thumb = images[0] || "";
            const sizes = getSizes(product);
            const perfumeTypes = getPerfumeTypes(product);
            const stock = getStockCount(product);
            const soldOut = Boolean(product.outOfStock) || (stock !== null && stock <= 0);
            const lowStock = !soldOut && stock !== null && stock <= 5;
            const discount = hasValidDiscount(product);
            const price = Number(product.price || 0);
            const discountPrice = Number(product.discountPrice);

            return (
              <article
                key={product._id}
                className="overflow-hidden rounded-md border border-[#e5e5e5] bg-[#ffffff] shadow-[0_18px_45px_rgba(62,45,28,0.08)]"
              >
                <div className="relative aspect-[4/3] bg-[#EAEAEA]">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs font-semibold uppercase tracking-[0.16em] text-[#9ca3af]">
                      No Image
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-white/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#51483f] shadow-sm">
                      {product.subCategory || product.category || "Fragrance"}
                    </span>
                    {product.active === false && (
                      <span className="rounded-full bg-[#000000]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="absolute right-3 top-3">
                    <span
                      className={`rounded-full border border-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm backdrop-blur ${
                        soldOut
                          ? "bg-[#000000]/85 text-white"
                          : lowStock
                            ? "bg-amber-50/95 text-amber-700"
                            : "bg-[#e5f1e8]/95 text-[#2f6c4d]"
                      }`}
                    >
                      {soldOut ? "Out" : lowStock ? "Low Stock" : "In Stock"}
                    </span>
                  </div>

                  {(product.newArrival || product.onSales) && (
                    <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5">
                      {product.newArrival && (
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2f6c4d] shadow-sm">
                          New
                        </span>
                      )}
                      {product.onSales && (
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
                      <h2 className="truncate font-serif text-2xl leading-tight text-[#000000]">
                        {product.name}
                      </h2>
                      <p className="mt-1 truncate text-[11px] uppercase tracking-[0.15em] text-[#8a7b6b]">
                        {[product.category, perfumeTypes[0]].filter(Boolean).join(" / ")}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#d4d4d4] bg-[#ffffff] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4b5563]">
                      {images.length} img
                    </span>
                  </div>

                  <p
                    className={`mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                      soldOut
                        ? "text-[#7b2d2d]"
                        : lowStock
                          ? "text-[#a16f2b]"
                          : "text-[#374151]"
                    }`}
                  >
                    {soldOut ? "Out of stock" : stock !== null ? `${stock} in stock` : "Stock not set"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className={`sotra-price text-base font-bold ${discount ? "sotra-sale-price" : "text-[#000000]"}`}>
                        ${discount ? discountPrice.toFixed(2) : price.toFixed(2)}
                      </span>
                      {discount && (
                        <span className="sotra-old-price text-sm">
                          ${price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {discount && (
                      <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7b2d2d]">
                        Discount
                      </span>
                    )}
                  </div>

                  {product.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#4b5563]">
                      {product.description}
                    </p>
                  )}

                  {sizes.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {sizes.map((size) => (
                        <span
                          key={size}
                          className="rounded-full border border-[#d4d4d4] bg-[#ffffff] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#746657]"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  )}

                  {perfumeTypes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {perfumeTypes.map((type) => (
                        <span
                          key={type}
                          className="rounded-full border border-[#d4d4d4] bg-[#ffffff] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#746657]"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Link
                      to={`/edit/${product._id}`}
                      className="rounded-full bg-[#000000] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#000000]"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="rounded-full border border-[#d4d4d4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#374151] transition hover:border-[#000000] hover:text-[#000000]"
                      onClick={() => toggleFlag(product._id, "active", product.active !== false)}
                    >
                      {product.active === false ? "Show" : "Hide"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-[#d4d4d4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#374151] transition hover:border-[#000000] hover:text-[#000000]"
                      onClick={() => toggleFlag(product._id, "outOfStock", Boolean(product.outOfStock))}
                    >
                      {product.outOfStock ? "Mark In Stock" : "Mark OOS"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-[#7b2d2d]/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7b2d2d] transition hover:border-[#7b2d2d] hover:bg-[#7b2d2d] hover:text-white"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default ProductsList;
