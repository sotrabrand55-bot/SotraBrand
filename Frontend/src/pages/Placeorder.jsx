import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { FiArrowRight, FiCheck, FiTag, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import LevonOrnament from "../componens/LevonOrnament";
import { ShopContext } from "../context/ShopContext";
import {
  getEffectiveProductPrice,
  getPrimaryProductImage,
} from "../utils/productMapping";

const isObjectId = (s) => typeof s === "string" && /^[a-f0-9]{24}$/i.test(s);

const formatPrice = (value, currency = "$") => {
  const amount = Number(value);
  return `${currency}${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
};

const fieldClass =
  "mt-2 w-full border border-[#dfd1c1] bg-[#fffaf4]/70 px-4 py-3 text-sm text-[#1f1b17] outline-none transition placeholder:text-[#a49181] focus:border-[#c49a5e] focus:ring-2 focus:ring-[#c49a5e]/18";

const inputGroups = [
  [
    { name: "firstName", label: "First Name", required: true },
    { name: "lastName", label: "Last Name", required: true },
  ],
  [
    { name: "email", label: "Email", required: true, type: "email" },
    { name: "street", label: "Street" },
  ],
  [
    { name: "addressLine1", label: "Address Line 1" },
    { name: "addressLine2", label: "Address Line 2" },
  ],
  [
    { name: "building", label: "Building" },
    { name: "floor", label: "Floor / Apartment" },
  ],
  [
    { name: "city", label: "City" },
    { name: "state", label: "State" },
  ],
  [
    { name: "zipCode", label: "Zip Code" },
    { name: "country", label: "Country", required: true },
  ],
];

const Placeorder = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [method, setMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    couponDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    currency,
  } = useContext(ShopContext);

  const subtotal = Number(getCartAmount() || 0);
  const discount = Number(couponDiscount || 0);
  const shipping = Number(delivery_fee || 0);
  const total = subtotal - discount + shipping;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    building: "",
    floor: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter a coupon code");
    await applyCoupon(couponCode);
    setCouponCode("");
  };

  const buildItemsFromCart = () => {
    const items = [];
    for (const productId in cartItems || {}) {
      if (!isObjectId(productId)) continue;
      const variant = cartItems[productId];
      if (!variant) continue;

      for (const key in variant) {
        const val = variant[key];
        if (!val) continue;

        const product = products?.find((p) => p._id === productId);
        const productTitle = product?.name || product?.title || "";
        const productPrice = product ? getEffectiveProductPrice(product) : 0;
        const productImage = product ? getPrimaryProductImage(product) : "";
        const stock =
          product?.stock === undefined || product?.stock === null || product?.stock === ""
            ? null
            : Number(product.stock);
        const outOfStock =
          !product ||
          product.active === false ||
          Boolean(product.outOfStock) ||
          (Number.isFinite(stock) && stock <= 0);

        if (typeof val === "number" && val > 0) {
          if (outOfStock) continue;
          items.push({
            productId,
            size: key,
            color: null,
            quantity: val,
            title: productTitle,
            name: productTitle,
            price: productPrice,
            unitPrice: productPrice,
            lineTotal: productPrice * val,
            image: productImage,
            category: product?.category || "",
            subCategory: product?.subCategory || "",
            concentration: product?.concentration || "",
            stock: Number.isFinite(stock) ? stock : null,
          });
        } else if (typeof val === "object") {
          for (const colorKey in val) {
            const q = val[colorKey];
            if (q <= 0) continue;
            if (outOfStock) continue;
            const color = colorKey === "_default" ? null : colorKey;
            items.push({
              productId,
              size: key,
              color,
              quantity: q,
              title: productTitle,
              name: productTitle,
              price: productPrice,
              unitPrice: productPrice,
              lineTotal: productPrice * q,
              image: productImage,
              category: product?.category || "",
              subCategory: product?.subCategory || "",
              concentration: product?.concentration || "",
              stock: Number.isFinite(stock) ? stock : null,
            });
          }
        }
      }
    }
    return items;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Please log in first.");

    const items = buildItemsFromCart();
    if (!items.length) return toast.error("Your cart is empty.");
    const overStockItem = items.find(
      (item) => item.stock !== null && item.quantity > item.stock
    );
    if (overStockItem) {
      return toast.error(`${overStockItem.title || "Product"} has only ${overStockItem.stock} in stock.`);
    }

    const subtotal = items.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );

    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === "fixed") {
        discount = Number(appliedCoupon.value || 0);
      } else if (appliedCoupon.type === "percentage") {
        discount = subtotal * (Number(appliedCoupon.value || 0) / 100);
      }
    }

    const shipping = Number(delivery_fee || 0);
    const total = subtotal - discount + shipping;

    const orderData = {
      address: { ...formData },
      items,
      paymentMethod: method,
      appliedCoupon: appliedCoupon || null,
      totals: {
        subtotal,
        discount,
        shipping,
        total,
      },
    };

    if (method !== "COD") return toast.info("Only Cash on Delivery is available.");

    try {
      const res = await axios.post(`${backendUrl}/api/order/place`, orderData, {
        headers: { token },
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Order placed!");
        setCartItems({});
        navigate("/orders");

        try {
          await axios
            .post(
              `${backendUrl}/api/order/notify-checkout`,
              {
                user: {
                  name: `${formData.firstName} ${formData.lastName}`.trim(),
                  email: formData.email,
                  phone: formData.phone,
                  street: formData.street,
                  city: formData.city,
                  state: formData.state,
                  zipCode: formData.zipCode,
                  country: formData.country,
                  addressLine1: formData.addressLine1,
                  addressLine2: formData.addressLine2,
                  building: formData.building,
                  floor: formData.floor,
                },
                items,
                totals: {
                  subtotal,
                  discount,
                  shipping,
                  total,
                },
                meta: {
                  orderId: res.data?.orderId || res.data?.data?._id || "",
                },
              },
              {
                headers: { "Content-Type": "application/json", token },
              }
            )
            .catch(() => {});
        } catch {}
      } else {
        toast.error(res.data?.message || "Order failed.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
      console.error("Place order failed:", err?.response?.data || err);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf4] px-4 pb-14 pt-10 text-[#1f1b17] sm:px-[5vw] md:px-[7vw] lg:px-[3vw]">
      <form onSubmit={onSubmitHandler} className="mx-auto max-w-[1300px]">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex w-fit items-center gap-3 text-[#c49a5e]">
            <span className="h-px w-10 bg-current" />
            <span className="h-2.5 w-2.5 rotate-45 bg-current" />
            <span className="h-px w-10 bg-current" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8068]">
            Checkout
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none sm:text-6xl lg:text-7xl">
            Place Order
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#7d6756] sm:text-lg">
            Complete your delivery details and confirm your scent order.
          </p>
        </div>

        <div className="checkout-layout mt-12">
          <section className="rounded-md border border-[#eadfd2] bg-white/62 p-5 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-8">
            <div className="mb-7">
              <div className="mb-3 h-2 w-2 rotate-45 bg-[#c49a5e]" />
              <h2 className="font-serif text-4xl leading-tight text-[#1f1b17]">
                Delivery Information
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7d6756]">
                Share the address where your Levon order should arrive.
              </p>
            </div>

            <div className="space-y-5">
              {inputGroups.map((group) => (
                <div key={group.map((field) => field.name).join("-")} className="grid gap-5 md:grid-cols-2">
                  {group.map((field) => (
                    <label key={field.name} className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5844]">
                        {field.label}
                      </span>
                      <input
                        required={field.required}
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={onChangeHandler}
                        placeholder={field.label}
                        className={fieldClass}
                      />
                    </label>
                  ))}
                </div>
              ))}

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5844]">
                  Phone
                </span>
                <input
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={onChangeHandler}
                  placeholder="Phone"
                  className={fieldClass}
                />
              </label>
            </div>
          </section>

          <aside className="space-y-5 lg:sticky lg:top-28">
            <section className="rounded-md border border-[#eadfd2] bg-white/78 p-6 shadow-[0_18px_45px_rgba(62,45,28,0.10)]">
              <div className="mb-6">
                <div className="mb-3 h-2 w-2 rotate-45 bg-[#c49a5e]" />
                <h2 className="font-serif text-4xl leading-tight text-[#1f1b17]">
                  Order Summary
                </h2>
              </div>

              <div className="space-y-4 border-y border-[#eadfd2] py-5 text-sm">
                <div className="flex items-center justify-between text-[#7d6756]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1f1b17]">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#7d6756]">
                  <span>Delivery</span>
                  <span className="font-semibold text-[#1f1b17]">
                    {formatPrice(shipping, currency)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-green-700">
                    <span>Discount</span>
                    <span className="font-semibold">
                      - {formatPrice(discount, currency)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-end justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                  Total
                </span>
                <span className="font-serif text-4xl text-[#1f1b17]">
                  {formatPrice(total, currency)}
                </span>
              </div>

              <div className="mt-7">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5844]">
                  Gift code or coupon
                </label>
                {appliedCoupon ? (
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <FiTag className="h-4 w-4 shrink-0" />
                      <span className="truncate">{appliedCoupon.code}</span>
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-green-300 transition hover:bg-white"
                      aria-label="Remove coupon"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                    <input
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value)}
                      placeholder="Enter coupon code"
                      className="min-w-0 flex-1 rounded-md border border-[#dfd1c1] bg-[#fffaf4]/70 px-4 py-3 text-sm outline-none transition placeholder:text-[#a49181] focus:border-[#c49a5e] focus:ring-2 focus:ring-[#c49a5e]/18"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="rounded-full bg-[#c49a5e] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#1f1b17]"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-md border border-[#eadfd2] bg-white/78 p-6 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
              <div className="mb-5">
                <div className="mb-3 h-2 w-2 rotate-45 bg-[#c49a5e]" />
                <h2 className="font-serif text-3xl leading-tight text-[#1f1b17]">
                  Payment Method
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMethod("COD")}
                className={`flex w-full items-center justify-between rounded-md border px-4 py-4 text-left transition ${
                  method === "COD"
                    ? "border-[#c49a5e] bg-[#fffaf4]"
                    : "border-[#eadfd2] bg-white/60"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-green-300 bg-green-50 text-green-600">
                    <FiCheck className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1f1b17]">
                    Cash On Delivery
                  </span>
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </button>

              <button
                type="submit"
                className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#1f1b17] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#c49a5e]"
              >
                Place Order
                <FiArrowRight className="h-4 w-4" />
              </button>
            </section>
          </aside>
        </div>

        <LevonOrnament className="mt-10" />
      </form>
    </main>
  );
};

export default Placeorder;
