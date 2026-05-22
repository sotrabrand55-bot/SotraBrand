import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import { AdminDashboardSkeleton } from "../components/AdminSkeletons";

const cardClass =
  "rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_14px_34px_rgba(62,45,28,0.06)]";

const formatPrice = (value) => {
  const amount = Number(value);
  return `${currency}${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
};

const formatCompact = (value) => {
  const number = Number(value || 0);
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return String(number);
};

const getDate = (value) => new Date(Number(value) || value || Date.now());

const isWithinDays = (value, days) => {
  if (days === "all") return true;
  const date = getDate(value);
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return date.getTime() >= cutoff;
};

const pickImage = (image) => {
  if (Array.isArray(image)) {
    const first = image[0];
    return typeof first === "string" ? first : first?.url || first?.path || "";
  }
  if (typeof image === "string") return image;
  return image?.url || image?.path || "";
};

const normalizeOrderItems = (order) => {
  const raw = Array.isArray(order.items) ? order.items : [];
  return raw.map((item) => ({
    title: item.title || item.name || item.productName || "Product",
    productId: String(item.productId || item._id || ""),
    image: pickImage(item.image),
    qty: Number(item.qty ?? item.quantity ?? 0),
    unitPrice: Number(item.unitPrice ?? item.price ?? 0),
    subtotal: Number(item.subtotal ?? 0),
    subCategory: item.subCategory || "",
    concentration: item.concentration || "",
  }));
};

const statusKey = (status = "") => String(status).toLowerCase();

const Dashboard = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const loadDashboard = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [productRes, orderRes, couponRes] = await Promise.allSettled([
        axios.get(`${backendUrl}/api/product/list`, { headers: { token } }),
        axios.post(`${backendUrl}/api/order/list`, {}, { headers: { token } }),
        axios.get(`${backendUrl}/api/coupon/list`, { headers: { token } }),
      ]);

      if (productRes.status === "fulfilled" && productRes.value.data?.success) {
        setProducts(productRes.value.data.products || []);
      }

      if (orderRes.status === "fulfilled" && orderRes.value.data?.success) {
        setOrders(
          [...(orderRes.value.data.orders || [])].sort(
            (a, b) => Number(b.date) - Number(a.date)
          )
        );
      }

      if (couponRes.status === "fulfilled" && couponRes.value.data?.success) {
        setCoupons(couponRes.value.data.coupons || []);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => isWithinDays(order.date, range)),
    [orders, range]
  );

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((product) => map.set(String(product._id), product));
    return map;
  }, [products]);

  const orderItems = useMemo(
    () => filteredOrders.flatMap((order) => normalizeOrderItems(order)),
    [filteredOrders]
  );

  const revenue = filteredOrders.reduce(
    (sum, order) => sum + Number(order.amount || 0),
    0
  );
  const ordersCount = filteredOrders.length;
  const checkoutStarts = ordersCount;
  const addToCart = orderItems.reduce((sum, item) => sum + item.qty, 0);
  const productViews = 0;
  const visitors = 0;
  const sessions = 0;
  const conversionRate =
    sessions > 0 ? `${((ordersCount / sessions) * 100).toFixed(1)}%` : "Ready";

  const bestSellers = useMemo(() => {
    const map = new Map();
    orderItems.forEach((item) => {
      const key = item.productId || item.title;
      const current = map.get(key) || {
        title: item.title,
        image: item.image,
        units: 0,
        revenue: 0,
      };
      current.units += item.qty;
      current.revenue += item.subtotal || item.qty * item.unitPrice;

      const product = productMap.get(item.productId);
      if (product) {
        current.title = product.name || current.title;
        current.image = pickImage(product.image) || current.image;
      }

      map.set(key, current);
    });

    const sold = [...map.values()].sort((a, b) => b.units - a.units);
    if (sold.length) return sold.slice(0, 5);

    return products
      .filter((product) => product.bestseller)
      .slice(0, 5)
      .map((product) => ({
        title: product.name,
        image: pickImage(product.image),
        units: 0,
        revenue: 0,
      }));
  }, [orderItems, productMap, products]);

  const lowStock = useMemo(
    () =>
      products
        .map((product) => ({
          ...product,
          stockNumber:
            product.stock === undefined || product.stock === null || product.stock === ""
              ? null
              : Number(product.stock),
        }))
        .filter(
          (product) =>
            product.outOfStock ||
            (product.stockNumber !== null &&
              Number.isFinite(product.stockNumber) &&
              product.stockNumber <= 5)
        )
        .sort((a, b) => Number(a.stockNumber || 0) - Number(b.stockNumber || 0))
        .slice(0, 6),
    [products]
  );

  const outOfStockCount = lowStock.filter(
    (product) => product.outOfStock || Number(product.stockNumber || 0) <= 0
  ).length;

  const couponUsage = filteredOrders.filter((order) => order.coupon).length;
  const activeCoupons = coupons.filter((coupon) => coupon.isActive).length;
  const contactMessages = "Email only";

  const trend = useMemo(() => {
    const days = range === 1 ? 1 : range === 7 ? 7 : 30;
    const points = [...Array(days)].map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - index - 1));
      const key = date.toDateString();
      const dayOrders = filteredOrders.filter(
        (order) => getDate(order.date).toDateString() === key
      );
      return {
        label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
      };
    });
    return points;
  }, [filteredOrders, range]);

  const maxRevenue = Math.max(1, ...trend.map((point) => point.revenue));
  const maxOrders = Math.max(1, ...trend.map((point) => point.orders));

  const revenuePath = trend
    .map((point, index) => {
      const x = trend.length === 1 ? 280 : (index / (trend.length - 1)) * 560;
      const y = 190 - (point.revenue / maxRevenue) * 150;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const ordersPath = trend
    .map((point, index) => {
      const x = trend.length === 1 ? 280 : (index / (trend.length - 1)) * 560;
      const y = 190 - (point.orders / maxOrders) * 120;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const liveActivity = [
    ...filteredOrders.slice(0, 4).map((order) => ({
      label: "Order",
      title: `${order.address?.firstName || "Customer"} placed ${order.items?.length || 0} item order`,
      detail: `${formatPrice(order.amount)} / ${order.paymentMethod || "COD"}`,
    })),
    ...lowStock.slice(0, 3).map((product) => ({
      label: product.outOfStock ? "Out of Stock" : "Low Stock",
      title: product.name,
      detail: `${product.stockNumber ?? 0} in stock`,
    })),
  ].slice(0, 6);

  const kpis = [
    { label: "Visitors", value: visitors, note: "tracking ready" },
    { label: "Sessions", value: sessions, note: "tracking ready" },
    { label: "Product Views", value: productViews, note: "tracking ready" },
    { label: "Add To Cart", value: addToCart, note: "from orders" },
    { label: "Checkout Starts", value: checkoutStarts, note: "confirmed orders" },
    { label: "Orders", value: ordersCount, note: "selected range" },
    { label: "Revenue", value: formatPrice(revenue), note: "selected range" },
    { label: "Conversion Rate", value: conversionRate, note: "needs visitor tracking" },
  ];

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <main className="mx-auto w-full max-w-[1480px] text-[#1f1b17]">
      <div className="mb-5 flex flex-col gap-3 border-b border-[#eadfd2] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b9945d]">
            Business Overview
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none text-[#1f1b17]">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#7d6756]">
            Track visits, sales, stock, and customer activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[1, 7, 30].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRange(days)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                range === days
                  ? "border-[#1f1b17] bg-[#1f1b17] text-white"
                  : "border-[#d8c2a5] text-[#6f5844] hover:border-[#1f1b17]"
              }`}
            >
              {days === 1 ? "Today" : `${days} Days`}
            </button>
          ))}
          <button
            type="button"
            onClick={loadDashboard}
            className="rounded-full border border-[#d8c2a5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
          >
            Refresh
          </button>
          <button
            type="button"
            className="rounded-full bg-[#1f1b17] px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c49a5e]"
          >
            Export
          </button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={cardClass}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
              {kpi.label}
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="font-serif text-3xl leading-none text-[#1f1b17]">
                {typeof kpi.value === "number" ? formatCompact(kpi.value) : kpi.value}
              </p>
              <span className="rounded-full border border-[#dfd1c1] bg-[#fffdf9] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7d6756]">
                {kpi.note}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-5 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
                Sales Trend
              </p>
              <h2 className="font-serif text-3xl text-[#1f1b17]">
                Revenue and Orders
              </h2>
            </div>
            <div className="flex gap-3 text-xs text-[#7d6756]">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-5 rounded-full bg-[#c49a5e]" />
                Revenue
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-5 rounded-full bg-[#7b2d2d]" />
                Orders
              </span>
            </div>
          </div>

          <div className="h-[260px] rounded-md border border-[#eadfd2] bg-[#fffdf9] p-4">
            <svg viewBox="0 0 560 220" className="h-full w-full" role="img" aria-label="Revenue and orders trend">
              {[40, 80, 120, 160, 200].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="560"
                  y2={y}
                  stroke="#eadfd2"
                  strokeWidth="1"
                />
              ))}
              <path d={revenuePath} fill="none" stroke="#c49a5e" strokeWidth="4" strokeLinecap="round" />
              <path d={ordersPath} fill="none" stroke="#7b2d2d" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 8" />
            </svg>
          </div>
        </div>

        <aside className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-5 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
            Live Store Activity
          </p>
          <div className="mt-4 space-y-3">
            {liveActivity.length ? (
              liveActivity.map((activity, index) => (
                <div key={`${activity.title}-${index}`} className="rounded-md border border-[#eadfd2] bg-[#fffdf9] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a8068]">
                    {activity.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#1f1b17]">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-xs text-[#7d6756]">{activity.detail}</p>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-[#eadfd2] bg-[#fffdf9] p-4 text-sm text-[#7d6756]">
                Activity will appear here when orders and analytics events arrive.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-5 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
                Best Sellers
              </p>
              <h2 className="font-serif text-3xl text-[#1f1b17]">
                Product Performance
              </h2>
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-[#eadfd2] bg-[#fffdf9]">
            {bestSellers.map((product, index) => (
              <div
                key={`${product.title}-${index}`}
                className="grid grid-cols-[54px_minmax(0,1fr)_90px_100px] items-center gap-3 border-b border-[#eadfd2] p-3 last:border-b-0"
              >
                <div className="h-12 w-12 overflow-hidden rounded-md bg-[#eee4d9]">
                  {product.image ? (
                    <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1f1b17]">
                    {product.title}
                  </p>
                  <p className="text-xs text-[#7d6756]">Units sold</p>
                </div>
                <p className="text-sm font-semibold text-[#1f1b17]">
                  {product.units}
                </p>
                <p className="text-right text-sm font-semibold text-[#7b2d2d]">
                  {formatPrice(product.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-5 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
              Low Stock Alerts
            </p>
            <div className="mt-4 space-y-2">
              {lowStock.length ? (
                lowStock.map((product) => (
                  <div key={product._id} className="flex items-center justify-between gap-3 rounded-md border border-[#eadfd2] bg-[#fffdf9] p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1f1b17]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#7d6756]">
                        {product.subCategory || product.category}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                      product.outOfStock || Number(product.stockNumber || 0) <= 0
                        ? "bg-[#7b2d2d] text-white"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {product.outOfStock || Number(product.stockNumber || 0) <= 0
                        ? "Out of Stock"
                        : `${product.stockNumber} left`}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-md border border-[#eadfd2] bg-[#fffdf9] p-4 text-sm text-[#7d6756]">
                  No low stock alerts.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className={cardClass}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                Out of Stock
              </p>
              <p className="mt-2 font-serif text-3xl text-[#1f1b17]">
                {outOfStockCount}
              </p>
            </div>
            <div className={cardClass}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                Coupon Usage
              </p>
              <p className="mt-2 font-serif text-3xl text-[#1f1b17]">
                {couponUsage}
              </p>
              <p className="mt-1 text-xs text-[#7d6756]">
                {activeCoupons} active coupons
              </p>
            </div>
            <div className={cardClass}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                Contact Messages
              </p>
              <p className="mt-2 font-serif text-3xl text-[#1f1b17]">
                {contactMessages}
              </p>
              <p className="mt-1 text-xs text-[#7d6756]">
                Contact form currently sends email, not stored analytics.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
