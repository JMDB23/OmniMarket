import { describe, it, expect } from 'vitest';
import {
  calculateAverageOrderValue,
  calculateGrossProfit,
  calculateGrossMarginPercentage,
  calculateNetRevenue,
  aggregateFinancialMetrics,
} from '@/lib/financial';

describe('Cálculos Financieros E-Commerce (AOV, Márgenes y Net Revenue)', () => {
  it('1. Debe calcular el ticket promedio (AOV) correctamente con valores positivos', () => {
    const revenue = 10500;
    const ordersCount = 50;
    const aov = calculateAverageOrderValue(revenue, ordersCount);
    expect(aov).toBe(210);
  });

  it('2. Debe retornar 0 en ticket promedio si no hay órdenes o el ingreso es 0 o negativo', () => {
    expect(calculateAverageOrderValue(0, 0)).toBe(0);
    expect(calculateAverageOrderValue(500, 0)).toBe(0);
    expect(calculateAverageOrderValue(-100, 5)).toBe(0);
  });

  it('3. Debe calcular la ganancia bruta absoluta (Gross Profit) correctamente', () => {
    const revenue = 5000;
    const cost = 3200;
    const profit = calculateGrossProfit(revenue, cost);
    expect(profit).toBe(1800);
  });

  it('4. Debe calcular el porcentaje de margen bruto con precisión de dos decimales', () => {
    const revenue = 1250;
    const cost = 800;
    // Margen: ((1250 - 800) / 1250) * 100 = (450 / 1250) * 100 = 36%
    const margin = calculateGrossMarginPercentage(revenue, cost);
    expect(margin).toBe(36);
  });

  it('5. Debe calcular el ingreso neto descontando promociones e impuestos', () => {
    const gross = 1000;
    const discount = 10; // 10%
    const tax = 0;
    // 1000 - 10% = 900
    const net = calculateNetRevenue(gross, discount, tax);
    expect(net).toBe(900);
  });

  it('6. Debe agregar métricas financieras acumuladas de un conjunto de órdenes', () => {
    const mockOrders = [
      { totalAmount: 1000, totalCost: 600 },
      { totalAmount: 500, totalCost: 200 },
    ];
    const metrics = aggregateFinancialMetrics(mockOrders);

    expect(metrics.totalOrders).toBe(2);
    expect(metrics.totalRevenue).toBe(1500);
    expect(metrics.totalCost).toBe(800);
    expect(metrics.grossProfit).toBe(700);
    expect(metrics.averageOrderValue).toBe(750);
    expect(metrics.grossMarginPercentage).toBe(46.67);
  });
});
