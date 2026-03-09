import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'customer';
  otp?: string;
  otpExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

export interface IFood {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  available: boolean;
  createdAt: Date;
}

export interface IOrder {
  _id: string;
  userId: string;
  items: Array<{
    foodId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  phoneNumber: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}
