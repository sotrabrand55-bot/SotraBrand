import mongoose from "mongoose";

const categoryChildSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const categoryGroupSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
    image: { type: String, default: "" },
    imageFileId: { type: String, default: "" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    children: { type: [categoryChildSchema], default: [] },
  },
  { timestamps: true }
);

const categoryGroupModel =
  mongoose.models.categoryGroup ||
  mongoose.model("categoryGroup", categoryGroupSchema);

export default categoryGroupModel;
