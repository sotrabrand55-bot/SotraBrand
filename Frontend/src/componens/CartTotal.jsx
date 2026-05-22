// CartTotalWithCoupon.jsx
import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const CartTotal = () => {
  const {
    getCartAmount,
    delivery_fee,
    appliedCoupon,
    couponDiscount,
    getTotalAfterDiscount,
    applyCoupon,
    removeCoupon,
  } = useContext(ShopContext);

  const [code, setCode] = useState("");

  const handleApplyCoupon = async () => {
    if (!code.trim()) return toast.error("Enter a coupon code");
    await applyCoupon(code);
    setCode("");
  };

  const subtotal = getCartAmount() || 0;
  const total = getTotalAfterDiscount() + Number(delivery_fee || 0);

  return (
    <div className="w-full max-w-md border p-4 rounded-md shadow-md bg-white">
      <h2 className="text-lg font-bold mb-3">Cart Summary</h2>

      {/* Subtotal */}
      <div className="flex justify-between mb-2">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      {/* Delivery Fee */}
      <div className="flex justify-between mb-2">
        <span>Delivery Fee</span>
        <span>${delivery_fee.toFixed(2)}</span>
      </div>

     {/* Coupon Input */}
{!appliedCoupon && (
  <div className="flex flex-col sm:flex-row gap-2 mb-2 mt-3">
    <input
      type="text"
      placeholder="Enter coupon code"
      value={code}
      onChange={(e) => setCode(e.target.value)}
      className="border p-2 rounded-md w-full sm:flex-1"
    />
    <button
      type="button"
      onClick={handleApplyCoupon}
      className="px-3 py-2 bg-green-600 text-white rounded-md w-full sm:w-auto"
    >
      Apply
    </button>
  </div>
)}

      {/* Applied Coupon */}
      {appliedCoupon && couponDiscount > 0 && (
        <div className="flex justify-between items-center mb-2 mt-3 text-green-600 font-medium">
          <span>Coupon ({appliedCoupon.code})</span>
          <span>- ${couponDiscount.toFixed(2)}</span>
          <button
            onClick={removeCoupon}
            className="ml-2 px-2 py-1 text-red-500 border rounded-md"
          >
            Remove
          </button>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between font-bold text-lg mt-4 border-t pt-2">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CartTotal;
