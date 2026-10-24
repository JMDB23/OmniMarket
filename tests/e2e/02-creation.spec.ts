import { test, expect } from '@playwright/test';
import { loginAsEvaluator, resetAuditData } from './helpers';

test.describe('Flujo 2: Registro de nuevo producto/pedido y validación en tabla', () => {
  test.beforeEach(async ({ page }) => {
    await resetAuditData(page);
    await loginAsEvaluator(page);
  });

  test('Debe registrar un nuevo pedido mediante el modal y reflejarse inmediatamente en la tabla', async ({ page }) => {
    // 1. Navegar a la página de gestión de pedidos
    await page.goto('/orders');
    await expect(page.locator('h1')).toContainText('Gestión Integral de Pedidos');

    // 2. Abrir el modal de creación
    await page.click('[data-testid="btn-open-create-order-modal"]');
    await expect(page.locator('[data-testid="modal-create-order"]')).toBeVisible();

    // 3. Completar el formulario de creación
    await page.fill('[data-testid="input-customer-name"]', 'Marcos Galperin');
    await page.fill('[data-testid="input-customer-email"]', 'marcos@mercadolibre.com');
    await page.fill('[data-testid="input-product-name"]', 'Servidor Rack 1U Xeon Pro');
    await page.fill('[data-testid="input-product-qty"]', '2');
    await page.fill('[data-testid="input-product-price"]', '1250');
    await page.fill('[data-testid="input-shipping-address"]', 'Av. Libertador 1000, Buenos Aires');

    // 4. Enviar el formulario
    await page.click('[data-testid="btn-submit-order"]');

    // 5. El modal debe cerrarse
    await expect(page.locator('[data-testid="modal-create-order"]')).not.toBeVisible();

    // 6. Validar que el nuevo pedido se refleje en la tabla de operaciones
    const table = page.locator('[data-testid="orders-table"]');
    await expect(table).toContainText('Marcos Galperin');
    await expect(table).toContainText('Servidor Rack 1U Xeon Pro');
    await expect(table).toContainText('$2,500.00');
  });
});
