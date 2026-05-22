import express from 'express'
import {placeOrder,allOrders,userOrders,updateStatus,deleteOrder} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/authUser.js'
const orderRouter = express.Router()

// Admin Feature
orderRouter.post('/list',adminAuth,allOrders)// adminAuth because only the admin can see the list of all orders
orderRouter.post('/status',adminAuth,updateStatus) // also only the admin can change the status

// Payment Feature 
orderRouter.post('/place',authUser,placeOrder) // for the cash delivery
// Delete — support BOTH styles so frontend can’t 404
orderRouter.delete('/delete/:orderId', adminAuth, deleteOrder);
orderRouter.post('/delete', adminAuth, deleteOrder);

// user feature
orderRouter.post('/userorder',authUser,userOrders) 

export default orderRouter