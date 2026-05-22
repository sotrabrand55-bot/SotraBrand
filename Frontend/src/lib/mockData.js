const now = Date.now();

export const mockProducts = [
  {
    _id: "mock-noir-ambre",
    name: "Noir Ambre Extrait",
    description:
      "A deep amber perfume with saffron, resin, and smoked cedar. Warm, elegant, and built for evening wear.",
    price: 104,
    discountPrice: 82,
    image: [
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1595425964071-2c1ecf4d3f37?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Fragrance",
    subCategory: "Amber",
    concentration: "Eau de Parfum",
    sizes: ["50ml", "100ml"],
    colors: ["amber", "gold", "black"],
    bestseller: true,
    newArrival: true,
    onSales: true,
    active: true,
    outOfStock: false,
    stock: 18,
    date: now - 1000,
  },
  {
    _id: "mock-rose-veil",
    name: "Rose Veil Eau de Parfum",
    description:
      "Damask rose, white musk, and vanilla skin create a clean floral scent with a soft luxury trail.",
    price: 76,
    discountPrice: 0,
    image: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Fragrance",
    subCategory: "Floral",
    concentration: "Eau de Parfum",
    sizes: ["30ml", "75ml"],
    colors: ["rose", "blush", "white"],
    bestseller: true,
    newArrival: false,
    onSales: false,
    active: true,
    outOfStock: false,
    stock: 7,
    date: now - 2000,
  },
  {
    _id: "mock-cedar-rain",
    name: "Cedar Rain",
    description:
      "Fresh bergamot, rain accord, and cedar leaf settle into a clean woody perfume for daily wear.",
    price: 89,
    discountPrice: 69,
    image: [
      "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Fragrance",
    subCategory: "Fresh",
    concentration: "Eau de Toilette",
    sizes: ["50ml", "100ml"],
    colors: ["mint", "silver", "sky"],
    bestseller: false,
    newArrival: true,
    onSales: true,
    active: true,
    outOfStock: false,
    stock: 4,
    date: now - 3000,
  },
  {
    _id: "mock-golden-oud",
    name: "Golden Oud",
    description:
      "A refined oud scent softened by cardamom, honeyed labdanum, and polished woods.",
    price: 118,
    discountPrice: 96,
    image: [
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Fragrance",
    subCategory: "Oud",
    concentration: "Eau de Parfum",
    sizes: ["50ml", "100ml"],
    colors: ["gold", "brown", "black"],
    bestseller: true,
    newArrival: false,
    onSales: true,
    active: true,
    outOfStock: false,
    stock: 11,
    date: now - 4000,
  },
  {
    _id: "mock-musk-linen",
    name: "Musk Linen",
    description:
      "A clean musk perfume with cotton flower, soft iris, and sandalwood for effortless daywear.",
    price: 68,
    discountPrice: 0,
    image: [
      "https://images.unsplash.com/photo-1585386959984-a41552231658?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Fragrance",
    subCategory: "Musk",
    concentration: "Eau de Toilette",
    sizes: ["30ml", "75ml"],
    colors: ["white", "cream", "silver"],
    bestseller: false,
    newArrival: true,
    onSales: false,
    active: true,
    outOfStock: false,
    stock: 2,
    date: now - 5000,
  },
  {
    _id: "mock-citrus-noir",
    name: "Citrus Noir",
    description:
      "Bright citrus, black tea, and vetiver create a sharp, elegant perfume with a modern drydown.",
    price: 84,
    discountPrice: 72,
    image: [
      "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Fragrance",
    subCategory: "Citrus",
    concentration: "Eau de Toilette",
    sizes: ["50ml", "100ml"],
    colors: ["yellow", "green", "black"],
    bestseller: false,
    newArrival: false,
    onSales: true,
    active: true,
    outOfStock: false,
    stock: 9,
    date: now - 6000,
  },
  {
    _id: "mock-discovery-set",
    name: "Discovery Set",
    description:
      "A curated trio of Levon signatures for finding the scent that feels like yours.",
    price: 64,
    discountPrice: 0,
    image: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Gift Sets",
    subCategory: "Discovery Set",
    concentration: "Eau de Parfum",
    sizes: ["3 x 10ml"],
    colors: ["black", "gold"],
    bestseller: true,
    newArrival: true,
    onSales: false,
    active: true,
    outOfStock: false,
    stock: 14,
    date: now - 7000,
  },
  {
    _id: "mock-gift-for-her",
    name: "For Her Gift Set",
    description:
      "A soft gift edit with rose, musk, and luminous amber notes.",
    price: 142,
    discountPrice: 124,
    image: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Gift Sets",
    subCategory: "For Her",
    concentration: "Eau de Parfum",
    sizes: ["50ml", "10ml"],
    colors: ["rose", "gold"],
    bestseller: false,
    newArrival: true,
    onSales: true,
    active: true,
    outOfStock: false,
    stock: 5,
    date: now - 8000,
  },
  {
    _id: "mock-gift-for-him",
    name: "For Him Gift Set",
    description:
      "A refined pairing of oud, cedar, and warm amber for evening rituals.",
    price: 148,
    discountPrice: 0,
    image: [
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=85",
    ],
    category: "Gift Sets",
    subCategory: "For Him",
    concentration: "Eau de Parfum",
    sizes: ["100ml", "10ml"],
    colors: ["black", "amber"],
    bestseller: true,
    newArrival: false,
    onSales: false,
    active: true,
    outOfStock: false,
    stock: 8,
    date: now - 9000,
  },
];

export const mockHeaderSlides = [
  {
    _id: "mock-header-1",
    image:
      "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=1800&q=85",
    title: "LEVON SIGNATURES",
    blurb: "Modern extrait perfumes with a quiet luxury trail.",
    badges: ["Amber", "Oud", "Musk"],
    order: 0,
    active: true,
  },
  {
    _id: "mock-header-2",
    image:
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1800&q=85",
    title: "SCENTS THAT STAY",
    blurb: "Gift-ready bottles, refined notes, and polished everyday rituals.",
    badges: ["Gift Sets", "Fresh", "Floral"],
    order: 1,
    active: true,
  },
  {
    _id: "mock-header-3",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1800&q=85",
    title: "GOLDEN OUD",
    blurb: "Warm woods, polished amber, and a refined evening finish.",
    badges: ["Evening", "Woody", "Gold"],
    order: 2,
    active: true,
  },
];

export const mockGiftSetsPreview = [
  {
    _id: "mock-gift-preview-1",
    title: "Discovery Set",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
    linkTo: "/gift-sets",
    active: true,
    date: now,
  },
];

export const mockCollectionList = [
  {
    _id: "mock-tile-amber",
    title: "Amber",
    subKey: "Amber",
    image:
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=85",
    active: true,
    order: 0,
  },
  {
    _id: "mock-tile-oud",
    title: "Oud",
    subKey: "Oud",
    image:
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=85",
    active: true,
    order: 1,
  },
  {
    _id: "mock-tile-fresh",
    title: "Fresh",
    subKey: "Fresh",
    image:
      "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&w=1200&q=85",
    active: true,
    order: 2,
  },
];

export const mockSubcatTiles = mockCollectionList;

export const mockBrandStatements = [
  {
    _id: "mock-brand-statement",
    eyebrow: "Levon Craft",
    title: "Proudly Made by Our Brand",
    description:
      "At LEVON, we blend careful craftsmanship with modern perfume design, creating refined scents that celebrate everyday beauty and memorable rituals.",
    buttonText: "Explore More",
    buttonLink: "/Collection",
    image:
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Levon perfume craftsmanship",
    details: [
      {
        title: "Brand Craft",
        text: "Measured details, polished notes.",
      },
      {
        title: "Modern Scent Rituals",
        text: "Designed for daily elegance.",
      },
    ],
    imageEyebrow: "LEVON SIGNATURE",
    imageTitle: "Crafted to feel quiet, lasting, and unmistakably refined.",
    active: true,
    order: 0,
  },
];

export const mockBrandStatement =
  mockBrandStatements.find((item) => item.active) || mockBrandStatements[0];

export const mockScentWardrobe = [
  {
    _id: "mock-wardrobe-fresh-day",
    title: "Fresh Day",
    description: "Clean brightness for morning routines and easy movement.",
    image:
      "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&w=1200&q=85",
    tags: ["Bergamot", "Cedar"],
    linkTo: "/collection?sub=Fresh&cat=Fragrance",
    active: true,
    order: 0,
  },
  {
    _id: "mock-wardrobe-amber-night",
    title: "Amber Night",
    description: "Warm resin and polished woods for evening presence.",
    image:
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=85",
    tags: ["Amber", "Vanilla"],
    linkTo: "/collection?sub=Amber&cat=Fragrance",
    active: true,
    order: 1,
  },
  {
    _id: "mock-wardrobe-floral-softness",
    title: "Floral Softness",
    description: "Petal notes, clean musk, and a soft luminous finish.",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85",
    tags: ["Rose", "Musk"],
    linkTo: "/collection?sub=Floral&cat=Fragrance",
    active: true,
    order: 2,
  },
  {
    _id: "mock-wardrobe-oud-depth",
    title: "Oud Depth",
    description: "Deep woods and smoke for a refined signature trail.",
    image:
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1200&q=85",
    tags: ["Oud", "Cedar"],
    linkTo: "/collection?sub=Oud&cat=Fragrance",
    active: true,
    order: 3,
  },
];

export const mockSettings = {
  delivery_fee: 3,
};

export const useMockData =
  String(import.meta.env.VITE_USE_MOCK_DATA || "").toLowerCase() === "true";
