import { describe, it, expect } from 'vitest';
import { createOrderSchema, bulkUpdateOrdersSchema, analyticsQuerySchema } from '@/lib/schemas';

describe('Validación de Esquemas Zod', () => {
  it('11. Debe validar un pedido válido con productos según createOrderSchema', () => {
    const validOrder = {
      customerName: 'Laura Vega',
      customerEmail: 'laura.vega@example.com',
      category: 'electronics',
      priority: 'high',
      status: 'pending',
      shippingAddress: 'Av. Vallarta 2040, Guadalajara',
      items: [
        {
          name: 'Cámara Mirrorless 4K',
          quantity: 1,
          unitPrice: 1200,
          costPrice: 750,
        },
      ],
    };

    const parsed = createOrderSchema.safeParse(validOrder);
    expect(parsed.success).toBe(true);
  });

  it('12. Debe rechazar pedidos sin productos o con email inválido', () => {
    const invalidOrder = {
      customerName: 'A', // Demasiado corto
      customerEmail: 'no-es-un-email',
      category: 'electronics',
      shippingAddress: 'Calle',
      items: [], // Vacío
    };

    const parsed = createOrderSchema.safeParse(invalidOrder);
    expect(parsed.success).toBe(false);
  });

  it('13. Debe validar solicitudes de Bulk Update correctamente', () => {
    const validBulk = {
      orderIds: ['ord-001', 'ord-002'],
      action: 'update_status',
      status: 'delivered',
    };

    const parsed = bulkUpdateOrdersSchema.safeParse(validBulk);
    expect(parsed.success).toBe(true);
  });

  it('14. Debe validar y transformar parámetros de paginación en analyticsQuerySchema', () => {
    const query = { page: '2', limit: '25' };
    const parsed = analyticsQuerySchema.safeParse(query);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.page).toBe(2);
      expect(parsed.data.limit).toBe(25);
    }
  });
});
