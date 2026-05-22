import mongoose from "mongoose";

const pageImagesSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    aboutImage: { type: String, default: "" },
    aboutImageAlt: { type: String, default: "LEVON fragrance collection" },
    contactImage: { type: String, default: "" },
    contactImageAlt: { type: String, default: "Levon perfume contact" },
  },
  { timestamps: true }
);

const pageImagesModel =
  mongoose.models.pageImages || mongoose.model("pageImages", pageImagesSchema);

export default pageImagesModel;
