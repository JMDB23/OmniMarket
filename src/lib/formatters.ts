export type CurrencyCode = 'USD' | 'EUR' | 'MXN';

/**
 * Formatea un número a representación de moneda con el locale adecuado.
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'USD', locale: string = 'en-US'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Formatea un porcentaje con símbolo %.
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  const safeValue = isNaN(value) ? 0 : value;
  return `${safeValue >= 0 ? '+' : ''}${safeValue.toFixed(decimals)}%`;
}

/**
 * Formatea números grandes de forma compacta (ej: 1.2K, 3.4M).
 */
export function formatCompactNumber(number: number): string {
  const safeNumber = isNaN(number) ? 0 : number;
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(safeNumber);
}

/**
 * Formatea una fecha ISO a formato legible.
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
