import React, { useCallback, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import LevonOrnament from "../componens/LevonOrnament";
import { ShimmerImage } from "../componens/Skeletons";
import {
  getEffectiveProductPrice,
  getPrimaryProductImage,
} from "../utils/productMapping";

const CURRENCY_FALLBACK = import.meta.env.VITE_CURRENCY || "$";
const isObj = (v) => v && typeof v === "object";

function formatPrice(n, currency) {
  const c = currency || CURRENCY_FALLBACK;
  const x = Number.isFinite(n) ? n : 0;
  return `${c}${x.toFixed(2)}`;
}

export default function Cart() {
  const {
    cartItems,
    products,
    updateQuantity,
    delivery_fee,
    currency,
    navigate,
  } = useContext(ShopContext);

  const productMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(products)) {
      for (const product of products) {
        if (product && product._id != null) map.set(String(product._id), product);
      }
    }
    return map;
  }, [products]);

  const rows = useMemo(() => {
    const out = [];
    if (!isObj(cartItems)) return out;

    for (const itemId in cartItems) {
      const sizeMap = cartItems[itemId];
      const product = productMap.get(String(itemId)) || null;
      const unitPrice = getEffectiveProductPrice(product);
      const originalPrice = Number(product?.price || 0);
      const image = getPrimaryProductImage(product);
      const name = product?.name || "Product";
      const stock =
        product?.stock === undefined || product?.stock === null || product?.stock === ""
          ? null
          : Number(product.stock);
      const hasStock = stock !== null && Number.isFinite(stock);
      const soldOut = Boolean(product?.outOfStock) || (hasStock && stock <= 0);
      const unavailable = !product || product.active === false || soldOut;

      if (!isObj(sizeMap)) continue;

      for (const size in sizeMap) {
        const val = sizeMap[size];

        if (typeof val === "number") {
          if (val > 0) {
            out.push({
              itemId,
              size,
              color: null,
              qty: val,
              product,
              price: unitPrice,
              originalPrice,
              image,
              name,
              stock: hasStock ? stock : null,
              unavailable,
            });
          }
          continue;
        }

        if (isObj(val)) {
          for (const colorKey in val) {
            const qty = Number(val[colorKey]);
            if (Number.isFinite(qty) && qty > 0) {
              out.push({
                itemId,
                size,
                color: colorKey === "_default" ? null : colorKey,
                qty,
                product,
                price: unitPrice,
                originalPrice,
                image,
                name,
                stock: hasStock ? stock : null,
                unavailable,
              });
            }
          }
        }
      }
    }

    return out;
  }, [cartItems, productMap]);

  const subtotal = useMemo(
    () => rows.reduce((sum, row) => sum + row.price * row.qty, 0),
    [rows]
  );

  const safeUpdate = useCallback(
    (itemId, size, qty, color) => {
      const nextQty = Number(qty);
      const safeQty = Number.isFinite(nextQty) ? (nextQty < 0 ? 0 : nextQty) : 1;
      updateQuantity(itemId, size, safeQty, color ?? null);
    },
    [updateQuantity]
  );

  const inc = (row) => safeUpdate(row.itemId, row.size, row.qty + 1, row.color);
  const dec = (row) =>
    safeUpdate(row.itemId, row.size, Math.max(0, row.qty - 1), row.color);
  const remove = (row) => safeUpdate(row.itemId, row.size, 0, row.color);

  const delivery = Number(delivery_fee || 0);
  const safeDelivery = Number.isFinite(delivery) ? delivery : 0;
  const total = subtotal + safeDelivery;
  const itemCount = rows.reduce((sum, row) => sum + row.qty, 0);
  const hasUnavailableItems = rows.some((row) => row.unavailable);
  const hasInvalidQuantity = rows.some(
    (row) => row.stock !== null && row.qty > row.stock
  );
  const cannotCheckout = hasUnavailableItems || hasInvalidQuantity;

  if (!rows.length) {
    return (
      <main className="min-h-screen bg-[#fffaf4] px-4 py-12 text-[#1f1b17] sm:px-[5vw] md:px-[7vw] lg:px-[3vw]">
        <section className="mx-auto max-w-[900px] text-center">
          <div className="mx-auto mb-4 flex w-fit items-center gap-3 text-[#c49a5e]">
            <span className="h-px w-10 bg-current" />
            <span className="h-2.5 w-2.5 rotate-45 bg-current" />
            <span className="h-px w-10 bg-current" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8068]">
            Your Selection
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none sm:text-6xl">
            Shopping Cart
          </h1>
          <div className="mx-auto mt-10 max-w-md rounded-md border border-[#eadfd2] bg-white/72 p-8 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#d8c8b5] text-[#c49a5e]">
              <FiShoppingBag className="h-6 w-6" />
            </div>
            <p className="mt-5 font-serif text-2xl">Your cart is empty.</p>
            <p className="mt-3 text-sm leading-7 text-[#7d6756]">
              Explore the Levon collection and add your favorite scent.
            </p>
            <Link
              to="/collection"
              className="mt-6 inline-flex items-center justify-center gap-3 rounded-full bg-[#1f1b17] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#c49a5e]"
            >
              Continue Shopping
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    );
  }

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
            Your Selection
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none sm:text-6xl lg:text-7xl">
            Shopping Cart
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#7d6756] sm:text-lg">
            Review your scents before checkout.
          </p>
        </div>

        <div className="cart-layout mt-12">
          <div className="rounded-md border border-[#eadfd2] bg-white/58 p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-[#eadfd2] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                  Cart Items
                </p>
                <p className="mt-1 text-sm text-[#7d6756]">
                  {itemCount} {itemCount === 1 ? "item" : "items"} in your selection
                </p>
              </div>
              <span className="grid h-8 min-w-8 place-items-center rounded-full bg-[#7b2d2d] px-2 text-sm font-semibold text-white">
                {itemCount}
              </span>
            </div>

            <div className="space-y-4">
              {rows.map((row) => {
              const isSale = row.originalPrice > row.price && row.price > 0;
              const lineTotal = row.price * row.qty;
              const chips = [
                row.product?.subCategory,
                row.product?.concentration,
                row.size,
              ].filter(Boolean);
              const overStock = row.stock !== null && row.qty > row.stock;

              return (
                <article
                  key={`${row.itemId}::${row.size}::${row.color ?? "noc"}`}
                  className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-3 sm:p-4"
                >
                  <div className="cart-line">
                    <div className="cart-line-image">
                      <div className="h-full w-full overflow-hidden rounded-md bg-[#eadfd2]">
                        {row.image ? (
                          <ShimmerImage
                            src={row.image}
                            alt={row.name}
                            className="h-full w-full object-cover"
                            wrapperClassName="h-full w-full"
                            skeletonClassName="bg-[#E9DFD3]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-xs uppercase tracking-[0.14em] text-[#9a8068]">
                            No image
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-serif text-2xl leading-tight text-[#1f1b17]">
                            {row.name}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {chips.map((chip) => (
                              <span
                                key={chip}
                                className="rounded-full border border-[#dfd1c1] bg-white/58 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#746657]"
                              >
                                {chip}
                              </span>
                            ))}
                            {row.color && (
                              <span className="rounded-full border border-[#dfd1c1] bg-white/58 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#746657]">
                                {row.color}
                              </span>
                            )}
                          </div>
                        </div>

                        {isSale && (
                          <span className="rounded-full bg-[#7b2d2d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                            Sale
                          </span>
                        )}
                        {row.unavailable && (
                          <span className="rounded-full bg-[#1f1b17] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                            Unavailable
                          </span>
                        )}
                        {!row.unavailable && overStock && (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                            Only {row.stock} left
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8068]">
                            Price
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-lg font-semibold text-[#1f1b17]">
                              {formatPrice(row.price, currency)}
                            </span>
                            {isSale && (
                              <span className="text-sm text-[#9a8068] line-through">
                                {formatPrice(row.originalPrice, currency)}
                              </span>
                            )}
                          </div>
                          {row.stock !== null && (
                            <p className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                              row.unavailable || overStock ? "text-[#7b2d2d]" : "text-[#6f5844]"
                            }`}>
                              {row.unavailable ? "Out of stock" : `${row.stock} in stock`}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex h-10 items-center rounded-full border border-[#dfd1c1] bg-white/70">
                            <button
                              type="button"
                              onClick={() => dec(row)}
                              aria-label="Decrease quantity"
                              className="grid h-10 w-10 place-items-center rounded-full text-[#6f5844] transition hover:bg-[#eadfd2] hover:text-[#1f1b17]"
                            >
                              <FiMinus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={row.qty}
                              onChange={(event) => {
                                const raw = event.target.value;
                                const parsed = Number(raw);
                                safeUpdate(
                                  row.itemId,
                                  row.size,
                                  raw === "" ? 1 : Number.isFinite(parsed) ? parsed : 1,
                                  row.color
                                );
                              }}
                              className="h-10 w-12 border-x border-[#dfd1c1] bg-transparent text-center text-sm font-semibold text-[#1f1b17] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => inc(row)}
                              aria-label="Increase quantity"
                              disabled={row.unavailable || (row.stock !== null && row.qty >= row.stock)}
                              className="grid h-10 w-10 place-items-center rounded-full text-[#6f5844] transition hover:bg-[#eadfd2] hover:text-[#1f1b17]"
                            >
                              <FiPlus className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => remove(row)}
                            aria-label="Remove item"
                            className="grid h-10 w-10 place-items-center rounded-full border border-[#dfd1c1] bg-white/70 text-[#7b2d2d] transition hover:border-[#7b2d2d] hover:bg-[#7b2d2d] hover:text-white"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="cart-line-total border-t border-[#eadfd2] pt-4 text-left md:border-t-0 md:pt-0 md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8068]">
                        Line Total
                      </p>
                      <p className="mt-1 font-serif text-3xl text-[#1f1b17]">
                        {formatPrice(lineTotal, currency)}
                      </p>
                    </div>
                  </div>
                </article>
              );
              })}
            </div>
          </div>

          <div className="w-full rounded-md border border-[#eadfd2] bg-white/78 p-6 shadow-[0_18px_45px_rgba(62,45,28,0.10)] lg:sticky lg:top-28">
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
                  {formatPrice(safeDelivery, currency)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                Total
              </span>
              <span className="font-serif text-4xl text-[#1f1b17]">
                {formatPrice(total, currency)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/place-order")}
              disabled={cannotCheckout}
              className={`mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition ${
                cannotCheckout
                  ? "cursor-not-allowed bg-[#8d8378]"
                  : "bg-[#1f1b17] hover:bg-[#c49a5e]"
              }`}
            >
              {cannotCheckout ? "Update Cart To Continue" : "Proceed To Checkout"}
              <FiArrowRight className="h-4 w-4" />
            </button>

            <Link
              to="/collection"
              className="mt-4 inline-flex w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.16em] text-[#7d6756] transition hover:text-[#1f1b17]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        <LevonOrnament className="mt-10" />
      </section>
    </main>
  );
}
