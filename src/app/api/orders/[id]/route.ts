import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { updateOrderStatusSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const order = db.getOrderById(params.id);
  if (!order) {
    return NextResponse.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: order });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Estado de pedido inválido', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = db.updateOrderStatus(params.id, parsed.data.status);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado para actualizar' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Pedido ${updated.orderNumber} actualizado a ${updated.status}`,
      data: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el estado' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const deleted = db.deleteOrder(params.id);
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Pedido no encontrado' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Pedido eliminado exitosamente' });
}
