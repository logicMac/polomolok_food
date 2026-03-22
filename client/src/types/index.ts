export interface User {
  _id?: string;
  userId?: string;
  name: string;
  email: string;
  role: 'admin' | 'customer' | 'rider';
  phoneNumber?: string;
  vehicleType?: 'motorcycle' | 'bicycle' | 'car' | 'scooter';
  vehicleNumber?: string;
  isAvailable?: boolean;
  image?: string;
  createdAt?: string;
}

export interface Food {
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
  createdAt?: string;
}

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  userId: string;
  riderId?: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  phoneNumber: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  estimatedDeliveryTime?: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
}

export interface ChatMessage {
  _id?: string;
  userId: string;
  userName: string;
  message: string;
  sender: 'user' | 'admin' | 'system';
  orderId?: string;
  isRead: boolean;
  createdAt?: string;
  timestamp?: string;
}

export interface CartItem {
  food: Food;
  quantity: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    accessToken?: string;
    refreshToken?: string;
    email?: string;
    otpSent?: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: string[];
}
