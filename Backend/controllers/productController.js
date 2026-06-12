// controllers/productController.js
import productModel from '../models/productModel.js'; // <-- Make sure the path is correct
import { logError } from "../utils/logger.js";
import {
  deleteImageKitAssets,
  uploadImageKitAsset,
} from "../utils/imagekitCleanup.js";

// ---------- helpers (CSV / JSON strings -> arrays, string -> number/bool) ----------
const toNum = (v) => (v === undefined || v === '' ? undefined : Number(v));
const toStock = (v, fallback = undefined) => {
  if (v === undefined || v === '') return fallback;
  const n = Math.max(0, Math.floor(Number(v)));
  return Number.isFinite(n) ? n : fallback;
};
const toBool = (v, fallback = false) => {
  if (v === undefined) return fallback;
  if (typeof v === 'boolean') return v;
  return String(v).toLowerCase() === 'true';
};
const toArray = (v) => {
  if (v === undefined || v === null) return [];
  if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
  try {
    const j = JSON.parse(v);
    if (Array.isArray(j)) return j.map(x => String(x).trim()).filter(Boolean);
  } catch (_) { /* not JSON, fall back to CSV */ }
  return String(v).split(',').map(s => s.trim()).filter(Boolean);
};
const normalizeSize = (value) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  const compact = text.toLowerCase().replace(/\s+/g, '');

  if (!compact || compact === 'default') return '';
  if (compact === '100ml') return '100ML';
  if (compact === '120ml') return '120ML';
  if (compact === '150ml') return '150ML';
  if (compact === '50ml') return '50ML';
  if (compact === '30ml') return '30ML';
  if (compact === '10ml') return '10ML';

  return text;
};
const normalizeSizes = (value) => [
  ...new Set(toArray(value).map(normalizeSize).filter(Boolean)),
];
const normalizePerfumeType = (value) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  const compact = text.toLowerCase().replace(/\s+/g, '');

  if (!compact || compact === 'default') return '';
  if (['eaudeparfum', 'eaudeperfume', 'edp'].includes(compact)) return 'Eau de Parfum';
  if (['eaudetoilette', 'edt'].includes(compact)) return 'Eau de Toilette';
  if (['perfume', 'parfum'].includes(compact)) return 'Parfum';

  return text;
};
const normalizePerfumeTypes = (value) => [
  ...new Set(toArray(value).map(normalizePerfumeType).filter(Boolean)),
];
const toObjectArray = (v) => {
  if (v === undefined || v === null || v === "") return [];
  if (Array.isArray(v)) return v.filter((item) => item && typeof item === "object");
  try {
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed)) return parsed.filter((item) => item && typeof item === "object");
  } catch {
    return [];
  }
  return [];
};

const getExistingImageMeta = (product) => {
  const meta = Array.isArray(product?.imageMeta) ? product.imageMeta : [];
  const images = Array.isArray(product?.image) ? product.image : [];
  const byUrl = new Map(
    meta
      .filter((item) => item?.url)
      .map((item) => [item.url, { url: item.url, fileId: item.fileId || "" }])
  );

  images.forEach((url) => {
    if (url && !byUrl.has(url)) byUrl.set(url, { url, fileId: "" });
  });

  return Array.from(byUrl.values());
};

const normalizeMediaOptions = async ({ rawItems, files, prefix, fallbackName, allowTextOnly = false }) => {
  const items = toObjectArray(rawItems);

  for (let index = 0; index < items.length; index += 1) {
    const upload = await uploadImageKitAsset(
      files?.[`${prefix}${index}`]?.[0],
      `${fallbackName}-${index + 1}`
    );

    if (upload) {
      items[index].image = upload.url;
      items[index].fileId = upload.fileId;
    }

    items[index].id = items[index].id || `${fallbackName}-${Date.now()}-${index}`;
    items[index].label = items[index].label || items[index].alt || "";
    items[index].cartValue = items[index].cartValue || items[index].label || "";
    items[index].description = items[index].description || "";
    items[index].alt = items[index].alt || items[index].label || "";
    items[index].order = Number.isFinite(Number(items[index].order))
      ? Number(items[index].order)
      : index + 1;
  }

  return items
    .filter((item) => item.image || (allowTextOnly && (item.label || item.cartValue)))
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
};

