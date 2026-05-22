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

function pickColor(it) {
  return it.color ?? it.selectedColor ?? it.variantColor ?? undefined
}

const effectivePrice = (product = {}) => {
  const price = Number(product.price || 0)
  const discountPrice = Number(product.discountPrice)
  return Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < price
    ? discountPrice
    : price
}

const placeOrder = async (req, res) => {
  try {
    const { userId, items, address, paymentMethod = 'COD', totals = {}, appliedCoupon } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: missing userId' });
    }

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

      const unitPrice = effectivePrice(p);
      const itemSubtotal = unitPrice * qty;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: String(p._id),
        title: p.name,
        image: p.image || '',
        category: p.category || '',
        subCategory: p.subCategory || '',
        concentration: p.concentration || '',
        size: it.size ?? null,
        color: it.color ?? null,
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

    const orderData = {
      userId,
      items: orderItems,
      address,
      subtotal,
      discount,               // ✅ only if coupon active
      shipping,
      amount: finalTotal,     // ✅ total after discount + shipping
      paymentMethod,
      payment: false,
      date: Date.now(),
      status: 'Order Placed',
      coupon: validCoupon?.code || null, // ✅ only save if coupon is active
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    return res.json({
      success: true,
      message: 'Order Placed',
      orderId: newOrder._id,
      amount: finalTotal,
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
