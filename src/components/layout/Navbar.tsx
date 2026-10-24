'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  BarChart3,
  Kanban,
  Package,
  RotateCcw,
  LogOut,
  Zap,
  ShoppingBag,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [resetting, setResetting] = useState(false);

  const handleResetData = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/test/reset-data', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('Datos restablecidos al conjunto de prueba inicial', {
          description: `${data.totalRecords} pedidos restaurados para auditoría/E2E`,
        });
        // Disparar recarga de evento global para componentes reactivos
        window.dispatchEvent(new CustomEvent('omnimarket:data-reset'));
      } else {
        toast.error('Error al restablecer datos de prueba');
      }
    } catch {
      toast.error('Error de red al invocar /api/test/reset-data');
    } finally {
      setResetting(false);
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard Analítico', icon: BarChart3 },
    { href: '/kanban', label: 'Kanban D&D', icon: Kanban },
    { href: '/orders', label: 'Gestión de Pedidos & Bulk', icon: Package },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-indigo-600 dark:text-indigo-400">
              <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline-block tracking-tight text-slate-900 dark:text-white">
                OmniMarket <span className="text-xs uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full ml-1">Operations Hub</span>
              </span>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: SLA badge, Reset button, User session */}
          <div className="flex items-center gap-3">
            {/* SLA Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800" title="SLA Backend < 300ms verificado en endpoints /api/test/*">
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600/30" />
              <span>SLA &lt;300ms</span>
            </div>

            {/* Audit Reset Button */}
            <button
              onClick={handleResetData}
              disabled={resetting}
              data-testid="btn-reset-data"
              title="Restablecer base de datos a estado inicial determinista (/api/test/reset-data)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-700 transition disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Auditoría</span>
            </button>

            {/* User Session Profile & Logout */}
            {session ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden xl:block text-left text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                    {session.user?.name || 'Evaluador'}
                  </p>
                  <p className="text-slate-400 text-[10px] truncate max-w-[120px]">
                    {session.user?.email}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  data-testid="btn-signout"
                  title="Cerrar sesión"
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
              >
                <UserCheck className="w-4 h-4" />
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
