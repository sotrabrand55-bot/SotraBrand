import express from "express";
const router = express.Router();

import adminAuth from "../middleware/adminAuth.js";
import {
  createCoupon,
  listCoupons,
  toggleCoupon,
  deleteCoupon,
  checkCoupon, // ✅ ADD THIS
} from "../controllers/couponController.js";

// ================= ADMIN =================
router.post("/create", adminAuth, createCoupon);
router.get("/list", adminAuth, listCoupons);
router.put("/toggle/:id", adminAuth, toggleCoupon);
router.delete("/:id", adminAuth, deleteCoupon);

// ================= PUBLIC =================
// ✅ used by ShopContext.applyCoupon()
router.post("/check", checkCoupon);

export default router;
