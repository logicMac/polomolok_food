export interface User {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  createdAt?: string;
}

export interface Food {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
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
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  phoneNumber: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
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
