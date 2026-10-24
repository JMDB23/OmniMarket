import { Order, OrderStatus, OrderPriority, AnalyticsSummary } from '@/types';
import { INITIAL_ORDERS } from './initialData';
import { aggregateFinancialMetrics } from './financial';
import { filterOrders, FilterOptions, paginateItems } from './filters';

// Declaración global para persistencia en memoria durante ciclo de vida de Next.js
declare global {
  // eslint-disable-next-line no-var
  var __omnimarket_orders_store__: Order[] | undefined;
}

function getStore(): Order[] {
  if (!globalThis.__omnimarket_orders_store__) {
    globalThis.__omnimarket_orders_store__ = JSON.parse(JSON.stringify(INITIAL_ORDERS));
  }
  return globalThis.__omnimarket_orders_store__!;
}

function setStore(orders: Order[]): void {
  globalThis.__omnimarket_orders_store__ = orders;
}

export const db = {
  /**
   * Restablece los datos al conjunto de prueba inicial determinista.
   */
  resetData(): Order[] {
    const freshData = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    setStore(freshData);
    return freshData;
  },

  /**
   * Obtiene todos los pedidos, con opción de filtrado y paginación.
   */
  getOrders(filters: FilterOptions = {}, page: number = 1, limit: number = 50) {
    const store = getStore();
    const filtered = filterOrders(store, filters);
    // Ordenar por fecha de creación descendente por defecto
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return paginateItems(filtered, page, limit);
  },

  /**
   * Obtiene un pedido por ID o por número de orden.
   */
  getOrderById(id: string): Order | undefined {
    const store = getStore();
    return store.find((o) => o.id === id || o.orderNumber === id);
  },

  /**
   * Crea un nuevo pedido.
   */
  createOrder(data: {
    customerName: string;
    customerEmail: string;
    category: 'electronics' | 'apparel' | 'home' | 'beauty' | 'sports';
    priority?: OrderPriority;
    status?: OrderStatus;
    shippingAddress: string;
    items: { name: string; quantity: number; unitPrice: number; costPrice?: number }[];
  }): Order {
    const store = getStore();
    const newId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderNumber = `OMN-${1000 + store.length + 1}`;

    const items = data.items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      costPrice: item.costPrice ?? item.unitPrice * 0.6,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalCost = items.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);

    const newOrder: Order = {
      id: newId,
      orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      category: data.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shippingAddress: data.shippingAddress,
      items,
      totalAmount: Number(totalAmount.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
    };

    store.unshift(newOrder);
    setStore(store);
    return newOrder;
  },

  /**
   * Actualiza el estado de un pedido (Drag & Drop en Kanban).
   */
  updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const store = getStore();
    const index = store.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (index === -1) return null;

    store[index] = {
      ...store[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    setStore(store);
    return store[index];
  },

  /**
   * Actualización en lote (Bulk Update).
   */
  bulkUpdate(params: {
    orderIds: string[];
    action: 'update_status' | 'update_priority' | 'delete';
    status?: OrderStatus;
    priority?: OrderPriority;
  }): { updatedCount: number; affectedIds: string[] } {
    let store = getStore();
    const targetIds = new Set(params.orderIds);

    if (params.action === 'delete') {
      const initialCount = store.length;
      store = store.filter((o) => !targetIds.has(o.id));
      setStore(store);
      return {
        updatedCount: initialCount - store.length,
        affectedIds: params.orderIds,
      };
    }

    let updatedCount = 0;
    const affectedIds: string[] = [];

    store = store.map((order) => {
      if (targetIds.has(order.id)) {
        updatedCount++;
        affectedIds.push(order.id);
        return {
          ...order,
          status: params.action === 'update_status' && params.status ? params.status : order.status,
          priority: params.action === 'update_priority' && params.priority ? params.priority : order.priority,
          updatedAt: new Date().toISOString(),
        };
      }
      return order;
    });

    setStore(store);
    return { updatedCount, affectedIds };
  },

  /**
   * Elimina un pedido.
   */
  deleteOrder(id: string): boolean {
    const store = getStore();
    const initialLen = store.length;
    const filtered = store.filter((o) => o.id !== id);
    if (filtered.length !== initialLen) {
      setStore(filtered);
      return true;
    }
    return false;
  },

  /**
   * Genera el resumen analítico completo.
   */
  getAnalytics(): AnalyticsSummary {
    const store = getStore();
    const financial = aggregateFinancialMetrics(store);

    const ordersByStatus: Record<OrderStatus, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    const salesByCategory: Record<string, number> = {};

    store.forEach((order) => {
      if (ordersByStatus[order.status] !== undefined) {
        ordersByStatus[order.status]++;
      }
      salesByCategory[order.category] = (salesByCategory[order.category] || 0) + order.totalAmount;
    });

    // Redondear montos por categoría
    Object.keys(salesByCategory).forEach((cat) => {
      salesByCategory[cat] = Number(salesByCategory[cat].toFixed(2));
    });

    // Agrupar ventas recientes por día (últimos 7 días)
    const dailyMap: Record<string, { revenue: number; orders: number }> = {};
    store.forEach((order) => {
      const dateKey = order.createdAt.slice(0, 10);
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { revenue: 0, orders: 0 };
      }
      dailyMap[dateKey].revenue += order.totalAmount;
      dailyMap[dateKey].orders += 1;
    });

    const recentRevenueTrends = Object.keys(dailyMap)
      .sort()
      .map((date) => ({
        date,
        revenue: Number(dailyMap[date].revenue.toFixed(2)),
        orders: dailyMap[date].orders,
      }));

    return {
      ...financial,
      ordersByStatus,
      salesByCategory,
      recentRevenueTrends,
    };
  },
};
