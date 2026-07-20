/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCheck,
  FiEdit3,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import { ShimmerImage } from "./Skeletons";
import {
  getEffectiveProductPrice,
  getPrimaryProductImage,
} from "../utils/productMapping";

const FREE_SHIPPING_TARGET = 55;
const ORDER_NOTE_STORAGE_KEY = "sotra_order_note";
const LEGACY_ORDER_NOTE_STORAGE_KEY = "nancy_order_note";
const isObject = (value) => value && typeof value === "object";
const isRealSize = (value) =>
  Boolean(value) &&
  !["default", "_no_size"].includes(String(value).toLowerCase());
const isRealOption = (value) =>
  Boolean(value) &&
  !["default", "_default", "_no_perfume_type"].includes(String(value).toLowerCase());
const needsFitSelection = (product) =>
  Number.isFinite(Number(product?.fitMin)) && Number.isFinite(Number(product?.fitMax));
const formatMoney = (value, currency = "$") =>
  `${currency || "$"}${(Number(value) || 0).toFixed(2)}`;
const normalizeOptionText = (value) =>
  String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
const getSelectedColorOption = (product, color) => {
  const target = normalizeOptionText(color);
  if (!target || !Array.isArray(product?.shadeOptions)) return null;

  return (
    product.shadeOptions.find((option) =>
      [option?.cartValue, option?.label, option?.id]
        .map(normalizeOptionText)
        .includes(target)
    ) || null
  );
};
const getSavedOrderNote = () => {
  try {
    return (
      localStorage.getItem(ORDER_NOTE_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_ORDER_NOTE_STORAGE_KEY) ||
      ""
    );
  } catch {
    return "";
  }
};
const getRowState = (product, quantity) => {
  const stock =
    product?.stock === undefined ||
    product?.stock === null ||
    product?.stock === ""
      ? null
      : Number(product.stock);
  const hasStock = stock !== null && Number.isFinite(stock);
  const soldOut = Boolean(product?.outOfStock) || (hasStock && stock <= 0);
  const unavailable = !product || product.active === false || soldOut;
  const overStock = hasStock && quantity > stock;
  return { stock: hasStock ? stock : null, unavailable, overStock };
};

