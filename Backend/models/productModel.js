import mongoose from "mongoose";
// we import the product data from frontend to store it in the data base
const productReviewSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Customer" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
    date: { type: Number, default: Date.now },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: Array, required: true },
  imageMeta: {
    type: [
      {
        url: { type: String, default: "" },
        fileId: { type: String, default: "" },
      },
    ],
    default: [],
  },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  concentration: { type: String },
  perfumeTypes: {
    type: [String],
    default: [],
  },
  sizes: {
    type: [String],
    default: [],
  },
  bestseller: { type: Boolean },
  newArrival: { type: Boolean },
  onSales: { type: Boolean },
  date: { type: Number, required: true },
  discountPrice: { type: Number },       // ✅ new field
  rating: { type: Number, default: 5 },
  reviewCount: { type: Number, default: 0 },
  reviews: { type: [productReviewSchema], default: [] },
  colors: [String],                      // ✅ new field
  active: { type: Boolean, default: true },       // ✅ new field
  outOfStock: { type: Boolean, default: false },  // ✅ new field
  stock: { type: Number, min: 0 },
  featuredSlot: { type: Number },
  showSmallImages: { type: Boolean, default: true },
  shadeOptions: {
    type: [
      {
        id: { type: String, default: "" },
        label: { type: String, default: "" },
        cartValue: { type: String, default: "" },
        image: { type: String, default: "" },
        fileId: { type: String, default: "" },
        description: { type: String, default: "" },
        order: { type: Number, default: 0 },
      },
    ],
    default: [],
  },
  storyImages: {
    type: [
      {
        id: { type: String, default: "" },
        image: { type: String, default: "" },
        fileId: { type: String, default: "" },
        alt: { type: String, default: "" },
        order: { type: Number, default: 0 },
      },
    ],
    default: [],
  },
  setContents: {
    type: [
      {
        id: { type: String, default: "" },
        image: { type: String, default: "" },
        fileId: { type: String, default: "" },
        label: { type: String, default: "" },
        description: { type: String, default: "" },
        alt: { type: String, default: "" },
        order: { type: Number, default: 0 },
        gallery: {
          type: [
            {
              id: { type: String, default: "" },
              image: { type: String, default: "" },
              fileId: { type: String, default: "" },
              alt: { type: String, default: "" },
              order: { type: Number, default: 0 },
            },
          ],
          default: [],
        },
      },
    ],
    default: [],
  },
});

// this or operatior  when the product models is already available than that model will be used the(mongoose.models.product) and if its not available it will create a new model using this schema( mongoose.model("product",productSchema))
const productModel =
  mongoose.models.product || mongoose.model("product", productSchema); // we store the product schema in the product model whenever we will
// run this projuct then the model will be created multiples times and we can create the model only once

export default productModel;
