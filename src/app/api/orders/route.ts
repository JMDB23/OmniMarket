import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createOrderSchema, bulkUpdateOrdersSchema } from '@/lib/schemas';
import { OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const status = (searchParams.get('status') as OrderStatus) || undefined;
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;

  const result = db.getOrders({ status, category, search }, page, limit);

  return NextResponse.json({
    success: true,
    ...result,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de pedido inválidos',
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const newOrder = db.createOrder(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Pedido creado exitosamente',
        data: newOrder,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar la solicitud',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bulkUpdateOrdersSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parámetros de actualización en lote inválidos',
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const result = db.bulkUpdate(parsed.data);

    return NextResponse.json({
      success: true,
      message: `Actualización en lote completada (${result.updatedCount} registros)`,
      data: result,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Error en actualización en lote',
      },
      { status: 500 }
    );
  }
}
