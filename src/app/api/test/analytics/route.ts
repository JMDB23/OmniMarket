import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analyticsQuerySchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const searchParams = request.nextUrl.searchParams;

  const rawParams = {
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '50',
    status: searchParams.get('status') || undefined,
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
  };

  const parsed = analyticsQuerySchema.safeParse(rawParams);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Parámetros de consulta inválidos',
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const { page, limit, status, category, search, startDate, endDate } = parsed.data;

  // Obtener pedidos paginados y analíticas
  const paginated = db.getOrders({ status, category, search, startDate, endDate }, page, limit);
  const analytics = db.getAnalytics();

  const responseTimeMs = Number((performance.now() - startTime).toFixed(2));

  return NextResponse.json(
    {
      success: true,
      slaPassed: responseTimeMs < 300,
      responseTimeMs,
      pagination: paginated.pagination,
      metrics: analytics,
      data: paginated.data,
    },
    {
      status: 200,
      headers: {
        'Server-Timing': `db;dur=${responseTimeMs}`,
        'X-Response-Time': `${responseTimeMs}ms`,
      },
    }
  );
}
