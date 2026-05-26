'use client';

import { Car, Shield, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
      <div className="mb-10 flex flex-col items-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600">
          <Car size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">AutoTrack</h1>
        <p className="mt-2 text-gray-400">Gerenciamento de servicos automotivos</p>
      </div>

      <div className="grid w-full max-w-md gap-4">
        <Link
          href="/client/login"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UserCircle size={24} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Sou cliente</p>
            <p className="text-sm text-gray-500">Acompanhe ou solicite um servico</p>
          </div>
        </Link>

        <Link
          href="/admin/login"
          className="flex items-center gap-4 rounded-2xl bg-white/10 border border-white/20 p-5 hover:bg-white/15 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-800 text-gray-300">
            <Shield size={24} />
          </div>
          <div>
            <p className="font-semibold text-white">Painel administrativo</p>
            <p className="text-sm text-gray-400">Acesso para funcionarios</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
