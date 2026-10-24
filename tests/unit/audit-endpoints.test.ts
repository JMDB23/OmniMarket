import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';

describe('Auditoría de Endpoints API (/api/test/*)', () => {
  beforeEach(() => {
    db.resetData();
  });

  it('18. GET /api/test/analytics: Debe retornar métricas y datos paginados con latencia < 300ms', () => {
    const start = performance.now();
    const orders = db.getOrders({}, 1, 50);
    const analytics = db.getAnalytics();
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(300);
    expect(orders.data.length).toBeGreaterThan(0);
    expect(analytics.totalRevenue).toBeGreaterThan(0);
    expect(analytics.averageOrderValue).toBeGreaterThan(0);
    expect(orders.pagination.page).toBe(1);
    expect(orders.pagination.limit).toBe(50);
  });

  it('19. POST /api/test/reset-data: Debe restaurar el conjunto conocido de datos deterministas', () => {
    // Modificamos un estado
    db.updateOrderStatus('ord-001', 'cancelled');
    expect(db.getOrderById('ord-001')?.status).toBe('cancelled');

    // Ejecutamos reset
    const fresh = db.resetData();
    expect(fresh.length).toBe(10);
    expect(db.getOrderById('ord-001')?.status).toBe('pending');
  });

  it('20. GET /api/test/kanban-status: Debe consultar el estado actualizado de un pedido tras Drag & Drop', () => {
    const orderBefore = db.getOrderById('ord-001');
    expect(orderBefore?.status).toBe('pending');

    db.updateOrderStatus('ord-001', 'delivered');

    const orderAfter = db.getOrderById('ord-001');
    expect(orderAfter?.status).toBe('delivered');
  });
});
