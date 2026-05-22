import express from "express";
import {
  getPageImages,
  updatePageImages,
} from "../controllers/pageImagesController.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";

const pageImagesRouter = express.Router();

pageImagesRouter.get("/", getPageImages);
pageImagesRouter.get("/list", getPageImages);
pageImagesRouter.post(
  "/update",
  adminAuth,
  upload.fields([
    { name: "aboutImage", maxCount: 1 },
    { name: "contactImage", maxCount: 1 },
  ]),
  updatePageImages
);

export default pageImagesRouter;
