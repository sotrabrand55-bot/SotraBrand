import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";
import {
  getHomepageSection,
  listHomepageSections,
  removeHomepageSection,
  upsertHomepageSection,
} from "../controllers/homepageSectionController.js";

const mediaFields = [
  ...Array.from({ length: 12 }, (_, index) => ({
    name: `itemFile${index}`,
    maxCount: 1,
  })),
  ...Array.from({ length: 12 }, (_, index) => ({
    name: `desktopFile${index}`,
    maxCount: 1,
  })),
  ...Array.from({ length: 12 }, (_, index) => ({
    name: `posterFile${index}`,
    maxCount: 1,
  })),
];

const router = express.Router();

router.get("/list", listHomepageSections);
router.get("/:key", getHomepageSection);
router.post(
  "/upsert/:key",
  adminAuth,
  upload.fields(mediaFields),
  upsertHomepageSection
);
router.post("/remove/:key", adminAuth, removeHomepageSection);

export default router;
