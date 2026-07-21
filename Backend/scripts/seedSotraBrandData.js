import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import imagekit from "../config/ImageKit.js";
import productModel from "../models/productModel.js";
import HeaderSlide from "../models/headerSlideModel.js";
import homepageSectionModel from "../models/homepageSectionModel.js";
import siteSettingsModel from "../models/siteSettingsModel.js";
import categoryGroupModel from "../models/categoryGroupModel.js";
import { deleteImageKitAssets } from "../utils/imagekitCleanup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const assetRoot = path.join(projectRoot, "Frontend", "src", "assets", "sotraBrand");
const now = Date.now();

const file = (...parts) => path.join(assetRoot, ...parts);

const assets = {
  logo: file("Logo_Sotra.jpeg"),
  header1: file("Header_1.jpeg"),
  header2: file("Header_2.jpeg"),
  header3: file("Header_3.jpeg"),
  video: file("WhatsApp Video 2026-07-20 at 10.04.08 AM.mp4"),
  abaya: [
    file("abaya (2).jpeg"),
    file("abaya (3).jpeg"),
    file("abaya (1).jpeg"),
    file("abaya (4).jpeg"),
    file("abaya1.jpeg"),
    file("abaya2.jpeg"),
    file("abaya3.jpeg"),
    file("abaya4.jpeg"),
    file("abaya5.jpeg"),
    file("abaya6.jpeg"),
  ],
  dresses: [
    file("dresses.jpeg"),
    file("dresses (1).jpeg"),
    file("dresses (3).jpeg"),
    file("dresses (4).jpeg"),
    file("dresses (5).jpeg"),
  ],
  hijabs: [
    file("hijab_products.jpeg"),
    file("hijab2_.jpeg"),
    file("hijab3.jpeg"),
    file("hijab4.jpeg"),
    file("hijab5.jpeg"),
  ],
  islamic: [file("islamic (1).jpeg"), file("islamic (2).jpeg")],
  blouses: [
    file("blouses1 (1).jpeg"),
    file("blouses1 (2).jpeg"),
    file("blouses1 (3).jpeg"),
  ],
};

const categoryGroups = [
  ["Abaya", "abaya"],
  ["Dresses", "dresses"],
  ["Hijabs", "hijabs"],
  ["Islamic Essentials", "islamic-essentials"],
  ["Blouses", "blouses"],
].map(([label, slug], order) => ({
  label,
  slug,
  active: true,
  order,
  children: [{ label, slug, active: true, order: 0 }],
}));

const settings = {
  key: "main",
  delivery_fee: 5,
  announcementEnabled: true,
  announcementItems: ["Welcome to our store", "Cash On Delivery", "Tripoli Delivery Only $2"],
  freeShippingEnabled: true,
  freeShippingText: "Delivery $5 All Over Lebanon",
  availableNowText: "SOTRA Modest Fashion",
  brandEmail: "Serinachendeb133@gmail.com",
  brandPhone: "71872919",
  socialLinks: {
    instagram:
      "https://www.instagram.com/sotra_brand_hijab?igsh=MWZiNzdkM3BuZnVndA%3D%3D&utm_source=qr",
    facebook: "https://www.facebook.com/share/1Cnd12KNGw/?mibextid=wwXIfr",
    tiktok: "https://www.tiktok.com/@sotrabrand133?_r=1&_t=ZS-98BbAHXPjTc",
    whatsapp: "https://wa.me/96171872919",
    email: "Serinachendeb133@gmail.com",
    phone: "71872919",
  },
};

const descriptions = {
  Abaya:
    "A graceful abaya selected for modest coverage, easy movement, and refined everyday elegance. The silhouette is comfortable without losing its polished shape, making it suitable for visits, errands, prayer, and special moments.",
  Dresses:
    "A modest dress designed with a soft feminine line and thoughtful coverage. The fabric, length, and movement make it easy to style for daytime, gatherings, and elevated occasions while staying true to SOTRA's elegant modest mood.",
  Hijabs:
    "A comfortable hijab chosen for smooth drape, reliable coverage, and styling flexibility. It sits neatly with everyday outfits and occasion looks, giving a clean finish without feeling heavy.",
  "Islamic Essentials":
    "An essential modest piece created to support daily routines with comfort and confidence. It is practical, refined, and easy to pair with SOTRA dresses, abayas, and hijabs.",
  Blouses:
    "A modest blouse with a clean shape, soft coverage, and an easy fit for layering. It pairs beautifully with skirts, trousers, abayas, and hijabs for a complete SOTRA wardrobe look.",
};

