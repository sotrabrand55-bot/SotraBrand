/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiArrowRight,
  FiCheck,
  FiLock,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiTag,
  FiTruck,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { ShimmerImage } from "../componens/Skeletons";
import FireworksOverlay from "../componens/FireworksOverlay";
import wishMoneyLogo from "../assets/wish-money-logo.png";
import {
  getEffectiveProductPrice,
  getPrimaryProductImage,
} from "../utils/productMapping";

const isObjectId = (value) =>
  typeof value === "string" && /^[a-f0-9]{24}$/i.test(value);
const ORDER_NOTE_STORAGE_KEY = "nancy_order_note";
const isObject = (value) => value && typeof value === "object";
const isRealSize = (value) =>
  Boolean(value) &&
  !["default", "_no_size"].includes(String(value).toLowerCase());
const isRealOption = (value) =>
  Boolean(value) &&
  !["default", "_default", "_no_perfume_type"].includes(String(value).toLowerCase());
const formatPrice = (value, currency = "$") =>
  `${currency || "$"}${(Number(value) || 0).toFixed(2)}`;
const WISH_MONEY_NUMBER = "+96181238570";

const fieldClass =
  "mt-2 h-12 w-full border border-black/25 bg-white px-4 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black";
const labelClass =
  "text-[10px] font-bold uppercase tracking-[0.17em] text-black/65";
