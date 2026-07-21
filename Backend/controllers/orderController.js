import { logError } from "../utils/logger.js";
// controllers/orderController.js
// controllers/orderController.js
import productModel from '../models/productModel.js'
import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'
import Coupon from '../models/coupon.js'; // ✅ your coupon model// ✅ Make sure you have a coupon model

function toArrayMaybe(items) {
  if (Array.isArray(items)) return items
  if (items && typeof items === 'object') {
    // cart sent as object map -> convert to array of values
    return Object.values(items)
  }
  return []
}

function pickProductId(it) {
  return (
    it.productId ||
    it.id ||
    it._id ||
    it.productId?.$oid ||            // sometimes from Mongo export
    it.product?._id ||               // nested object
    it.productId?.toString?.() ||
    it._id?.toString?.() ||
    null
  )
}

function pickQty(it) {
  const raw = it.qty ?? it.quantity ?? it.count ?? 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

function pickSize(it) {
  return it.size ?? it.selectedSize ?? it.variantSize ?? undefined
}

function pickPerfumeType(it) {
  return (
    it.perfumeType ??
    it.selectedPerfumeType ??
    it.variantPerfumeType ??
    it.concentration ??
    undefined
  )
}

function normalizeSize(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  const compact = text.toLowerCase().replace(/\s+/g, '')

  if (!compact || compact === 'default') return ''
  if (compact === '100ml') return '100ML'
  if (compact === '120ml') return '120ML'
  if (compact === '150ml') return '150ML'
  if (compact === '50ml') return '50ML'
  if (compact === '30ml') return '30ML'
  if (compact === '10ml') return '10ML'

  return text
}

function normalizeFitKg(value) {
  const text = normalizeSize(value)
  const match = text.match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : NaN
}

function normalizeSizes(value = []) {
  return [
    ...new Set(
      (Array.isArray(value) ? value : [])
        .map(normalizeSize)
        .filter(Boolean)
    ),
  ]
}

function normalizePerfumeType(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  const compact = text.toLowerCase().replace(/\s+/g, '')

  if (!compact || compact === 'default') return ''
  if (['eaudeparfum', 'eaudeperfume', 'edp'].includes(compact)) return 'Eau de Parfum'
  if (['eaudetoilette', 'edt'].includes(compact)) return 'Eau de Toilette'
  if (['perfume', 'parfum'].includes(compact)) return 'Parfum'

  return text
}

function normalizePerfumeTypes(value = []) {
  return [
    ...new Set(
      (Array.isArray(value) ? value : [])
        .map(normalizePerfumeType)
        .filter(Boolean)
    ),
  ]
}

function getProductPerfumeType(product = {}) {
  return normalizePerfumeTypes(product.perfumeTypes)[0] || normalizePerfumeType(product.concentration)
}

function pickColor(it) {
  return it.color ?? it.selectedColor ?? it.variantColor ?? undefined
}

function normalizeOption(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function getShadeValues(product = {}) {
  return (Array.isArray(product.shadeOptions) ? product.shadeOptions : [])
    .map((option, index) =>
      normalizeOption(
        option?.cartValue ||
          option?.label ||
          option?.id ||
          `Option ${index + 1}`
      )
    )
    .filter(Boolean)
}

function getShadeOption(product = {}, requestedColor = '') {
  const target = normalizeOption(requestedColor).toLowerCase()
  if (!target) return null

  return (Array.isArray(product.shadeOptions) ? product.shadeOptions : []).find((option, index) => {
    const values = [
      option?.cartValue,
      option?.label,
      option?.id,
      `Option ${index + 1}`,
    ]
      .map((value) => normalizeOption(value).toLowerCase())
      .filter(Boolean)

    return values.includes(target)
  }) || null
}

const effectivePrice = (product = {}) => {
  const price = Number(product.price || 0)
  const discountPrice = Number(product.discountPrice)
  return Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < price
    ? discountPrice
    : price
}

const pickImageValue = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(pickImageValue).find(Boolean) || ''
  if (typeof value === 'object') return value.image || value.url || value.path || value.secure_url || ''
  return ''
}

const pickOrderProductImage = (product = {}) =>
  pickImageValue(product.storyImages) ||
  pickImageValue(product.shadeOptions) ||
  pickImageValue(product.image) ||
  pickImageValue(product.images) ||
  pickImageValue(product.image1) ||
  ''

const placeOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      address,
      customerNote = '',
      paymentMethod = 'COD',
      totals = {},
      delivery = {},
      appliedCoupon,
    } = req.body;

    const rawItems = Array.isArray(items) ? items : [];
    if (!rawItems.length) {
      return res.status(400).json({ success: false, message: 'No items in request' });
    }

    const orderItems = [];
    let subtotal = 0;

    // ---------------------------
    // ✅ Validate coupon before proceeding
    let validCoupon = null;
    if (appliedCoupon?.code) {
      const couponFromDb = await Coupon.findOne({ code: appliedCoupon.code });
      if (!couponFromDb || !couponFromDb.isActive) {
        return res.status(400).json({ success: false, message: 'Coupon is inactive or invalid' });
      }
      validCoupon = couponFromDb;
    }
    // ---------------------------

    for (let idx = 0; idx < rawItems.length; idx++) {
      const it = rawItems[idx];
      const productId = it.productId;
      const qty = it.quantity;

      if (!productId || !qty || qty <= 0) {
        return res.status(400).json({ success: false, message: `Invalid item at index ${idx}` });
      }

      const p = await productModel.findById(productId).lean();
      if (!p || p.active === false) {
        return res.status(400).json({ success: false, message: `Product unavailable at index ${idx}` });
      }

      const stock = p.stock === undefined || p.stock === null ? null : Number(p.stock);
      if (p.outOfStock || (stock !== null && stock <= 0)) {
        return res.status(400).json({ success: false, message: `${p.name} is out of stock` });
      }

      if (stock !== null && Number.isFinite(stock) && qty > stock) {
        return res.status(400).json({
          success: false,
          message: `${p.name} has only ${stock} in stock`,
        });
      }

      const productSizes = normalizeSizes(p.sizes);
      const requestedSize = normalizeSize(it.size);
      const fitMin = Number(p.fitMin);
      const fitMax = Number(p.fitMax);
      const hasFitRange =
        Number.isFinite(fitMin) && Number.isFinite(fitMax) && fitMin > 0 && fitMax >= fitMin;

      if (productSizes.length && !requestedSize) {
        return res.status(400).json({
          success: false,
          message: `${p.name} needs a product size`,
        });
      }
      if (productSizes.length && requestedSize && !productSizes.includes(requestedSize)) {
        return res.status(400).json({
          success: false,
          message: `${requestedSize} is not available for ${p.name}`,
        });
      }
      if (hasFitRange) {
        const requestedFit = normalizeFitKg(requestedSize);
        if (!Number.isFinite(requestedFit)) {
          return res.status(400).json({
            success: false,
            message: `${p.name} needs a KG fit selection`,
          });
        }
        if (requestedFit < fitMin || requestedFit > fitMax) {
          return res.status(400).json({
            success: false,
            message: `${p.name} supports ${fitMin}-${fitMax} ${p.fitUnit || 'kg'}`,
          });
        }
      }

      const productPerfumeTypes = normalizePerfumeTypes(p.perfumeTypes);
      const requestedPerfumeType = normalizePerfumeType(pickPerfumeType(it));
      if (
        productPerfumeTypes.length &&
        requestedPerfumeType &&
        !productPerfumeTypes.includes(requestedPerfumeType)
      ) {
        return res.status(400).json({
          success: false,
          message: `${requestedPerfumeType} is not available for ${p.name}`,
        });
      }
      const orderPerfumeType =
        requestedPerfumeType || productPerfumeTypes[0] || getProductPerfumeType(p) || '';

      const shadeValues = getShadeValues(p);
      const requestedColor = normalizeOption(it.color);
      if (requestedColor && shadeValues.length && !shadeValues.includes(requestedColor)) {
        return res.status(400).json({
          success: false,
          message: `${requestedColor} is not available for ${p.name}`,
        });
      }
      const shadeOption = getShadeOption(p, requestedColor);
      const selectedColorLabel =
        normalizeOption(it.colorLabel || it.selectedColor || shadeOption?.label || requestedColor);
      const selectedColorImage =
        pickImageValue(it.colorImage) ||
        pickImageValue(it.selectedColorImage) ||
        pickImageValue(shadeOption?.image) ||
        '';

      const unitPrice = effectivePrice(p);
      const itemSubtotal = unitPrice * qty;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: String(p._id),
        title: p.name,
        image: selectedColorImage || pickOrderProductImage(p),
        productImage: pickOrderProductImage(p),
        category: p.category || '',
        subCategory: p.subCategory || '',
        concentration: orderPerfumeType || p.concentration || '',
        perfumeType: orderPerfumeType || null,
        size: productSizes.length || hasFitRange ? requestedSize : null,
        color: requestedColor || null,
        colorLabel: selectedColorLabel || requestedColor || null,
        colorImage: selectedColorImage || null,
        selectedColor: selectedColorLabel || requestedColor || null,
        selectedColorImage: selectedColorImage || null,
        qty,
        unitPrice,
        subtotal: itemSubtotal,
      });
    }

    // ---------------------------
    // Only apply discount if coupon is active
    const discount = validCoupon ? Number(totals?.discount || 0) : 0;
    const shipping = Number(totals?.shipping || 0);
    const finalTotal = subtotal - discount + shipping;
    const deliveryZone = String(delivery?.zone || (shipping === 2 ? 'Tripoli' : 'Lebanon')).trim();
    const deliveryNote =
      String(delivery?.note || '').trim() ||
      (deliveryZone.toLowerCase() === 'tripoli'
        ? 'Tripoli delivery applied at $2'
        : 'Lebanon delivery applied at $5');

    const orderData = {
      userId: userId || '',
      items: orderItems,
      address,
      subtotal,
      discount,               // ✅ only if coupon active
      shipping,
      delivery: {
        zone: deliveryZone,
        note: deliveryNote,
      },
      amount: finalTotal,     // ✅ total after discount + shipping
      paymentMethod,
      payment: false,
      date: Date.now(),
      status: 'Order Placed',
      coupon: validCoupon?.code || null, // ✅ only save if coupon is active
      customerNote: String(customerNote || '').trim().slice(0, 1200),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    if (userId) {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    }

    return res.json({
      success: true,
      message: 'Order Placed',
      orderId: newOrder._id,
      amount: finalTotal,
      order: newOrder,
    });
  } catch (error) {
    logError("placeOrder", error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};



// All orders data for Admin Panel
const allOrders = async (req, res) => {
    try {
      // 'await' is used to wait for the result of an asynchronous operation (a promise)
      // In this case, it waits for orderModel.find({}) to finish fetching all orders from the database
      const orders = await orderModel.find({}); // Get all orders from the database
  
      // Send a JSON response with the list of orders
      res.json({ success: true, orders });
  
    } catch (error) {
      logError("allOrders", error);
  
      // If there's an error, send a failure response with the error message
      res.json({ success: false, message: error.message });
    }
  }

  
//UserOrder to Display the User Order That he Placed In frontend In orders Page
const userOrders = async (req, res) => {
    try {
      // Extract the userId from the request body (sent from the frontend)
      const { userId } = req.body;
  
      // Find all orders in the database that belong to this user
      const orders = await orderModel.find({ userId });
  
      // Send a success response with the list of orders
      res.json({ success: true, orders });
  
    } catch (error) {
      logError("userOrders", error);
  
      // Send a failure response with the error message
      res.json({ success: false, message: error.message });
    }
  }
  


// update order Status like ("Shipped", "Delivered", "Cancelled") from admin pannel
const updateStatus = async (req, res) => {
    try {
      // Get the orderId and new status from the request body (sent from the admin panel)
      const { orderId, status } = req.body;
  
      // Update the status of the order with the matching ID in the database
      await orderModel.findByIdAndUpdate(orderId, { status });
  
      // Respond with success message
      res.json({ success: true, message: 'Status Updated' });
  
    } catch (error) {
      logError("updateStatus", error);
  
      // If there's an error, respond with a failure message
      res.json({ success: false, message: error.message });
    }
  }

  // Delete order (supports URL param or body)
const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId || req.body.orderId || req.body.id
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' })
    }

    const deleted = await orderModel.findByIdAndDelete(orderId)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    res.json({ success: true, message: 'Order deleted', order: deleted })
  } catch (e) {
    logError("deleteOrder", e)
    res.status(500).json({ success: false, message: e.message })
  }
}

 
export{placeOrder,allOrders,userOrders,updateStatus,deleteOrder}
