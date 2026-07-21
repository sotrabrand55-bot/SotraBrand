import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema(
  {
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    tiktok: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    delivery_fee: { type: Number, default: 5 },
    announcementEnabled: { type: Boolean, default: true },
    announcementItems: {
      type: [String],
      default: ["Welcome to our store", "Cash On Delivery", "Tripoli Delivery Only $2"],
    },
    freeShippingEnabled: { type: Boolean, default: true },
    freeShippingText: { type: String, default: "Delivery $5 All Over Lebanon" },
    availableNowText: { type: String, default: "AVAILABLE NOW" },
    brandEmail: { type: String, default: "sotrabrand7@gmail.com" },
    brandPhone: { type: String, default: "71872919" },
    socialLinks: {
      type: socialLinksSchema,
      default: () => ({
        instagram: "https://www.instagram.com/sotra_brand_hijab?igsh=MWZiNzdkM3BuZnVndA%3D%3D&utm_source=qr",
        facebook: "https://www.facebook.com/share/1Cnd12KNGw/?mibextid=wwXIfr",
        tiktok: "https://www.tiktok.com/@sotrabrand133?_r=1&_t=ZS-98BbAHXPjTc",
        whatsapp: "https://wa.me/96171872919",
        email: "sotrabrand7@gmail.com",
        phone: "71872919",
      }),
    },
  },
  { timestamps: true }
);

const siteSettingsModel =
  mongoose.models.siteSettings ||
  mongoose.model("siteSettings", siteSettingsSchema);

export default siteSettingsModel;
