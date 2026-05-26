'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Checklist } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

const FUEL_OPTIONS = ['E', '1/4', '1/2', '3/4', 'F'];

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const [checklist, setChecklist] = useState<Partial<Checklist>>({
    scratches: false,
    dents: false,
    mirrorsOk: true,
    lightsOk: true,
    tiresOk: true,
    glassOk: true,
    internalObjects: '',
    fuelLevel: '1/2',
    notes: '',
  });
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ checklist: Checklist }>(`/services/${id}/checklist`)
      .then((res) => {
        setChecklist(res.checklist);
        setIsLocked(res.checklist.isLocked);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function handleToggle(field: string) {
    setChecklist((prev) => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put<{ checklist: Checklist }>(`/services/${id}/checklist`, checklist);
      setChecklist(res.checklist);
      setIsLocked(res.checklist.isLocked);
      toast.success('Checklist salvo com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar checklist');
    } finally {
      setSaving(false);
    }
  }

  const checkItems = [
    { field: 'scratches', label: 'Arranhões', inverted: false },
    { field: 'dents', label: 'Amassados', inverted: false },
    { field: 'mirrorsOk', label: 'Retrovisores OK', inverted: true },
    { field: 'lightsOk', label: 'Faróis OK', inverted: true },
    { field: 'tiresOk', label: 'Pneus OK', inverted: true },
    { field: 'glassOk', label: 'Vidros OK', inverted: true },
  ];

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando...</div>;

  return (
    <div className="p-8 max-w-xl">
      <Link href={`/admin/services/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} />
        Voltar ao atendimento
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Checklist de Entrada</h1>
        {isLocked && (
          <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
            <Lock size={12} />
            Bloqueado
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
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
            {saving ? 'Salvando...' : 'Salvar checklist'}
          </button>
        )}
      </form>
    </div>
  );
}
