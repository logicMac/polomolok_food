import mongoose, { Schema, Document } from 'mongoose';
import { IFood } from '../types';

interface IFoodDocument extends Omit<IFood, '_id'>, Document {}

const foodSchema = new Schema<IFoodDocument>({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Snack']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  available: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IFoodDocument>('Food', foodSchema);
