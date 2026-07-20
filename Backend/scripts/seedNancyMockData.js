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
const frontendAssetRoot = path.join(projectRoot, "Frontend", "src", "assets");

const now = Date.now();

const asset = (...parts) => path.join(frontendAssetRoot, ...parts);

const assetPaths = {
  headerFirst: asset("first.jpeg"),
  headerSecond: asset("second.jpeg"),
  headerThird: asset("third.jpeg"),
  bodySplashIcon: asset("nancy-products", "body-splash-icon.jpeg"),
  bodyOilIcon: asset("nancy-products", "body-oil-icon.jpeg"),
  bodyLotionIcon: asset("nancy-products", "body-lotion-icon.jpeg"),
  bodyOilBenefits: asset("nancy-products", "body-oil-benefits.jpeg"),
  pheromoneGiftBoxProducts: asset("nancy-products", "pheromone-gift-box-products.jpeg"),
  pheromoneEmptyBox: asset("nancy-products", "pheromone-empty-box.jpeg"),
  bodyOilStoryBenefits: asset("nancy-products", "body-oil-story-benefits.jpeg"),
  bodySplashCampaign: asset("nancy-products", "body-splash-campaign.jpeg"),
  bodySplashNotes: asset("nancy-products", "body-splash-notes.jpeg"),
  bodyLotionWater: asset("nancy-products", "body-lotion-water.jpeg"),
  bodyLotionTexture: asset("nancy-products", "body-lotion-texture.jpeg"),
  bodyLotionSplash: asset("nancy-products", "body-lotion-splash.jpeg"),
  bodyCareLineup: asset("nancy-products", "body-care-lineup.jpeg"),
  dailyRitual: asset("nancy-products", "daily-ritual.jpeg"),
  pheromoneGiftBoxStory: asset("nancy-products", "pheromone-gift-box-story.jpeg"),
  mystiqueBoxBottle: asset("nancy-products", "mystique", "mystique-box-bottle.jpeg"),
  mystiqueGiftBox: asset("nancy-products", "mystique", "mystique-gift-box.jpeg"),
  mystiqueOrchidBottle: asset("nancy-products", "mystique", "mystique-orchid-bottle.jpeg"),
  mystiqueRedSmoke: asset("nancy-products", "mystique", "mystique-red-smoke.jpeg"),
  mystiqueRedDress: asset("nancy-products", "mystique", "mystique-red-dress.jpeg"),
  nancyVideo1: asset("videos", "nancy-video-1.mp4"),
  nancyVideo2: asset("videos", "nancy-video-2.mp4"),
  nancyVideo3: asset("videos", "nancy-video-3.mp4"),
  nancyVideo4: asset("videos", "nancy-video-4.mp4"),
  nancyVideo5: asset("videos", "nancy-video-5.mp4"),
};

const assertEnv = () => {
  const missing = ["MONGO_URI", "IMAGEKIT_PUBLIC_KEY", "IMAGEKIT_PRIVATE_KEY", "IMAGEKIT_URL_ENDPOINT"].filter(
    (key) => !process.env[key]
  );
  if (missing.length) {
    throw new Error(`Missing required env values: ${missing.join(", ")}`);
  }
};

const connectDB = async () => {
  await mongoose.connect(`${process.env.MONGO_URI}/levon_app`);
};

