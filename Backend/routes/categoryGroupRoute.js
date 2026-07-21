import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";
import {
  listCategoryGroups,
  restoreCategoryGroups,
  saveCategoryGroups,
} from "../controllers/categoryGroupController.js";

const router = express.Router();

router.get("/list", listCategoryGroups);
router.post(
  "/save",
  adminAuth,
  upload.fields(
    Array.from({ length: 40 }, (_, index) => ({
      name: `groupImage${index}`,
      maxCount: 1,
    }))
  ),
  saveCategoryGroups
);
router.post("/restore-defaults", adminAuth, restoreCategoryGroups);

export default router;
