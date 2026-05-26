'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Service, ServiceStatus, STATUS_LABELS } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'AGUARDANDO_COLETA', label: STATUS_LABELS.AGUARDANDO_COLETA },
  { value: 'EM_TRANSITO_PARA_ESTETICA', label: STATUS_LABELS.EM_TRANSITO_PARA_ESTETICA },
  { value: 'RECEBIDO_NA_ESTETICA', label: STATUS_LABELS.RECEBIDO_NA_ESTETICA },
  { value: 'EM_LAVAGEM_SERVICO', label: STATUS_LABELS.EM_LAVAGEM_SERVICO },
  { value: 'PRONTO_PARA_DEVOLUCAO', label: STATUS_LABELS.PRONTO_PARA_DEVOLUCAO },
  { value: 'EM_TRANSITO_PARA_ENTREGA', label: STATUS_LABELS.EM_TRANSITO_PARA_ENTREGA },
  { value: 'ENTREGUE_CONCLUIDO', label: STATUS_LABELS.ENTREGUE_CONCLUIDO },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);

    setLoading(true);
    api
      .get<{ data: Service[] }>(`/services?${params}`)
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  }, [search, status]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atendimentos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie todas as ordens de serviço</p>
        </div>
        <Link
          href="/admin/services/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Novo atendimento
        </Link>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, placa ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Cliente</th>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Veículo</th>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Placa</th>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Entrada</th>
              <th className="px-5 py-3 text-left font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400">Carregando...</td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400">Nenhum atendimento encontrado.</td>
              </tr>
            ) : (
              services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{s.customerName}</p>
                    <p className="text-gray-500 text-xs">{s.customerPhone}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-700">{s.vehicleModel}</td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{s.vehiclePlate}</span>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/services/${s.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