const safeFileName = (label, filePath) => {
  const extension = path.extname(filePath) || ".jpg";
  const base = String(label || path.basename(filePath, extension))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "nancy-asset"}-${Date.now()}-${Math.round(Math.random() * 9999)}${extension}`;
};

const uploadLocalAsset = async (filePath, label) => {
  const file = await fs.readFile(filePath);
  const uploaded = await imagekit.upload({
    file,
    fileName: safeFileName(label, filePath),
  });
  return {
    url: uploaded.url,
    fileId: uploaded.fileId || "",
  };
};

const mediaAssets = (items = []) =>
  items
    .map((item) => ({ url: item?.image || item?.src || item?.desktopSrc || item?.poster || "", fileId: item?.fileId || item?.desktopFileId || item?.posterFileId || "" }))
    .filter((item) => item.url || item.fileId);

const productAssets = (product) => [
  ...(Array.isArray(product?.imageMeta) ? product.imageMeta : []),
  ...mediaAssets(product?.shadeOptions || []),
  ...mediaAssets(product?.storyImages || []),
];

const sectionAssets = (section) =>
  (section?.items || []).flatMap((item) => [
    { url: item.src, fileId: item.fileId },
    { url: item.desktopSrc, fileId: item.desktopFileId },
    { url: item.poster, fileId: item.posterFileId },
  ]);

const settings = {
  key: "main",
  delivery_fee: 5,
  announcementEnabled: true,
  announcementItems: ["Welcome to our store", "Cash On Delivery", "Tripoli Delivery Only $2"],
  freeShippingEnabled: true,
  freeShippingText: "Delivery $5 All Over Lebanon",
  availableNowText: "AVAILABLE NOW",
  brandEmail: "beradiantnancy@gmail.com",
  socialLinks: {
    instagram: "https://www.instagram.com/radiant_bynancy?igsh=MWY3YmwxcjNyYTNjcg==",
    facebook: "https://www.facebook.com/share/18oAYDyvZt/",
    tiktok: "https://www.tiktok.com/@radiant.nancy?_r=1&_t=ZS-96qoZYlR9xF",
    email: "beradiantnancy@gmail.com",
  },
};

const categoryGroups = [
  {
    label: "Pheromone Touch",
    slug: "pheromone-touch",
    active: true,
    order: 0,
    children: [
      ["Pheromone Touch", "pheromone-touch"],
      ["Body lotion pheromone", "body-lotion-pheromone"],
      ["Body oil pheromone", "body-oil-pheromone"],
      ["Body splash pheromone", "body-splash-pheromone"],
      ["Body scrub pheromone", "body-scrub-pheromone"],
    ].map(([label, slug], order) => ({ label, slug, order, active: true })),
  },
  {
    label: "Mystique Set",
    slug: "mystique-set",
    active: true,
    order: 1,
    children: [
      ["Mystique parfum", "mystique-parfum"],
      ["Body lotion mystique", "body-lotion-mystique"],
      ["Body splash mystique", "body-splash-mystique"],
    ].map(([label, slug], order) => ({ label, slug, order, active: true })),
  },
  {
    label: "Roll-on",
    slug: "roll-on",
    active: true,
    order: 2,
    children: [["Radiant charm", "radiant-charm"]].map(([label, slug], order) => ({
      label,
      slug,
      order,
      active: true,
    })),
  },
];

const pheromoneShadeDefinitions = [
  {
    id: "body-splash",
    label: "Body Splash",
    cartValue: "Body Splash",
    file: assetPaths.bodySplashIcon,
    description: "Body Splash Pheromone Touch. A fresh, radiant body mist with a soft feminine trail.",
  },
  {
    id: "body-oil",
    label: "Body Oil",
    cartValue: "Body Oil",
    file: assetPaths.bodyOilIcon,
    description: "Body Oil Pheromone Touch. A silky nourishing oil for glow, softness, and a luxurious finish.",
  },
  {
    id: "body-lotion",
    label: "Body Lotion",
    cartValue: "Body Lotion",
    file: assetPaths.bodyLotionIcon,
    description: "Body Lotion Pheromone Touch. A smooth hydrating lotion for soft, radiant skin.",
  },
];

const pheromoneStoryDefinitions = [
  ["body-oil-benefits", assetPaths.bodyOilBenefits, "Radiant Body Oil benefits story image"],
  ["pheromone-gift-box-products", assetPaths.pheromoneGiftBoxProducts, "Pheromone Touch product gift box"],
  ["pheromone-empty-box", assetPaths.pheromoneEmptyBox, "Pheromone Touch empty pink gift box"],
  ["body-oil-story-benefits", assetPaths.bodyOilStoryBenefits, "Body Oil product benefit details"],
  ["body-splash-campaign", assetPaths.bodySplashCampaign, "Body Splash campaign story image"],
  ["body-splash-notes", assetPaths.bodySplashNotes, "Body Splash fragrance notes story image"],
  ["body-lotion-water", assetPaths.bodyLotionWater, "Body Lotion water and rose story image"],
  ["body-lotion-texture", assetPaths.bodyLotionTexture, "Body Lotion texture story image"],
  ["body-lotion-splash", assetPaths.bodyLotionSplash, "Body Lotion splash story image"],
  ["body-care-lineup", assetPaths.bodyCareLineup, "Pheromone Touch body care lineup"],
  ["daily-ritual", assetPaths.dailyRitual, "Pheromone Touch daily ritual story image"],
  ["pheromone-gift-box-story", assetPaths.pheromoneGiftBoxStory, "Pheromone Touch gift box story image"],
];

const mystiqueShadeDefinitions = [
  {
    id: "mystique-parfum",
    label: "Mystique Parfum",
    cartValue: "Mystique Parfum",
    file: assetPaths.mystiqueBoxBottle,
    description: "Mystique Parfum. A deep red floral fragrance with a confident, elegant trail.",
    alt: "Mystique perfume bottle beside its black box",
  },
  {
    id: "mystique-red-smoke",
    label: "Red Bloom",
    cartValue: "Mystique Red Bloom",
    file: assetPaths.mystiqueRedSmoke,
    description: "Mystique Red Bloom. A dramatic floral moment with soft sweetness and a bold feminine finish.",
    alt: "Mystique red perfume bottle with red smoke",
  },
  {
    id: "mystique-orchid",
    label: "Orchid Touch",
    cartValue: "Mystique Orchid Touch",
    file: assetPaths.mystiqueOrchidBottle,
    description: "Mystique Orchid Touch. A sensual red-flower expression made for evening glow.",
    alt: "Mystique red perfume bottle with dark red flowers",
  },
  {
    id: "mystique-gift-box",
    label: "Gift Box",
    cartValue: "Mystique Gift Box",
    file: assetPaths.mystiqueGiftBox,
    description: "Mystique Gift Box. A premium black and red presentation for a refined Nancy fragrance ritual.",
    alt: "Be Radiant By Nancy black gift box with red flowers",
  },
];

const catalogDefinitions = [
  ["Pheromone Touch", "Pheromone Touch", "pheromone-touch", 36, "100ml", "Body Ritual"],
  ["Pheromone Touch", "Body lotion pheromone", "body-lotion-pheromone", 28, "250ml", "Body Lotion"],
  ["Pheromone Touch", "Body oil pheromone", "body-oil-pheromone", 32, "100ml", "Body Oil"],
  ["Pheromone Touch", "Body splash pheromone", "body-splash-pheromone", 26, "250ml", "Body Splash"],
  ["Pheromone Touch", "Body scrub pheromone", "body-scrub-pheromone", 30, "300g", "Body Scrub"],
  ["Mystique Set", "Mystique parfum", "mystique-parfum", 48, "50ml", "Parfum"],
  ["Mystique Set", "Body lotion mystique", "body-lotion-mystique", 30, "250ml", "Body Lotion"],
  ["Mystique Set", "Body splash mystique", "body-splash-mystique", 28, "250ml", "Body Splash"],
  ["Roll-on", "Radiant charm", "radiant-charm", 18, "10ml", "Roll-on"],
].map(([category, subCategory, slug, basePrice, size, concentration]) => ({
  category,
  subCategory,
  slug,
  basePrice,
  size,
  concentration,
}));

const productNames = ["Original", "Rose Glow", "Velvet Bloom", "Soft Musk", "Golden Touch", "Midnight", "Radiant"];

const catalogImageFiles = [
  ...pheromoneShadeDefinitions.map((item) => item.file),
  ...pheromoneStoryDefinitions.map(([, file]) => file),
];

const uploadShadeOptions = async (definitions, productLabel) => {
  const items = [];
  const assets = [];
  for (const definition of definitions) {
    const uploaded = await uploadLocalAsset(definition.file, `${productLabel}-${definition.id}`);
    assets.push(uploaded);
    items.push({
      id: definition.id,
      label: definition.label,
      cartValue: definition.cartValue,
      image: uploaded.url,
      fileId: uploaded.fileId,
      description: definition.description,
    });
  }
  return { items, assets };
};

const uploadStoryImages = async (definitions, productLabel) => {
  const items = [];
  for (const [id, file, alt] of definitions) {
    const uploaded = await uploadLocalAsset(file, `${productLabel}-${id}`);
    items.push({ id, image: uploaded.url, fileId: uploaded.fileId, alt });
  }
  return items;
};

const uploadGeneratedProductImages = async (files, label) => {
  const assets = [];
  for (let index = 0; index < files.length; index += 1) {
    assets.push(await uploadLocalAsset(files[index], `${label}-image-${index + 1}`));
  }
  return assets;
};

const buildFeaturedProducts = async () => {
  const pheromoneShades = await uploadShadeOptions(pheromoneShadeDefinitions, "pheromone-touch-featured");
  const pheromoneStories = await uploadStoryImages(pheromoneStoryDefinitions, "pheromone-touch-featured");

  const mystiqueShades = await uploadShadeOptions(mystiqueShadeDefinitions, "mystique-featured");

  return [
    {
      name: "Pheromone Touch",
      description: "Body Splash Pheromone Touch. A fresh, radiant body mist with a soft feminine trail.",
      price: 36,
      discountPrice: 0,
      image: pheromoneShades.assets.map((item) => item.url),
      imageMeta: pheromoneShades.assets,
      storyImages: pheromoneStories,
      shadeOptions: pheromoneShades.items,
      category: "Pheromone Touch",
      subCategory: "Pheromone Touch",
      concentration: "Body Ritual",
      sizes: ["100ml"],
      colors: ["body splash", "body oil", "body lotion"],
      bestseller: true,
      newArrival: true,
      onSales: true,
      featuredSlot: 1,
      showSmallImages: true,
      active: true,
      outOfStock: false,
      stock: 18,
      date: now - 1000,
    },
    {
      name: "Mystique Parfum",
      description: "Mystique Parfum. A deep red floral fragrance with a confident, elegant trail.",
      price: 48,
      discountPrice: 0,
      image: mystiqueShades.assets.map((item) => item.url),
      imageMeta: mystiqueShades.assets,
      storyImages: mystiqueShades.items.map((item, index) => ({
        id: `${item.id}-story`,
        image: item.image,
        fileId: item.fileId,
        alt: mystiqueShadeDefinitions[index].alt,
      })),
      shadeOptions: mystiqueShades.items,
      category: "Mystique Set",
      subCategory: "Mystique parfum",
      concentration: "Parfum",
      sizes: ["100ml"],
      colors: ["mystique parfum", "red bloom", "orchid touch", "gift box"],
      bestseller: true,
      newArrival: true,
      onSales: false,
      featuredSlot: 2,
      showSmallImages: true,
      active: true,
      outOfStock: false,
      stock: 14,
      date: now - 900,
    },
  ];
};

const buildCatalogProducts = async () => {
  const products = [];

  for (let definitionIndex = 0; definitionIndex < catalogDefinitions.length; definitionIndex += 1) {
    const definition = catalogDefinitions[definitionIndex];
    const startIndex = definition.slug === "pheromone-touch" ? 2 : 1;
    const count = definition.slug === "pheromone-touch" ? 6 : 7;

    for (let localIndex = 0; localIndex < count; localIndex += 1) {
      const productNumber = startIndex + localIndex;
      const sequence = definitionIndex * 7 + productNumber;
      const imageStart = (sequence * 2) % catalogImageFiles.length;
      const files = Array.from(
        { length: 3 },
        (_, imageIndex) => catalogImageFiles[(imageStart + imageIndex) % catalogImageFiles.length]
      );
      const imageAssets = await uploadGeneratedProductImages(files, `${definition.slug}-${productNumber}`);
      const stock = sequence % 11 === 0 ? 0 : 3 + ((sequence * 5) % 24);
      const hasDiscount = sequence % 4 === 0;
      const price = definition.basePrice + localIndex * 2;
      const productName = `${definition.subCategory} ${productNames[localIndex]}`;

      products.push({
        name: productName,
        description: `${definition.subCategory} ${productNames[localIndex]}. A Be Radiant by Nancy ritual designed for softness, confidence, and a beautiful lasting finish.`,
        price,
        discountPrice: hasDiscount ? Math.max(1, price - 5) : 0,
        image: imageAssets.map((item) => item.url),
        imageMeta: imageAssets,
        storyImages: imageAssets.map((item, storyIndex) => ({
          id: `${definition.slug}-${productNumber}-story-${storyIndex + 1}`,
          image: item.url,
          fileId: item.fileId,
          alt: productName,
        })),
        shadeOptions: [],
        category: definition.category,
        subCategory: definition.subCategory,
        concentration: definition.concentration,
        sizes: [definition.size],
        colors: ["radiant", "soft", "nancy"],
        bestseller: sequence % 3 === 0,
        newArrival: sequence % 2 === 0,
        onSales: hasDiscount,
        featuredSlot: undefined,
        showSmallImages: sequence % 2 === 0,
        active: true,
        outOfStock: stock === 0,
        stock,
        date: now - sequence * 1000,
      });
    }
  }

  return products;
};

const upsertProduct = async (product) => {
  const filter = {
    name: product.name,
    category: product.category,
    subCategory: product.subCategory,
  };
  const current = await productModel.findOne(filter);
  if (current) {
    await deleteImageKitAssets(productAssets(current));
  }
  await productModel.findOneAndUpdate(filter, { $set: product }, { upsert: true, new: true });
};

const seedProducts = async () => {
  const featured = await buildFeaturedProducts();
  const catalog = await buildCatalogProducts();
  const products = [...featured, ...catalog];

  for (const product of products) {
    await upsertProduct(product);
  }

  return products.length;
};

const seedHeaderSlides = async () => {
  const slideDefinitions = [
    [assetPaths.headerFirst, 0],
    [assetPaths.headerSecond, 1],
    [assetPaths.headerThird, 2],
  ];

  for (const [file, order] of slideDefinitions) {
    const current = await HeaderSlide.findOne({ order });
    if (current) {
      await deleteImageKitAssets([
        { url: current.image, fileId: current.imageFileId },
        { url: current.desktopImage, fileId: current.desktopImageFileId },
      ]);
    }

    const image = await uploadLocalAsset(file, `header-mobile-${order + 1}`);
    const desktopImage = await uploadLocalAsset(file, `header-desktop-${order + 1}`);

    await HeaderSlide.findOneAndUpdate(
      { order },
      {
        $set: {
          image: image.url,
          imageFileId: image.fileId,
          desktopImage: desktopImage.url,
          desktopImageFileId: desktopImage.fileId,
          order,
          active: true,
        },
      },
      { upsert: true, new: true }
    );
  }

  await HeaderSlide.updateMany(
    { order: { $nin: slideDefinitions.map(([, order]) => order) } },
    { $set: { active: false } }
  );

  return slideDefinitions.length;
};

const seedHomepageSections = async () => {
  const sectionDefinitions = [
    {
      key: "luxury-gallery",
      title: "Luxury Video Gallery",
      preferredSizeNote: "Mobile: vertical 9:16 videos/images. Laptop: 4 vertical columns work best.",
      items: [
        ["nancy-video-1", "video", assetPaths.nancyVideo1, "Nancy video 1"],
        ["nancy-video-2", "video", assetPaths.nancyVideo2, "Nancy video 2"],
        ["nancy-gallery-image-1", "image", assetPaths.bodySplashCampaign, "Pheromone Touch campaign"],
        ["nancy-video-3", "video", assetPaths.nancyVideo3, "Nancy video 3"],
        ["nancy-video-4", "video", assetPaths.nancyVideo4, "Nancy video 4"],
        ["nancy-video-5", "video", assetPaths.nancyVideo5, "Nancy video 5"],
      ],
    },
    {
      key: "single-campaign",
      title: "Single Campaign Video",
      preferredSizeNote: "Mobile: 9:16 vertical. Laptop: wide 2:1 media matching the header width.",
      items: [["nancy-single-campaign-video", "video", assetPaths.nancyVideo5, "Be Radiant by Nancy campaign video"]],
    },
    {
      key: "from-the-gram",
      title: "From The Gram",
      preferredSizeNote: "Mobile: vertical 9:16. Laptop: 4 vertical columns with square edges.",
      items: [
        ["from-the-gram-image-1", "image", assetPaths.headerFirst, "Be Radiant by Nancy campaign"],
        ["from-the-gram-video-1", "video", assetPaths.nancyVideo4, "Be Radiant by Nancy social video"],
        ["from-the-gram-mystique-red-dress", "image", assetPaths.mystiqueRedDress, "Mystique perfume held against red satin"],
        ["from-the-gram-image-3", "image", assetPaths.headerThird, "Be Radiant by Nancy fragrance story"],
      ],
    },
  ];

  for (const section of sectionDefinitions) {
    const current = await homepageSectionModel.findOne({ key: section.key });
    if (current) {
      await deleteImageKitAssets(sectionAssets(current));
    }

    const items = [];
    for (let index = 0; index < section.items.length; index += 1) {
      const [id, type, file, label] = section.items[index];
      const uploaded = await uploadLocalAsset(file, `${section.key}-${id}`);
      items.push({
        id,
        type,
        src: uploaded.url,
        fileId: uploaded.fileId,
        desktopSrc: "",
        desktopFileId: "",
        poster: "",
        posterFileId: "",
        alt: type === "image" ? label : "",
        label,
        order: index,
        active: true,
      });
    }

    await homepageSectionModel.findOneAndUpdate(
      { key: section.key },
      {
        $set: {
          key: section.key,
          title: section.title,
          preferredSizeNote: section.preferredSizeNote,
          active: true,
          items,
        },
      },
      { upsert: true, new: true }
    );
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

const seedCategories = async () => {
  for (const group of categoryGroups) {
    await categoryGroupModel.findOneAndUpdate(
      { slug: group.slug },
      { $set: group },
      { upsert: true, new: true }
    );
  }
  return categoryGroups.length;
};

const main = async () => {
  assertEnv();
  await connectDB();

  console.log("Seeding Be Radiant by Nancy mock data into MongoDB/ImageKit...");

  await seedSettings();
  const categories = await seedCategories();
  const slides = await seedHeaderSlides();
  const sections = await seedHomepageSections();
  const products = await seedProducts();

  console.log(`Done. Seeded ${products} products, ${slides} header slides, ${sections} homepage media sections, ${categories} category groups, and site settings.`);
};

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
