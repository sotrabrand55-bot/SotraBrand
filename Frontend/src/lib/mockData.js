import abayaPleatedPlum from "../assets/sotraBrand/abaya (1).jpeg";
import abayaButtonBeige from "../assets/sotraBrand/abaya (2).jpeg";
import abayaButtonBrown from "../assets/sotraBrand/abaya (3).jpeg";
import abayaPrayerGreen from "../assets/sotraBrand/abaya (4).jpeg";
import blouse1 from "../assets/sotraBrand/blouses1 (1).jpeg";
import blouse2 from "../assets/sotraBrand/blouses1 (2).jpeg";
import blouse3 from "../assets/sotraBrand/blouses1 (3).jpeg";
import dressesImage from "../assets/sotraBrand/dresses.jpeg";
import dressFloralSage from "../assets/sotraBrand/dresses (1).jpeg";
import dressPlainRed from "../assets/sotraBrand/dresses (3).jpeg";
import dressPlainBlueSide from "../assets/sotraBrand/dresses (4).jpeg";
import dressFloralYellow from "../assets/sotraBrand/dresses (5).jpeg";
import header1 from "../assets/sotraBrand/Header_1.jpeg";
import header2 from "../assets/sotraBrand/Header_2.jpeg";
import header3 from "../assets/sotraBrand/Header_3.jpeg";
import hijab2 from "../assets/sotraBrand/hijab2_.jpeg";
import hijab3 from "../assets/sotraBrand/hijab3.jpeg";
import hijab4 from "../assets/sotraBrand/hijab4.jpeg";
import hijab5 from "../assets/sotraBrand/hijab5.jpeg";
import hijabProducts from "../assets/sotraBrand/hijab_products.jpeg";
import islamicEssentials1 from "../assets/sotraBrand/islamic (1).jpeg";
import islamicEssentials2 from "../assets/sotraBrand/islamic (2).jpeg";
import sotraVideo from "../assets/sotraBrand/WhatsApp Video 2026-07-20 at 10.04.08 AM.mp4";

const now = Date.now();
const brandLabel = "SOTRA BRAND";
const heroTitle = "SOTRA\nBringing Modesty to Every Wardrobe";

const categoryImages = {
  Abaya: [abayaButtonBrown, abayaButtonBeige, abayaPleatedPlum, abayaPrayerGreen],
  Dresses: [dressesImage, dressFloralSage, dressPlainRed, dressPlainBlueSide, dressFloralYellow],
  Hijabs: [hijabProducts, hijab2, hijab3, hijab4, hijab5],
  "Islamic Essentials": [islamicEssentials1, islamicEssentials2],
  Blouses: [blouse1, blouse2, blouse3],
};

const productImageSets = {
  Abaya: [
    { images: [abayaButtonBeige, abayaButtonBrown], colors: ["Beige", "Brown"] },
    { images: [abayaPleatedPlum], colors: ["Plum"] },
    { images: [abayaPrayerGreen], colors: ["Green"] },
    { images: [abayaButtonBrown, abayaButtonBeige], colors: ["Brown", "Beige"] },
    { images: [abayaPleatedPlum], colors: ["Plum"] },
    { images: [abayaPrayerGreen], colors: ["Green"] },
  ],
  Dresses: [
    {
      images: [dressesImage, dressPlainBlueSide, dressPlainRed],
      colors: ["Sky Blue", "Aqua Blue", "Burgundy"],
    },
    {
      images: [dressFloralSage, dressFloralYellow],
      colors: ["Sage Floral", "Yellow Floral"],
    },
    { images: [dressPlainRed, dressPlainBlueSide], colors: ["Burgundy", "Aqua Blue"] },
    { images: [dressPlainBlueSide, dressesImage], colors: ["Aqua Blue", "Sky Blue"] },
    { images: [dressFloralYellow, dressFloralSage], colors: ["Yellow Floral", "Sage Floral"] },
    { images: [dressesImage], colors: ["Sky Blue"] },
  ],
  Hijabs: [
    { images: [hijabProducts], colors: ["Classic"] },
    { images: [hijab2], colors: ["Soft Neutral"] },
    { images: [hijab3], colors: ["Everyday"] },
    { images: [hijab4], colors: ["Essential"] },
    { images: [hijab5], colors: ["Statement"] },
    { images: [hijabProducts, hijab2], colors: ["Classic", "Soft Neutral"] },
  ],
  "Islamic Essentials": [
    { images: [islamicEssentials1], colors: ["Black Sleeves"] },
    { images: [islamicEssentials2], colors: ["Black Gloves"] },
    { images: [islamicEssentials1, islamicEssentials2], colors: ["Black Sleeves", "Black Gloves"] },
    { images: [islamicEssentials2], colors: ["Classic Black"] },
    { images: [islamicEssentials1], colors: ["Soft Black"] },
    { images: [islamicEssentials2, islamicEssentials1], colors: ["Black Gloves", "Black Sleeves"] },
  ],
  Blouses: [
    { images: [blouse1], colors: ["Rose"] },
    { images: [blouse2], colors: ["Ivory"] },
    { images: [blouse3], colors: ["Soft Pink"] },
    { images: [blouse1, blouse2], colors: ["Rose", "Ivory"] },
    { images: [blouse2, blouse3], colors: ["Ivory", "Soft Pink"] },
    { images: [blouse3], colors: ["Soft Pink"] },
  ],
};

