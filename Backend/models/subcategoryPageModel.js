import mongoose from "mongoose";

const subcategoryDetailSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    text: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const subcategoryMediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image", "video"], default: "image" },
    src: { type: String, default: "" },
    fileId: { type: String, default: "" },
    alt: { type: String, default: "" },
  },
  { _id: false }
);

const subcategoryPageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    categoryLabel: { type: String, default: "" },
    subcategoryLabel: { type: String, default: "" },
    featuredProductId: { type: String, default: "" },
    advice: { type: String, default: "" },
    details: { type: [subcategoryDetailSchema], default: [] },
    media: { type: subcategoryMediaSchema, default: () => ({}) },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const subcategoryPageModel =
  mongoose.models.subcategoryPage ||
  mongoose.model("subcategoryPage", subcategoryPageSchema);

export default subcategoryPageModel;
