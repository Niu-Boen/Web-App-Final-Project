export interface User {
  id: number;
  student_id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'student';
  gender: 'male' | 'female';
  account_balance: number;
  avatar?: string;
  last_login_at?: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  parent_id?: number;
  is_active: boolean;
  sort_order: number;
  children?: Category[];
  menu_items?: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  ingredients?: string[];
  allergens?: string[];
  category_id: number;
  category?: Category;
  is_available: boolean;
  is_featured: boolean;
  preparation_time: number;
  stock_quantity?: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item?: MenuItem;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_requests?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user?: User;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  pickup_time?: string;
  pickup_person_name?: string;
  pickup_person_id?: string;
  special_instructions?: string;
  confirmed_at?: string;
  ready_at?: string;
  completed_at?: string;
  order_items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  special_requests?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}