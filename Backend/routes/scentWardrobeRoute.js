import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";
import {
  addScentWardrobe,
  listScentWardrobe,
  removeScentWardrobe,
  updateScentWardrobe,
} from "../controllers/scentWardrobeController.js";

const scentWardrobeRouter = express.Router();

scentWardrobeRouter.get("/list", listScentWardrobe);
scentWardrobeRouter.post("/add", adminAuth, upload.single("image"), addScentWardrobe);
scentWardrobeRouter.put("/update/:id", adminAuth, upload.single("image"), updateScentWardrobe);
scentWardrobeRouter.post("/remove", adminAuth, removeScentWardrobe);

export default scentWardrobeRouter;
