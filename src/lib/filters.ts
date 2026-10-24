import { Order, OrderStatus } from '@/types';

export interface FilterOptions {
  status?: OrderStatus | 'all';
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Filtra una lista de pedidos con base en criterios múltiples.
 */
export function filterOrders(orders: Order[], filters: FilterOptions): Order[] {
  return orders.filter((order) => {
    // Filtro por Estado
    if (filters.status && filters.status !== 'all' && order.status !== filters.status) {
      return false;
    }

    // Filtro por Categoría
    if (filters.category && filters.category !== 'all' && order.category !== filters.category) {
      return false;
    }

    // Filtro por Búsqueda de texto (número de orden, cliente o email)
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      const matchOrderNum = order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = order.customerName.toLowerCase().includes(q);
      const matchEmail = order.customerEmail.toLowerCase().includes(q);
      const matchItem = order.items.some((item) => item.name.toLowerCase().includes(q));

      if (!matchOrderNum && !matchCustomer && !matchEmail && !matchItem) {
        return false;
      }
    }

    // Filtro por Rango de Fechas
    if (filters.startDate) {
      const orderDate = new Date(order.createdAt).getTime();
      const start = new Date(filters.startDate).getTime();
      if (!isNaN(start) && orderDate < start) return false;
    }

    if (filters.endDate) {
      const orderDate = new Date(order.createdAt).getTime();
      const end = new Date(filters.endDate).getTime();
      if (!isNaN(end) && orderDate > end) return false;
    }

    // Filtro por Monto
    if (typeof filters.minAmount === 'number' && order.totalAmount < filters.minAmount) {
      return false;
    }

    if (typeof filters.maxAmount === 'number' && order.totalAmount > filters.maxAmount) {
      return false;
    }

    return true;
  });
}

/**
 * Pagina un arreglo de elementos.
 */
export function paginateItems<T>(items: T[], page: number = 1, limit: number = 50): {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
} {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const total = items.length;
  const totalPages = Math.ceil(total / safeLimit) || 1;
  const startIndex = (safePage - 1) * safeLimit;
  const data = items.slice(startIndex, startIndex + safeLimit);

  return {
    data,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
}
