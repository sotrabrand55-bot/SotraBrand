import express from "express";
import {
  getDeliveryFee,
  getSiteSettings,
  setDeliveryFee,
  updateSiteSettings,
} from "../controllers/settingsController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/site", getSiteSettings);
router.post("/site", adminAuth, updateSiteSettings);
router.get("/delivery-fee", getDeliveryFee);
router.post("/delivery-fee", adminAuth, setDeliveryFee);

export default router;