export const sotraCollections = [
  "New Arrival",
  "Everyday Modesty",
  "Elegant Edit",
  "Hijab Essentials",
];

export const sotraCategoryTiles = [
  { label: "Abaya", slug: "abaya", image: abayaButtonBrown },
  { label: "Dresses", slug: "dresses", image: dressesImage },
  { label: "Hijabs", slug: "hijabs", image: hijabProducts },
  { label: "Islamic Essentials", slug: "islamic-essentials", image: islamicEssentials1 },
  { label: "Blouses", slug: "blouses", image: blouse1 },
];

export const sotraHero = {
  eyebrow: "SOTRA",
  title: heroTitle,
  buttonLabel: "Discover More",
  to: "/collection",
  image: header1,
  desktopImage: header1,
};

export const sotraSaleFeature = {
  title: heroTitle,
  buttonLabel: "On Sale",
  to: "/on-sale",
  image: header2,
};

export const sotraHeroSlides = [
  {
    id: "sotra-modesty-wardrobe",
    title: heroTitle,
    buttonLabel: "Discover More",
    to: "/collection",
    image: header1,
    desktopImage: header1,
  },
  {
    id: "sotra-sale-edit",
    title: heroTitle,
    buttonLabel: "On Sale",
    to: "/on-sale",
    image: header2,
    desktopImage: header2,
  },
  {
    id: "sotra-new-arrivals",
    title: heroTitle,
    buttonLabel: "Discover More",
    to: "/collection",
    image: header3,
    desktopImage: header3,
  },
];

const productCatalog = {
  Abaya: [
    ["Black Flow Abaya", "Elegant Edit", 90, 0],
    ["Everyday Soft Abaya", "Everyday Modesty", 82, 68],
    ["Layered Modest Abaya", "New Arrival", 96, 0],
    ["Classic Sotra Abaya", "Elegant Edit", 88, 0],
    ["Premium Occasion Abaya", "New Arrival", 110, 92],
    ["Comfort Wrap Abaya", "Everyday Modesty", 78, 0],
  ],
  Dresses: [
    ["Modest Satin Dress", "Elegant Edit", 78, 0],
    ["Soft Day Dress", "Everyday Modesty", 72, 58],
    ["Evening Modesty Dress", "New Arrival", 95, 0],
    ["Garden Flow Dress", "Elegant Edit", 86, 0],
    ["Long Sleeve Dress", "Everyday Modesty", 80, 64],
    ["Sotra Occasion Dress", "New Arrival", 105, 0],
  ],
  Hijabs: [
    ["Premium Chiffon Hijab", "Hijab Essentials", 18, 0],
    ["Soft Jersey Hijab", "Everyday Modesty", 20, 16],
    ["Essential Crepe Hijab", "Hijab Essentials", 17, 0],
    ["Everyday Modal Hijab", "New Arrival", 22, 0],
    ["Elegant Evening Hijab", "Elegant Edit", 24, 19],
    ["Classic Sotra Hijab", "Hijab Essentials", 18, 0],
  ],
  "Islamic Essentials": [
    ["Sotra Arm Sleeves", "Hijab Essentials", 12, 0],
    ["Sotra Modest Gloves", "Everyday Modesty", 14, 0],
    ["Arm Sleeves And Gloves Set", "Hijab Essentials", 22, 18],
    ["Classic Black Gloves", "New Arrival", 14, 0],
    ["Soft Black Arm Sleeves", "Everyday Modesty", 12, 0],
    ["Sotra Modesty Essentials Set", "Elegant Edit", 24, 20],
  ],
  Blouses: [
    ["Soft Modest Blouse", "Everyday Modesty", 42, 0],
    ["Elegant Tie Blouse", "Elegant Edit", 48, 38],
    ["Classic Covered Blouse", "New Arrival", 45, 0],
    ["Minimal Daily Blouse", "Everyday Modesty", 39, 0],
    ["Refined Satin Blouse", "Elegant Edit", 55, 44],
    ["Sotra Layering Blouse", "New Arrival", 46, 0],
  ],
};

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const productDescriptionByCategory = {
  Abaya:
    "A graceful abaya selected for modest coverage, easy movement, and refined everyday elegance. The silhouette is comfortable without losing its polished shape, making it suitable for visits, errands, prayer, and special moments.",
  Dresses:
    "A modest dress designed with a soft feminine line and thoughtful coverage. The fabric, length, and movement make it easy to style for daytime, gatherings, and elevated occasions while staying true to SOTRA's elegant modest mood.",
  Hijabs:
    "A comfortable hijab chosen for smooth drape, reliable coverage, and styling flexibility. It sits neatly with everyday outfits and occasion looks, giving you a clean finish without feeling heavy.",
  "Islamic Essentials":
    "An essential modest piece created to support daily routines with comfort and confidence. It is practical, refined, and easy to pair with SOTRA dresses, abayas, and hijabs.",
  Blouses:
    "A modest blouse with a clean shape, soft coverage, and an easy fit for layering. It pairs beautifully with skirts, trousers, abayas, and hijabs for a complete SOTRA wardrobe look.",
};

