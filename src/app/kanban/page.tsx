'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Order, OrderStatus } from '@/types';
import { SkeletonKanbanBoard } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import {
  Clock,
  RefreshCw,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  ArrowRightCircle,
} from 'lucide-react';

const COLUMNS: { id: OrderStatus; title: string; color: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'pending', title: 'Pendiente', color: 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300', icon: Clock },
  { id: 'processing', title: 'Procesando', color: 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300', icon: RefreshCw },
  { id: 'shipped', title: 'Enviado', color: 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300', icon: Truck },
  { id: 'delivered', title: 'Entregado', color: 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300', icon: CheckCircle2 },
  { id: 'cancelled', title: 'Cancelado', color: 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300', icon: XCircle },
];

export default function KanbanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<OrderStatus | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?limit=100');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      } else {
        toast.error('Error al cargar pedidos para el tablero Kanban');
      }
    } catch {
      toast.error('Fallo de conexión al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const handleReset = () => {
      fetchOrders();
    };
    window.addEventListener('omnimarket:data-reset', handleReset);
    return () => window.removeEventListener('omnimarket:data-reset', handleReset);
  }, [fetchOrders]);

  /**
   * Mutación optimista inmediata con persistencia y rollback ante fallos.
   */
  const moveOrder = async (orderId: string, targetStatus: OrderStatus) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    if (!currentOrder || currentOrder.status === targetStatus) return;

    const previousStatus = currentOrder.status;

    // 1. MUTACIÓN OPTIMISTA INMEDIATA
    const optimisticOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: targetStatus, updatedAt: new Date().toISOString() } : o
    );
    setOrders(optimisticOrders);

    // 2. Persistencia en Backend
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success(`Pedido ${currentOrder.orderNumber} actualizado`, {
          description: `Movido de "${previousStatus}" a "${targetStatus}"`,
        });
      } else {
        // Rollback optimista en caso de respuesta no exitosa
        setOrders(orders);
        toast.error('Error al actualizar pedido en el servidor', {
          description: 'Se revirtió el cambio de estado en el tablero.',
        });
      }
    } catch {
      // Rollback optimista ante error de red
      setOrders(orders);
      toast.error('Error de red al persistir el cambio', {
        description: 'Se revirtió el cambio en el tablero.',
      });
    }
  };

  // Manejadores de Drag and Drop HTML5
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, orderId: string) => {
    setDraggingId(orderId);
    e.dataTransfer.setData('text/plain', orderId);
    e.dataTransfer.setData('application/json', JSON.stringify({ orderId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: OrderStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== columnId) {
      setActiveDropColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStatus: OrderStatus) => {
    e.preventDefault();
    setActiveDropColumn(null);

    let orderId = e.dataTransfer.getData('text/plain') || draggingId;
    if (!orderId) {
      try {
        const json = e.dataTransfer.getData('application/json');
        if (json) {
          orderId = JSON.parse(json).orderId;
        }
      } catch {
        // Fallback
      }
    }

    setDraggingId(null);

    if (orderId) {
      await moveOrder(orderId, targetStatus);
    }
  };

  return (
    <div className="space-y-6">
      {/* Kanban Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tablero Kanban de Operaciones
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
              Drag & Drop Optimista
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Arrastra las tarjetas entre columnas para gestionar el ciclo de vida de los pedidos con persistencia en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOrders()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <SkeletonKanbanBoard />
      ) : (
        <div
          data-testid="kanban-board"
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start"
        >
          {COLUMNS.map((col) => {
            const Icon = col.icon;
            const columnOrders = orders.filter((o) => o.status === col.id);
            const isDropActive = activeDropColumn === col.id;

            return (
              <div
                key={col.id}
                data-testid={`kanban-column-${col.id}`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col rounded-2xl border transition-all duration-200 min-h-[550px] p-3 ${
                  isDropActive
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-400 ring-offset-2'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {col.title}
                    </span>
                  </div>
                  <span
                    data-testid={`column-count-${col.id}`}
                    className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 shadow-sm"
                  >
                    {columnOrders.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-3">
                  {columnOrders.map((order) => {
                    const isDragging = draggingId === order.id;
                    const priorityBadges: Record<string, string> = {
                      low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                      medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
                      high: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
                      urgent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
                    };

                    return (
                      <div
                        key={order.id}
                        id={`card-${order.id}`}
                        data-testid={`kanban-card-${order.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setActiveDropColumn(null);
                        }}
                        className={`p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none ${
                          isDragging ? 'opacity-40 scale-95 border-dashed border-indigo-400' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              priorityBadges[order.priority] || ''
                            }`}
                          >
                            {order.priority}
                          </span>
                        </div>

                        <p className="font-medium text-xs text-slate-900 dark:text-white line-clamp-1">
                          {order.customerName}
                        </p>

                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">
                            {order.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatCurrency(order.totalAmount)}
                          </span>

                          {/* Quick action / Status transition selector */}
                          <div className="flex items-center gap-1">
                            <select
                              aria-label={`Mover estado de ${order.orderNumber}`}
                              value={order.status}
                              onChange={(e) => moveOrder(order.id, e.target.value as OrderStatus)}
                              data-testid={`select-card-status-${order.id}`}
                              className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-600 dark:text-slate-300 font-medium"
                            >
                              <option value="pending">Pendiente</option>
                              <option value="processing">Procesando</option>
                              <option value="shipped">Enviado</option>
                              <option value="delivered">Entregado</option>
                              <option value="cancelled">Cancelado</option>
                            </select>

                            {/* Botón rápido para mover a la siguiente columna */}
                            {order.status === 'pending' && (
                              <button
                                onClick={() => moveOrder(order.id, 'processing')}
                                data-testid={`btn-move-next-${order.id}`}
                                title="Mover a Procesando"
                                className="text-indigo-600 hover:text-indigo-800 p-0.5"
                              >
                                <ArrowRightCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {columnOrders.length === 0 && (
                    <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                      <Layers className="w-5 h-5 mb-1 opacity-50" />
                      <span>Sin pedidos</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
