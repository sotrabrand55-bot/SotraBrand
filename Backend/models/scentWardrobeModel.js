import mongoose from "mongoose";

const scentWardrobeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, required: true },
    tags: { type: [String], default: [] },
    targetType: {
      type: String,
      enum: ["scentFamily", "category", "product", "custom"],
      default: "scentFamily",
    },
    targetValue: { type: String, default: "" },
    linkTo: { type: String, default: "/collection" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const scentWardrobeModel =
  mongoose.models.scentWardrobe ||
  mongoose.model("scentWardrobe", scentWardrobeSchema);

export default scentWardrobeModel;
