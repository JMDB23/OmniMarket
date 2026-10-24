import { Page } from '@playwright/test';

export async function loginAsEvaluator(page: Page) {
  await page.goto('/login');
  await page.fill('[data-testid="input-email"]', 'evaluador@omnimarket.com');
  await page.fill('[data-testid="input-password"]', 'auditor2026');
  await page.click('[data-testid="btn-login-submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

export async function resetAuditData(page: Page) {
  await page.request.post('/api/test/reset-data');
}
