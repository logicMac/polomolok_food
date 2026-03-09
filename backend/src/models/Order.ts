import mongoose, { Schema, Document } from 'mongoose';
import { IOrder } from '../types';

interface IOrderDocument extends Omit<IOrder, '_id'>, Document {}

const orderSchema = new Schema<IOrderDocument>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  items: [{
    foodId: {
      type: String,
      required: true,
      ref: 'Food'
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Delivery address is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  location: {
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IOrderDocument>('Order', orderSchema);
