'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { LayoutDashboard, ClipboardList, LogOut, Car, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user && !pathname.includes('/login')) {
      router.replace('/admin/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user && !pathname.includes('/login')) return null;

  if (pathname.includes('/login')) return <>{children}</>;

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/services', label: 'Atendimentos', icon: ClipboardList },
    { href: '/admin/reports', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - desktop only */}
      <aside
        className={clsx(
          'relative hidden md:flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out shrink-0',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Logo */}
        <div className={clsx(
          'flex items-center border-b border-gray-700 py-5 overflow-hidden',
          collapsed ? 'justify-center px-0' : 'gap-2 px-6',
        )}>
          <Car size={24} className="text-blue-400 shrink-0" />
          {!collapsed && <span className="text-lg font-bold whitespace-nowrap">AutoTrack</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={clsx(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                collapsed ? 'justify-center' : 'gap-3',
                pathname.startsWith(href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800',
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-gray-700 p-2">
          {!collapsed && (
            <div className="mb-2 px-3">
              <p className="text-xs text-gray-400">Conectado como</p>
              <p className="text-sm font-medium truncate">{user?.name}</p>
            </div>
          )}
          <button
            title={collapsed ? 'Sair' : undefined}
            onClick={() => { logout(); router.replace('/admin/login'); }}
            className={clsx(
              'flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors',
              collapsed ? 'justify-center' : 'gap-3',
            )}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-blue-600 transition-colors shadow-md"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-20 flex md:hidden items-center justify-between bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <Car size={20} className="text-blue-400" />
          <span className="text-base font-bold text-white">AutoTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 truncate max-w-[120px]">{user?.name}</span>
          <button
            onClick={() => { logout(); router.replace('/admin/login'); }}
            className="flex items-center rounded-lg p-2 text-gray-300 hover:bg-gray-800 transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pt-14 pb-20 md:pt-0 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex md:hidden items-stretch justify-around border-t border-gray-200 bg-white safe-bottom">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors',
              pathname.startsWith(href)
                ? 'text-blue-600'
                : 'text-gray-400',
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <Toaster position="top-right" />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
