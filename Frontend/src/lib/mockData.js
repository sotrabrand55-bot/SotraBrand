import { mystiqueProductMedia, pheromoneTouchProductMedia } from "./productMediaData";

const now = Date.now();

const featuredPheromoneTouchProduct = {
    _id: "mock-pheromone-touch-1",
    name: "Pheromone Touch",
    description:
      "Body Splash Pheromone Touch. A fresh, radiant body mist with a soft feminine trail.",
    price: 36,
    discountPrice: 0,
    rating: 5,
    reviewCount: 2,
    image: pheromoneTouchProductMedia.shadeOptions.map((option) => option.image),
    storyImages: pheromoneTouchProductMedia.storyImages,
    shadeOptions: pheromoneTouchProductMedia.shadeOptions,
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
};

const featuredMystiqueProduct = {
    _id: "mock-mystique-featured-1",
    name: "Mystique Parfum",
    description:
      "Mystique Parfum. A deep red floral fragrance with a confident, elegant trail.",
    price: 48,
    discountPrice: 0,
    rating: 5,
    reviewCount: 6,
    image: mystiqueProductMedia.shadeOptions.map((option) => option.image),
    storyImages: mystiqueProductMedia.storyImages,
    shadeOptions: mystiqueProductMedia.shadeOptions,
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
};

const catalogDefinitions = [
  {
    category: "Pheromone Touch",
    subCategory: "Pheromone Touch",
    slug: "pheromone-touch",
    basePrice: 36,
    size: "100ml",
    concentration: "Body Ritual",
  },
  {
    category: "Pheromone Touch",
    subCategory: "Body lotion pheromone",
    slug: "body-lotion-pheromone",
    basePrice: 28,
    size: "250ml",
    concentration: "Body Lotion",
  },
  {
    category: "Pheromone Touch",
    subCategory: "Body oil pheromone",
    slug: "body-oil-pheromone",
    basePrice: 32,
    size: "100ml",
    concentration: "Body Oil",
  },
  {
    category: "Pheromone Touch",
    subCategory: "Body splash pheromone",
    slug: "body-splash-pheromone",
    basePrice: 26,
    size: "250ml",
    concentration: "Body Splash",
  },
  {
    category: "Pheromone Touch",
    subCategory: "Body scrub pheromone",
    slug: "body-scrub-pheromone",
    basePrice: 30,
    size: "300g",
    concentration: "Body Scrub",
  },
  {
    category: "Mystique Set",
    subCategory: "Mystique parfum",
    slug: "mystique-parfum",
    basePrice: 48,
    size: "50ml",
    concentration: "Parfum",
  },
  {
    category: "Mystique Set",
    subCategory: "Body lotion mystique",
    slug: "body-lotion-mystique",
    basePrice: 30,
    size: "250ml",
    concentration: "Body Lotion",
  },
  {
    category: "Mystique Set",
    subCategory: "Body splash mystique",
    slug: "body-splash-mystique",
    basePrice: 28,
    size: "250ml",
    concentration: "Body Splash",
  },
  {
    category: "Roll-on",
    subCategory: "Radiant charm",
    slug: "radiant-charm",
    basePrice: 18,
    size: "10ml",
    concentration: "Roll-on",
  },
];

const productNames = [
  "Original",
  "Rose Glow",
  "Velvet Bloom",
  "Soft Musk",
  "Golden Touch",
  "Midnight",
  "Radiant",
];

const catalogImages = [
  ...pheromoneTouchProductMedia.shadeOptions.map((option) => option.image),
  ...pheromoneTouchProductMedia.storyImages.map((story) => story.image),
];

const generatedCatalogProducts = catalogDefinitions.flatMap(
  (definition, definitionIndex) => {
    const startIndex = definition.slug === "pheromone-touch" ? 2 : 1;

    return Array.from(
      { length: definition.slug === "pheromone-touch" ? 6 : 7 },
      (_, localIndex) => {
        const productNumber = startIndex + localIndex;
        const sequence = definitionIndex * 7 + productNumber;
        const imageStart = (sequence * 2) % catalogImages.length;
        const images = Array.from(
          { length: 3 },
          (_, imageIndex) =>
            catalogImages[(imageStart + imageIndex) % catalogImages.length]
        );
        const stock = sequence % 11 === 0 ? 0 : 3 + ((sequence * 5) % 24);
        const hasDiscount = sequence % 4 === 0;
        const price = definition.basePrice + localIndex * 2;

        return {
          _id: `mock-${definition.slug}-${productNumber}`,
          name: `${definition.subCategory} ${productNames[localIndex]}`,
          description: `${definition.subCategory} ${productNames[localIndex]}. A Be Radiant by Nancy ritual designed for softness, confidence, and a beautiful lasting finish.`,
          price,
          discountPrice: hasDiscount ? Math.max(1, price - 5) : 0,
          rating: 4 + (sequence % 2) * 0.5,
          reviewCount: 3 + ((sequence * 3) % 38),
          image: images,
          storyImages: images.map((image, storyIndex) => ({
            id: `${definition.slug}-${productNumber}-story-${storyIndex + 1}`,
            image,
            alt: `${definition.subCategory} ${productNames[localIndex]}`,
          })),
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
        };
      }
    );
  }
);

