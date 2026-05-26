'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { LayoutDashboard, ClipboardList, LogOut, Car, ChevronLeft, ChevronRight } from 'lucide-react';
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
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={clsx(
          'relative flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out shrink-0',
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>

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
