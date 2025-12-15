export interface User {
  id: number;
  student_id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'student' | 'finance';
  gender: 'male' | 'female';
  account_balance: number | string;
  avatar?: string;
  last_login_at?: string;
  is_active: boolean;
  two_factor_enabled?: boolean;
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
  likes_count?: number;
  is_liked?: boolean;
  average_rating?: number;
  reviews_count?: number;
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

export interface Review {
  id: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  menu_item_id: number;
  order_id?: number;
  rating: number;
  comment?: string;
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

export interface TrustedFriend {
  id: number;
  user_id: number;
  friend_id: number;
  friend?: User;
  permission_type: 'permanent' | 'temporary';
  expires_at?: string;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user?: User;
  action: string;
  description: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  performed_by: number;
  performedBy?: User;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialReport {
  total_revenue: number;
  total_orders: number;
  completed_orders: number;
  completion_rate: number;
  top_menu_items: Array<{
    name: string;
    total_sold: number;
    revenue: number;
  }>;
  daily_revenue: Array<{
    date: string;
    revenue: number;
  }>;
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface DashboardStats {
  stats: {
    total_users: number;
    active_users: number;
    total_orders: number;
    pending_orders: number;
    total_revenue: number;
    total_menu_items: number;
    active_menu_items: number;
  };
  recent_orders: Order[];
  recent_users: User[];
}

export interface ConsumptionStats {
  user: User;
  most_ordered: Array<{
    item_name: string;
    category_name: string;
    total_quantity: number;
    total_spent: number;
  }>;
  spending_by_category: Array<{
    category_name: string;
    total_spent: number;
    order_count: number;
  }>;
  monthly_spending: Array<{
    year: number;
    month: number;
    total_spent: number;
    order_count: number;
  }>;
  liked_items: MenuItem[];
  total_spent: number;
  total_orders: number;
}

export interface LikesStatistics {
  most_liked: MenuItem[];
  likes_by_category: Array<{
    category_name: string;
    likes_count: number;
  }>;
  daily_likes: Array<{
    date: string;
    likes_count: number;
  }>;
}

export interface MenuItemReview {
  id: number;
  user_id: number;
  menu_item_id: number;
  order_id?: number;
  rating: number;
  comment?: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  created_at: string;
  updated_at: string;
}