const CartDrawer = ({ open, onClose }) => {
  const {
    addToCart,
    cartItems,
    currency,
    delivery_fee,
    navigate,
    products,
    token,
    updateQuantity,
  } = useContext(ShopContext);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState(getSavedOrderNote);
  const [suggestionAdded, setSuggestionAdded] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, open]);

  useEffect(() => {
    try {
      if (note.trim()) {
        localStorage.setItem(ORDER_NOTE_STORAGE_KEY, note);
      } else {
        localStorage.removeItem(ORDER_NOTE_STORAGE_KEY);
      }
    } catch {
      // Checkout still works when storage is unavailable.
    }
  }, [note]);

  const productMap = useMemo(
    () =>
      new Map(
        (products || [])
          .filter((product) => product?._id)
          .map((product) => [String(product._id), product])
      ),
    [products]
  );

  const rows = useMemo(() => {
    const result = [];
    if (!isObject(cartItems)) return result;

    Object.entries(cartItems).forEach(([itemId, sizeMap]) => {
      if (!isObject(sizeMap)) return;
      const product = productMap.get(String(itemId));

      Object.entries(sizeMap).forEach(([size, value]) => {
        if (typeof value === "number" && value > 0) {
          result.push({
            itemId,
            product,
            size,
            color: null,
            quantity: value,
            ...getRowState(product, value),
          });
          return;
        }

        if (isObject(value)) {
          Object.entries(value).forEach(([color, quantityOrPerfumeMap]) => {
            if (typeof quantityOrPerfumeMap === "number") {
              const amount = Number(quantityOrPerfumeMap);
              if (Number.isFinite(amount) && amount > 0) {
                result.push({
                  itemId,
                  product,
                  size,
                  color: isRealOption(color) ? color : null,
                  perfumeType: null,
                  quantity: amount,
                  ...getRowState(product, amount),
                });
              }
              return;
            }

            if (!isObject(quantityOrPerfumeMap)) return;
            Object.entries(quantityOrPerfumeMap).forEach(([perfumeType, quantity]) => {
              const amount = Number(quantity);
              if (!Number.isFinite(amount) || amount <= 0) return;
              result.push({
                itemId,
                product,
                size,
                color: isRealOption(color) ? color : null,
                perfumeType: isRealOption(perfumeType) ? perfumeType : null,
                quantity: amount,
                ...getRowState(product, amount),
              });
            });
          });
        }
      });
    });

    return result;
  }, [cartItems, productMap]);

  const subtotal = useMemo(
    () =>
      rows.reduce(
        (total, row) =>
          total + getEffectiveProductPrice(row.product) * row.quantity,
        0
      ),
    [rows]
  );
  const itemCount = rows.reduce((total, row) => total + row.quantity, 0);
  const delivery = Number.isFinite(Number(delivery_fee))
    ? Number(delivery_fee)
    : 0;
  const estimatedTotal = subtotal + delivery;
  const cannotCheckout = rows.some((row) => row.unavailable || row.overStock);
  const cartIds = useMemo(
    () => new Set(rows.map((row) => String(row.itemId))),
    [rows]
  );
  const suggestion = useMemo(
    () =>
      (products || []).find((product) => {
        const stock = Number(product?.stock);
        const soldOut =
          Boolean(product?.outOfStock) ||
          (Number.isFinite(stock) && product?.stock !== "" && stock <= 0);
        return (
          product?.active !== false &&
          !soldOut &&
          !cartIds.has(String(product?._id))
        );
      }),
    [cartIds, products]
  );
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_TARGET - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_TARGET) * 100);

  const updateRow = (row, quantity) => {
    const maxQuantity = row.stock === null ? Infinity : row.stock;
    const safeQuantity = Math.max(0, Math.min(quantity, maxQuantity));
    updateQuantity(row.itemId, row.size, safeQuantity, row.color, row.perfumeType);
  };

  const addSuggestion = () => {
    if (!suggestion || suggestionAdded) return;
    const sizes = Array.isArray(suggestion.sizes)
      ? suggestion.sizes.filter((item) => isRealSize(item))
      : [];
    const perfumeTypes = Array.isArray(suggestion.perfumeTypes)
      ? suggestion.perfumeTypes.filter((item) => isRealOption(item))
      : [];
    const perfumeTypeLabel = perfumeTypes[0] || suggestion.concentration || "";

    if (sizes.length || needsFitSelection(suggestion)) {
      onClose();
      navigate(`/Product/${suggestion._id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    addToCart(suggestion._id, null, null, 1, perfumeTypeLabel || null);
    setSuggestionAdded(true);
    window.setTimeout(() => setSuggestionAdded(false), 1200);
  };

  const checkout = () => {
    if (cannotCheckout) return;
    onClose();
    navigate("/place-order");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed inset-0 z-[1000] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className={`absolute inset-0 h-full w-full bg-black/50 transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        className={`absolute bottom-0 right-0 top-0 flex h-full w-full max-w-[430px] flex-col bg-white text-black shadow-[-18px_0_50px_rgba(0,0,0,0.18)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
      >
        <header className="border-b border-black px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-black/45">
                Your selection
              </p>
              <h2 className="mt-1 text-xl font-black uppercase tracking-[0.08em]">
                Cart
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 place-items-center rounded-full bg-[#f1f1f1] transition hover:bg-black hover:text-white"
              aria-label="Close cart"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {rows.length > 0 && (
            <div className="mt-4">
              <p className="text-xs leading-5 text-black/65">
                {amountToFreeShipping > 0
                  ? `Spend ${formatMoney(amountToFreeShipping, currency)} more to reach free shipping`
                  : "You unlocked free shipping"}
              </p>
              <div className="mt-3 h-px w-full bg-black/20">
                <div
                  className="h-px bg-black transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {rows.length === 0 ? (
            <div className="grid min-h-full place-items-center px-7 py-14 text-center">
              <div>
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-black/20">
                  <FiShoppingBag className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-[2rem] font-normal leading-tight sm:text-[2.4rem]">
                  Your cart is empty
                </h3>
                <Link
                  to="/collection"
                  onClick={onClose}
                  className="mt-7 inline-flex min-h-14 items-center justify-center rounded-[14px] bg-black px-10 text-[1.15rem] font-semibold text-white transition hover:bg-[#222]"
                >
                  Continue shopping
                </Link>
                {!token && (
                  <div className="mt-14">
                    <h4 className="text-[1.65rem] font-semibold leading-none">
                      Have an account?
                    </h4>
                    <p className="mt-5 text-[1.2rem] leading-none text-black/70">
                      <Link
                        to="/login?mode=login"
                        onClick={onClose}
                        className="border-b border-black text-black transition hover:text-black/55"
                      >
                        Log in
                      </Link>{" "}
                      to check out faster.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="px-5">
                {rows.map((row) => {
                  const price = getEffectiveProductPrice(row.product);
                  const colorOption = getSelectedColorOption(row.product, row.color);
                  const image = colorOption?.image || getPrimaryProductImage(row.product);
                  const colorLabel = colorOption?.label || row.color || "";
                  const originalPrice = Number(row.product?.price || 0);
                  const discounted = originalPrice > price && price > 0;
                  const atMaximum =
                    row.unavailable ||
                    (row.stock !== null && row.quantity >= row.stock);
                  const productName = row.product?.name || "Unavailable product";
                  const productImage = (
                    <ShimmerImage
                      src={image}
                      alt={productName}
                      className="h-full w-full object-contain"
                      wrapperClassName="h-full w-full"
                      skeletonClassName="bg-[#EAEAEA]"
                      loading="lazy"
                    />
                  );

                  return (
                    <article
                      key={`${row.itemId}-${row.size}-${row.color || "default"}-${row.perfumeType || "no-perfume-type"}`}
                      className="grid grid-cols-[70px_1fr_auto] gap-4 border-b border-black/25 py-5"
                    >
                      {row.product ? (
                        <Link
                          to={`/Product/${row.itemId}`}
                          onClick={onClose}
                          className="block aspect-[3/4] overflow-hidden bg-white"
                        >
                          {productImage}
                        </Link>
                      ) : (
                        <div className="block aspect-[3/4] overflow-hidden bg-white">
                          {productImage}
                        </div>
                      )}

                      <div className="min-w-0">
                        {row.product ? (
                          <Link
                            to={`/Product/${row.itemId}`}
                            onClick={onClose}
                            className="line-clamp-2 text-xs font-semibold uppercase leading-5 tracking-[0.08em]"
                          >
                            {productName}
                          </Link>
                        ) : (
                          <p className="line-clamp-2 text-xs font-semibold uppercase leading-5 tracking-[0.08em]">
                            {productName}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-black/45">
                          {[
                            row.perfumeType,
                            isRealSize(row.size) ? row.size : null,
                            colorLabel,
                          ]
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                        {(row.unavailable || row.overStock || row.stock !== null) && (
                          <p
                            className={`mt-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
                              row.unavailable || row.overStock
                                ? "text-[#a24c68]"
                                : "text-black/40"
                            }`}
                          >
                            {row.unavailable
                              ? "Unavailable - remove item"
                              : row.overStock
                                ? `Only ${row.stock} in stock`
                                : `${row.stock} in stock`}
                          </p>
                        )}

                        <div className="mt-3 inline-grid h-7 grid-cols-[28px_42px_28px] border border-black/30">
                          <button
                            type="button"
                            onClick={() => updateRow(row, row.quantity - 1)}
                            className="grid place-items-center transition hover:bg-black hover:text-white"
                            aria-label={`Decrease ${productName} quantity`}
                          >
                            <FiMinus className="h-3 w-3" />
                          </button>
                          <span className="grid place-items-center border-x border-black/30 text-xs">
                            {row.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateRow(row, row.quantity + 1)}
                            disabled={atMaximum}
                            className="grid place-items-center transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                            aria-label={`Increase ${productName} quantity`}
                          >
                            <FiPlus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between gap-4">
                        <div className="text-right">
                          <p className={`sotra-price text-sm font-bold ${discounted ? "sotra-sale-price" : ""}`}>
                            {formatMoney(price * row.quantity, currency)}
                          </p>
                          {discounted && (
                            <p className="sotra-old-price mt-1 text-[10px]">
                              {formatMoney(originalPrice * row.quantity, currency)}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => updateRow(row, 0)}
                          className="grid h-8 w-8 place-items-center transition hover:bg-black hover:text-white"
                          aria-label={`Remove ${productName}`}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {suggestion && (
                <section className="border-b border-black/25 px-5 py-6">
                  <div className="flex items-center gap-3">
                    <h3 className="shrink-0 text-[10px] font-black uppercase tracking-[0.22em]">
                      You May Also Like
                    </h3>
                    <span className="h-px flex-1 bg-black/35" />
                  </div>

                  <article className="mt-5 grid grid-cols-[72px_1fr_auto] items-center gap-4">
                    <Link
                      to={`/Product/${suggestion._id}`}
                      onClick={onClose}
                      className="block aspect-[3/4]"
                    >
                      <ShimmerImage
                        src={getPrimaryProductImage(suggestion)}
                        alt={suggestion.name}
                        className="h-full w-full object-contain"
                        wrapperClassName="h-full w-full"
                        skeletonClassName="bg-[#EAEAEA]"
                        loading="lazy"
                      />
                    </Link>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-xs font-semibold uppercase leading-5 tracking-[0.08em]">
                        {suggestion.name}
                      </p>
                      <p className="sotra-price mt-1 text-sm font-bold">
                        {formatMoney(getEffectiveProductPrice(suggestion), currency)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addSuggestion}
                      className="grid h-11 w-11 place-items-center border border-black transition hover:bg-black hover:text-white"
                      aria-label={`Add ${suggestion.name} to cart`}
                    >
                      {suggestionAdded ? (
                        <FiCheck className="h-4 w-4" />
                      ) : (
                        <FiShoppingBag className="h-4 w-4" />
                      )}
                    </button>
                  </article>
                </section>
              )}

              <section className="border-b border-black/25">
                <button
                  type="button"
                  onClick={() => setNoteOpen((current) => !current)}
                  className="flex w-full items-center justify-center gap-3 px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em]"
                >
                  <FiEdit3 className="h-4 w-4" />
                  Add A Note
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    noteOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5">
                      <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Write your order note"
                        className="min-h-24 w-full resize-none border border-black/30 p-3 text-sm outline-none transition focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        {rows.length > 0 && (
          <footer className="border-t border-black bg-white px-5 pb-5 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.12em]">
                  Subtotal
                </p>
                <p className="mt-1 max-w-[230px] text-[11px] leading-4 text-black/55">
                  Taxes, discounts and shipping calculated at checkout.
                </p>
              </div>
              <p className="sotra-price text-lg font-bold">{formatMoney(subtotal, currency)}</p>
            </div>
            <div className="mt-3 space-y-2 border-t border-black/15 pt-3 text-[11px]">
              <div className="flex items-center justify-between text-black/50">
                <span>Delivery</span>
                <span className="sotra-price text-black">{formatMoney(delivery, currency)}</span>
              </div>
              <div className="flex items-center justify-between font-bold uppercase tracking-[0.1em]">
                <span>Estimated Total</span>
                <span className="sotra-price">{formatMoney(estimatedTotal, currency)}</span>
              </div>
            </div>
            {cannotCheckout && (
              <p className="mt-3 text-[10px] font-semibold uppercase leading-4 tracking-[0.12em] text-[#a24c68]">
                Remove unavailable items or reduce quantities before checkout.
              </p>
            )}
            <button
              type="button"
              onClick={checkout}
              disabled={cannotCheckout}
              className="mt-4 flex w-full items-center justify-between bg-black px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <span>{cannotCheckout ? "Update Cart To Continue" : "Proceed To Checkout"}</span>
              <span className="sotra-price">{formatMoney(estimatedTotal, currency)}</span>
            </button>
            <p className="mt-3 text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </footer>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
