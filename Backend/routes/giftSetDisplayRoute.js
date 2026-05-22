import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";
import {
  getGiftSetDisplay,
  updateGiftSetDisplay,
} from "../controllers/giftSetDisplayController.js";

const giftSetDisplayRouter = express.Router();

giftSetDisplayRouter.get("/", getGiftSetDisplay);
giftSetDisplayRouter.post(
  "/update",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ]),
  updateGiftSetDisplay
);

export default giftSetDisplayRouter;