const colorOptionNames = ["Black", "Ivory", "Mocha"];
const fitRangeCategories = new Set(["Abaya", "Dresses", "Blouses"]);

const getProductImageSet = (category, itemIndex) => {
  const sets = productImageSets[category];
  if (Array.isArray(sets) && sets.length) {
    return sets[itemIndex % sets.length];
  }

  const pool = categoryImages[category] || [header1, header2, header3];
  return {
    images: pool.length ? [pool[itemIndex % pool.length]] : [header1],
    colors: [colorOptionNames[itemIndex % colorOptionNames.length]],
  };
};

const buildProductDescription = (name, category, collection) =>
  `${name} belongs to the ${collection} selection at SotraBrand. ${
    productDescriptionByCategory[category] ||
    "This piece is selected for modest styling, comfort, and everyday elegance."
  } Every detail is chosen to help you feel confident, covered, and beautifully dressed with purpose.`;

const buildOptionDescription = (name, category, collection, optionLabel) =>
  `${optionLabel} color option for ${name}. This ${category.toLowerCase()} keeps the same ${collection} fit and modest silhouette while giving the customer a clear color choice for the order.`;

const productSeeds = Object.entries(productCatalog).flatMap(([category, items], categoryIndex) =>
  items.map(([name, collection, price, discountPrice], itemIndex) => [
    `sotra-${slugify(category)}-${itemIndex + 1}`,
    name,
    category,
    collection,
    price,
    discountPrice,
    categoryIndex,
    itemIndex,
  ])
);

export const mockProducts = productSeeds.map(
  ([id, name, category, collection, price, discountPrice, categoryIndex, itemIndex], index) => {
    const imageSet = getProductImageSet(category, itemIndex);
    const images = (Array.isArray(imageSet.images) ? imageSet.images : []).filter(Boolean);
    const optionLabels = (Array.isArray(imageSet.colors) ? imageSet.colors : [])
      .filter(Boolean)
      .slice(0, images.length);

    return {
      _id: id,
      name,
      brand: brandLabel,
      description: buildProductDescription(name, category, collection),
      price,
      discountPrice: discountPrice || 0,
      image: images.length ? images : [header1],
      storyImages: images.map((image, storyIndex) => ({
        id: `${id}-story-${storyIndex + 1}`,
        image,
        alt: storyIndex === 0 ? name : `${name} detail ${storyIndex + 1}`,
        order: storyIndex + 1,
      })),
      shadeOptions: images.map((image, optionIndex) => ({
        id: `${id}-icon-${optionIndex + 1}`,
        label: optionLabels[optionIndex] || colorOptionNames[optionIndex] || `Color ${optionIndex + 1}`,
        cartValue: optionLabels[optionIndex] || colorOptionNames[optionIndex] || `Color ${optionIndex + 1}`,
        image,
        description: buildOptionDescription(
          name,
          category,
          collection,
          optionLabels[optionIndex] || colorOptionNames[optionIndex] || `Color ${optionIndex + 1}`
        ),
        order: optionIndex + 1,
      })),
      category,
      subCategory: category,
      concentration: collection,
      collection,
      sizes: [],
      fitRange: fitRangeCategories.has(category) ? "Fits 50 kg - 110 kg" : "",
      fitMin: fitRangeCategories.has(category) ? 50 : null,
      fitMax: fitRangeCategories.has(category) ? 110 : null,
      fitUnit: fitRangeCategories.has(category) ? "kg" : "",
      colors: (optionLabels.length ? optionLabels : colorOptionNames).map((color) => color.toLowerCase()),
      bestseller: index % 4 === 0,
      newArrival: collection === "New Arrival",
      onSales: Boolean(discountPrice),
      active: true,
      outOfStock: index === 11,
      stock: index === 11 ? 0 : 4 + categoryIndex + itemIndex * 3,
      date: now - index * 1000,
    };
  }
);

