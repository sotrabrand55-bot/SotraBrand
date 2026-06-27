export const perfumeSizeOptions = ["100ML", "120ML", "150ML", "30ML", "50ML", "10ML"];
export const perfumeTypeOptions = ["Eau de Parfum", "Eau de Toilette", "Parfum"];

const normalizePerfumeSize = (value) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  const compact = text.toLowerCase().replace(/\s+/g, "");

  if (compact === "30ml") return "30ML";
  if (compact === "50ml") return "50ML";
  if (compact === "100ml") return "100ML";
  if (compact === "120ml") return "120ML";
  if (compact === "150ml") return "150ML";
  if (compact === "10ml") return "10ML";
  if (compact === "default") return "";

  return text;
};

const sortPerfumeSizes = (sizes) => {
  const order = new Map(perfumeSizeOptions.map((size, index) => [size, index]));
  return [...sizes].sort((a, b) => {
    const aOrder = order.has(a) ? order.get(a) : Number.MAX_SAFE_INTEGER;
    const bOrder = order.has(b) ? order.get(b) : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return String(a).localeCompare(String(b));
  });
};

export const normalizePerfumeType = (value) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  const compact = text.toLowerCase().replace(/\s+/g, "");

  if (!compact || compact === "default") return "";
  if (["eaudeparfum", "eaudeperfume", "edp"].includes(compact)) return "Eau de Parfum";
  if (["eaudetoilette", "edt"].includes(compact)) return "Eau de Toilette";
  if (["perfume", "parfum"].includes(compact)) return "Parfum";

  return text;
};

const parseArray = (value) => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);

  const text = String(value).trim();
  if (!text) return [];

  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed)
        ? parsed.map(String).map((item) => item.trim()).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  }

  return text.split(",").map((item) => item.trim()).filter(Boolean);
};

const parseImageValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.url || value.path || value.secure_url || "";
  return "";
};

const parseImageArray = (value) => {
  if (Array.isArray(value)) return value.map(parseImageValue).filter(Boolean);
  const single = parseImageValue(value);
  return single ? [single] : [];
};

const unique = (items) => [...new Set(items.filter(Boolean))];

const sortMediaItems = (items = []) =>
  [...items].sort((a, b) => {
    const aOrder = Number.isFinite(Number(a?.order)) ? Number(a.order) : 9999;
    const bOrder = Number.isFinite(Number(b?.order)) ? Number(b.order) : 9999;
    return aOrder - bOrder;
  });

const parseNumber = (value, fallback = undefined) => {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const parseBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

export const getProductImages = (product = {}) =>
  unique([
    ...parseImageArray(sortMediaItems(product.storyImages).map((item) => item?.image)),
    ...parseImageArray(sortMediaItems(product.shadeOptions).map((item) => item?.image)),
    ...parseImageArray(product.image),
    ...parseImageArray(product.images),
    parseImageValue(product.image1),
    parseImageValue(product.image2),
    parseImageValue(product.image3),
    parseImageValue(product.image4),
  ]);

export const getPrimaryProductImage = (product = {}) =>
  getProductImages(product)[0] || "";

export const getEffectiveProductPrice = (product = {}) => {
  const price = parseNumber(product.price, 0);
  const discountPrice = parseNumber(product.discountPrice, undefined);

  if (
    discountPrice !== undefined &&
    discountPrice > 0 &&
    discountPrice < price
  ) {
    return discountPrice;
  }

  return price;
};

export const normalizeProduct = (product = {}) => {
  const image = getProductImages(product);
  const price = parseNumber(product.price, 0);
  const discountPrice = parseNumber(product.discountPrice, undefined);
  const stock = parseNumber(product.stock, undefined);
  const sizes = sortPerfumeSizes([
    ...new Set(parseArray(product.sizes).map(normalizePerfumeSize).filter(Boolean)),
  ]);
  const explicitPerfumeTypes = parseArray(product.perfumeTypes)
    .map(normalizePerfumeType)
    .filter(Boolean);
  const legacyPerfumeType = perfumeTypeOptions.includes(normalizePerfumeType(product.concentration))
    ? normalizePerfumeType(product.concentration)
    : "";
  const perfumeTypes = [...new Set([
    ...explicitPerfumeTypes,
    legacyPerfumeType,
  ].filter(Boolean))];
  const setContents = sortMediaItems(
    Array.isArray(product.setContents) ? product.setContents : []
  )
    .map((item, index) => ({
      ...item,
      id: item?.id || `set-content-${index}`,
      image: parseImageValue(item?.image),
      label: String(item?.label || "").trim(),
      description: String(item?.description || "").trim(),
      alt: String(item?.alt || item?.label || "").trim(),
      order: parseNumber(item?.order, index + 1),
      gallery: sortMediaItems(Array.isArray(item?.gallery) ? item.gallery : [])
        .map((galleryItem, galleryIndex) => ({
          ...galleryItem,
          id: galleryItem?.id || `set-detail-${index}-${galleryIndex}`,
          image: parseImageValue(galleryItem?.image),
          alt: String(galleryItem?.alt || item?.label || "").trim(),
          order: parseNumber(galleryItem?.order, galleryIndex + 1),
        }))
        .filter((galleryItem) => galleryItem.image),
    }))
    .filter((item) => item.image);

  return {
    ...product,
    _id: product._id || product.id || "",
    name: product.name || product.title || "",
    title: product.name || product.title || "",
    description: product.description || "",
    price,
    discountPrice:
      discountPrice !== undefined && discountPrice > 0 && discountPrice < price
        ? discountPrice
        : undefined,
    image,
    images: image,
    image1: image[0] || "",
    image2: image[1] || "",
    image3: image[2] || "",
    image4: image[3] || "",
    category: product.category || "Fragrance",
    subCategory: product.subCategory || "",
    concentration: product.concentration || perfumeTypes[0] || "",
    perfumeTypes,
    sizes,
    setContents,
    colors: parseArray(product.colors),
    bestseller: parseBool(product.bestseller, false),
    newArrival: parseBool(product.newArrival, false),
    onSales: parseBool(product.onSales, false),
    active: parseBool(product.active, true),
    outOfStock: parseBool(product.outOfStock, false),
    stock,
    date: parseNumber(product.date, Date.now()),
  };
};

export const normalizeProducts = (products = []) =>
  Array.isArray(products) ? products.map(normalizeProduct) : [];
