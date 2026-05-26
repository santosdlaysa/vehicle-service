'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Checklist, ChecklistType } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Lock, Truck, Package } from 'lucide-react';

const FUEL_OPTIONS = ['E', '1/4', '1/2', '3/4', 'F'];

const DEFAULT_CHECKLIST: Partial<Checklist> = {
  scratches: false,
  dents: false,
  mirrorsOk: true,
  lightsOk: true,
  tiresOk: true,
  glassOk: true,
  internalObjects: '',
  fuelLevel: '1/2',
  odometer: null,
  odometerPhotoUrl: '',
  notes: '',
};

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<ChecklistType>('PICKUP');
  const [pickup, setPickup] = useState<Partial<Checklist>>(DEFAULT_CHECKLIST);
  const [delivery, setDelivery] = useState<Partial<Checklist>>(DEFAULT_CHECKLIST);
  const [pickupLocked, setPickupLocked] = useState(false);
  const [deliveryLocked, setDeliveryLocked] = useState(false);
  const [serviceClosed, setServiceClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ pickup: Checklist | null; delivery: Checklist | null; serviceClosed?: boolean }>(`/services/${id}/checklists`)
      .then((res) => {
        if (res.pickup) {
          setPickup(res.pickup);
          setPickupLocked(res.pickup.isLocked);
        }
        if (res.delivery) {
          setDelivery(res.delivery);
          setDeliveryLocked(res.delivery.isLocked);
        }
        setServiceClosed(!!res.serviceClosed);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const checklist = activeTab === 'PICKUP' ? pickup : delivery;
  const setChecklist = activeTab === 'PICKUP' ? setPickup : setDelivery;
  const isLocked = serviceClosed || (activeTab === 'PICKUP' ? pickupLocked : deliveryLocked);

  function handleToggle(field: string) {
    setChecklist((prev) => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put<{ checklist: Checklist }>(`/services/${id}/checklists/${activeTab}`, checklist);
      setChecklist(res.checklist as any);
      if (activeTab === 'PICKUP') setPickupLocked(res.checklist.isLocked);
      else setDeliveryLocked(res.checklist.isLocked);
      toast.success('Checklist salvo com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar checklist');
    } finally {
      setSaving(false);
    }
  }

  const checkItems = [
    { field: 'scratches', label: 'Arranhões' },
    { field: 'dents', label: 'Amassados' },
    { field: 'mirrorsOk', label: 'Retrovisores OK' },
    { field: 'lightsOk', label: 'Faróis OK' },
    { field: 'tiresOk', label: 'Pneus OK' },
    { field: 'glassOk', label: 'Vidros OK' },
  ];

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando...</div>;

  return (
    <div className="p-8 max-w-xl">
      <Link href={`/admin/services/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} />
        Voltar ao atendimento
      </Link>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('PICKUP')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'PICKUP'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Truck size={16} />
          Checklist de Busca
        </button>
        <button
          onClick={() => setActiveTab('DELIVERY')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'DELIVERY'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Package size={16} />
          Checklist de Entrega
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {activeTab === 'PICKUP' ? 'Check-in de Busca' : 'Check-out de Entrega'}
        </h1>
        {isLocked && (
          <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
            <Lock size={12} />
            Bloqueado
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {activeTab === 'PICKUP'
          ? 'Preencha na casa/trabalho do cliente antes de ligar o carro.'
          : 'Preencha na devolução para o cliente conferir o estado do veículo.'}
      </p>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Odômetro - obrigatório no PICKUP */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Quilometragem (Odômetro) {activeTab === 'PICKUP' && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            disabled={isLocked}
            value={checklist.odometer ?? ''}
            onChange={(e) => setChecklist((prev) => ({ ...prev, odometer: e.target.value ? Number(e.target.value) : null }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
            placeholder="Ex: 45230"
          />
          {activeTab === 'PICKUP' && (
            <p className="text-xs text-gray-400 mt-1">Tire uma foto do painel mostrando a quilometragem e o nível de combustível.</p>
          )}
        </div>

        {/* Foto do painel/odômetro */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            URL da foto do painel {activeTab === 'PICKUP' && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            disabled={isLocked}
            value={checklist.odometerPhotoUrl ?? ''}
            onChange={(e) => setChecklist((prev) => ({ ...prev, odometerPhotoUrl: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
            placeholder="URL da foto do painel..."
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Estado do veículo</p>
          <div className="space-y-3">
            {checkItems.map(({ field, label }) => (
              <label key={field} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">{label}</span>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleToggle(field)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    checklist[field as keyof typeof checklist]
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      checklist[field as keyof typeof checklist] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nível de combustível</label>
          <div className="flex gap-2">
            {FUEL_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={isLocked}
                onClick={() => setChecklist((prev) => ({ ...prev, fuelLevel: opt }))}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  checklist.fuelLevel === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Objetos internos</label>
          <input
            type="text"
            disabled={isLocked}
            value={checklist.internalObjects ?? ''}
            onChange={(e) => setChecklist((prev) => ({ ...prev, internalObjects: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
            placeholder="Ex: bolsa azul, guarda-chuva..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Observações</label>
          <textarea
            rows={3}
            disabled={isLocked}
            value={checklist.notes ?? ''}
            onChange={(e) => setChecklist((prev) => ({ ...prev, notes: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50 resize-none"
            placeholder="Observações gerais sobre o veículo..."
          />
        </div>

        {!isLocked && (
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Salvando...' : `Salvar ${activeTab === 'PICKUP' ? 'checklist de busca' : 'checklist de entrega'}`}
          </button>
        )}
      </form>
    </div>
  );
}
