'use client';

import { useEffect, useState } from 'react';
import { PublicServiceData, STATUS_LABELS } from '@/types';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import { confirmReceipt, getPublicService } from '@/lib/publicApi';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Car, CheckCircle, Clock, Info } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

interface Props {
  initialData: PublicServiceData;
  uuid: string;
}

export function ClientServiceView({ initialData, uuid }: Props) {
  const [data, setData] = useState(initialData);
  const [confirming, setConfirming] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'checklist' | 'photos'>('status');
  const { service, checklists, media } = data;
  const checklist = checklists.pickup ?? checklists.delivery;

  // Poll every 30s for status updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await getPublicService(uuid);
        setData(res as PublicServiceData);
      } catch {}
    }, 30_000);
    return () => clearInterval(interval);
  }, [uuid]);

  async function handleConfirm() {
    setConfirming(true);
    try {
      await confirmReceipt(uuid);
      toast.success('Recebimento confirmado! Obrigado.');
      const res = await getPublicService(uuid);
      setData(res as PublicServiceData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao confirmar recebimento');
    } finally {
      setConfirming(false);
    }
  }

  const tabs = [
    { key: 'status' as const, label: 'Status', disabled: false },
    { key: 'checklist' as const, label: 'Checklist', disabled: !checklist },
    { key: 'photos' as const, label: 'Fotos', disabled: media.entry.length === 0 && media.exit.length === 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-blue-600 px-4 pt-12 pb-6 text-white">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Car size={20} />
            <span className="text-sm font-medium opacity-90">AutoTrack</span>
          </div>
          <h1 className="text-xl font-bold">{service.customerName}</h1>
          <p className="text-sm opacity-80 mt-1">
            {service.vehicleModel} • <span className="font-mono">{service.vehiclePlate}</span>
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
            <span className="text-xs font-medium">{STATUS_LABELS[service.status]}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex">
          {tabs.map(({ key, label, disabled }) => (
            <button
              key={key}
              disabled={disabled}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            {service.isExpired && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  Este link expirou após 48 horas da entrega. O histórico está disponível apenas para consulta.
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Progresso do serviço</h2>
              <StatusTimeline currentStatus={service.status} />
            </div>

            {service.status === 'ENTREGUE_CONCLUIDO' && !service.receiptConfirmedAt && !service.isExpired && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-sm text-gray-600 mb-4">
                  Seu veículo foi entregue! Confirme o recebimento clicando no botão abaixo.
                </p>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle size={18} />
                  {confirming ? 'Confirmando...' : 'Confirmar recebimento do veículo'}
                </button>
              </div>
            )}

            {service.receiptConfirmedAt && (
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-700">Recebimento confirmado</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Em {new Date(service.receiptConfirmedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && checklist && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <Info size={16} />
              <span>Este checklist foi registrado na entrada do veículo e não pode ser alterado.</span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Arranhões', value: checklist.scratches },
                { label: 'Amassados', value: checklist.dents },
                { label: 'Retrovisores OK', value: checklist.mirrorsOk },
                { label: 'Faróis OK', value: checklist.lightsOk },
                { label: 'Pneus OK', value: checklist.tiresOk },
                { label: 'Vidros OK', value: checklist.glassOk },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {value ? 'Sim' : 'Não'}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Nível de combustível</p>
              <p className="text-sm font-medium">{checklist.fuelLevel}</p>
            </div>

            {checklist.internalObjects && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Objetos internos</p>
                <p className="text-sm">{checklist.internalObjects}</p>
              </div>
            )}

            {checklist.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Observações</p>
                <p className="text-sm">{checklist.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            {media.entry.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Fotos de entrada</h2>
                <div className="grid grid-cols-2 gap-3">
                  {media.entry.map((m) => (
                    <div key={m.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <Image src={m.url} alt="Foto de entrada" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {media.exit.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Fotos de saída</h2>
                <div className="grid grid-cols-2 gap-3">
                  {media.exit.map((m) => (
                    <div key={m.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <Image src={m.url} alt="Foto de saída" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
