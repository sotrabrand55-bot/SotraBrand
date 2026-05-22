import express from "express";
import { getDeliveryFee, setDeliveryFee } from "../controllers/settingsController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/delivery-fee", getDeliveryFee);
router.post("/delivery-fee", adminAuth, setDeliveryFee);

export default router;
