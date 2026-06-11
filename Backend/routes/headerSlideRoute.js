// routes/headerSlideRoute.js
import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";
import {
  addSlide,
  listSlides,
  updateSlide,
  removeSlide,
} from "../controllers/headerSlideController.js";

const router = express.Router();

router.post("/add", adminAuth, upload.fields([
  { name: "image", maxCount: 1 },
  { name: "desktopImage", maxCount: 1 },
]), addSlide);
router.get("/list", listSlides);
router.post("/update/:id", adminAuth, upload.fields([
  { name: "image", maxCount: 1 },
  { name: "desktopImage", maxCount: 1 },
]), updateSlide);
router.post("/remove/:id", adminAuth , removeSlide);

export default router;
