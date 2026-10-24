import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('orderId') || searchParams.get('id');

  if (orderId) {
    const order = db.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: `Pedido con ID o número ${orderId} no encontrado`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        updatedAt: order.updatedAt,
      },
      { status: 200 }
    );
  }

  // Si no se pasa orderId, retornar el mapa global de estados en el tablero Kanban
  const allOrders = db.getOrders({}, 1, 500).data;
  const statusMap = allOrders.reduce((acc, o) => {
    acc[o.id] = {
      orderNumber: o.orderNumber,
      status: o.status,
      customerName: o.customerName,
      updatedAt: o.updatedAt,
    };
    return acc;
  }, {} as Record<string, { orderNumber: string; status: string; customerName: string; updatedAt: string }>);

  const columnCounts = allOrders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json(
    {
      success: true,
      totalOrders: allOrders.length,
      columnCounts,
      orders: statusMap,
    },
    { status: 200 }
  );
}
