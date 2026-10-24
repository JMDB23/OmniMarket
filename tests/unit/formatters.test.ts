import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage, formatCompactNumber } from '@/lib/formatters';

describe('Formateadores de Moneda y Métricas', () => {
  it('7. Debe formatear importes en USD con dos decimales', () => {
    const formatted = formatCurrency(1250.5, 'USD', 'en-US');
    expect(formatted).toBe('$1,250.50');
  });

  it('8. Debe formatear importes en MXN y EUR correctamente', () => {
    const formattedMxn = formatCurrency(500, 'MXN', 'es-MX');
    // es-MX format contains $ and 500.00
    expect(formattedMxn).toContain('500.00');

    const formattedEur = formatCurrency(100, 'EUR', 'en-US');
    expect(formattedEur).toContain('€');
  });

  it('9. Debe formatear porcentajes con signo y un decimal', () => {
    expect(formatPercentage(15.42)).toBe('+15.4%');
    expect(formatPercentage(-8.7)).toBe('-8.7%');
    expect(formatPercentage(0)).toBe('+0.0%');
  });

  it('10. Debe formatear números grandes en formato compacto (K, M)', () => {
    expect(formatCompactNumber(1500)).toBe('1.5K');
    expect(formatCompactNumber(2500000)).toBe('2.5M');
  });
});
