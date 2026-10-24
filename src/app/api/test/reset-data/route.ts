import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const freshOrders = db.resetData();
  const analytics = db.getAnalytics();

  return NextResponse.json(
    {
      success: true,
      message: 'Base de datos de prueba restablecida exitosamente',
      totalRecords: freshOrders.length,
      metrics: analytics,
      sampleOrders: freshOrders.slice(0, 3),
    },
    { status: 200 }
  );
}

// También admitir GET para conveniencia de inspección en navegador si el evaluador lo abre directamente
export async function GET() {
  return NextResponse.json({
    message: 'Usa POST para restablecer los datos de prueba a su estado inicial determinista.',
    endpoint: '/api/test/reset-data',
    method: 'POST',
  });
}