export const mockHeaderSlides = sotraHeroSlides.map((slide, index) => ({
  _id: slide.id,
  image: slide.image,
  desktopImage: slide.desktopImage,
  title: slide.title,
  buttonLabel: slide.buttonLabel,
  to: slide.to,
  order: index,
  active: true,
}));

export const mockHomepageSections = [
  {
    key: "featured-set-1",
    title: "SotraBrand Modest Edit",
    active: true,
    items: [
      {
        id: "sotra-sale-feature",
        type: "image",
        src: sotraSaleFeature.image,
        desktopSrc: "",
        alt: "SotraBrand modest sale pieces",
        label: "SotraBrand Modest Edit",
        buttonLabel: "On Sale",
        productId: "",
        active: true,
        order: 0,
      },
    ],
  },
  {
    key: "luxury-gallery",
    title: "SotraBrand Edit",
    active: true,
    items: [
      {
        id: "sotra-video-1",
        type: "video",
        src: sotraVideo,
        alt: "SotraBrand modest fashion video",
        label: "SotraBrand video",
        active: true,
        order: 0,
      },
      {
        id: "sotra-gallery-1",
        type: "image",
        src: header1,
        alt: "SotraBrand abaya styling",
        label: "SotraBrand abaya styling",
        active: true,
        order: 1,
      },
      {
        id: "sotra-gallery-2",
        type: "image",
        src: hijabProducts,
        alt: "SotraBrand hijab essentials",
        label: "SotraBrand hijab essentials",
        active: true,
        order: 2,
      },
      {
        id: "sotra-gallery-3",
        type: "image",
        src: blouse1,
        alt: "SotraBrand blouse edit",
        label: "SotraBrand blouse edit",
        active: true,
        order: 3,
      },
    ],
  },
];

export const getMockHomepageSectionItems = (key) =>
  (mockHomepageSections.find((section) => section.key === key)?.items || [])
    .filter((item) => item.active !== false && item.src)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item, index) => ({
      id: item.id || `${key}-${index}`,
      type: item.type === "video" ? "video" : "image",
      src: item.src,
      desktopSrc: item.desktopSrc || "",
      poster: item.poster || "",
      alt: item.alt || item.label || "SotraBrand media",
      label: item.label || item.alt || "SotraBrand media",
      buttonLabel: item.buttonLabel ?? "Discover More",
      productId: item.productId || "",
    }));

export const mockSettings = {
  delivery_fee: 5,
  announcementEnabled: true,
  announcementItems: ["Welcome to our store", "Cash On Delivery", "Tripoli Delivery Only $2"],
  freeShippingEnabled: true,
  freeShippingText: "Delivery $5 All Over Lebanon",
  availableNowText: "SOTRA Modest Fashion",
  brandEmail: "sotrabrand7@gmail.com",
  brandPhone: "71872919",
  socialLinks: {
    instagram:
      "https://www.instagram.com/sotra_brand_hijab?igsh=MWZiNzdkM3BuZnVndA%3D%3D&utm_source=qr",
    facebook: "https://www.facebook.com/share/1Cnd12KNGw/?mibextid=wwXIfr",
    tiktok: "https://www.tiktok.com/@sotrabrand133?_r=1&_t=ZS-98BbAHXPjTc",
    whatsapp: "https://wa.me/96171872919",
    email: "sotrabrand7@gmail.com",
    phone: "71872919",
  },
};

export const useMockData =
  String(import.meta.env.VITE_USE_MOCK_DATA || "").toLowerCase() === "true";
