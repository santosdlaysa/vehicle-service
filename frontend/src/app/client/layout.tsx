'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CustomerAuthProvider, useCustomerAuth } from '@/components/providers/CustomerAuthProvider';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { Car, LogOut, LayoutDashboard, Plus } from 'lucide-react';
import clsx from 'clsx';

function ClientShell({ children }: { children: React.ReactNode }) {
  const { customer, loading, logout } = useCustomerAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');

  useEffect(() => {
    if (!loading && !customer && !isAuthPage) {
      router.replace('/client/login');
    }
  }, [customer, loading, isAuthPage, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!customer && !isAuthPage) return null;

  if (isAuthPage) return <>{children}</>;

  const navItems = [
    { href: '/client/dashboard', label: 'Meus Atendimentos', icon: LayoutDashboard },
    { href: '/client/services/new', label: 'Solicitar Servico', icon: Plus },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top nav */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-gray-900 text-white shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Car size={22} className="text-blue-400" />
            <span className="text-lg font-bold">AutoTrack</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800',
                )}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-300 sm:block">{customer?.name}</span>
            <button
              onClick={() => { logout(); router.replace('/client/login'); }}
              className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6 pt-[68px] pb-20 sm:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex sm:hidden items-stretch justify-around border-t border-gray-200 bg-white safe-bottom">
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

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      <ClientShell>{children}</ClientShell>
    </CustomerAuthProvider>
  );
}
