// models/headerSlideModel.js
import mongoose from "mongoose";

const headerSlideSchema = new mongoose.Schema(
  {
    image: { type: String, required: true }, // ImageKit URL
    title: { type: String, required: true },
    blurb: { type: String, default: "" },
    badges: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const HeaderSlide =
  mongoose.models.HeaderSlide || mongoose.model("HeaderSlide", headerSlideSchema);
export default HeaderSlide;
