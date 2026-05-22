import express from "express";
import upload from "../middleware/multer.js";
import {addTile,listTiles,removeTile,updateTile } 
  from "../controllers/subcatTileController.js";
import adminAuth from "../middleware/adminAuth.js"; // your existing admin auth middleware

const router = express.Router();

router.post("/add", adminAuth, upload.single("image"), addTile);
router.get("/list", listTiles);
router.post("/remove", adminAuth,removeTile);
// The one your frontend calls:
router.put("/update/:id", adminAuth, upload.single("image"), updateTile);
// (Optional fallback) allow POST with { id } in body:
router.post("/update", adminAuth, upload.single("image"), updateTile);

export default router;
