import userModel from "../models/userModel.js";
import { logError } from "../utils/logger.js";

const normalizeKey = (value, fallback) => {
  const text = String(value || "").trim();
  return text && text.toLowerCase() !== "default" ? text : fallback;
};

const getVariantBucket = (cartData, itemId, sizeKey, colorKey) => {
  if (!cartData[itemId]) cartData[itemId] = {};

  if (typeof cartData[itemId][sizeKey] === "number") {
    cartData[itemId][sizeKey] = {
      _default: { _no_perfume_type: cartData[itemId][sizeKey] },
    };
  }
  if (!cartData[itemId][sizeKey] || typeof cartData[itemId][sizeKey] !== "object") {
    cartData[itemId][sizeKey] = {};
  }
  if (typeof cartData[itemId][sizeKey][colorKey] === "number") {
    cartData[itemId][sizeKey][colorKey] = {
      _no_perfume_type: cartData[itemId][sizeKey][colorKey],
    };
  }
  if (
    !cartData[itemId][sizeKey][colorKey] ||
    typeof cartData[itemId][sizeKey][colorKey] !== "object"
  ) {
    cartData[itemId][sizeKey][colorKey] = {};
  }

  return cartData[itemId][sizeKey][colorKey];
};

const cleanupCartPath = (cartData, itemId, sizeKey, colorKey) => {
  if (
    cartData[itemId]?.[sizeKey]?.[colorKey] &&
    typeof cartData[itemId][sizeKey][colorKey] === "object" &&
    Object.keys(cartData[itemId][sizeKey][colorKey]).length === 0
  ) {
    delete cartData[itemId][sizeKey][colorKey];
  }
  if (
    cartData[itemId]?.[sizeKey] &&
    typeof cartData[itemId][sizeKey] === "object" &&
    Object.keys(cartData[itemId][sizeKey]).length === 0
  ) {
    delete cartData[itemId][sizeKey];
  }
  if (cartData[itemId] && Object.keys(cartData[itemId]).length === 0) {
    delete cartData[itemId];
  }
};

// add product to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size, color, perfumeType, quantity = 1 } = req.body; // after using that user ID from user model we will find that user  and we will modify that card data and this sizes and their cartdata
    const sizeKey = normalizeKey(size, "_no_size");
    const colorKey = normalizeKey(color, "_default");
    const perfumeTypeKey = normalizeKey(perfumeType, "_no_perfume_type");
    const qty = Math.max(1, Number(quantity) || 1);

    const userData = await userModel.findById(userId); // here the userId that we will get from the request.body
    let cartData = await userData.cartData; // extract the cartData and this cartData if we open userModel file we will see an emty object of cartData so we call that cartData from user model and add userData to this cartData

    if (color || perfumeType) {
      const bucket = getVariantBucket(cartData, itemId, sizeKey, colorKey);
      bucket[perfumeTypeKey] = (Number(bucket[perfumeTypeKey]) || 0) + qty;
    } else {
      if (!cartData[itemId]) {
        cartData[itemId] = {};
      }
      if (cartData[itemId][sizeKey]) {
        if (typeof cartData[itemId][sizeKey] === "object") {
          const bucket = getVariantBucket(cartData, itemId, sizeKey, "_default");
          bucket._no_perfume_type = (Number(bucket._no_perfume_type) || 0) + qty;
        } else {
          cartData[itemId][sizeKey] += qty;
        }
      } else {
        cartData[itemId][sizeKey] = qty;
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData }); // we are sending the updated data into this object
    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    logError("addToCart", error);
    res.json({ success: false, message: error.message });
  }
};

// update user cart
// update user cart
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity, color, perfumeType } = req.body; // we request those from body
    const sizeKey = normalizeKey(size, "_no_size");
    const colorKey = normalizeKey(color, "_default");
    const perfumeTypeKey = normalizeKey(perfumeType, "_no_perfume_type");
    const userData = await userModel.findById(userId); // get user by ID
    let cartData = await userData.cartData; // extract the cartData

    if (!cartData[itemId]) cartData[itemId] = {};

    if (color || perfumeType) {
      const bucket = getVariantBucket(cartData, itemId, sizeKey, colorKey);
      if (Number(quantity) <= 0) {
        delete bucket[perfumeTypeKey];
      } else {
        bucket[perfumeTypeKey] = Number(quantity);
      }
      cleanupCartPath(cartData, itemId, sizeKey, colorKey);
    } else if (Number(quantity) <= 0) {
      delete cartData[itemId][sizeKey];
    } else {
      cartData[itemId][sizeKey] = Number(quantity);   // Update the quantity for the specific item and size
    }

    if (cartData[itemId] && Object.keys(cartData[itemId]).length === 0) {
      delete cartData[itemId];
    }

    await userModel.findByIdAndUpdate(userId, { cartData }); // update user's cart
    res.json({ success: true, message: "Cart Updated" });

  } catch (error) {
    logError("updateCart", error);
    res.json({ success: false, message: error.message });
  }
};

// get user Cartdata
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body; // get user ID from request mean frontend 
    const userData = await userModel.findById(userId); // here the userId that we will get from the request.body
    let cartData = await userData.cartData; // extract the cartData

    res.json({ success: true, cartData });
  } catch (error) {
    logError("getUserCart", error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart };
