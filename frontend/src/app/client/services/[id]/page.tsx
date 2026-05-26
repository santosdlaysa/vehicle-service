'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { customerApi } from '@/lib/customerApi';
import { Service, STATUS_LABELS } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ClientServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerApi
      .get<{ service: Service }>(`/customer/services/${id}`)
      .then((res) => setService(res.service))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Poll for updates every 30s
  useEffect(() => {
    if (!service || service.status === 'ENTREGUE_CONCLUIDO') return;
    const interval = setInterval(() => {
      customerApi
        .get<{ service: Service }>(`/customer/services/${id}`)
        .then((res) => setService(res.service))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [id, service?.status]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>Atendimento nao encontrado.</p>
        <Link href="/client/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/client/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">{service.vehicleModel}</h1>
              <StatusBadge status={service.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Placa</p>
                <p className="font-medium text-gray-900">{service.vehiclePlate}</p>
              </div>
              <div>
                <p className="text-gray-500">Cor</p>
                <p className="font-medium text-gray-900">{service.vehicleColor}</p>
              </div>
              <div>
                <p className="text-gray-500">Aberto em</p>
                <p className="font-medium text-gray-900">
                  {new Date(service.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {service.preferredDate && (
                <div>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Calendar size={14} /> Data preferida
                  </p>
                  <p className="font-medium text-gray-900">
                    {new Date(service.preferredDate).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>

            {service.description && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <FileText size={14} /> Descricao do servico
                </p>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            )}
          </div>

          {/* Checklists */}
          {service.checklists && service.checklists.length > 0 && service.checklists.map((checklist) => (
            <div key={checklist.id} className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                {checklist.type === 'PICKUP' ? 'Checklist de Busca' : 'Checklist de Entrega'}
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Riscos</span>
                  <span>{checklist.scratches ? 'Sim' : 'Nao'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amassados</span>
                  <span>{checklist.dents ? 'Sim' : 'Nao'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Retrovisores</span>
                  <span>{checklist.mirrorsOk ? 'OK' : 'Problema'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Farois</span>
                  <span>{checklist.lightsOk ? 'OK' : 'Problema'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pneus</span>
                  <span>{checklist.tiresOk ? 'OK' : 'Problema'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vidros</span>
                  <span>{checklist.glassOk ? 'OK' : 'Problema'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Combustivel</span>
                  <span>{checklist.fuelLevel}</span>
                </div>
                {checklist.odometer && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quilometragem</span>
                    <span>{checklist.odometer.toLocaleString('pt-BR')} km</span>
                  </div>
                )}
              </div>
              {checklist.notes && (
                <p className="mt-3 text-sm text-gray-600">
                  <span className="font-medium">Obs:</span> {checklist.notes}
                </p>
              )}
            </div>
          ))}

          {/* Media */}
          {service.media && service.media.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Fotos</h2>
              {['ENTRY', 'EXIT'].map((type) => {
                const photos = service.media!.filter((m) => m.type === type);
                if (photos.length === 0) return null;
                return (
                  <div key={type} className="mb-4">
                    <h3 className="mb-2 text-sm font-medium text-gray-700">
                      {type === 'ENTRY' ? 'Entrada' : 'Saida'}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo) => (
                        <img
                          key={photo.id}
                          src={photo.url}
                          alt={`Foto de ${type === 'ENTRY' ? 'entrada' : 'saida'}`}
                          className="h-24 w-full rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar - Timeline */}
        <div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Progresso</h2>
            <StatusTimeline currentStatus={service.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
