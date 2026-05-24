export interface User {
  id: string | number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  image: string; // imageUrl
  stock: number;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string | number;
  productId: string | number;
  userId?: string | number;
  quantity: number;
  product: Product;
}

export interface OrderItem {
  id: string | number;
  productId: string | number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string | number;
  orderCode: string;
  userId: string | number;
  totalAmount: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED" | string;
  snapToken?: string | null;
  paymentUrl?: string | null;
  createdAt: string;
  items?: OrderItem[];
  user?: User;
}

export interface DashboardStats {
  revenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  orderStatuses: {
    status: string;
    count: number;
  }[];
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
}
