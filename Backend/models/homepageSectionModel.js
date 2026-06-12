import mongoose from "mongoose";

const homepageSectionItemSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    type: { type: String, enum: ["image", "video"], default: "image" },
    src: { type: String, default: "" },
    fileId: { type: String, default: "" },
    desktopSrc: { type: String, default: "" },
    desktopFileId: { type: String, default: "" },
    poster: { type: String, default: "" },
    posterFileId: { type: String, default: "" },
    alt: { type: String, default: "" },
    label: { type: String, default: "" },
    buttonLabel: { type: String, default: "" },
    productId: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const homepageSectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    title: { type: String, default: "" },
    active: { type: Boolean, default: true },
    preferredSizeNote: { type: String, default: "" },
    items: { type: [homepageSectionItemSchema], default: [] },
  },
  { timestamps: true }
);

const homepageSectionModel =
  mongoose.models.homepageSection ||
  mongoose.model("homepageSection", homepageSectionSchema);

export default homepageSectionModel;
