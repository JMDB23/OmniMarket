'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Order, OrderStatus, OrderPriority } from '@/types';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  CheckSquare,
  Square,
  X,
  PackagePlus,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Estado para Modal de Creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    customerName: string;
    customerEmail: string;
    category: 'electronics' | 'apparel' | 'home' | 'beauty' | 'sports';
    priority: OrderPriority;
    shippingAddress: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>({
    customerName: '',
    customerEmail: '',
    category: 'electronics',
    priority: 'medium',
    shippingAddress: '',
    productName: '',
    quantity: 1,
    unitPrice: 150,
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      } else {
        toast.error('Error al cargar pedidos');
      }
    } catch {
      toast.error('Error de red al consultar pedidos');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchOrders();

    const handleReset = () => {
      fetchOrders();
    };
    window.addEventListener('omnimarket:data-reset', handleReset);
    return () => window.removeEventListener('omnimarket:data-reset', handleReset);
  }, [fetchOrders]);

  // Selección individual y masiva
  const handleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Update con Mutación Optimista
  const handleBulkAction = async (action: 'update_status' | 'update_priority' | 'delete', value?: string) => {
    if (selectedIds.length === 0) return;

    const previousOrders = [...orders];

    // Mutación optimista en frontend
    if (action === 'delete') {
      setOrders((prev) => prev.filter((o) => !selectedIds.includes(o.id)));
    } else if (action === 'update_status' && value) {
      setOrders((prev) =>
        prev.map((o) => (selectedIds.includes(o.id) ? { ...o, status: value as OrderStatus } : o))
      );
    } else if (action === 'update_priority' && value) {
      setOrders((prev) =>
        prev.map((o) => (selectedIds.includes(o.id) ? { ...o, priority: value as OrderPriority } : o))
      );
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: selectedIds,
          action,
          status: action === 'update_status' ? value : undefined,
          priority: action === 'update_priority' ? value : undefined,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(`Acción en lote completada`, {
          description: `Se actualizaron ${result.data?.updatedCount || selectedIds.length} pedidos exitosamente`,
        });
        setSelectedIds([]);
      } else {
        // Rollback
        setOrders(previousOrders);
        toast.error('Fallo en la actualización en lote. Cambios revertidos.');
      }
    } catch {
      setOrders(previousOrders);
      toast.error('Error de conexión en actualización en lote.');
    }
  };

  // Creación de Pedido (Flujo 2 E2E)
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      category: formData.category,
      priority: formData.priority,
      status: 'pending' as OrderStatus,
      shippingAddress: formData.shippingAddress,
      items: [
        {
          name: formData.productName,
          quantity: Number(formData.quantity),
          unitPrice: Number(formData.unitPrice),
          costPrice: Number(formData.unitPrice) * 0.6,
        },
      ],
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // Reflejar inmediatamente en la tabla
        setOrders((prev) => [result.data, ...prev]);
        toast.success(`Pedido ${result.data.orderNumber} registrado exitosamente`, {
          description: `Cliente: ${result.data.customerName} - Total: ${formatCurrency(result.data.totalAmount)}`,
        });
        setIsModalOpen(false);
        // Reset form
        setFormData({
          customerName: '',
          customerEmail: '',
          category: 'electronics',
          priority: 'medium',
          shippingAddress: '',
          productName: '',
          quantity: 1,
          unitPrice: 150,
        });
      } else {
        toast.error('Error al registrar pedido', {
          description: result.error || 'Verifique los campos ingresados',
        });
      }
    } catch {
      toast.error('Error de red al registrar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadges: Record<OrderStatus, { text: string; bg: string }> = {
    pending: { text: 'Pendiente', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
    processing: { text: 'Procesando', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
    shipped: { text: 'Enviado', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
    delivered: { text: 'Entregado', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
    cancelled: { text: 'Cancelado', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gestión Integral de Pedidos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            CRUD avanzado, selección múltiple y actualización en lote (Bulk Update) con persistencia optimista.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            data-testid="btn-open-create-order-modal"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Pedido</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            data-testid="input-search-orders"
            placeholder="Buscar por cliente, pedido o producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            data-testid="select-status-filter"
            className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
          >
            <option value="all">Todos los Estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            data-testid="select-category-filter"
            className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
          >
            <option value="all">Todas las Categorías</option>
            <option value="electronics">Electronics</option>
            <option value="apparel">Apparel</option>
            <option value="home">Home</option>
            <option value="beauty">Beauty</option>
            <option value="sports">Sports</option>
          </select>

          <button
            onClick={() => fetchOrders()}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Refrescar tabla"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div
          data-testid="bulk-actions-bar"
          className="bg-indigo-900 text-white p-3.5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="bg-indigo-700 px-2 py-0.5 rounded-md">
              {selectedIds.length} seleccionados
            </span>
            <span>Acciones en lote:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Status Select */}
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction('update_status', e.target.value);
                  e.target.value = '';
                }
              }}
              data-testid="bulk-status-select"
              className="text-xs bg-indigo-800 border border-indigo-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="" disabled>Cambiar Estado Masivo...</option>
              <option value="pending">Marcar como Pendiente</option>
              <option value="processing">Marcar como Procesando</option>
              <option value="shipped">Marcar como Enviado</option>
              <option value="delivered">Marcar como Entregado</option>
              <option value="cancelled">Marcar como Cancelado</option>
            </select>

            {/* Bulk Priority Select */}
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction('update_priority', e.target.value);
                  e.target.value = '';
                }
              }}
              data-testid="bulk-priority-select"
              className="text-xs bg-indigo-800 border border-indigo-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="" disabled>Cambiar Prioridad Masiva...</option>
              <option value="low">Prioridad Baja</option>
              <option value="medium">Prioridad Media</option>
              <option value="high">Prioridad Alta</option>
              <option value="urgent">Prioridad Urgente</option>
            </select>

            {/* Bulk Delete */}
            <button
              onClick={() => handleBulkAction('delete')}
              data-testid="btn-bulk-delete"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>

            {/* Deseleccionar */}
            <button
              onClick={() => setSelectedIds([])}
              className="p-1 text-indigo-300 hover:text-white"
              title="Deseleccionar todos"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <SkeletonTable />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table data-testid="orders-table" className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5 w-10">
                    <button
                      onClick={handleSelectAll}
                      data-testid="checkbox-select-all"
                      className="text-slate-600 dark:text-slate-400"
                    >
                      {selectedIds.length === orders.length && orders.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Pedido</th>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Productos</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Prioridad</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Monto Total</th>
                  <th className="p-3.5">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  const statusInfo = statusBadges[order.status] || { text: order.status, bg: 'bg-slate-100' };

                  return (
                    <tr
                      key={order.id}
                      data-testid={`order-row-${order.id}`}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          data-testid={`checkbox-order-${order.id}`}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">
                        {order.orderNumber}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {order.customerName}
                        </div>
                        <div className="text-[10px] text-slate-400">{order.customerEmail}</div>
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-slate-600 dark:text-slate-300">
                        {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="p-3.5 capitalize text-slate-500">{order.category}</td>
                      <td className="p-3.5">
                        <span className="uppercase text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {order.priority}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusInfo.bg}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="p-3.5 text-slate-400">{formatDate(order.createdAt)}</td>
                    </tr>
                  );
                })}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No se encontraron pedidos que coincidan con los criterios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Creación de Nuevo Pedido (Requisito E2E Flujo 2) */}
      {isModalOpen && (
        <div
          data-testid="modal-create-order"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Registrar Nuevo Pedido E-Commerce
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                data-testid="btn-close-modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    data-testid="input-customer-name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Ej. Roberto Sánchez"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    data-testid="input-customer-email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="roberto@example.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Producto / Item *
                </label>
                <input
                  type="text"
                  required
                  data-testid="input-product-name"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Ej. Teclado Mecánico Custom Pro"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    data-testid="input-product-qty"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Precio Unit. ($) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    data-testid="input-product-price"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as 'electronics' | 'apparel' | 'home' | 'beauty' | 'sports',
                      })
                    }
                    data-testid="select-modal-category"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="apparel">Apparel</option>
                    <option value="home">Home</option>
                    <option value="beauty">Beauty</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as OrderPriority })}
                    data-testid="select-modal-priority"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dirección de Envío *
                </label>
                <input
                  type="text"
                  required
                  data-testid="input-shipping-address"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  placeholder="Calle Sonora 45, Col. Roma, CDMX"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="btn-submit-order"
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{submitting ? 'Guardando...' : 'Crear Pedido'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
