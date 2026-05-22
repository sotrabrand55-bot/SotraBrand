// routes/orderNotifyRoute.js
import express from 'express';
import { notifyAdminCheckout } from '../controllers/notifyController.js';
import authUser from '../middleware/authUser.js'; // enable if you want auth

const router = express.Router();

// POST /api/order/notify-checkout
router.post('/notify-checkout', authUser , notifyAdminCheckout);

export default router;
