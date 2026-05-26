'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleColor: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ service: { id: string } }>('/services', form);
      toast.success('Atendimento criado com sucesso!');
      router.push(`/admin/services/${res.service.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar atendimento');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-xl">
      <Link
        href="/admin/services"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Atendimento</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 mb-3">Dados do Cliente</legend>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nome completo *</label>
              <input
                name="customerName"
                required
                value={form.customerName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="João da Silva"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Telefone *</label>
              <input
                name="customerPhone"
                required
                value={form.customerPhone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 mb-3">Dados do Veículo</legend>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Modelo *</label>
              <input
                name="vehicleModel"
                required
                value={form.vehicleModel}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Volkswagen Gol 2020"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Placa *</label>
                <input
                  name="vehiclePlate"
                  required
                  value={form.vehiclePlate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none font-mono uppercase"
                  placeholder="ABC-1234"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cor *</label>
                <input
                  name="vehicleColor"
                  required
                  value={form.vehicleColor}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Branco"
                />
              </div>
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Criando...' : 'Criar atendimento'}
        </button>
      </form>
    </div>
  );
}
