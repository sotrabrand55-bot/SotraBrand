// routes/headerSlideRoute.js
import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js"; // <-- uses memoryStorage (same as subcatTile)
import {
  addSlide,
  listSlides,
  updateSlide,
  removeSlide,
} from "../controllers/headerSlideController.js";

const router = express.Router();

router.post("/add", adminAuth , upload.single("image"), addSlide);
router.get("/list", listSlides);
router.post("/update/:id", adminAuth , upload.single("image"), updateSlide);
router.post("/remove/:id", adminAuth , removeSlide);

export default router;