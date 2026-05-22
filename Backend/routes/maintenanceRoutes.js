import express from "express";
import { getMaintenance, setMaintenance } from "../controllers/maintenanceController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// GET: fetch maintenance state
router.get("/", getMaintenance);

// POST: toggle maintenance state
router.post("/", adminAuth, setMaintenance);

export default router;
