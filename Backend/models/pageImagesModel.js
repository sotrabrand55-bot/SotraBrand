import mongoose from "mongoose";

const pageImagesSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    aboutImage: { type: String, default: "" },
    aboutImageFileId: { type: String, default: "" },
    aboutImageAlt: { type: String, default: "SotraBrand collection" },
    contactImage: { type: String, default: "" },
    contactImageFileId: { type: String, default: "" },
    contactImageAlt: { type: String, default: "SotraBrand contact" },
  },
  { timestamps: true }
);

const pageImagesModel =
  mongoose.models.pageImages || mongoose.model("pageImages", pageImagesSchema);

export default pageImagesModel;
