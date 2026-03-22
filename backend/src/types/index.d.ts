import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'customer' | 'rider';
    phoneNumber?: string;
    vehicleType?: 'motorcycle' | 'bicycle' | 'car' | 'scooter';
    vehicleNumber?: string;
    isAvailable?: boolean;
    image?: string;
    currentLocation?: {
        latitude: number;
        longitude: number;
        lastUpdated: Date;
    };
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
    cuisine?: string;
    dietaryTags?: string[];
    ingredients?: string[];
    price: number;
    preparationTime?: number;
    image: string;
    available: boolean;
    createdAt: Date;
}
export interface IOrder {
    _id: string;
    userId: string;
    riderId?: string;
    items: Array<{
        foodId: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
    deliveryAddress: string;
    phoneNumber: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    estimatedDeliveryTime?: Date;
    driverLocation?: {
        latitude: number;
        longitude: number;
        lastUpdated: Date;
    };
    statusHistory?: Array<{
        status: string;
        timestamp: Date;
        note?: string;
    }>;
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
//# sourceMappingURL=index.d.ts.map