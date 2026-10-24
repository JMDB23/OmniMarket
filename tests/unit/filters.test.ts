import { describe, it, expect } from 'vitest';
import { filterOrders, paginateItems } from '@/lib/filters';
import { INITIAL_ORDERS } from '@/lib/initialData';

describe('Lógica de Filtrado y Paginación', () => {
  it('15. Debe filtrar pedidos por estado específico (shipped, pending, etc.)', () => {
    const shipped = filterOrders(INITIAL_ORDERS, { status: 'shipped' });
    expect(shipped.length).toBeGreaterThan(0);
    expect(shipped.every((o) => o.status === 'shipped')).toBe(true);
  });

  it('16. Debe filtrar pedidos por búsqueda de texto en cliente o número de pedido', () => {
    const results = filterOrders(INITIAL_ORDERS, { search: 'Mendoza' });
    expect(results.length).toBe(1);
    expect(results[0].customerName).toContain('Mendoza');

    const byOrderNumber = filterOrders(INITIAL_ORDERS, { search: 'OMN-1003' });
    expect(byOrderNumber.length).toBe(1);
    expect(byOrderNumber[0].orderNumber).toBe('OMN-1003');
  });

  it('17. Debe paginar listas de elementos correctamente calculando totalPages', () => {
    const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const page1 = paginateItems(list, 1, 4);
    expect(page1.data).toEqual([1, 2, 3, 4]);
    expect(page1.pagination.total).toBe(10);
    expect(page1.pagination.totalPages).toBe(3);

    const page3 = paginateItems(list, 3, 4);
    expect(page3.data).toEqual([9, 10]);
  });
});
