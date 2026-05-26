'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Service, STATUS_ORDER, STATUS_LABELS, ServiceStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, Image, Share2, ChevronRight, Copy, CheckCircle2, Circle, AlertCircle, UserCheck, Calendar, FileText } from 'lucide-react';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [sharedLink, setSharedLink] = useState<string | null>(null);
  async function fetchService() {
    try {
      const res = await api.get<{ service: Service }>(`/services/${id}`);
      setService(res.service);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchService(); }, [id]);

  async function handleStatusChange(newStatus: ServiceStatus) {
    setChangingStatus(true);
    try {
      await api.patch(`/services/${id}/status`, { status: newStatus });
      toast.success(`Status atualizado: ${STATUS_LABELS[newStatus]}`);
      fetchService();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar status');
    } finally {
      setChangingStatus(false);
    }
  }

  async function handleShare() {
    setSharing(true);
    try {
      const res = await api.post<{ link: string }>(`/services/${id}/share`, {});
      const link = res.link;
      setSharedLink(link);
      await navigator.clipboard.writeText(link);
      toast.success('Link copiado para a área de transferência!');
      fetchService();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao compartilhar link');
    } finally {
      setSharing(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Carregando...</div>;
  }

  if (!service) {
    return <div className="p-8 text-center text-gray-400">Atendimento não encontrado.</div>;
  }

  const currentIdx = STATUS_ORDER.indexOf(service.status);
  const nextStatus = STATUS_ORDER[currentIdx + 1] as ServiceStatus | undefined;

  const entryPhotos = service.media?.filter(m => m.type === 'ENTRY') ?? [];
  const exitPhotos = service.media?.filter(m => m.type === 'EXIT') ?? [];

  type Step = { label: string; done: boolean; href?: string; forStatus: ServiceStatus };

  const allSteps: Step[] = [
    { label: 'Preencher checklist de busca', done: !!(service.checklists?.find(c => c.type === 'PICKUP')), href: `/admin/services/${id}/checklist`, forStatus: 'AGUARDANDO_COLETA' },
    { label: 'Adicionar foto de entrada', done: entryPhotos.length > 0, href: `/admin/services/${id}/media`, forStatus: 'RECEBIDO_NA_ESTETICA' },
    { label: 'Adicionar foto de saida', done: exitPhotos.length > 0, href: `/admin/services/${id}/media`, forStatus: 'EM_LAVAGEM_SERVICO' },
    { label: 'Preencher checklist de entrega', done: !!(service.checklists?.find(c => c.type === 'DELIVERY')), href: `/admin/services/${id}/checklist`, forStatus: 'EM_TRANSITO_PARA_ENTREGA' },
    { label: 'Compartilhar link com cliente', done: !!service.linkSharedAt, forStatus: 'PRONTO_PARA_DEVOLUCAO' },
    { label: 'Cliente confirmou o recebimento', done: !!service.receiptConfirmedAt, forStatus: 'ENTREGUE_CONCLUIDO' },
  ];

  const currentSteps = allSteps.filter(s => s.forStatus === service.status);
  const allCurrentStepsDone = currentSteps.every(s => s.done);

  return (
    <div className="p-8">
      <Link
        href="/admin/services"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{service.customerName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {service.vehicleModel} • <span className="font-mono">{service.vehiclePlate}</span> • {service.vehicleColor}
          </p>
        </div>
        <StatusBadge status={service.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Status do serviço</h2>
          <StatusTimeline currentStatus={service.status} />

          {/* Checklist de progresso completo */}
          {service.status !== 'ENTREGUE_CONCLUIDO' && (
            <div className="mt-5 border border-gray-100 rounded-lg overflow-hidden">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2 bg-gray-50">
                Checklist do atendimento
              </p>
              <ul className="divide-y divide-gray-50">
                {allSteps.map((step, i) => {
                  const isCurrent = step.forStatus === service.status;
                  const isPast = STATUS_ORDER.indexOf(step.forStatus) < currentIdx;
                  const isFuture = STATUS_ORDER.indexOf(step.forStatus) > currentIdx;

                  return (
                    <li key={i} className={`flex items-center gap-2.5 px-3 py-2.5 text-sm ${isFuture ? 'opacity-40' : ''}`}>
                      {step.done
                        ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        : isFuture
                          ? <Circle size={16} className="text-gray-200 shrink-0" />
                          : <Circle size={16} className="text-amber-400 shrink-0" />
                      }
                      {step.href && isCurrent && !step.done ? (
                        <Link href={step.href} className="text-blue-600 hover:underline">
                          {step.label}
                        </Link>
                      ) : (
                        <span className={step.done ? 'text-gray-400 line-through' : isFuture ? 'text-gray-400' : 'text-gray-700'}>
                          {step.label}
                        </span>
                      )}
                      {isPast && !step.done && (
                        <span className="ml-auto text-xs text-red-400">não feito</span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {currentSteps.length > 0 && !allCurrentStepsDone && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-2 border-t border-amber-100">
                  <AlertCircle size={13} />
                  Conclua os itens pendentes antes de avançar
                </div>
              )}
            </div>
          )}

          <div className="mt-5 space-y-3">
            {nextStatus && nextStatus !== 'ENTREGUE_CONCLUIDO' && (
              <button
                onClick={() => handleStatusChange(nextStatus)}
                disabled={changingStatus || !allCurrentStepsDone}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {changingStatus ? 'Atualizando...' : `Avançar: ${STATUS_LABELS[nextStatus]}`}
                <ChevronRight size={16} />
              </button>
            )}

            {service.status === 'EM_TRANSITO_PARA_ENTREGA' && (
              <button
                onClick={() => handleStatusChange('ENTREGUE_CONCLUIDO')}
                disabled={changingStatus}
                className="w-full rounded-lg bg-gray-800 py-2.5 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {changingStatus ? 'Concluindo...' : 'Concluir entrega'}
              </button>
            )}

            {service.status === 'PRONTO_PARA_DEVOLUCAO' && !service.linkSharedAt && (
              <button
                onClick={handleShare}
                disabled={sharing}
                className="w-full rounded-lg border border-blue-600 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                {sharing ? 'Compartilhando...' : 'Compartilhar link com cliente'}
              </button>
            )}

            {service.linkSharedAt && (
              <div className="space-y-2">
                <p className="text-xs text-center text-gray-400">
                  Link compartilhado em{' '}
                  {new Date(service.linkSharedAt).toLocaleString('pt-BR')}
                </p>
                <button
                  onClick={async () => {
                    const link = sharedLink ?? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/service/${id}`;
                    await navigator.clipboard.writeText(link);
                    toast.success('Link copiado!');
                  }}
                  className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy size={14} />
                  Copiar link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info cards */}
        <div className="lg:col-span-2 space-y-4">
          {service.customerId && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-2 text-sm text-blue-700">
              <UserCheck size={16} />
              Solicitado pelo cliente
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Informações</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Telefone</dt>
                <dd className="font-medium">{service.customerPhone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Data de entrada</dt>
                <dd className="font-medium">{new Date(service.createdAt).toLocaleString('pt-BR')}</dd>
              </div>
              {service.driverName && (
                <div>
                  <dt className="text-gray-500">Motorista/Chofer</dt>
                  <dd className="font-medium">{service.driverName}</dd>
                </div>
              )}
              {service.pickupAddress && (
                <div>
                  <dt className="text-gray-500">Endereço de Coleta</dt>
                  <dd className="font-medium">{service.pickupAddress}</dd>
                </div>
              )}
              {service.deliveryAddress && (
                <div>
                  <dt className="text-gray-500">Endereço de Devolução</dt>
                  <dd className="font-medium">{service.deliveryAddress}</dd>
                </div>
              )}
              {service.deliveredAt && (
                <div>
                  <dt className="text-gray-500">Data de entrega</dt>
                  <dd className="font-medium">{new Date(service.deliveredAt).toLocaleString('pt-BR')}</dd>
                </div>
              )}
              {service.receiptConfirmedAt && (
                <div>
                  <dt className="text-gray-500">Recibo confirmado</dt>
                  <dd className="font-medium text-green-600">{new Date(service.receiptConfirmedAt).toLocaleString('pt-BR')}</dd>
                </div>
              )}
              {service.preferredDate && (
                <div>
                  <dt className="text-gray-500 flex items-center gap-1"><Calendar size={14} /> Data preferida</dt>
                  <dd className="font-medium">{new Date(service.preferredDate).toLocaleString('pt-BR')}</dd>
                </div>
              )}
            </dl>
            {service.description && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <FileText size={14} /> Descricao do servico
                </p>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href={`/admin/services/${id}/checklist`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:border-blue-300 transition-colors group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                <ClipboardList size={20} />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">Checklist</p>
                <p className="text-xs text-gray-500">
                  {service.status === 'ENTREGUE_CONCLUIDO' ? 'Bloqueado' : 'Editar'}
                </p>
              </div>
            </Link>

            <Link
              href={`/admin/services/${id}/media`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:border-blue-300 transition-colors group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100">
                <Image size={20} />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">Fotos</p>
                <p className="text-xs text-gray-500">{service.media?.length ?? 0} arquivo(s)</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
