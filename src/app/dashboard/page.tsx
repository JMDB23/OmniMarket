'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Percent,
  Clock,
  ArrowRight,
  Kanban,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { AnalyticsSummary, Order } from '@/types';
import { SkeletonMetricCard, SkeletonChart } from '@/components/ui/Skeleton';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [slaPassed, setSlaPassed] = useState<boolean>(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/test/analytics?page=1&limit=8');
      const data = await res.json();
      const end = performance.now();
      const clientLatency = Number((end - start).toFixed(2));

      if (data.success) {
        setMetrics(data.metrics);
        setRecentOrders(data.data || []);
        setLatencyMs(data.responseTimeMs || clientLatency);
        setSlaPassed(data.slaPassed !== undefined ? data.slaPassed : clientLatency < 300);
      } else {
        toast.error('Error al cargar analítica de ventas');
      }
    } catch {
      toast.error('Fallo de conexión al cargar analítica');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();

    const handleReset = () => {
      fetchAnalytics();
    };
    window.addEventListener('omnimarket:data-reset', handleReset);
    return () => window.removeEventListener('omnimarket:data-reset', handleReset);
  }, [fetchAnalytics]);

  return (
    <div className="space-y-6">
      {/* Header & Latency SLA Monitor */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard de Analítica E-Commerce
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervisión integral de ventas, márgenes financieros y flujo de operaciones en tiempo real.
          </p>
        </div>

        {/* SLA Box */}
        <div className="flex items-center gap-3">
          <div
            data-testid="sla-latency-badge"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              slaPassed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Latencia API: {latencyMs}ms</span>
            <span className="font-bold text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider bg-white/60 dark:bg-black/30">
              {slaPassed ? 'Cumple SLA < 300ms' : 'SLA Excedido'}
            </span>
          </div>

          <button
            onClick={() => fetchAnalytics()}
            title="Actualizar datos"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Financial Cards (Skeletons during load) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ingresos Totales</span>
              <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {formatCurrency(metrics.totalRevenue)}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs periodo anterior</span>
            </div>
          </div>

          {/* Average Order Value (Ticket Promedio) */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ticket Promedio (AOV)</span>
              <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 rounded-xl">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {formatCurrency(metrics.averageOrderValue)}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-600 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{metrics.totalOrders} pedidos totales</span>
            </div>
          </div>

          {/* Gross Margin Percentage */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Margen Bruto (%)</span>
              <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 rounded-xl">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {formatPercentage(metrics.grossMarginPercentage)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Ganancia: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(metrics.grossProfit)}</span>
            </p>
          </div>

          {/* Active Orders / Operations Status */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Flujo Kanban</span>
              <div className="p-2 bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 rounded-xl">
                <Kanban className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {(metrics.ordersByStatus.pending || 0) + (metrics.ordersByStatus.processing || 0)}
              <span className="text-xs font-normal text-slate-500 ml-1">en proceso</span>
            </p>
            <div className="flex gap-2 mt-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                {metrics.ordersByStatus.pending} pend.
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                {metrics.ordersByStatus.shipped} env.
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                {metrics.ordersByStatus.delivered} entreg.
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Category Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-1">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            Ventas por Categoría
          </h2>
          {loading ? (
            <div className="space-y-4 pt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : metrics ? (
            <div className="space-y-4">
              {Object.entries(metrics.salesByCategory).map(([category, amount]) => {
                const percentage = metrics.totalRevenue > 0 ? (amount / metrics.totalRevenue) * 100 : 0;
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="capitalize text-slate-700 dark:text-slate-300">{category}</span>
                      <span className="text-slate-900 dark:text-white font-semibold">
                        {formatCurrency(amount)} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Recent Revenue Trends Bar Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Tendencia de Ingresos Diarios
            </h2>
            <span className="text-xs text-slate-500">Últimos periodos registrados</span>
          </div>

          {loading ? (
            <SkeletonChart />
          ) : metrics && metrics.recentRevenueTrends.length > 0 ? (
            <div>
              {/* Max value scale calculation */}
              {(() => {
                const maxVal = Math.max(...metrics.recentRevenueTrends.map((t) => t.revenue), 100);
                return (
                  <div className="h-56 flex items-end gap-3 pt-6 px-2">
                    {metrics.recentRevenueTrends.map((trend) => {
                      const heightPercent = Math.max(12, Math.round((trend.revenue / maxVal) * 100));
                      return (
                        <div key={trend.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                          {/* Tooltip on hover */}
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap shadow z-10">
                            {formatCurrency(trend.revenue)} ({trend.orders} pedidos)
                          </div>
                          <div
                            className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md hover:from-indigo-500 hover:to-indigo-300 transition-all cursor-pointer shadow-sm"
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="text-[10px] text-slate-500 truncate max-w-full">
                            {trend.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-12 text-center">No hay datos de tendencias disponibles</p>
          )}
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Pedidos Recientes
            </h2>
            <p className="text-xs text-slate-500">Últimas transacciones sincronizadas en tiempo real</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/kanban"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition"
            >
              <Kanban className="w-3.5 h-3.5" />
              Tablero Kanban
            </Link>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
            >
              <span>Ver Todos y Bulk Update</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-700 uppercase">
              <tr>
                <th className="p-3.5">Pedido</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5">Monto</th>
                <th className="p-3.5">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.map((order) => {
                const statusStyles: Record<string, string> = {
                  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
                  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
                  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                  cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
                };
                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">
                      {order.orderNumber}
                    </td>
                    <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {order.customerName}
                    </td>
                    <td className="p-3.5 capitalize text-slate-500">
                      {order.category}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusStyles[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {order.createdAt.slice(0, 10)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
