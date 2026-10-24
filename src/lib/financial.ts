export interface FinancialInputOrder {
  totalAmount: number;
  totalCost: number;
}

/**
 * Calcula el ticket promedio (Average Order Value - AOV).
 * @param totalRevenue Ingreso total acumulado.
 * @param totalOrders Cantidad total de pedidos.
 * @returns Ticket promedio redondeado a 2 decimales, o 0 si no hay pedidos.
 */
export function calculateAverageOrderValue(totalRevenue: number, totalOrders: number): number {
  if (totalOrders <= 0 || totalRevenue <= 0) return 0;
  return Number((totalRevenue / totalOrders).toFixed(2));
}

/**
 * Calcula el margen bruto absoluto (Gross Profit).
 * Ganancia = Ingresos - Costos
 */
export function calculateGrossProfit(totalRevenue: number, totalCost: number): number {
  const profit = totalRevenue - totalCost;
  return Number(profit.toFixed(2));
}

/**
 * Calcula el porcentaje de margen bruto (Gross Margin Percentage).
 * Fórmula: ((Ingresos - Costos) / Ingresos) * 100
 */
export function calculateGrossMarginPercentage(totalRevenue: number, totalCost: number): number {
  if (totalRevenue <= 0) return 0;
  const margin = ((totalRevenue - totalCost) / totalRevenue) * 100;
  return Number(margin.toFixed(2));
}

/**
 * Calcula el ingreso neto considerando una tasa de descuento o impuestos.
 */
export function calculateNetRevenue(grossRevenue: number, discountPercentage: number = 0, taxPercentage: number = 0): number {
  if (grossRevenue <= 0) return 0;
  const afterDiscount = grossRevenue * (1 - Math.max(0, discountPercentage) / 100);
  const net = afterDiscount / (1 + Math.max(0, taxPercentage) / 100);
  return Number(net.toFixed(2));
}

/**
 * Agrega los totales financieros de una lista de órdenes.
 */
export function aggregateFinancialMetrics(orders: FinancialInputOrder[]) {
  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalCost = orders.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
  const totalOrders = orders.length;
  const averageOrderValue = calculateAverageOrderValue(totalRevenue, totalOrders);
  const grossProfit = calculateGrossProfit(totalRevenue, totalCost);
  const grossMarginPercentage = calculateGrossMarginPercentage(totalRevenue, totalCost);

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    totalOrders,
    averageOrderValue,
    grossProfit,
    grossMarginPercentage,
  };
}
