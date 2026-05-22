import mongoose from "mongoose";

const giftSetDisplaySlotSchema = new mongoose.Schema(
  {
    slot: { type: Number, required: true, min: 1, max: 3 },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    buttonText: { type: String, default: "Shop Set" },
    image: { type: String, default: "" },
    linkTo: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const giftSetDisplaySchema = new mongoose.Schema({
  key: { type: String, default: "main", unique: true },
  slots: {
    type: [giftSetDisplaySlotSchema],
    default: () => [
      { slot: 1, active: true, buttonText: "Shop Set" },
      { slot: 2, active: true, buttonText: "Shop Set" },
      { slot: 3, active: true, buttonText: "Shop Set" },
    ],
  },
  updatedAt: { type: Number, default: Date.now },
});

const giftSetDisplayModel =
  mongoose.models.giftSetDisplay ||
  mongoose.model("giftSetDisplay", giftSetDisplaySchema);

export default giftSetDisplayModel;
