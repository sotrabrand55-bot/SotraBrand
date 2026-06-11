import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import { AdminOrdersSkeleton } from "../components/AdminSkeletons";

const statusOptions = [
  "Order Placed",
  "Processing",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
  "Cancelled",
  "Out Of Stock",
];

const statClass =
  "rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[0_14px_34px_rgba(62,45,28,0.06)]";

const formatPrice = (value) => {
  const amount = Number(value);
  return `${currency}${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
};

const shortOrderId = (id = "") => {
  const text = String(id);
  return text ? `BR-${text.slice(-6).toUpperCase()}` : "BR-ORDER";
};

const formatDate = (value) => {
  const date = new Date(Number(value) || value || Date.now());
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const formatDateTime = (value) => {
  const date = new Date(Number(value) || value || Date.now());
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

const pickImage = (image) => {
  if (Array.isArray(image)) {
    const first = image[0];
    if (typeof first === "string") return first;
    return first?.url || first?.path || "";
  }
  if (typeof image === "string") return image;
  return image?.url || image?.path || "";
};

const normalizeItems = (order) => {
  const raw =
    Array.isArray(order.itemsDetailed) && order.itemsDetailed.length
      ? order.itemsDetailed
      : Array.isArray(order.items)
        ? order.items
        : [];

  return raw.map((item, index) => {
    const quantity = Number(item.quantity ?? item.qty ?? item.count ?? 0);
    const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
    const subtotal = Number(item.subtotal ?? unitPrice * quantity);

    return {
      key: `${item.productId || item._id || index}-${index}`,
      thumb:
        item.productThumb ||
        item.thumbnail ||
        pickImage(item.image) ||
        pickImage(item.product?.image),
      name:
        item.title ||
        item.productName ||
        item.name ||
        item.product?.name ||
        "Product",
      perfumeType:
        item.perfumeType ??
        item.selectedPerfumeType ??
        item.concentration ??
        null,
      size: item.size ?? item.selectedSize ?? item.variantSize ?? null,
      color: item.color ?? item.selectedColor ?? item.variantColor ?? null,
      quantity,
      unitPrice,
      subtotal,
    };
  });
};

const getCustomerName = (order) => {
  const first = order?.address?.firstName || "";
  const last = order?.address?.lastName || "";
  return `${first} ${last}`.trim() || "Customer";
};

const getOrderTotals = (order) => {
  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount || 0);
  const shipping = Number(order.shipping || 0);
  const amount = Number(order.amount || 0);

  return {
    subtotal,
    discount,
    shipping,
    amount,
  };
};

const statusTone = (status = "") => {
  const key = status.toLowerCase();
  if (key.includes("deliver")) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (key.includes("cancel") || key.includes("stock")) return "border-[#7b2d2d]/25 bg-rose-50 text-[#7b2d2d]";
  if (key.includes("ship") || key.includes("out for")) return "border-blue-200 bg-blue-50 text-blue-700";
  if (key.includes("processing") || key.includes("pack")) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-[#d4d4d4] bg-[#ffffff] text-[#374151]";
};

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  const selectedOrder = useMemo(
    () => orders.find((order) => order._id === selectedId) || orders[0] || null,
    [orders, selectedId]
  );

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pending = orders.filter((order) => {
      const status = String(order.status || "").toLowerCase();
      return !status.includes("deliver") && !status.includes("cancel");
    }).length;
    const shipped = orders.filter((order) => {
      const status = String(order.status || "").toLowerCase();
      return status.includes("ship") || status.includes("out for");
    }).length;
    const delivered = orders.filter((order) =>
      String(order.status || "").toLowerCase().includes("deliver")
    ).length;
    const cancelled = orders.filter((order) =>
      String(order.status || "").toLowerCase().includes("cancel")
    ).length;
    const revenue = orders.reduce(
      (sum, order) => sum + Number(order.amount || 0),
      0
    );

    return [
      { label: "Total Orders", value: totalOrders },
      { label: "Pending", value: pending },
      { label: "Shipped", value: shipped },
      { label: "Delivered", value: delivered },
      { label: "Cancelled", value: cancelled },
      { label: "Revenue", value: formatPrice(revenue) },
    ];
  }, [orders]);

  const fetchAllOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );

      if (response.data?.success) {
        const sorted = [...(response.data.orders || [])]
          .sort((a, b) => Number(b.date) - Number(a.date))
          .map((order) => ({
            ...order,
            subtotal: Number(order.subtotal || 0),
            discount: Number(order.discount || 0),
            shipping: Number(order.shipping || 0),
            amount: Number(order.amount || 0),
            coupon: order.coupon || null,
          }));

        setOrders(sorted);
        setSelectedId((current) =>
          current && sorted.some((order) => order._id === current)
            ? current
            : sorted[0]?._id || ""
        );
      } else {
        toast.error(response.data?.message || "Failed to load orders");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (status, orderId) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status },
        { headers: { token } }
      );

      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status } : order
          )
        );
        toast.success("Status updated");
      } else {
        toast.error(res.data?.message || "Status update failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm("Delete this order?")) return;
    try {
      await axios.delete(`${backendUrl}/api/order/delete/${orderId}`, {
        headers: { token },
      });
      toast.success("Order deleted");
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      setSelectedId((current) => (current === orderId ? "" : current));
    } catch (firstError) {
      if (firstError?.response?.status === 404) {
        try {
          const res = await axios.post(
            `${backendUrl}/api/order/delete`,
            { orderId },
            { headers: { token } }
          );
          if (res.data?.success) {
            toast.success("Order deleted");
            setOrders((prev) => prev.filter((order) => order._id !== orderId));
            setSelectedId((current) => (current === orderId ? "" : current));
            return;
          }
          toast.error(res.data?.message || "Delete failed");
        } catch (secondError) {
          toast.error(secondError?.response?.data?.message || secondError.message);
        }
      } else {
        toast.error(firstError?.response?.data?.message || firstError.message);
      }
    }
  };

  const exportOrders = () => {
    const header = ["order", "date", "customer", "status", "payment", "method", "items", "total", "note"];
    const rows = orders.map((order) => [
      shortOrderId(order._id),
      formatDateTime(order.date),
      getCustomerName(order),
      order.status || "Order Placed",
      order.payment ? "Paid" : "Pending",
      order.paymentMethod || "-",
      normalizeItems(order).reduce((sum, item) => sum + item.quantity, 0),
      Number(order.amount || 0).toFixed(2),
      order.customerNote || "",
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "be-radiant-nancy-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return <AdminOrdersSkeleton />;
  }

  return (
    <main className="mx-auto w-full max-w-[1480px] text-[#000000]">
      <div className="mb-5 flex flex-col gap-3 border-b border-[#e5e5e5] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c47b92]">
            Order Manager
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none text-[#000000]">
            Orders
          </h1>
          <p className="mt-2 text-sm text-[#4b5563]">
            Track customer orders, payment status, and fulfillment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchAllOrders}
            className="rounded-full border border-[#d4d4d4] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#374151] transition hover:border-[#000000] hover:text-[#000000]"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={exportOrders}
            disabled={!orders.length}
            className="rounded-full bg-[#000000] px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#000000] disabled:cursor-not-allowed disabled:bg-[#4b5563]"
          >
            Export
          </button>
        </div>
      </div>

      <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
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

      {!orders.length ? (
        <section className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-10 text-center shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
          <p className="font-serif text-3xl text-[#000000]">No orders yet</p>
          <p className="mt-3 text-sm text-[#4b5563]">
            New customer checkout activity will appear here.
          </p>
        </section>
      ) : (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-4">
            {orders.map((order) => {
              const items = normalizeItems(order);
              const firstItems = items.slice(0, 3);
              const itemCount = items.reduce((sum, item) => sum + item.quantity, 0) || items.length;
              const totals = getOrderTotals(order);
              const selected = selectedOrder?._id === order._id;

              return (
                <article
                  key={order._id}
                  className={`rounded-md border bg-[#ffffff] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] transition ${
                    selected ? "border-[#000000]" : "border-[#e5e5e5]"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedId(order._id)}
                      className="min-w-0 text-left"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c47b92]">
                        Order {shortOrderId(order._id)}
                      </p>
                      <h2 className="mt-1 truncate font-serif text-2xl leading-tight text-[#000000]">
                        {getCustomerName(order)}
                      </h2>
                      <p className="mt-1 text-xs text-[#4b5563]">
                        {formatDate(order.date)} / {itemCount} {itemCount === 1 ? "item" : "items"}
                      </p>
                    </button>

                    <div className="flex flex-wrap gap-1.5 lg:justify-end">
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusTone(order.status)}`}>
                        {order.status || "Order Placed"}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        order.payment
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-[#7b2d2d]/25 bg-rose-50 text-[#7b2d2d]"
                      }`}>
                        {order.payment ? "Paid" : "Payment Pending"}
                      </span>
                      <span className="rounded-full border border-[#d4d4d4] bg-[#ffffff] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#374151]">
                        {order.paymentMethod || "COD"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_210px]">
                    <div className="min-w-0">
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {firstItems.map((item) => (
                          <div
                            key={item.key}
                            className="flex min-w-[210px] items-center gap-3 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-2"
                          >
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#EAEAEA]">
                              {item.thumb ? (
                                <img
                                  src={item.thumb}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="grid h-full w-full place-items-center text-[9px] uppercase tracking-[0.12em] text-[#9ca3af]">
                                  No image
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#000000]">
                                {item.name}
                              </p>
                              <p className="mt-1 truncate text-[11px] text-[#4b5563]">
                                {[item.perfumeType, item.size].filter(Boolean).join(" / ") || "-"} / Qty {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                        {items.length > firstItems.length && (
                          <button
                            type="button"
                            onClick={() => setSelectedId(order._id)}
                            className="min-w-[96px] rounded-md border border-[#e5e5e5] bg-[#ffffff] px-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#4b5563]"
                          >
                            +{items.length - firstItems.length} more
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-3">
                      <div className="flex items-center justify-between text-xs text-[#4b5563]">
                        <span>Subtotal</span>
                        <span className="font-semibold text-[#000000]">
                          {formatPrice(totals.subtotal)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-[#4b5563]">
                        <span>Delivery</span>
                        <span className="font-semibold text-[#000000]">
                          {formatPrice(totals.shipping)}
                        </span>
                      </div>
                      {totals.discount > 0 && (
                        <div className="mt-2 flex items-center justify-between text-xs text-[#7b2d2d]">
                          <span>Discount</span>
                          <span className="font-semibold">
                            -{formatPrice(totals.discount)}
                          </span>
                        </div>
                      )}
                      <div className="mt-3 border-t border-[#e5e5e5] pt-3">
                        <div className="flex items-end justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
                            Total
                          </span>
                          <span className="font-serif text-2xl text-[#000000]">
                            {formatPrice(totals.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {order.customerNote && (
                    <div className="mt-4 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
                        Customer Note
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#374151]">
                        {order.customerNote}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <select
                      value={order.status || "Order Placed"}
                      onChange={(event) => statusHandler(event.target.value, order._id)}
                      className="min-h-10 rounded-md border border-[#d4d4d4] bg-[#ffffff] px-3 py-2 text-sm text-[#000000] outline-none focus:border-[#000000] focus:ring-2 focus:ring-[#000000]/15"
                    >
                      {[...new Set([order.status, ...statusOptions].filter(Boolean))].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId(order._id)}
                        className="rounded-full border border-[#d4d4d4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#374151] transition hover:border-[#000000] hover:text-[#000000]"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(order._id)}
                        className="rounded-full border border-[#7b2d2d]/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7b2d2d] transition hover:border-[#7b2d2d] hover:bg-[#7b2d2d] hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <OrderDetails
              order={selectedOrder}
              onStatusChange={statusHandler}
              onDelete={handleDelete}
            />
          </aside>
        </section>
      )}
    </main>
  );
};

const OrderDetails = ({ order, onStatusChange, onDelete }) => {
  if (!order) {
    return (
      <section className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-6 text-sm text-[#4b5563] shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
        Select an order to view details.
      </section>
    );
  }

  const items = normalizeItems(order);
  const totals = getOrderTotals(order);
  const address = order.address || {};

  return (
    <section className="rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c47b92]">
            Order Detail
          </p>
          <h2 className="mt-1 font-serif text-3xl leading-tight text-[#000000]">
            {shortOrderId(order._id)}
          </h2>
          <p className="mt-1 text-xs text-[#4b5563]">
            {formatDateTime(order.date)}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusTone(order.status)}`}>
          {order.status || "Order Placed"}
        </span>
      </div>

      <div className="mt-5 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
          Customer
        </p>
        <p className="mt-2 font-serif text-2xl text-[#000000]">
          {getCustomerName(order)}
        </p>
        <div className="mt-2 space-y-1 text-sm leading-6 text-[#4b5563]">
          {address.phone && <p>{address.phone}</p>}
          {address.email && <p>{address.email}</p>}
          <p>
            {[address.addressLine1, address.addressLine2, address.street]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p>
            {[address.building && `Building ${address.building}`, address.floor && `Floor ${address.floor}`]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p>
            {[address.city, address.state, address.zipCode, address.country]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
          Payment
        </p>
        <div className="mt-3 space-y-2 text-sm text-[#4b5563]">
          <div className="flex items-center justify-between">
            <span>Method</span>
            <span className="font-semibold text-[#000000]">
              {order.paymentMethod || "COD"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Status</span>
            <span className="font-semibold text-[#000000]">
              {order.payment ? "Paid" : "Payment Pending"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Coupon</span>
            <span className="font-semibold text-[#000000]">
              {order.coupon || "None"}
            </span>
          </div>
        </div>
      </div>

      {order.customerNote && (
        <div className="mt-4 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
            Customer Note
          </p>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#374151]">
            {order.customerNote}
          </p>
        </div>
      )}

      <div className="mt-4 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
          Items
        </p>
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#EAEAEA]">
                {item.thumb ? (
                  <img
                    src={item.thumb}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[9px] uppercase tracking-[0.12em] text-[#9ca3af]">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#000000]">
                  {item.name}
                </p>
                <p className="mt-1 text-xs text-[#4b5563]">
                  {[item.perfumeType, item.size, item.color].filter(Boolean).join(" / ") || "-"} / Qty {item.quantity}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#000000]">
                  {formatPrice(item.subtotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-[#4b5563]">
            <span>Subtotal</span>
            <span className="font-semibold text-[#000000]">
              {formatPrice(totals.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#4b5563]">
            <span>Delivery</span>
            <span className="font-semibold text-[#000000]">
              {formatPrice(totals.shipping)}
            </span>
          </div>
          {totals.discount > 0 && (
            <div className="flex items-center justify-between text-[#7b2d2d]">
              <span>Discount {order.coupon ? `(${order.coupon})` : ""}</span>
              <span className="font-semibold">-{formatPrice(totals.discount)}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-[#e5e5e5] pt-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
            Total
          </span>
          <span className="font-serif text-3xl text-[#000000]">
            {formatPrice(totals.amount)}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
          Update Status
        </label>
        <select
          value={order.status || "Order Placed"}
          onChange={(event) => onStatusChange(event.target.value, order._id)}
          className="mt-2 min-h-10 w-full rounded-md border border-[#d4d4d4] bg-[#ffffff] px-3 py-2 text-sm text-[#000000] outline-none focus:border-[#000000] focus:ring-2 focus:ring-[#000000]/15"
        >
          {[...new Set([order.status, ...statusOptions].filter(Boolean))].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onDelete(order._id)}
          className="mt-3 w-full rounded-full border border-[#7b2d2d]/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7b2d2d] transition hover:border-[#7b2d2d] hover:bg-[#7b2d2d] hover:text-white"
        >
          Delete Order
        </button>
      </div>
    </section>
  );
};

export default Orders;
