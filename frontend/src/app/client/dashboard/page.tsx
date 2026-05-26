'use client';

import { useEffect, useState } from 'react';
import { customerApi } from '@/lib/customerApi';
import { Service, ServiceStatus, STATUS_LABELS } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Plus, Car } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type FilterTab = 'all' | 'waiting' | 'active' | 'done';

export default function ClientDashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');

  useEffect(() => {
    customerApi
      .get<{ data: Service[] }>('/customer/services?limit=100')
      .then((res) => setServices(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = services.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'waiting') return s.status === 'AGUARDANDO_COLETA';
    if (filter === 'active') return !['AGUARDANDO_COLETA', 'ENTREGUE_CONCLUIDO'].includes(s.status);
    if (filter === 'done') return s.status === 'ENTREGUE_CONCLUIDO';
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'waiting', label: 'Aguardando' },
    { key: 'active', label: 'Em andamento' },
    { key: 'done', label: 'Concluidos' },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meus Atendimentos</h1>
        <Link
          href="/client/services/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Solicitar servico
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Car size={48} className="mb-4" />
          <p className="text-lg font-medium">Nenhum atendimento encontrado</p>
          <p className="text-sm">Solicite um servico para comecar.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((service) => (
            <Link
              key={service.id}
              href={`/client/services/${service.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  {service.vehicleModel}
                </span>
                <StatusBadge status={service.status} />
              </div>
              <p className="text-sm text-gray-500">
                Placa: <span className="font-medium text-gray-700">{service.vehiclePlate}</span>
              </p>
              {service.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{service.description}</p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                {new Date(service.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
