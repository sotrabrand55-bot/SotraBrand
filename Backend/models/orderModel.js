import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  items: { type: Array, required: true },

  amount: { type: Number, required: true },
   subtotal: { type: Number, default: 0 },    // ✅ Add this
  discount: { type: Number, default: 0 },    // ✅ Add this
  shipping: { type: Number, default: 0 },    // ✅ Add this
  amount: { type: Number, required: true },

  coupon: { type: String, default: null },   // ✅ Add this
  address: {
    firstName:     { type: String, default: '' },
    lastName:      { type: String, default: '' },
    email:         { type: String, default: '' },
    phone:         { type: String, default: '' },

    street:        { type: String, default: '' },
    city:          { type: String, default: '' },
    state:         { type: String, default: '' },
    country:       { type: String, default: '' },
    zipCode:       { type: String, default: '' },

    addressLine1:  { type: String, default: '' },
    addressLine2:  { type: String, default: '' },
    building:      { type: String, default: '' },
    floor:         { type: String, default: '' },
  },

  status: {
    type: String,
    default: 'Order Placed',
    required: true,
  },

  paymentMethod: { type: String, required: true },

  payment: { type: Boolean, default: false },

  date: { type: Number, required: true },
});

const orderModel =
  mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel;
