import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema(
  {
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    tiktok: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    delivery_fee: { type: Number, default: 3 },
    announcementEnabled: { type: Boolean, default: true },
    announcementItems: {
      type: [String],
      default: ["FREE 10 mL Tester With Every Purchase", "Free Shipping On All Orders"],
    },
    freeShippingEnabled: { type: Boolean, default: true },
    freeShippingText: { type: String, default: "Free Shipping On All Orders" },
    availableNowText: { type: String, default: "AVAILABLE NOW" },
    brandEmail: { type: String, default: "beradiantnancy@gmail.com" },
    socialLinks: {
      type: socialLinksSchema,
      default: () => ({
        instagram: "https://www.instagram.com/radiant_bynancy?igsh=MWY3YmwxcjNyYTNjcg==",
        facebook: "https://www.facebook.com/share/18oAYDyvZt/",
        tiktok: "https://www.tiktok.com/@radiant.nancy?_r=1&_t=ZS-96qoZYlR9xF",
        email: "beradiantnancy@gmail.com",
      }),
    },
  },
  { timestamps: true }
);

const siteSettingsModel =
  mongoose.models.siteSettings ||
  mongoose.model("siteSettings", siteSettingsSchema);

export default siteSettingsModel;
