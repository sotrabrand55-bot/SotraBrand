import mongoose from "mongoose";

const brandStatementDetailSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const brandStatementSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "Levon Craft" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    buttonText: { type: String, default: "Explore More" },
    buttonLink: { type: String, default: "/Collection" },
    image: { type: String },
    imageAlt: { type: String },
    details: { type: [brandStatementDetailSchema], default: [] },
    imageEyebrow: { type: String },
    imageTitle: { type: String },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const brandStatementModel =
  mongoose.models.brandStatement ||
  mongoose.model("brandStatement", brandStatementSchema);

export default brandStatementModel;
