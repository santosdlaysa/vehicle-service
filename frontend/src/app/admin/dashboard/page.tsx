'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Service, STATUS_LABELS, ServiceStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { Car, ClipboardList, CheckCircle, Package, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: Service[] }>('/services?limit=5')
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  }, []);

  const counts = services.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<ServiceStatus, number>,
  );

  const stats = [
    { label: 'Aguardando', value: counts.AGUARDANDO_COLETA ?? 0, icon: Clock, color: 'text-orange-600 bg-orange-50' },
    { label: 'Em transito', value: (counts.EM_TRANSITO_PARA_ESTETICA ?? 0) + (counts.EM_TRANSITO_PARA_ENTREGA ?? 0), icon: Car, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Na estetica', value: (counts.RECEBIDO_NA_ESTETICA ?? 0) + (counts.EM_LAVAGEM_SERVICO ?? 0), icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
    { label: 'Prontos', value: counts.PRONTO_PARA_DEVOLUCAO ?? 0, icon: Package, color: 'text-green-600 bg-green-50' },
    { label: 'Concluidos', value: counts.ENTREGUE_CONCLUIDO ?? 0, icon: CheckCircle, color: 'text-gray-600 bg-gray-50' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral dos atendimentos</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Últimos atendimentos</h2>
          <Link href="/admin/services" className="text-sm text-blue-600 hover:underline">
            Ver todos
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/admin/services/${s.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900">{s.customerName}</p>
                  <p className="text-xs text-gray-500">
                    {s.vehicleModel} • {s.vehiclePlate}
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </Link>
            ))}
            {services.length === 0 && (
              <p className="p-8 text-center text-sm text-gray-400">Nenhum atendimento ainda.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