const productCatalog = {
  Abaya: [
    ["Black Flow Abaya", "Elegant Edit", 90, 0, ["Beige", "Brown"], [0, 1]],
    ["Everyday Soft Abaya", "Everyday Modesty", 82, 68, ["Plum"], [2]],
    ["Layered Modest Abaya", "New Arrival", 96, 0, ["Green"], [3]],
    ["Classic Sotra Abaya", "Elegant Edit", 88, 0, ["Brown", "Beige"], [1, 0]],
    ["Premium Occasion Abaya", "New Arrival", 110, 92, ["Black"], [4]],
    ["Comfort Wrap Abaya", "Everyday Modesty", 78, 0, ["Soft Black"], [5]],
  ],
  Dresses: [
    ["Modest Satin Dress", "Elegant Edit", 78, 0, ["Sky Blue", "Aqua Blue", "Burgundy"], [0, 3, 2]],
    ["Soft Day Dress", "Everyday Modesty", 72, 58, ["Sage Floral", "Yellow Floral"], [1, 4]],
    ["Evening Modesty Dress", "New Arrival", 95, 0, ["Burgundy", "Aqua Blue"], [2, 3]],
    ["Garden Flow Dress", "Elegant Edit", 86, 0, ["Aqua Blue", "Sky Blue"], [3, 0]],
    ["Long Sleeve Dress", "Everyday Modesty", 80, 64, ["Yellow Floral", "Sage Floral"], [4, 1]],
    ["Sotra Occasion Dress", "New Arrival", 105, 0, ["Sky Blue"], [0]],
  ],
  Hijabs: [
    ["Premium Chiffon Hijab", "Hijab Essentials", 18, 0, ["Classic"], [0]],
    ["Soft Jersey Hijab", "Everyday Modesty", 20, 16, ["Soft Neutral"], [1]],
    ["Essential Crepe Hijab", "Hijab Essentials", 17, 0, ["Everyday"], [2]],
    ["Everyday Modal Hijab", "New Arrival", 22, 0, ["Essential"], [3]],
    ["Elegant Evening Hijab", "Elegant Edit", 24, 19, ["Statement"], [4]],
    ["Classic Sotra Hijab", "Hijab Essentials", 18, 0, ["Classic", "Soft Neutral"], [0, 1]],
  ],
  "Islamic Essentials": [
    ["Sotra Arm Sleeves", "Hijab Essentials", 12, 0, ["Black Sleeves"], [0]],
    ["Sotra Modest Gloves", "Everyday Modesty", 14, 0, ["Black Gloves"], [1]],
    ["Arm Sleeves And Gloves Set", "Hijab Essentials", 22, 18, ["Black Sleeves", "Black Gloves"], [0, 1]],
    ["Classic Black Gloves", "New Arrival", 14, 0, ["Classic Black"], [1]],
    ["Soft Black Arm Sleeves", "Everyday Modesty", 12, 0, ["Soft Black"], [0]],
    ["Sotra Modesty Essentials Set", "Elegant Edit", 24, 20, ["Black Gloves", "Black Sleeves"], [1, 0]],
  ],
  Blouses: [
    ["Soft Modest Blouse", "Everyday Modesty", 42, 0, ["Rose"], [0]],
    ["Elegant Tie Blouse", "Elegant Edit", 48, 38, ["Ivory"], [1]],
    ["Classic Covered Blouse", "New Arrival", 45, 0, ["Soft Pink"], [2]],
    ["Minimal Daily Blouse", "Everyday Modesty", 39, 0, ["Rose", "Ivory"], [0, 1]],
    ["Refined Satin Blouse", "Elegant Edit", 55, 44, ["Ivory", "Soft Pink"], [1, 2]],
    ["Sotra Layering Blouse", "New Arrival", 46, 0, ["Soft Pink"], [2]],
  ],
};

const buildMongoUri = () => {
  const baseUri = String(process.env.MONGO_URI || "").trim();
  const [uriWithoutQuery, query = ""] = baseUri.split("?");
  return `${uriWithoutQuery.replace(/\/+$/, "")}/levon_app${query ? `?${query}` : ""}`;
};

