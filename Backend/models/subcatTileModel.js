// models/subcatTileModel.js
import mongoose from "mongoose";

const subcatTileSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    subKey: { type: String, required: true }, // e.g. "Amber", "Oud", must match your frontend filter values
    image: { type: String, required: true },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.SubcatTile ||
  mongoose.model("SubcatTile", subcatTileSchema);

