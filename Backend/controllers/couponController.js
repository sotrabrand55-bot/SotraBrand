import Coupon from "../models/coupon.js";
import { logError } from "../utils/logger.js";

export const createCoupon = async (req, res) => {
  try {
    let { code, type, value, isActive } = req.body;

    // normalize code
    code = code.trim().toUpperCase();

    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const newCoupon = new Coupon({
      code,
      type,
      value,
      isActive,
    });

    await newCoupon.save();

    res.json({
      success: true,
      message: "Coupon created successfully",
      coupon: newCoupon,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// list all coupons
export const listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// toggle active/inactive
export const toggleCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!coupon)
      return res.status(404).json({ success: false, message: "Coupon not found" });

    res.json({ success: true, message: "Coupon updated", coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE coupon by ID
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    await Coupon.findByIdAndDelete(id);

    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    logError("deleteCoupon", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const checkCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive coupon",
      });
    }

    res.json({
      success: true,
      coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


