import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";
import {
  getSubcategoryPage,
  listSubcategoryPages,
  upsertSubcategoryPage,
} from "../controllers/subcategoryPageController.js";

const router = express.Router();

router.get("/list", listSubcategoryPages);
router.get("/:slug", getSubcategoryPage);
router.post(
  "/upsert/:slug",
  adminAuth,
  upload.fields([{ name: "mediaFile", maxCount: 1 }]),
  upsertSubcategoryPage
);

export default router;
