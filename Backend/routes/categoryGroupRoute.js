import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  listCategoryGroups,
  restoreCategoryGroups,
  saveCategoryGroups,
} from "../controllers/categoryGroupController.js";

const router = express.Router();

router.get("/list", listCategoryGroups);
router.post("/save", adminAuth, saveCategoryGroups);
router.post("/restore-defaults", adminAuth, restoreCategoryGroups);

export default router;