const mediaAssets = (items = []) =>
  items
    .map((item) => ({ url: item?.image || "", fileId: item?.fileId || "" }))
    .filter((item) => item.url || item.fileId);

const removedMediaAssets = (previous = [], next = []) => {
  const nextUrls = new Set(next.map((item) => item?.image).filter(Boolean));
  return mediaAssets(previous).filter((item) => item.url && !nextUrls.has(item.url));
};

const uniqueAssets = (assets = []) => {
  const seen = new Set();
  return assets.filter((asset) => {
    const key = asset?.fileId || asset?.url;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const deriveProductImages = (...groups) =>
  [
    ...new Set(
      groups
        .flat()
        .map((item) => item?.image)
        .filter(Boolean)
    ),
  ];

const unusedGalleryAssets = (product, nextImages = []) => {
  const protectedUrls = new Set(nextImages);
  return getExistingImageMeta(product).filter(
    (asset) => asset.url && !protectedUrls.has(asset.url)
  );
};

// ------------function for add product----------------
const addProduct = async (req, res) => {
  /* to add a product we will create a middleware using multer so that if we send any files as form data
     then that file will be passed using multer 
  */
  try {
    // we request the details of those var from the body request
    const {
      name,
      description,
      price,
      category,
      subCategory,
      concentration,
      perfumeTypes,
      sizes,
      newArrival,
      onSales,

      // NEW FIELDS we keep the same style (strings/CSV -> convert)
      colors,          // e.g. "Red,Blue"  OR JSON/array from frontend (we will parse here)
      discountPrice,   // string -> Number
      rating,
      reviewCount,
      active,          // "true"/"false" -> boolean (default true)
      outOfStock,      // "true"/"false" -> boolean
      stock            // numeric stock count
      ,featuredSlot
      ,showSmallImages
      ,shadeOptions
      ,storyImages
    } = req.body;

    const parsedSizes = normalizeSizes(sizes);
    const parsedPerfumeTypes = normalizePerfumeTypes(perfumeTypes);
    const displayConcentration = normalizePerfumeType(concentration) || parsedPerfumeTypes[0] || '';
    const parsedShadeOptions = await normalizeMediaOptions({
      rawItems: shadeOptions,
      files: req.files,
      prefix: "shadeImage",
      fallbackName: "shade-option",
      allowTextOnly: true,
    });
    const parsedStoryImages = await normalizeMediaOptions({
      rawItems: storyImages,
      files: req.files,
      prefix: "storyImage",
      fallbackName: "story-image",
    });

    //we create the productdata to save the url of images and the data (names,..) in the mongodb--------------------------------------
    const productData = {
      name,
      description,
      category,
      price: Number(price), // price in form data input well took as string so we convertet as number
      subCategory,
      concentration: displayConcentration,
      perfumeTypes: parsedPerfumeTypes,
      bestseller: false,
      newArrival: newArrival === 'true' ? true : false,
      onSales: onSales === 'true' ? true : false,

      // because we cannot send the array directly as form data so from the frontend we will send the sizes and it will be convertet as array
      // (supports "S,M,L" OR '["S","M","L"]')
      sizes: parsedSizes,

      // NEW FIELDS saved the same way
      colors: toArray(colors),                  // "Red,Blue" -> ["Red","Blue"] OR JSON array
      discountPrice: toNum(discountPrice),      // "19.99" -> 19.99
      rating: toNum(rating) ?? 5,
      reviewCount: toNum(reviewCount) ?? 0,
      active: active === undefined ? true : toBool(active, true), // default true
      outOfStock: toBool(outOfStock, false),
      stock: toStock(stock, undefined),
      featuredSlot: toNum(featuredSlot),
      showSmallImages: showSmallImages === undefined ? true : toBool(showSmallImages, true),
      shadeOptions: parsedShadeOptions,
      storyImages: parsedStoryImages,

      image: deriveProductImages(parsedStoryImages, parsedShadeOptions),
      imageMeta: [],
      date: Date.now(), // that shhould return the date of now
    };

    const product = new productModel(productData); // we put our proudct data in productmodel for mongodb
    await product.save(); // we save the product to the database

    res.status(201).json({
      success: true,
      message: 'Product added successfully!', // This message will show in the frontend
      productAdded: product,
    });
  } catch (error) {
    logError("addProduct", error);
    res.status(500).json({ success: false, message: error.message }); // to respond error in thunderclient
  }
};

// This function is used to fetch (list) or show  all products from the MongoDB database
const listProducts = async (req, res) => {
  try {
    // aham shi ltry la tekshof lerror l3ena
    const products = await productModel.find({}).sort({ date: -1, _id: -1 }); // newest products first
    res.json({ success: true, products }); // we put products to see if its work
  } catch (error) {
    logError("listProducts", error);
    res.json({ success: false, message: error.message });
  }
};

// function for removing product
const removeProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.body.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const cleanup = await deleteImageKitAssets([
      ...uniqueAssets([
        ...getExistingImageMeta(product),
        ...mediaAssets(product.shadeOptions),
        ...mediaAssets(product.storyImages),
      ]),
    ]);

    await productModel.findByIdAndDelete(req.body.id); // so this function ecplain her self it will findby id and delete then we request from body the id to delete the product
    res.json({ success: true, message: 'Product Removed', imagekit: cleanup });
  } catch (error) {
    logError("removeProduct", error);
    res.json({ success: false, message: error.message });
  }
};

// function for single product info (KEEPING YOUR ORIGINAL NOTE & STYLE)
// we will get the product id from request so we create this to type it in the request and we will get the id men khilelu
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body; // this function to get the single product id info
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    logError("singleProduct", error);
    res.json({ success: false, message: error.message });
  }
};