export const mockProducts = [
  featuredPheromoneTouchProduct,
  featuredMystiqueProduct,
  ...generatedCatalogProducts,
];

export const mockHeaderSlides = [
  {
    _id: "mock-header-1",
    image: "https://ik.imagekit.io/aovmyygbb/WhatsApp_Image_2026-06-03_at_9.03.49_PM_YJfO-9jLTx.jpeg",
    desktopImage: "https://ik.imagekit.io/aovmyygbb/WhatsApp_Image_2026-06-05_at_9.31.12_PM_mXLwfuaNt.jpeg",
    order: 0,
    active: true,
  },
  {
    _id: "mock-header-2",
    image: "https://ik.imagekit.io/aovmyygbb/WhatsApp_Image_2026-06-05_at_9.31.12_PM_3SXZ2cOee.jpeg",
    desktopImage: "",
    order: 1,
    active: true,
  },
  {
    _id: "mock-header-3",
    image: "https://ik.imagekit.io/aovmyygbb/WhatsApp_Image_2026-06-05_at_9.32.19_PM__1__KOAgKtYtI.jpeg",
    desktopImage: "",
    order: 2,
    active: true,
  },
];

export const mockHomepageSections = [
  {
    key: "luxury-gallery",
    title: "Luxury Video Gallery",
    active: true,
    preferredSizeNote: "Mobile: vertical 9:16 videos/images. Laptop: 4 vertical columns work best.",
    items: [
      {
        id: "nancy-video-1",
        type: "video",
        src: "https://ik.imagekit.io/aovmyygbb/luxury-gallery-nancy-video-1-1780769455770-3690_1l8g6lDTe.mp4",
        poster: "",
        alt: "Nancy video 1",
        label: "Nancy video 1",
        order: 0,
        active: true,
      },
      {
        id: "nancy-video-2",
        type: "video",
        src: "https://ik.imagekit.io/aovmyygbb/WhatsApp_Video_2026-06-05_at_9.47.07_PM_7p9uQ83mp.mp4",
        poster: "",
        alt: "Nancy video 2",
        label: "Nancy video 2",
        order: 1,
        active: true,
      },
      {
        id: "nancy-gallery-image-1",
        type: "video",
        src: "https://ik.imagekit.io/aovmyygbb/WhatsApp_Video_2026-06-05_at_10.06.33_PM_NMGNt6M2I.mp4",
        poster: "",
        alt: "Pheromone Touch campaign",
        label: "Pheromone Touch campaign",
        order: 2,
        active: true,
      },
      {
        id: "nancy-video-3",
        type: "video",
        src: "https://ik.imagekit.io/aovmyygbb/WhatsApp_Video_2026-06-05_at_10.03.50_PM_gQLA0to4h.mp4",
        poster: "",
        alt: "Nancy video 3",
        label: "Nancy video 3",
        order: 3,
        active: true,
      },
      {
        id: "nancy-video-4",
        type: "video",
        src: "https://ik.imagekit.io/aovmyygbb/luxury-gallery-nancy-video-4-1780769459546-215_X5h9-V4wJ.mp4",
        poster: "",
        alt: "Nancy video 4",
        label: "Nancy video 4",
        order: 4,
        active: true,
      },
      {
        id: "nancy-video-5",
        type: "video",
        src: "https://ik.imagekit.io/aovmyygbb/luxury-gallery-nancy-video-5-1780769460410-2190_AIUb7MWdZ.mp4",
        poster: "",
        alt: "Nancy video 5",
        label: "Nancy video 5",
        order: 5,
        active: true,
      },
    ],
  },
  {
    key: "single-campaign",
    title: "Single Campaign Video",
    active: true,
    preferredSizeNote: "Mobile: 9:16 vertical. Laptop: wide 2:1 media matching the header width.",
    items: [
      {
        id: "nancy-single-campaign-video",
        type: "video",
        src: "https://ik.imagekit.io/aovmyygbb/WhatsApp_Video_2026-06-05_at_10.06.37_PM_XL4Er_YDF.mp4",
        desktopSrc: "",
        poster: "",
        alt: "Be Radiant by Nancy campaign video",
        label: "Be Radiant by Nancy campaign video",
        order: 0,
        active: true,
      },
    ],
  },
  {
    key: "featured-set-1",
    title: "Featured Set Picture 1",
    active: true,
    preferredSizeNote: "Single image section. Mobile: 9:16 vertical. Laptop: wide 2:1 set image.",
    items: [
      {
        id: "featured-set-1-image",
        type: "image",
        src: "https://ik.imagekit.io/aovmyygbb/pheromone-gift-box-products-BE6BUSY_.jpeg",
        desktopSrc: "",
        poster: "",
        alt: "Pheromone Touch set by Nancy",
        label: "Pheromone Touch Set",
        buttonLabel: "See Full Set",
        productId: "",
        order: 0,
        active: true,
      },
    ],
  },
  {
    key: "featured-set-2",
    title: "Featured Set Picture 2",
    active: true,
    preferredSizeNote: "Single image section. Mobile: 9:16 vertical. Laptop: wide 2:1 set image.",
    items: [
      {
        id: "featured-set-2-image",
        type: "image",
        src: "https://ik.imagekit.io/aovmyygbb/mystique-gift-box-CVlljw8t.jpeg",
        desktopSrc: "",
        poster: "",
        alt: "Mystique set by Nancy",
        label: "Mystique Set",
        buttonLabel: "See Full Set",
        productId: "",
        order: 0,
        active: true,
      },
    ],
  },
  {
    key: "from-the-gram",
    title: "From The Gram",
    active: true,
    preferredSizeNote: "Mobile: vertical 9:16. Laptop: 4 vertical columns with square edges.",
    items: [
      {
        id: "from-the-gram-image-1",
        type: "image",
        src: "https://ik.imagekit.io/aovmyygbb/from-the-gram-from-the-gram-image-1-1780769462839-2104_7pqDQdiIt.jpeg",
        poster: "",
        alt: "Be Radiant by Nancy campaign",
        label: "Be Radiant by Nancy campaign",
        order: 0,
        active: true,
      },
      {
        id: "from-the-gram-video-1",
        type: "video",
        src: "https://ik.imagekit.io/aovmyygbb/from-the-gram-from-the-gram-video-1-1780769463610-4733_r-nVjX7be.mp4",
        poster: "",
        alt: "Be Radiant by Nancy social video",
        label: "Be Radiant by Nancy social video",
        order: 1,
        active: true,
      },
      {
        id: "from-the-gram-mystique-red-dress",
        type: "image",
        src: "https://ik.imagekit.io/aovmyygbb/WhatsApp_Image_2026-06-05_at_7.07.40_PM_ImvF4BwlT.jpeg",
        poster: "",
        alt: "Mystique perfume held against red satin",
        label: "Mystique perfume held against red satin",
        order: 2,
        active: true,
      },
      {
        id: "from-the-gram-image-3",
        type: "image",
        src: "https://ik.imagekit.io/aovmyygbb/WhatsApp_Image_2026-06-05_at_7.07.41_PM_oD4Rmd5Ax.jpeg",
        poster: "",
        alt: "Be Radiant by Nancy fragrance story",
        label: "Be Radiant by Nancy fragrance story",
        order: 3,
        active: true,
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
      alt: item.alt || item.label || "Be Radiant by Nancy media",
      label: item.label || item.alt || "Be Radiant by Nancy media",
      buttonLabel: item.buttonLabel ?? "See Full Set",
      productId: item.productId || "",
    }));

export const mockSettings = {
  delivery_fee: 3,
  announcementEnabled: true,
  announcementItems: ["FREE 10 mL Tester With Every Purchase", "Free Shipping On All Orders"],
  freeShippingEnabled: true,
  freeShippingText: "Free Shipping On All Orders",
  availableNowText: "AVAILABLE NOW",
  brandEmail: "beradiantnancy@gmail.com",
  socialLinks: {
    instagram: "https://www.instagram.com/radiant_bynancy?igsh=MWY3YmwxcjNyYTNjcg==",
    facebook: "https://www.facebook.com/share/18oAYDyvZt/",
    tiktok: "https://www.tiktok.com/@radiant.nancy?_r=1&_t=ZS-96qoZYlR9xF",
    email: "beradiantnancy@gmail.com",
  },
};

export const useMockData =
  String(import.meta.env.VITE_USE_MOCK_DATA || "").toLowerCase() === "true";
