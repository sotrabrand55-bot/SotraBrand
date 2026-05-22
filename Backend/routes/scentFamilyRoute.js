import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  addScentFamily,
  listScentFamilies,
  removeScentFamily,
  restoreDefaultScentFamilies,
} from "../controllers/scentFamilyController.js";

const scentFamilyRouter = express.Router();

scentFamilyRouter.get("/list", listScentFamilies);
scentFamilyRouter.post("/add", adminAuth, addScentFamily);
scentFamilyRouter.post("/remove", adminAuth, removeScentFamily);
scentFamilyRouter.post("/restore-defaults", adminAuth, restoreDefaultScentFamilies);

export default scentFamilyRouter;
