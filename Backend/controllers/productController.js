// controllers/productController.js
import imagekit from '../config/ImageKit.js';
import productModel from '../models/productModel.js'; // <-- Make sure the path is correct
import { logError } from "../utils/logger.js";

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
      sizes,
      bestseller,
      newArrival,
      onSales,

      // NEW FIELDS we keep the same style (strings/CSV -> convert)
      colors,          // e.g. "Red,Blue"  OR JSON/array from frontend (we will parse here)
      discountPrice,   // string -> Number
      active,          // "true"/"false" -> boolean (default true)
      outOfStock,      // "true"/"false" -> boolean
      stock            // numeric stock count
    } = req.body;

    // we check if the images are available in the request, and if they are, we store them in variables
    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];

    const imageFiles = [image1, image2, image3, image4].filter((item) => item !== undefined); // we collect all images in an array and this filter to remove undifiend and store even if 1 image in the mongo db
    const uploadedImageUrls = []; // to store the urls after upload

    // we loop through the image array and upload them to ImageKit
    for (const file of imageFiles) {
      if (file) {
        const result = await imagekit.upload({
          file: file.buffer, // binary buffer (file saved in memory by multer)
          fileName: file.originalname, // original file name
        });
        uploadedImageUrls.push(result.url); // after upload we push the url in the array
      }
    }

    //we create the productdata to save the url of images and the data (names,..) in the mongodb--------------------------------------
    const productData = {
      name,
      description,
      category,
      price: Number(price), // price in form data input well took as string so we convertet as number
      subCategory,
      concentration,
      bestseller: bestseller === 'true' ? true : false, // same for bestseller  because the form data will took a string we will covert the string into true or false if its true so true if not so false
      newArrival: newArrival === 'true' ? true : false,
      onSales: onSales === 'true' ? true : false,

      // because we cannot send the array directly as form data so from the frontend we will send the sizes and it will be convertet as array
      // (supports "S,M,L" OR '["S","M","L"]')
      sizes: toArray(sizes),

      // NEW FIELDS saved the same way
      colors: toArray(colors),                  // "Red,Blue" -> ["Red","Blue"] OR JSON array
      discountPrice: toNum(discountPrice),      // "19.99" -> 19.99
      active: active === undefined ? true : toBool(active, true), // default true
      outOfStock: toBool(outOfStock, false),
      stock: toStock(stock, undefined),

      image: uploadedImageUrls, // to store the images url in the mongo db
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
    const products = await productModel.find({}); // to find the all data  // you can use .sort({ date: -1 }) to get latest first
    res.json({ success: true, products }); // we put products to see if its work
  } catch (error) {
    logError("listProducts", error);
    res.json({ success: false, message: error.message });
  }
};

// function for removing product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id); // so this function ecplain her self it will findby id and delete then we request from body the id to delete the product
    res.json({ success: true, message: 'Product Removed' });
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
      bestseller,
      newArrival,
      onSales,
      sizes, // could be "S,M,L" string or array
      imagesToRemove, // optional: JSON string or array of URLs to remove

      // NEW FIELDS (same style)
      colors,         // "Red,Blue" or array
      discountPrice,  // string number
      active,         // "true"/"false"
      outOfStock,     // "true"/"false"
      stock           // numeric stock count
    } = req.body;

    const next = {
      name: name ?? product.name,
      description: description ?? product.description,
      category: category ?? product.category,
      subCategory: subCategory ?? product.subCategory,
      concentration: concentration ?? product.concentration,
      price: price !== undefined ? Number(price) : product.price,
      bestseller: toBool(bestseller, product.bestseller),
      newArrival: toBool(newArrival, product.newArrival),
      onSales: toBool(onSales, product.onSales),
      sizes: sizes !== undefined ? toArray(sizes) : product.sizes,

      // NEW FIELDS (same style)
      colors: colors !== undefined ? toArray(colors) : product.colors,
      discountPrice:
        discountPrice !== undefined && discountPrice !== ''
          ? Number(discountPrice)
          : (discountPrice === '' ? undefined : product.discountPrice),
      active: toBool(active, product.active),
      outOfStock: toBool(outOfStock, product.outOfStock),
      stock: toStock(stock, product.stock),
    };

    // 3) Handle images
    // Existing images:
    let newImages = Array.isArray(product.image) ? [...product.image] : [];

    // 3a) Remove specific existing images if requested
    //     Client can send:
    //     - imagesToRemove as JSON string: '["https://.../img1.jpg","https://.../img2.jpg"]'
    //     - or as repeated fields
    let toRemove = [];
    if (imagesToRemove !== undefined) {
      try {
        if (typeof imagesToRemove === 'string') {
          toRemove = JSON.parse(imagesToRemove); // attempt to parse JSON
        } else if (Array.isArray(imagesToRemove)) {
          toRemove = imagesToRemove;
        }
      } catch (_) {
        // ignore malformed JSON; treat as no removals
      }
    }
    if (Array.isArray(toRemove) && toRemove.length) {
      newImages = newImages.filter((url) => !toRemove.includes(url));
      // (Optional) You can also delete files from ImageKit by fileId if you store it.
    }

    // 3b) Upload any newly provided images (image1..image4) via multer memory buffers
    const fileFields = ['image1', 'image2', 'image3', 'image4'];
    const uploadCandidates = [];
    fileFields.forEach((f) => {
      if (req.files?.[f]?.[0]) {
        uploadCandidates.push(req.files[f][0]);
      }
    });

    for (const file of uploadCandidates) {
      const result = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
      });
      newImages.push(result.url);
    }

    // 4) Persist all updates
    product.name = next.name;
    product.description = next.description;
    product.category = next.category;
    product.subCategory = next.subCategory;
    product.concentration = next.concentration;
    product.price = next.price;
    product.bestseller = next.bestseller;
    product.newArrival = next.newArrival;
    product.onSales = next.onSales;
    product.sizes = next.sizes;

    // NEW
    product.colors = next.colors;
    product.discountPrice = next.discountPrice;
    product.active = next.active;
    product.outOfStock = next.outOfStock;
    product.stock = next.stock;

    product.image = newImages; // final merged image list

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

export {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,      // your original (POST body {productId})
  singleProductById,  // optional GET /:id version
  updateProduct
};
