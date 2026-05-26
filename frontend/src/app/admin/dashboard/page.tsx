'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { Service, STATUS_LABELS, ServiceStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { Car, ClipboardList, CheckCircle, Package, Clock, Plus, Bell, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';

const POLL_INTERVAL = 15_000; // 15 segundos

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    // Dois beeps curtos e agradáveis
    [0, 0.2].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
  } catch {}
}

function sendBrowserNotification(service: Service) {
  if (Notification.permission !== 'granted') return;
  const n = new Notification('Novo atendimento!', {
    body: `${service.customerName} — ${service.vehicleModel} (${service.vehiclePlate})`,
    icon: '/icons/icon-192x192.svg',
    tag: `new-service-${service.id}`,
  });
  n.onclick = () => {
    window.focus();
    window.location.href = `/admin/services/${service.id}`;
  };
}

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const knownIdsRef = useRef<Set<string> | null>(null);
  const firstLoadRef = useRef(true);

  // Inicializar estado da permissão
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  async function requestNotifications() {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      return;
    }
    const result = await Notification.requestPermission();
    setNotificationsEnabled(result === 'granted');
    if (result === 'granted') {
      toast.success('Notificações ativadas!');
    }
  }

  const fetchServices = useCallback(() => {
    api
      .get<{ data: Service[] }>('/services?limit=5')
      .then((res) => {
        const newServices = res.data;
        // Detectar novos atendimentos
        if (knownIdsRef.current && !firstLoadRef.current) {
          const newOnes = newServices.filter((s) => !knownIdsRef.current!.has(s.id));
          if (newOnes.length > 0) {
            playNotificationSound();
            newOnes.forEach((s) => sendBrowserNotification(s));
            toast(`Novo atendimento: ${newOnes[0].customerName}`, { icon: '🚗' });
          }
        }
        knownIdsRef.current = new Set(newServices.map((s) => s.id));
        firstLoadRef.current = false;
        setServices(newServices);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, POLL_INTERVAL);

    function handleFocus() { fetchServices(); }
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') fetchServices();
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchServices]);

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral dos atendimentos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={requestNotifications}
            title={notificationsEnabled ? 'Notificações ativadas' : 'Ativar notificações'}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              notificationsEnabled
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            <span className="hidden sm:inline">{notificationsEnabled ? 'Notificações ativas' : 'Ativar notificações'}</span>
          </button>
          <Link
            href="/admin/services/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Novo atendimento</span>
          </Link>
        </div>
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
