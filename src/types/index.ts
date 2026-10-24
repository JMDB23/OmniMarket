export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  totalCost: number;
  status: OrderStatus;
  priority: OrderPriority;
  category: 'electronics' | 'apparel' | 'home' | 'beauty' | 'sports';
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCost: number;
  grossProfit: number;
  grossMarginPercentage: number;
  ordersByStatus: Record<OrderStatus, number>;
  salesByCategory: Record<string, number>;
  recentRevenueTrends: { date: string; revenue: number; orders: number }[];
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metrics?: AnalyticsSummary;
}

export interface KanbanColumn {
  id: OrderStatus;
  title: string;
  orderIds: string[];
}