const assertEnv = () => {
  const missing = ["MONGO_URI", "IMAGEKIT_PUBLIC_KEY", "IMAGEKIT_PRIVATE_KEY", "IMAGEKIT_URL_ENDPOINT"].filter(
    (key) => !process.env[key]
  );
  if (missing.length) throw new Error(`Missing required env values: ${missing.join(", ")}`);
};

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const safeFileName = (label, filePath) => {
  const ext = path.extname(filePath) || ".jpg";
  const base = slugify(label || path.basename(filePath, ext)).slice(0, 80);
  return `${base || "sotra-asset"}-${Date.now()}-${Math.round(Math.random() * 9999)}${ext}`;
};

const uploadLocalAsset = async (filePath, label) => {
  const buffer = await fs.readFile(filePath);
  const uploaded = await imagekit.upload({
    file: buffer,
    fileName: safeFileName(label, filePath),
  });
  return { url: uploaded.url, fileId: uploaded.fileId || "" };
};

const mediaAssets = (items = []) =>
  items
    .flatMap((item) => [
      { url: item?.image || item?.src || "", fileId: item?.fileId || "" },
      { url: item?.desktopSrc || "", fileId: item?.desktopFileId || "" },
      { url: item?.poster || "", fileId: item?.posterFileId || "" },
    ])
    .filter((item) => item.url || item.fileId);

const productAssets = (product) => [
  ...(Array.isArray(product?.imageMeta) ? product.imageMeta : []),
  ...mediaAssets(product?.shadeOptions || []),
  ...mediaAssets(product?.storyImages || []),
  ...(Array.isArray(product?.setContents)
    ? product.setContents.flatMap((item) => [
        { url: item.image, fileId: item.fileId },
        ...mediaAssets(item.gallery || []),
      ])
    : []),
];

const cleanupCollection = async () => {
  const [products, slides, sections] = await Promise.all([
    productModel.find({}).lean(),
    HeaderSlide.find({}).lean(),
    homepageSectionModel.find({}).lean(),
  ]);

  for (const product of products) {
    await deleteImageKitAssets(productAssets(product));
  }
  for (const slide of slides) {
    await deleteImageKitAssets([
      { url: slide.image, fileId: slide.imageFileId },
      { url: slide.desktopImage, fileId: slide.desktopImageFileId },
    ]);
  }
  for (const section of sections) {
    await deleteImageKitAssets(mediaAssets(section.items || []));
  }

  await Promise.all([
    productModel.deleteMany({}),
    HeaderSlide.deleteMany({}),
    homepageSectionModel.deleteMany({}),
    categoryGroupModel.deleteMany({}),
  ]);
};

const getPool = (category) => {
  if (category === "Abaya") return assets.abaya;
  if (category === "Dresses") return assets.dresses;
  if (category === "Hijabs") return assets.hijabs;
  if (category === "Islamic Essentials") return assets.islamic;
  return assets.blouses;
};

const buildProducts = async () => {
  const products = [];
  let index = 0;

  for (const [category, definitions] of Object.entries(productCatalog)) {
    const pool = getPool(category);
    for (const [name, collection, price, discountPrice, colorLabels, imageIndexes] of definitions) {
      const uploads = [];
      for (let optionIndex = 0; optionIndex < imageIndexes.length; optionIndex += 1) {
        const localImage = pool[imageIndexes[optionIndex] % pool.length];
        uploads.push(await uploadLocalAsset(localImage, `${slugify(name)}-${optionIndex + 1}`));
      }

      const hasFit = ["Abaya", "Dresses", "Blouses"].includes(category);
      const stock = index === 11 ? 0 : 4 + (index % 6) * 3;
      products.push({
        name,
        description: `${name} belongs to the ${collection} selection at SotraBrand. ${descriptions[category]} Every detail is chosen to help the customer feel confident, covered, and dressed with purpose.`,
        price,
        discountPrice: discountPrice || 0,
        image: uploads.map((item) => item.url),
        imageMeta: uploads,
        storyImages: uploads.map((item, storyIndex) => ({
          id: `${slugify(name)}-story-${storyIndex + 1}`,
          image: item.url,
          fileId: item.fileId,
          alt: storyIndex === 0 ? name : `${name} detail ${storyIndex + 1}`,
          order: storyIndex + 1,
        })),
        shadeOptions: uploads.map((item, optionIndex) => ({
          id: `${slugify(name)}-color-${optionIndex + 1}`,
          label: colorLabels[optionIndex] || `Color ${optionIndex + 1}`,
          cartValue: colorLabels[optionIndex] || `Color ${optionIndex + 1}`,
          image: item.url,
          fileId: item.fileId,
          description: `${colorLabels[optionIndex] || "Color"} option for ${name}.`,
          order: optionIndex + 1,
        })),
        setContents: [],
        category,
        subCategory: category,
        concentration: collection,
        perfumeTypes: [],
        sizes: [],
        fitMin: hasFit ? 50 : undefined,
        fitMax: hasFit ? 110 : undefined,
        fitUnit: hasFit ? "kg" : "",
        colors: colorLabels.map((color) => color.toLowerCase()),
        bestseller: index % 4 === 0,
        newArrival: collection === "New Arrival",
        onSales: Boolean(discountPrice),
        active: true,
        outOfStock: stock === 0,
        stock,
        showSmallImages: true,
        featuredSlot: index === 0 ? 1 : undefined,
        date: now - index * 1000,
      });
      index += 1;
    }
  }

  await productModel.insertMany(products);
  return products.length;
};

