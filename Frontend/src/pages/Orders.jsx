import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { FiArrowRight, FiClock, FiPackage, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import { ShimmerImage } from "../componens/Skeletons";
import { ShopContext } from "../context/ShopContext";

const LAST_ORDER_STORAGE_KEY = "sotra_last_order";

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
      pill: "border-green-500 text-green-700",
    };
  }

  if (key.includes("cancel")) {
    return {
      dot: "bg-red-600",
      pill: "border-red-500 text-red-700",
    };
  }

  return {
    dot: "bg-black",
    pill: "border-black text-black",
  };
};

const pickOrderImage = (image) => {
  if (Array.isArray(image)) return image[0] || "";
  return image || "";
};

const loadGuestOrders = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(LAST_ORDER_STORAGE_KEY) || "null");
    return saved ? [saved] : [];
  } catch {
    return [];
  }
};

const Orders = () => {
  const { backendUrl, currency, token, navigate } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  const loadOrderData = useCallback(async () => {
    try {
      if (!token) {
        setOrderData(loadGuestOrders());
        return;
      }

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
  }, [backendUrl, token]);

  useEffect(() => {
    loadOrderData();
  }, [loadOrderData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const renderEmptyState = () => (
    <div className="mx-auto mt-10 max-w-md border-y border-black/15 bg-white p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center border border-black/20 text-black">
        <FiPackage className="h-6 w-6" />
      </div>
      <p className="mt-5 text-2xl font-black uppercase">
        No orders yet.
      </p>
      <p className="mt-3 text-sm leading-7 text-black/55">
        When you place an order, its status and details will appear here. Log in to keep a full order history.
      </p>
      <button
        type="button"
        onClick={() => navigate("/collection")}
        className="mt-6 inline-flex h-12 items-center justify-center gap-3 bg-black px-7 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#222]"
      >
        Shop Collection
        <FiArrowRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-white px-4 pb-14 pt-10 text-black sm:px-6 lg:px-10">
      <section className="mx-auto max-w-[1300px]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/45">
            SotraBrand
          </p>
          <h1 className="mt-3 text-5xl font-black uppercase leading-none sm:text-6xl lg:text-7xl">
            My Orders
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-black/55 sm:text-lg">
            Track your SotraBrand orders from placement to delivery.
          </p>
        </div>

        {orderData.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="mt-12 space-y-5">
            {orderData.map((order, index) => {
              const status = order.status || "Order Placed";
              const statusStyle = getStatusStyle(status);
              const orderNumber = order._id
                ? `#${String(order._id).slice(-6).toUpperCase()}`
                : `#SO-${String(index + 1).padStart(4, "0")}`;
              const deliveryZone = order.delivery?.zone || (Number(order.shipping) === 2 ? "Tripoli" : "Lebanon");
              const deliveryNote = order.delivery?.note || "";

              return (
                <article
                  key={order._id || index}
                  className="border border-black/15 bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-4 border-b border-black/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/50">
                        Order {orderNumber}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-black/55">
                        <span className="inline-flex items-center gap-2">
                          <FiClock className="h-4 w-4 text-black" />
                          {formatDate(order.date)}
                        </span>
                        <span>/</span>
                        <span>{order.paymentMethod || "COD"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-2 border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${statusStyle.pill}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                        {status}
                      </span>
                      <button
                        type="button"
                        onClick={loadOrderData}
                        className="inline-flex items-center gap-2 border border-black/25 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black hover:bg-black hover:text-white"
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
                      const title = item.title || item.name || "SotraBrand item";

                      return (
                        <div
                          key={`${title}-${itemIndex}`}
                          className="flex flex-col gap-4 border border-black/15 bg-white p-3 sm:flex-row sm:items-center"
                        >
                          <div className="h-24 w-24 flex-none overflow-hidden bg-white">
                            <ShimmerImage
                              src={pickOrderImage(item.image) || "/placeholder.png"}
                              alt={title}
                              className="h-full w-full object-cover"
                              wrapperClassName="h-full w-full"
                              skeletonClassName="bg-[#EAEAEA]"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xl font-black uppercase leading-tight text-black">
                              {title}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {[
                                item.perfumeType || item.concentration,
                                item.size ? `Fit ${item.size}` : null,
                                item.colorLabel || item.selectedColor || item.color,
                                `Qty ${qty}`,
                              ]
                                .filter(Boolean)
                                .map((label) => (
                                  <span
                                    key={label}
                                    className="border border-black/20 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-black/65"
                                  >
                                    {label}
                                  </span>
                                ))}
                            </div>
                            {(item.colorImage || item.selectedColorImage) && (
                              <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-black/45">
                                <span className="h-6 w-6 overflow-hidden rounded-full border border-black/20 bg-white">
                                  <img
                                    src={item.colorImage || item.selectedColorImage}
                                    alt={item.colorLabel || item.selectedColor || item.color || "Selected color"}
                                    className="h-full w-full object-cover"
                                  />
                                </span>
                                Selected Color
                              </div>
                            )}
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/45">
                              Price
                            </p>
                            <p className="sotra-price mt-1 text-lg font-bold text-black">
                              {formatPrice(price, currency)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 grid gap-4 border-t border-black/15 pt-5 lg:grid-cols-[1fr_320px]">
                    <div className="bg-white p-4 text-sm leading-7 text-black/55">
                      <p className="font-bold uppercase tracking-[0.14em] text-black">
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
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-black">
                        {deliveryZone} delivery{deliveryNote ? ` / ${deliveryNote}` : ""}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-black/55">
                        <span>Subtotal</span>
                        <span className="sotra-price font-bold text-black">
                          {formatPrice(order.subtotal ?? 0, currency)}
                        </span>
                      </div>
                      {Number(order.discount || 0) > 0 && (
                        <div className="flex items-center justify-between text-green-700">
                          <span>Discount</span>
                          <span className="sotra-price font-bold">
                            - {formatPrice(order.discount, currency)}
                          </span>
                        </div>
                      )}
                      {Number(order.shipping || 0) > 0 && (
                        <div className="flex items-center justify-between text-black/55">
                          <span>Delivery</span>
                          <span className="sotra-price font-bold text-black">
                            {formatPrice(order.shipping, currency)}
                          </span>
                        </div>
                      )}
                      <div className="mt-3 flex items-end justify-between border-t border-black/15 pt-3">
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-black/45">
                          Total
                        </span>
                        <span className="sotra-price text-3xl font-black text-black">
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
      </section>
    </main>
  );
};

export default Orders;
