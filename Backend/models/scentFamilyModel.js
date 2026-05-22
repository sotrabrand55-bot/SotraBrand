import mongoose from "mongoose";

const scentFamilySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
    category: { type: String, default: "Fragrance" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const scentFamilyModel =
  mongoose.models.scentFamily ||
  mongoose.model("scentFamily", scentFamilySchema);

export default scentFamilyModel;
