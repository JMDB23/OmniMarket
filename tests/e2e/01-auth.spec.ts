import { test, expect } from '@playwright/test';

test.describe('Flujo 1: Autenticación y Redirección de Rutas Privadas', () => {
  test('Debe redirigir a /login cuando un usuario no autenticado intenta acceder a rutas privadas', async ({ page }) => {
    // 1. Intento de acceso a ruta privada /dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);

    // 2. Intento de acceso a ruta privada /kanban
    await page.goto('/kanban');
    await expect(page).toHaveURL(/\/login/);

    // 3. Intento de acceso a ruta privada /orders
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/login/);

    // 4. Verificar presencia obligatoria de los botones OAuth 2.0 (Google y GitHub)
    await expect(page.locator('[data-testid="btn-oauth-google"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-oauth-github"]')).toBeVisible();
  });

  test('Debe permitir simular sesión de auditor docente e ingresar al Dashboard', async ({ page }) => {
    await page.goto('/login');

    // Llenar credenciales de evaluador
    await page.fill('[data-testid="input-email"]', 'evaluador@omnimarket.com');
    await page.fill('[data-testid="input-password"]', 'auditor2026');
    await page.click('[data-testid="btn-login-submit"]');

    // Esperar redirección al Dashboard privado
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/.*dashboard/);

    // Validar que se muestren los componentes de la interfaz privada
    await expect(page.locator('h1')).toContainText('Dashboard de Analítica E-Commerce');
    await expect(page.locator('[data-testid="sla-latency-badge"]')).toBeVisible();
  });
});
