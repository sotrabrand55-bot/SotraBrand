import express from "express";
import {
  listBrandStatements,
  updateBrandStatement,
} from "../controllers/brandStatementController.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";

const brandStatementRouter = express.Router();

brandStatementRouter.get("/", listBrandStatements);
brandStatementRouter.get("/list", listBrandStatements);
brandStatementRouter.post(
  "/update",
  adminAuth,
  upload.single("image"),
  updateBrandStatement
);

export default brandStatementRouter;
