'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerApi } from '@/lib/customerApi';
import toast from 'react-hot-toast';

export default function NewServiceRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    vehicleModel: '',
    vehiclePlate: '',
    vehicleColor: '',
    description: '',
    preferredDate: '',
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body: Record<string, string> = {
        vehicleModel: form.vehicleModel,
        vehiclePlate: form.vehiclePlate,
        vehicleColor: form.vehicleColor,
        description: form.description,
      };
      if (form.preferredDate) body.preferredDate = form.preferredDate;

      await customerApi.post('/customer/services', body);
      toast.success('Solicitacao enviada com sucesso!');
      router.replace('/client/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar solicitacao');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Solicitar Servico</h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-gray-700 mb-2">Dados do Veiculo</legend>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
            <input
              type="text"
              required
              minLength={2}
              value={form.vehicleModel}
              onChange={(e) => update('vehicleModel', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ex: Honda Civic 2023"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
              <input
                type="text"
                required
                minLength={5}
                value={form.vehiclePlate}
                onChange={(e) => update('vehiclePlate', e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="ABC1D23"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <input
                type="text"
                required
                minLength={2}
                value={form.vehicleColor}
                onChange={(e) => update('vehicleColor', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Prata"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-gray-700 mb-2">Detalhes do Servico</legend>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descricao do servico desejado
            </label>
            <textarea
              required
              minLength={5}
              rows={4}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Descreva o que precisa ser feito no veiculo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data/horario preferido (opcional)
            </label>
            <input
              type="datetime-local"
              value={form.preferredDate}
              onChange={(e) => update('preferredDate', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Enviando...' : 'Enviar solicitacao'}
        </button>
      </form>
    </div>
  );
}