// OPTIONAL: same single product but by URL param (so GET /api/product/:id can work too)
const singleProductById = async (req, res) => {
  try {
    const productId = req.params.id; // <-- from URL
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    logError("singleProductById", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPDATE PRODUCT (text fields + optional images) ---
// keep same style (strings/CSV -> convert), and keep notes format
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Find existing product
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 2) Parse incoming fields (handle strings from multipart/form-data)
    //    If a field is not provided, keep the current one.
    const {
      name,
      description,
      price,
      category,
      subCategory,
      concentration,
      perfumeTypes,
      newArrival,
      onSales,
      sizes, // could be "S,M,L" string or array
      // NEW FIELDS (same style)
      colors,         // "Red,Blue" or array
      discountPrice,  // string number
      rating,
      reviewCount,
      active,         // "true"/"false"
      outOfStock,     // "true"/"false"
      stock           // numeric stock count
      ,featuredSlot
      ,showSmallImages
      ,shadeOptions
      ,storyImages
    } = req.body;

    const nextShadeOptions =
      shadeOptions !== undefined
        ? await normalizeMediaOptions({
            rawItems: shadeOptions,
            files: req.files,
            prefix: "shadeImage",
            fallbackName: "shade-option",
            allowTextOnly: true,
          })
        : product.shadeOptions;
    const nextStoryImages =
      storyImages !== undefined
        ? await normalizeMediaOptions({
            rawItems: storyImages,
            files: req.files,
            prefix: "storyImage",
            fallbackName: "story-image",
          })
        : product.storyImages;
    const parsedSizes =
      sizes !== undefined ? normalizeSizes(sizes) : normalizeSizes(product.sizes);
    const parsedPerfumeTypes =
      perfumeTypes !== undefined
        ? normalizePerfumeTypes(perfumeTypes)
        : normalizePerfumeTypes(product.perfumeTypes);
    const nextConcentration =
      concentration !== undefined
        ? normalizePerfumeType(concentration)
        : normalizePerfumeType(product.concentration);

    const next = {
      name: name ?? product.name,
      description: description ?? product.description,
      category: category ?? product.category,
      subCategory: subCategory ?? product.subCategory,
      concentration: nextConcentration || parsedPerfumeTypes[0] || '',
      perfumeTypes: parsedPerfumeTypes,
      price: price !== undefined ? Number(price) : product.price,
      bestseller: false,
      newArrival: toBool(newArrival, product.newArrival),
      onSales: toBool(onSales, product.onSales),
      sizes: parsedSizes,

      // NEW FIELDS (same style)
      colors: colors !== undefined ? toArray(colors) : product.colors,
      discountPrice:
        discountPrice !== undefined && discountPrice !== ''
          ? Number(discountPrice)
          : (discountPrice === '' ? undefined : product.discountPrice),
      rating: rating !== undefined ? Number(rating) : product.rating,
      reviewCount: reviewCount !== undefined ? Number(reviewCount) : product.reviewCount,
      active: toBool(active, product.active),
      outOfStock: toBool(outOfStock, product.outOfStock),
      stock: toStock(stock, product.stock),
      featuredSlot:
        featuredSlot !== undefined && featuredSlot !== ""
          ? Number(featuredSlot)
          : (featuredSlot === "" ? undefined : product.featuredSlot),
      showSmallImages: toBool(showSmallImages, product.showSmallImages),
      shadeOptions: nextShadeOptions,
      storyImages: nextStoryImages,
    };

    if (shadeOptions !== undefined) {
      await deleteImageKitAssets(removedMediaAssets(product.shadeOptions, next.shadeOptions));
    }
    if (storyImages !== undefined) {
      await deleteImageKitAssets(removedMediaAssets(product.storyImages, next.storyImages));
    }

    const nextProductImages = deriveProductImages(next.storyImages, next.shadeOptions);
    await deleteImageKitAssets(unusedGalleryAssets(product, nextProductImages));

    // 4) Persist all updates
    product.name = next.name;
    product.description = next.description;
    product.category = next.category;
    product.subCategory = next.subCategory;
    product.concentration = next.concentration;
    product.perfumeTypes = next.perfumeTypes;
    product.price = next.price;
    product.bestseller = false;
    product.newArrival = next.newArrival;
    product.onSales = next.onSales;
    product.sizes = next.sizes;

    // NEW
    product.colors = next.colors;
    product.discountPrice = next.discountPrice;
    product.rating = next.rating;
    product.reviewCount = next.reviewCount;
    product.active = next.active;
    product.outOfStock = next.outOfStock;
    product.stock = next.stock;
    product.featuredSlot = next.featuredSlot;
    product.showSmallImages = next.showSmallImages;
    product.shadeOptions = next.shadeOptions;
    product.storyImages = next.storyImages;

    product.imageMeta = [];
    product.image = nextProductImages;

    await product.save();

    return res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    logError("updateProduct", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const rating = Math.max(1, Math.min(5, Math.round(Number(req.body.rating) || 0)));
    if (!rating) {
      return res.status(400).json({ success: false, message: "Choose a rating first" });
    }

    const review = {
      name: String(req.body.name || "Customer").trim().slice(0, 60) || "Customer",
      rating,
      comment: String(req.body.comment || "").trim().slice(0, 500),
      date: Date.now(),
    };

    product.reviews = Array.isArray(product.reviews) ? product.reviews : [];
    product.reviews.unshift(review);
    const reviewCount = product.reviews.length;
    const ratingTotal = product.reviews.reduce(
      (sum, item) => sum + (Number(item.rating) || 0),
      0
    );
    product.reviewCount = reviewCount;
    product.rating = reviewCount ? Number((ratingTotal / reviewCount).toFixed(1)) : 5;

    await product.save();

    return res.json({
      success: true,
      message: "Review added",
      product,
      reviews: product.reviews,
      rating: product.rating,
      reviewCount: product.reviewCount,
    });
  } catch (error) {
    logError("addProductReview", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,      // your original (POST body {productId})
  singleProductById,  // optional GET /:id version
  updateProduct,
  addProductReview
};
