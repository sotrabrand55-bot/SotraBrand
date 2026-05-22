import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { AdminInlineSkeleton } from "../components/AdminSkeletons";

const AddCoupon = ({ token }) => {
  const [code, setCode] = useState("");
  const [type, setType] = useState("percentage"); // percentage | fixed
  const [value, setValue] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  // List of coupons
  const [coupons, setCoupons] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setListLoading(true);
      const res = await axios.get(`${backendUrl}/api/coupon/list`, {
        headers: { token },
      });
      if (res.data.success) setCoupons(res.data.coupons);
    } catch (err) {
      toast.error("Failed to load coupons");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Toggle active/inactive
  const toggleActive = async (id, current) => {
    try {
      const res = await axios.put(
        `${backendUrl}/api/coupon/toggle/${id}`,
        { isActive: !current },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Updated successfully");
        setCoupons((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isActive: !current } : c))
        );
      }
    } catch (err) {
      toast.error("Failed to update coupon");
    }
  };

  // Delete coupon
  const deleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await axios.delete(`${backendUrl}/api/coupon/${id}`, {
        headers: { token },
      });
      if (res.data.success) {
        toast.success("Coupon deleted successfully");
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete coupon");
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    if (!value || Number(value) <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        backendUrl + "/api/coupon/create",
        {
          code,
          type,
          value: Number(value),
          isActive: active,
        },
        {
          headers: { token },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setCode("");
        setValue("");
        setType("percentage");
        setActive(true);
        fetchCoupons(); // refresh the list
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.response?.data || err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[600px]">
      {/* --- Add Coupon Form --- */}
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col w-full gap-4 border p-4 rounded"
      >
        <h2 className="text-lg font-semibold">Add Coupon</h2>

        <div>
          <p className="mb-1">Coupon Code</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 border"
            type="text"
            placeholder="SUMMER 2026!"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Can include letters, numbers, spaces & symbols
          </p>
        </div>

        <div>
          <p className="mb-1">Discount Type</p>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 border w-full"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>

        <div>
          <p className="mb-1">{type === "percentage" ? "Percentage %" : "Amount $"}</p>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border"
            type="number"
            min="1"
            step="1"
            placeholder={type === "percentage" ? "e.g. 20" : "e.g. 10"}
          />
          <p className="text-[11px] text-gray-500 mt-1">
            {type === "percentage"
              ? "20 = 20% discount"
              : "10 = $10 discount"}
          </p>
        </div>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            onChange={() => setActive((p) => !p)}
          />
          <span>Active</span>
        </label>

        <button
          disabled={loading}
          className="w-32 py-2 bg-black text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "ADD"}
        </button>
      </form>

      {/* --- List of Coupons --- */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Existing Coupons</h2>

        {listLoading && <AdminInlineSkeleton cards={2} rows={1} />}
        {!listLoading && coupons.length === 0 && <p>No coupons yet.</p>}

        {!listLoading &&
          coupons.map((c) => (
            <div
              key={c._id}
              className="flex items-center justify-between p-3 border rounded"
            >
              <div className="flex flex-col">
                <span className="font-semibold">{c.code}</span>
                <span className="text-sm text-gray-600">
                  {c.type === "percentage"
                    ? `${c.value}% off`
                    : `$${c.value.toFixed(2)} off`}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(c._id, c.isActive)}
                  className={`px-3 py-1 rounded text-white ${
                    c.isActive ? "bg-emerald-600" : "bg-gray-400"
                  }`}
                >
                  {c.isActive ? "Active" : "Inactive"}
                </button>

                <button
                  onClick={() => deleteCoupon(c._id)}
                  className="px-3 py-1 rounded bg-red-600 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AddCoupon;
