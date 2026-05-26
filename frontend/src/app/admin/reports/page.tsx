'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { Service, STATUS_LABELS, ServiceStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Download, Filter, Calendar, Car, CheckCircle, Clock, TrendingUp } from 'lucide-react';

type DateRange = 'today' | 'week' | 'month' | 'custom';

function getDateRange(range: DateRange, customFrom?: string, customTo?: string) {
  const now = new Date();
  let from: string;
  let to: string = now.toISOString().slice(0, 10);

  switch (range) {
    case 'today':
      from = to;
      break;
    case 'week': {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      from = d.toISOString().slice(0, 10);
      break;
    }
    case 'month': {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      from = d.toISOString().slice(0, 10);
      break;
    }
    case 'custom':
      from = customFrom || to;
      to = customTo || to;
      break;
  }
  return { from: from!, to };
}

export default function ReportsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const tableRef = useRef<HTMLTableElement>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Service[] }>('/services?limit=9999');
      setServices(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const { from, to } = getDateRange(dateRange, customFrom, customTo);

  const filtered = services.filter((s) => {
    const d = s.createdAt.slice(0, 10);
    return d >= from && d <= to;
  });

  const completed = filtered.filter((s) => s.status === 'ENTREGUE_CONCLUIDO');
  const inProgress = filtered.filter((s) => s.status !== 'ENTREGUE_CONCLUIDO' && s.status !== 'AGUARDANDO_COLETA');
  const waiting = filtered.filter((s) => s.status === 'AGUARDANDO_COLETA');

  const statusCounts = filtered.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Tempo médio de conclusão (em horas)
  const completionTimes = completed
    .filter((s) => s.deliveredAt)
    .map((s) => (new Date(s.deliveredAt!).getTime() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60));
  const avgHours = completionTimes.length > 0
    ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
    : 0;

  function handleExportCSV() {
    const header = ['Cliente', 'Telefone', 'Veiculo', 'Placa', 'Cor', 'Status', 'Data Entrada', 'Data Entrega'];
    const rows = filtered.map((s) => [
      s.customerName,
      s.customerPhone,
      s.vehicleModel,
      s.vehiclePlate,
      s.vehicleColor,
      STATUS_LABELS[s.status],
      new Date(s.createdAt).toLocaleString('pt-BR'),
      s.deliveredAt ? new Date(s.deliveredAt).toLocaleString('pt-BR') : '',
    ]);

    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-atendimentos-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const rangeOptions: { key: DateRange; label: string }[] = [
    { key: 'today', label: 'Hoje' },
    { key: 'week', label: '7 dias' },
    { key: 'month', label: '30 dias' },
    { key: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-1">Acompanhe o desempenho dos atendimentos</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <Download size={16} />
          Exportar CSV
        </button>
      </div>

      {/* Filtro de período */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Período</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDateRange(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                dateRange === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {dateRange === 'custom' && (
          <div className="flex gap-3 mt-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">De</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Até</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="inline-flex p-2 rounded-lg text-blue-600 bg-blue-50 mb-3">
            <Car size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
          <p className="text-sm text-gray-500">Total no período</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="inline-flex p-2 rounded-lg text-green-600 bg-green-50 mb-3">
            <CheckCircle size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{completed.length}</p>
          <p className="text-sm text-gray-500">Concluídos</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="inline-flex p-2 rounded-lg text-orange-600 bg-orange-50 mb-3">
            <Clock size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{waiting.length + inProgress.length}</p>
          <p className="text-sm text-gray-500">Em andamento</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="inline-flex p-2 rounded-lg text-purple-600 bg-purple-50 mb-3">
            <TrendingUp size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgHours > 0 ? `${avgHours}h` : '-'}</p>
          <p className="text-sm text-gray-500">Tempo médio</p>
        </div>
      </div>

      {/* Distribuição por status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Distribuição por status</h2>
        <div className="space-y-3">
          {Object.entries(statusCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([status, count]) => {
              const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-40 shrink-0">
                    <StatusBadge status={status as ServiceStatus} />
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-16 text-right">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Tabela detalhada */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Atendimentos no período</h2>
          <p className="text-xs text-gray-400 mt-1">{filtered.length} resultado(s)</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhum atendimento no período selecionado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table ref={tableRef} className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Veículo</th>
                  <th className="px-5 py-3">Placa</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Entrada</th>
                  <th className="px-5 py-3">Entrega</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{s.customerName}</p>
                      <p className="text-xs text-gray-400">{s.customerPhone}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{s.vehicleModel}</td>
                    <td className="px-5 py-3 font-mono text-gray-700">{s.vehiclePlate}</td>
                    <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {s.deliveredAt ? new Date(s.deliveredAt).toLocaleDateString('pt-BR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
