import { test, expect } from '@playwright/test';
import { loginAsEvaluator, resetAuditData } from './helpers';

test.describe('Flujo 3: Arrastre de tarjeta en el tablero Kanban y aserción de cambio de columna', () => {
  test.beforeEach(async ({ page }) => {
    await resetAuditData(page);
    await loginAsEvaluator(page);
  });

  test('Debe mover una tarjeta entre columnas del Kanban y persistir el estado', async ({ page }) => {
    // 1. Navegar al tablero Kanban
    await page.goto('/kanban');
    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible();

    // 2. Verificar que la orden ord-001 se encuentre inicialmente en la columna 'pending'
    const pendingColumn = page.locator('[data-testid="kanban-column-pending"]');
    await expect(pendingColumn).toContainText('OMN-1001');

    // 3. Ejecutar el movimiento optimista hacia la columna 'processing'
    await page.click('[data-testid="btn-move-next-ord-001"]');

    // 4. Aserción en la UI: La columna 'processing' debe contener la tarjeta OMN-1001 inmediatamente
    const processingColumn = page.locator('[data-testid="kanban-column-processing"]');
    await expect(processingColumn).toContainText('OMN-1001');

    // 5. Verificar persistencia optimista en el endpoint de auditoría /api/test/kanban-status
    await expect
      .poll(
        async () => {
          const response = await page.request.get('/api/test/kanban-status?orderId=ord-001');
          if (!response.ok()) return null;
          const body = await response.json();
          return body.status;
        },
        {
          message: 'Esperando que el estado del pedido ord-001 se persista como "processing" en /api/test/kanban-status',
          timeout: 5000,
        }
      )
      .toBe('processing');
  });
});
