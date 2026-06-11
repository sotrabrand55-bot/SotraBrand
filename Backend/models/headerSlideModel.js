// models/headerSlideModel.js
import mongoose from "mongoose";

const headerSlideSchema = new mongoose.Schema(
  {
    image: { type: String, required: true }, // Mobile ImageKit URL
    imageFileId: { type: String, default: "" },
    desktopImage: { type: String, default: "" },
    desktopImageFileId: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const HeaderSlide =
  mongoose.models.HeaderSlide || mongoose.model("HeaderSlide", headerSlideSchema);
export default HeaderSlide;
