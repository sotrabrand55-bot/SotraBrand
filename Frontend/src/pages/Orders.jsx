import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  FiArrowRight,
  FiClock,
  FiPackage,
  FiRefreshCw,
} from "react-icons/fi";
import { toast } from "react-toastify";
import LevonOrnament from "../componens/LevonOrnament";
import { ShimmerImage } from "../componens/Skeletons";
import { ShopContext } from "../context/ShopContext";

const formatPrice = (value, currency = "$") => {
  const amount = Number(value);
  return `${currency}${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Recent order";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusStyle = (status = "") => {
  const key = status.toLowerCase();

  if (key.includes("delivered")) {
    return {
      dot: "bg-green-500",
      pill: "border-green-200 bg-green-50 text-green-700",
    };
  }

  if (key.includes("ship") || key.includes("way")) {
    return {
      dot: "bg-[#c49a5e]",
      pill: "border-[#ead3af] bg-[#fff8eb] text-[#8a6530]",
    };
  }

  if (key.includes("cancel")) {
    return {
      dot: "bg-[#7b2d2d]",
      pill: "border-red-200 bg-red-50 text-[#7b2d2d]",
    };
  }

  return {
    dot: "bg-[#7b2d2d]",
    pill: "border-[#eadfd2] bg-[#fffaf4] text-[#1f1b17]",
  };
};

const pickOrderImage = (image) => {
  if (Array.isArray(image)) return image[0] || "";
  return image || "";
};

const Orders = () => {
  const { backendUrl, currency, token, navigate } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(
        `${backendUrl}/api/order/userorder`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrderData([...(response.data.orders || [])].reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  const renderEmptyState = ({ loginRequired = false } = {}) => (
    <div className="mx-auto mt-10 max-w-md rounded-md border border-[#eadfd2] bg-white/72 p-8 text-center shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#d8c8b5] text-[#c49a5e]">
        <FiPackage className="h-6 w-6" />
      </div>
      <p className="mt-5 font-serif text-2xl">
        {loginRequired ? "Sign in to view orders." : "No orders yet."}
      </p>
      <p className="mt-3 text-sm leading-7 text-[#7d6756]">
        {loginRequired
          ? "Your Levon order history appears after you log in."
          : "When you place an order, its status and details will appear here."}
      </p>
      <button
        type="button"
        onClick={() => navigate(loginRequired ? "/login" : "/collection")}
        className="mt-6 inline-flex items-center justify-center gap-3 rounded-full bg-[#1f1b17] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#c49a5e]"
      >
        {loginRequired ? "Login" : "Shop Collection"}
        <FiArrowRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fffaf4] px-4 pb-14 pt-10 text-[#1f1b17] sm:px-[5vw] md:px-[7vw] lg:px-[3vw]">
      <section className="mx-auto max-w-[1300px]">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex w-fit items-center gap-3 text-[#c49a5e]">
            <span className="h-px w-10 bg-current" />
            <span className="h-2.5 w-2.5 rotate-45 bg-current" />
            <span className="h-px w-10 bg-current" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8068]">
            Your History
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none sm:text-6xl lg:text-7xl">
            My Orders
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#7d6756] sm:text-lg">
            Track your Levon scents from placement to delivery.
          </p>
        </div>

        {!token ? (
          renderEmptyState({ loginRequired: true })
        ) : orderData.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="mt-12 space-y-5">
            {orderData.map((order, index) => {
              const status = order.status || "Order Placed";
              const statusStyle = getStatusStyle(status);
              const orderNumber = order._id
                ? `#${String(order._id).slice(-6).toUpperCase()}`
                : `#LV-${String(index + 1).padStart(4, "0")}`;

              return (
                <article
                  key={order._id || index}
                  className="rounded-md border border-[#eadfd2] bg-white/64 p-5 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-6"
                >
                  <div className="flex flex-col gap-4 border-b border-[#eadfd2] pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                        Order {orderNumber}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#7d6756]">
                        <span className="inline-flex items-center gap-2">
                          <FiClock className="h-4 w-4 text-[#c49a5e]" />
                          {formatDate(order.date)}
                        </span>
                        <span className="text-[#d8c8b5]">/</span>
                        <span>{order.paymentMethod || "COD"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${statusStyle.pill}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                        {status}
                      </span>
                      <button
                        type="button"
                        onClick={loadOrderData}
                        className="inline-flex items-center gap-2 rounded-full border border-[#dfd1c1] bg-[#fffaf4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f1b17] transition hover:border-[#c49a5e]"
                      >
                        <FiRefreshCw className="h-4 w-4" />
                        Track
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {(order.items || []).map((item, itemIndex) => {
                      const qty = Number(item.qty ?? item.quantity ?? 1);
                      const price = Number(item.unitPrice ?? item.price ?? 0);
                      const title = item.title || item.name || "Levon item";

                      return (
                        <div
                          key={`${title}-${itemIndex}`}
                          className="flex flex-col gap-4 rounded-md border border-[#eadfd2] bg-[#fffaf4] p-3 sm:flex-row sm:items-center"
                        >
                          <div className="h-24 w-24 flex-none overflow-hidden rounded-md bg-[#eadfd2]">
                            <ShimmerImage
                              src={pickOrderImage(item.image) || "/placeholder.png"}
                              alt={title}
                              className="h-full w-full object-cover"
                              wrapperClassName="h-full w-full"
                              skeletonClassName="bg-[#E9DFD3]"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-serif text-2xl leading-tight text-[#1f1b17]">
                              {title}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.size && (
                                <span className="rounded-full border border-[#dfd1c1] bg-white/58 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#746657]">
                                  {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="rounded-full border border-[#dfd1c1] bg-white/58 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#746657]">
                                  {item.color}
                                </span>
                              )}
                              <span className="rounded-full border border-[#dfd1c1] bg-white/58 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#746657]">
                                Qty {qty}
                              </span>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8068]">
                              Price
                            </p>
                            <p className="mt-1 text-lg font-semibold text-[#1f1b17]">
                              {formatPrice(price, currency)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 grid gap-4 border-t border-[#eadfd2] pt-5 lg:grid-cols-[1fr_320px]">
                    <div className="rounded-md bg-[#fffaf4]/70 p-4 text-sm leading-7 text-[#7d6756]">
                      <p className="font-semibold uppercase tracking-[0.14em] text-[#1f1b17]">
                        Delivery
                      </p>
                      <p className="mt-1">
                        {[
                          order.address?.addressLine1,
                          order.address?.street,
                          order.address?.city,
                          order.address?.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Delivery details saved with order."}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-[#7d6756]">
                        <span>Subtotal</span>
                        <span className="font-semibold text-[#1f1b17]">
                          {formatPrice(order.subtotal ?? 0, currency)}
                        </span>
                      </div>
                      {Number(order.discount || 0) > 0 && (
                        <div className="flex items-center justify-between text-green-700">
                          <span>Discount</span>
                          <span className="font-semibold">
                            - {formatPrice(order.discount, currency)}
                          </span>
                        </div>
                      )}
                      {Number(order.shipping || 0) > 0 && (
                        <div className="flex items-center justify-between text-[#7d6756]">
                          <span>Delivery</span>
                          <span className="font-semibold text-[#1f1b17]">
                            {formatPrice(order.shipping, currency)}
                          </span>
                        </div>
                      )}
                      <div className="mt-3 flex items-end justify-between border-t border-[#eadfd2] pt-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                          Total
                        </span>
                        <span className="font-serif text-3xl text-[#1f1b17]">
                          {formatPrice(order.amount ?? 0, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <LevonOrnament className="mt-10" />
      </section>
    </main>
  );
};

export default Orders;
