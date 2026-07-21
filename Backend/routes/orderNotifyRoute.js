// routes/orderNotifyRoute.js
import express from 'express';
import { notifyAdminCheckout } from '../controllers/notifyController.js';
import authUser from '../middleware/authUser.js'; // enable if you want auth

const router = express.Router();

const optionalAuthUser = (req, res, next) => {
  const token = req.headers.token || req.cookies?.sotra_token;
  if (!token) return next();
  return authUser(req, res, next);
};

// POST /api/order/notify-checkout
router.post('/notify-checkout', optionalAuthUser, notifyAdminCheckout);

export default router;