const getSavedOrderNote = () => {
  try {
    return localStorage.getItem(ORDER_NOTE_STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const CheckoutField = ({
  name,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = label,
}) => (
  <label className="block">
    <span className={labelClass}>
      {label}
      {!required && <span className="ml-2 font-medium text-black/35">Optional</span>}
    </span>
    <input
      required={required}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={fieldClass}
    />
  </label>
);

const Placeorder = () => {
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    delivery_fee,
    products,
    couponDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    currency,
  } = useContext(ShopContext);
  const [method, setMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [customerNote, setCustomerNote] = useState(getSavedOrderNote);
  const [submitting, setSubmitting] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Lebanon",
    city: "",
    state: "",
    zipCode: "",
    addressLine1: "",
    addressLine2: "",
    street: "",
    building: "",
    floor: "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    try {
      if (customerNote.trim()) {
        localStorage.setItem(ORDER_NOTE_STORAGE_KEY, customerNote);
      } else {
        localStorage.removeItem(ORDER_NOTE_STORAGE_KEY);
      }
    } catch {
      // Checkout still works when storage is unavailable.
    }
  }, [customerNote]);

  const cartRows = useMemo(() => {
    const result = [];
    if (!isObject(cartItems)) return result;

    Object.entries(cartItems).forEach(([productId, sizeMap]) => {
      if (!isObject(sizeMap)) return;
      const product = products?.find((item) => item._id === productId);
      if (!product) return;

      Object.entries(sizeMap).forEach(([size, value]) => {
        if (typeof value === "number" && value > 0) {
          result.push({ productId, product, size, color: null, perfumeType: null, quantity: value });
          return;
        }
        if (isObject(value)) {
          Object.entries(value).forEach(([color, quantityOrPerfumeMap]) => {
            if (typeof quantityOrPerfumeMap === "number") {
              const amount = Number(quantityOrPerfumeMap);
              if (Number.isFinite(amount) && amount > 0) {
                result.push({
                  productId,
                  product,
                  size,
                  color: isRealOption(color) ? color : null,
                  perfumeType: null,
                  quantity: amount,
                });
              }
              return;
            }

            if (!isObject(quantityOrPerfumeMap)) return;
            Object.entries(quantityOrPerfumeMap).forEach(([perfumeType, quantity]) => {
              const amount = Number(quantity);
              if (!Number.isFinite(amount) || amount <= 0) return;
              result.push({
                productId,
                product,
                size,
                color: isRealOption(color) ? color : null,
                perfumeType: isRealOption(perfumeType) ? perfumeType : null,
                quantity: amount,
              });
            });
          });
        }
      });
    });

    return result;
  }, [cartItems, products]);

  const subtotal = cartRows.reduce(
    (sum, row) => sum + getEffectiveProductPrice(row.product) * row.quantity,
    0
  );
  const discount = Number(couponDiscount || 0);
  const shipping = Number(delivery_fee || 0);
  const total = Math.max(0, subtotal - discount + shipping);
  const itemCount = cartRows.reduce((sum, row) => sum + row.quantity, 0);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter a coupon code");
    await applyCoupon(couponCode);
    setCouponCode("");
  };

  const buildItemsFromCart = () =>
    cartRows
      .filter((row) => isObjectId(row.productId))
      .map((row) => {
        const price = getEffectiveProductPrice(row.product);
        const stock =
          row.product?.stock === undefined ||
          row.product?.stock === null ||
          row.product?.stock === ""
            ? null
            : Number(row.product.stock);

        return {
          perfumeType:
            row.perfumeType ||
            (Array.isArray(row.product.perfumeTypes) ? row.product.perfumeTypes[0] : "") ||
            row.product.concentration ||
            "",
          productId: row.productId,
          size: isRealSize(row.size) ? row.size : null,
          color: row.color,
          quantity: row.quantity,
          title: row.product.name || row.product.title || "",
          name: row.product.name || row.product.title || "",
          price,
          unitPrice: price,
          lineTotal: price * row.quantity,
          image: getPrimaryProductImage(row.product),
          category: row.product.category || "",
          subCategory: row.product.subCategory || "",
          concentration:
            row.perfumeType ||
            (Array.isArray(row.product.perfumeTypes) ? row.product.perfumeTypes[0] : "") ||
            row.product.concentration ||
            "",
          stock: Number.isFinite(stock) ? stock : null,
        };
      });

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!token) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.info(
        <div className="space-y-1 leading-5">
          <p>Please log in before placing your order.</p>
          <p dir="rtl">يرجى تسجيل الدخول قبل إرسال طلبك.</p>
        </div>,
        { position: "top-center", autoClose: 2200 }
      );
      window.setTimeout(() => navigate("/login?mode=login&redirect=/place-order"), 900);
      return;
    }
    if (!cartRows.length) return toast.error("Your cart is empty.");

    const items = buildItemsFromCart();
    if (!items.length) {
      return toast.error("Your current preview products cannot be submitted yet.");
    }
    const missingSizeItem = items.find((item) => {
      const product = products?.find((entry) => entry._id === item.productId);
      const sizes = Array.isArray(product?.sizes)
        ? product.sizes.filter((size) => isRealSize(size))
        : [];
      return sizes.length > 0 && !item.size;
    });
    if (missingSizeItem) {
      return toast.error(`${missingSizeItem.title || "Product"} needs a size.`);
    }
    const overStockItem = items.find(
      (item) => item.stock !== null && item.quantity > item.stock
    );
    if (overStockItem) {
      return toast.error(
        `${overStockItem.title || "Product"} has only ${overStockItem.stock} in stock.`
      );
    }
    const orderSubtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let orderDiscount = 0;
    if (appliedCoupon?.type === "fixed") {
      orderDiscount = Number(appliedCoupon.value || 0);
    } else if (appliedCoupon?.type === "percentage") {
      orderDiscount =
        orderSubtotal * (Number(appliedCoupon.value || 0) / 100);
    }
    const orderShipping = Number(delivery_fee || 0);
    const orderTotal = orderSubtotal - orderDiscount + orderShipping;
    const cleanNote = customerNote.trim();
    const orderData = {
      address: { ...formData },
      customerNote: cleanNote,
      items,
      paymentMethod: method,
      appliedCoupon: appliedCoupon || null,
      totals: {
        subtotal: orderSubtotal,
        discount: orderDiscount,
        shipping: orderShipping,
        total: orderTotal,
      },
    };

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/place`,
        orderData,
        { headers: { token } }
      );

      if (!response.data?.success) {
        toast.error(response.data?.message || "Order failed.");
        return;
      }

      toast.success(response.data.message || "Order placed!");
      setCartItems({});
      setShowFireworks(true);
      try {
        localStorage.removeItem(ORDER_NOTE_STORAGE_KEY);
      } catch {
        // The completed order is not affected when storage is unavailable.
      }
      window.setTimeout(() => navigate("/orders"), 950);

      axios
        .post(
          `${backendUrl}/api/order/notify-checkout`,
          {
            user: {
              name: `${formData.firstName} ${formData.lastName}`.trim(),
              ...formData,
            },
            items,
            customerNote: cleanNote,
            paymentMethod: method,
            appliedCoupon: appliedCoupon || null,
            totals: {
              subtotal: orderSubtotal,
              discount: orderDiscount,
              shipping: orderShipping,
              total: orderTotal,
            },
            meta: {
              orderId: response.data?.orderId || response.data?.data?._id || "",
            },
          },
          { headers: { "Content-Type": "application/json", token } }
        )
        .catch(() => {
          // Notification must never block a completed order.
        });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      console.error("Place order failed:", error?.response?.data || error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black">
      {showFireworks && <FireworksOverlay />}
      <form onSubmit={onSubmitHandler}>
        <header className="border-b border-black/15 px-4 pb-8 pt-10 text-center sm:px-6 sm:pb-10 sm:pt-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/50 sm:text-xs">
            Be Radiant By Nancy
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-6xl lg:text-7xl">
            Checkout
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/55 sm:text-base">
            Review your order and tell us where your radiance should arrive.
          </p>
        </header>

        <div className="mx-auto grid max-w-[1480px] gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_430px] lg:px-10">
          <div className="min-w-0">
            <section className="border-t border-black">
              <div className="flex items-center gap-3 border-b border-black/15 py-5">
                <FiMapPin className="h-5 w-5" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/40">
                    Step 01
                  </p>
                  <h2 className="mt-1 text-xl font-black uppercase sm:text-2xl">
                    Contact & Delivery
                  </h2>
                </div>
              </div>

              <div className="grid gap-x-5 gap-y-6 py-7 md:grid-cols-2">
                <CheckoutField name="firstName" label="First Name" value={formData.firstName} onChange={onChangeHandler} required />
                <CheckoutField name="lastName" label="Last Name" value={formData.lastName} onChange={onChangeHandler} required />
                <CheckoutField name="email" label="Email" value={formData.email} onChange={onChangeHandler} type="email" required />
                <CheckoutField name="phone" label="Phone" value={formData.phone} onChange={onChangeHandler} required />
                <CheckoutField name="country" label="Country" value={formData.country} onChange={onChangeHandler} required />
                <CheckoutField name="city" label="City" value={formData.city} onChange={onChangeHandler} required />
                <div className="md:col-span-2">
                  <CheckoutField
                    name="addressLine1"
                    label="Delivery Address"
                    value={formData.addressLine1}
                    onChange={onChangeHandler}
                    placeholder="Area, road, and delivery address"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <CheckoutField
                    name="addressLine2"
                    label="Additional Address"
                    value={formData.addressLine2}
                    onChange={onChangeHandler}
                    placeholder="Nearby landmark or extra address details"
                  />
                </div>
                <CheckoutField name="street" label="Street" value={formData.street} onChange={onChangeHandler} />
                <CheckoutField name="building" label="Building" value={formData.building} onChange={onChangeHandler} />
                <CheckoutField name="floor" label="Floor / Apartment" value={formData.floor} onChange={onChangeHandler} />
                <CheckoutField name="state" label="State / Region" value={formData.state} onChange={onChangeHandler} />
                <CheckoutField name="zipCode" label="Zip Code" value={formData.zipCode} onChange={onChangeHandler} />
              </div>
            </section>

            <section className="border-t border-black">
              <div className="flex items-center gap-3 border-b border-black/15 py-5">
                <FiPackage className="h-5 w-5" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/40">
                    Step 02
                  </p>
                  <h2 className="mt-1 text-xl font-black uppercase sm:text-2xl">
                    Order Note
                  </h2>
                </div>
              </div>
              <div className="py-7">
                <label className="block">
                  <span className={labelClass}>
                    Note For Your Order
                    <span className="ml-2 font-medium text-black/35">Optional</span>
                  </span>
                  <textarea
                    value={customerNote}
                    onChange={(event) =>
                      setCustomerNote(event.target.value.slice(0, 1200))
                    }
                    placeholder="Delivery instructions, a gift message, or anything Nancy should know."
                    className="mt-2 min-h-36 w-full resize-none border border-black/25 bg-white p-4 text-sm leading-6 outline-none transition placeholder:text-black/35 focus:border-black"
                  />
                </label>
                <div className="mt-2 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.13em] text-black/35">
                  <span>Leave blank if you do not need a note</span>
                  <span>{customerNote.length}/1200</span>
                </div>
              </div>
            </section>

            <section className="border-t border-black">
              <div className="flex items-center gap-3 border-b border-black/15 py-5">
                <FiTruck className="h-5 w-5" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/40">
                    Step 03
                  </p>
                  <h2 className="mt-1 text-xl font-black uppercase sm:text-2xl">
                    Payment
                  </h2>
                </div>
              </div>
              <div className="py-7">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setMethod("COD")}
                    className={`flex w-full items-center justify-between border px-5 py-5 text-left transition ${
                      method === "COD"
                        ? "border-black bg-black text-white"
                        : "border-black/20 bg-white text-black hover:border-black"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full border ${
                          method === "COD" ? "border-white/50" : "border-black/25"
                        }`}
                      >
                        <FiCheck className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-xs font-bold uppercase tracking-[0.16em]">
                          Cash On Delivery
                        </span>
                        <span
                          className={`mt-1 block text-[10px] ${
                            method === "COD" ? "text-white/55" : "text-black/45"
                          }`}
                        >
                          Pay when your order arrives
                        </span>
                      </span>
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        method === "COD" ? "bg-white" : "border border-black/40"
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod("Wish Money")}
                    className={`flex w-full items-center justify-between border px-5 py-5 text-left transition ${
                      method === "Wish Money"
                        ? "border-black bg-black text-white"
                        : "border-black/20 bg-white text-black hover:border-black"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`grid h-12 w-12 place-items-center overflow-hidden rounded-full border bg-white p-1 ${
                          method === "Wish Money" ? "border-white/50" : "border-black/25"
                        }`}
                      >
                        <img
                          src={wishMoneyLogo}
                          alt="Wish Money"
                          className="h-full w-full object-contain"
                        />
                      </span>
                      <span>
                        <span className="block text-xs font-bold uppercase tracking-[0.16em]">
                          Wish Money
                        </span>
                        <span
                          className={`mt-1 block text-[10px] ${
                            method === "Wish Money" ? "text-white/55" : "text-black/45"
                          }`}
                        >
                          Send payment to Nancy: {WISH_MONEY_NUMBER}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        method === "Wish Money" ? "bg-white" : "border border-black/40"
                      }`}
                    />
                  </button>

                  {method === "Wish Money" && (
                    <a
                      href={`tel:${WISH_MONEY_NUMBER}`}
                      className="flex items-center justify-between border border-black/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-black transition hover:border-black"
                    >
                      <span className="inline-flex items-center gap-2">
                        <FiPhone className="h-4 w-4" />
                        Nancy Wish Money Number
                      </span>
                      <span>{WISH_MONEY_NUMBER}</span>
                    </a>
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <section className="border-t border-black">
              <div className="flex items-end justify-between border-b border-black/15 py-5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/40">
                    Final Review
                  </p>
                  <h2 className="mt-1 text-xl font-black uppercase sm:text-2xl">
                    Your Order
                  </h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/45">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div>
                {cartRows.length ? (
                  cartRows.map((row) => {
                    const price = getEffectiveProductPrice(row.product);
                    return (
                      <article
                        key={`${row.productId}-${row.size}-${row.color || "default"}-${row.perfumeType || "no-perfume-type"}`}
                        className="grid grid-cols-[72px_1fr_auto] gap-4 border-b border-black/15 py-5"
                      >
                        <div className="aspect-[3/4]">
                          <ShimmerImage
                            src={getPrimaryProductImage(row.product)}
                            alt={row.product.name}
                            className="h-full w-full object-contain"
                            wrapperClassName="h-full w-full"
                            skeletonClassName="bg-[#EAEAEA]"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-xs font-semibold uppercase leading-5 tracking-[0.08em]">
                            {row.product.name}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-black/40">
                            {[
                              row.perfumeType,
                              isRealSize(row.size)
                                ? row.size
                                : null,
                              row.color,
                              `Qty ${row.quantity}`,
                            ]
                              .filter(Boolean)
                              .join(" / ")}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice(price * row.quantity, currency)}
                        </p>
                      </article>
                    );
                  })
                ) : (
                  <div className="border-b border-black/15 py-10 text-center">
                    <FiPackage className="mx-auto h-6 w-6 text-black/40" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em]">
                      Your cart is empty
                    </p>
                  </div>
                )}
              </div>

              <div className="border-b border-black/15 py-5">
                <label className={labelClass}>Gift Code Or Coupon</label>
                {appliedCoupon ? (
                  <div className="mt-3 flex items-center justify-between border border-black px-4 py-3 text-xs">
                    <span className="inline-flex min-w-0 items-center gap-2 font-bold uppercase tracking-[0.1em]">
                      <FiTag className="h-4 w-4 shrink-0" />
                      <span className="truncate">{appliedCoupon.code}</span>
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="grid h-8 w-8 shrink-0 place-items-center transition hover:bg-black hover:text-white"
                      aria-label="Remove coupon"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex">
                    <input
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value)}
                      placeholder="Enter coupon code"
                      className="h-12 min-w-0 flex-1 border border-black/25 bg-white px-4 text-sm outline-none transition placeholder:text-black/35 focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="h-12 border border-l-0 border-black bg-black px-5 text-[10px] font-bold uppercase tracking-[0.17em] text-white"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-b border-black/15 py-5 text-sm">
                <div className="flex justify-between text-black/55">
                  <span>Subtotal</span>
                  <span className="font-medium text-black">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-black/55">
                  <span>Delivery</span>
                  <span className="font-medium text-black">
                    {formatPrice(shipping, currency)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#a24c68]">
                    <span>Discount</span>
                    <span className="font-medium">
                      -{formatPrice(discount, currency)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-end justify-between py-5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Total
                </span>
                <span className="text-3xl font-medium">
                  {formatPrice(total, currency)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting || !cartRows.length}
                className="flex w-full items-center justify-between bg-black px-5 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span>{submitting ? "Placing Order" : "Place Order"}</span>
                <FiArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-4 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-black/35">
                <FiLock className="h-3.5 w-3.5" />
                Your order details are securely submitted
              </p>
            </section>
          </aside>
        </div>
      </form>
    </main>
  );
};

export default Placeorder;
