'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Checklist, ChecklistType, ChecklistPhoto } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Lock, Truck, Package, Camera, X, Loader2, ImagePlus } from 'lucide-react';

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
  notes: '',
  photos: [],
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
  const [uploading, setUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.upload<{ photo: ChecklistPhoto }>(
          `/services/${id}/checklists/${activeTab}/photos`,
          formData,
        );
        setChecklist((prev) => ({
          ...prev,
          photos: [...(prev.photos || []), res.photo],
        }));
      }
      toast.success('Foto(s) enviada(s) com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar foto');
    } finally {
      setUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  }

  async function handleDeletePhoto(photoId: string) {
    try {
      await api.delete(`/services/${id}/checklists/${activeTab}/photos/${photoId}`);
      setChecklist((prev) => ({
        ...prev,
        photos: (prev.photos || []).filter((p) => p.id !== photoId),
      }));
      toast.success('Foto removida.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover foto');
    }
  }

  const checkItems = [
    { field: 'scratches', question: 'A lataria apresenta arranhões?', invertConforme: true },
    { field: 'dents', question: 'A lataria apresenta amassados?', invertConforme: true },
    { field: 'mirrorsOk', question: 'Os retrovisores estão em bom estado?', invertConforme: false },
    { field: 'lightsOk', question: 'Os faróis e lanternas funcionam corretamente?', invertConforme: false },
    { field: 'tiresOk', question: 'Os pneus estão em boas condições?', invertConforme: false },
    { field: 'glassOk', question: 'Os vidros e para-brisa estão íntegros?', invertConforme: false },
  ];

  const photos = checklist.photos || [];

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
          : 'Preencha na devolucao para o cliente conferir o estado do veiculo.'}
      </p>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Fotos do veiculo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fotos do veiculo
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Registre o estado do veiculo: painel (quilometragem e combustivel), lataria, pneus, interior etc.
          </p>

          {/* Grid de fotos */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={photo.url}
                    alt={photo.label || 'Foto do checklist'}
                    className="w-full h-full object-cover"
                  />
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  )}
                  {photo.label && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1.5 py-0.5 truncate">
                      {photo.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Botoes de captura - camera e galeria */}
          {!isLocked && (
            <div className="flex gap-2">
              {/* Input para camera (abre camera traseira no celular) */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => uploadFiles(e.target.files)}
                className="hidden"
              />
              {/* Input para galeria (permite selecionar multiplas fotos) */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => uploadFiles(e.target.files)}
                className="hidden"
              />

              <button
                type="button"
                disabled={uploading}
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors justify-center disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Camera size={16} />
                    Tirar foto
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={uploading}
                onClick={() => galleryInputRef.current?.click()}
                className="flex-1 flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors justify-center disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <ImagePlus size={16} />
                    Galeria
                  </>
                )}
              </button>
            </div>
          )}

          {photos.length === 0 && isLocked && (
            <p className="text-sm text-gray-400">Nenhuma foto registrada.</p>
          )}
        </div>

        {/* Odometro */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Quilometragem (Odometro) {activeTab === 'PICKUP' && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            disabled={isLocked}
            value={checklist.odometer ?? ''}
            onChange={(e) => setChecklist((prev) => ({ ...prev, odometer: e.target.value ? Number(e.target.value) : null }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
            placeholder="Ex: 45230"
          />
          <p className="text-xs text-gray-400 mt-1">Tire uma foto do painel mostrando a quilometragem.</p>
        </div>

        {/* Estado do veiculo */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Estado do veículo</p>
          <div className="space-y-4">
            {checkItems.map(({ field, question, invertConforme }) => {
              const rawValue = checklist[field as keyof typeof checklist] as boolean;
              const isConforme = invertConforme ? !rawValue : rawValue;
              return (
                <div key={field} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-700 mb-2">{question}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => setChecklist((prev) => ({ ...prev, [field]: invertConforme ? false : true }))}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                        isConforme
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Conforme
                    </button>
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => setChecklist((prev) => ({ ...prev, [field]: invertConforme ? true : false }))}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                        !isConforme
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Não Conforme
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nivel de combustivel */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nivel de combustivel</label>
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

        {/* Objetos internos */}
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

        {/* Observacoes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Observacoes</label>
          <textarea
            rows={3}
            disabled={isLocked}
            value={checklist.notes ?? ''}
            onChange={(e) => setChecklist((prev) => ({ ...prev, notes: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50 resize-none"
            placeholder="Observacoes gerais sobre o veiculo..."
          />
        </div>

        {!isLocked && (
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar checklist'}
          </button>
        )}
      </form>
    </div>
  );
}