const seedHeaderSlides = async () => {
  const slides = [assets.header1, assets.header2, assets.header3];
  for (let order = 0; order < slides.length; order += 1) {
    const image = await uploadLocalAsset(slides[order], `sotra-header-mobile-${order + 1}`);
    const desktopImage = await uploadLocalAsset(slides[order], `sotra-header-desktop-${order + 1}`);
    await HeaderSlide.create({
      image: image.url,
      imageFileId: image.fileId,
      desktopImage: desktopImage.url,
      desktopImageFileId: desktopImage.fileId,
      order,
      active: true,
    });
  }
  return slides.length;
};

const seedHomepageSections = async () => {
  const luxuryItems = [
    ["sotra-video-1", "video", assets.video, "SotraBrand modest fashion video"],
    ["sotra-gallery-1", "image", assets.header1, "SotraBrand abaya styling"],
    ["sotra-gallery-2", "image", assets.hijabs[0], "SotraBrand hijab essentials"],
    ["sotra-gallery-3", "image", assets.blouses[0], "SotraBrand blouse edit"],
  ];
  const singleItems = [["sotra-single-campaign", "video", assets.video, "SotraBrand campaign video"]];
  const sectionDefinitions = [
    {
      key: "luxury-gallery",
      title: "SotraBrand Edit",
      preferredSizeNote: "Mobile: vertical 9:16 videos/images. Laptop: 4 vertical columns work best.",
      items: luxuryItems,
    },
    {
      key: "single-campaign",
      title: "SotraBrand Campaign",
      preferredSizeNote: "Mobile: 9:16 vertical. Laptop: wide 2:1 media matching the header width.",
      items: singleItems,
    },
  ];

  for (const section of sectionDefinitions) {
    const items = [];
    for (let order = 0; order < section.items.length; order += 1) {
      const [id, type, localFile, label] = section.items[order];
      const uploaded = await uploadLocalAsset(localFile, `${section.key}-${id}`);
      items.push({
        id,
        type,
        src: uploaded.url,
        fileId: uploaded.fileId,
        alt: type === "image" ? label : "",
        label,
        order,
        active: true,
      });
    }
    await homepageSectionModel.create({
      key: section.key,
      title: section.title,
      preferredSizeNote: section.preferredSizeNote,
      active: true,
      items,
    });
  }

  return sectionDefinitions.length;
};

const seedSettings = async () => {
  await siteSettingsModel.findOneAndUpdate(
    { key: "main" },
    { $set: settings },
    { upsert: true, new: true }
  );
};

const main = async () => {
  assertEnv();
  await mongoose.connect(buildMongoUri());
  console.log("Seeding SotraBrand backend data...");

  await cleanupCollection();
  await seedSettings();
  await categoryGroupModel.insertMany(categoryGroups);
  const slides = await seedHeaderSlides();
  const sections = await seedHomepageSections();
  const products = await buildProducts();

  console.log(
    `Done. Seeded ${products} products, ${slides} header slides, ${sections} homepage sections, ${categoryGroups.length} categories, and site settings.`
  );
};

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
