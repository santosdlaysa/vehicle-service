'use client';

import { useState } from 'react';
import { customerApi } from '@/lib/customerApi';
import { Car, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await customerApi.post('/customer/auth/forgot-password', { email });
      setSent(true);
      toast.success('Verifique seu e-mail!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao solicitar redefinicao');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <Car size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AutoTrack</h1>
          <p className="text-sm text-gray-400 mt-1">Redefinir Senha</p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Mail size={24} className="text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">E-mail enviado!</h2>
            <p className="text-sm text-gray-500">
              Se o e-mail <strong>{email}</strong> estiver cadastrado, voce recebera um link para redefinir sua senha.
            </p>
            <Link
              href="/client/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
            >
              <ArrowLeft size={14} />
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-8 shadow-xl">
            <p className="text-sm text-gray-500">
              Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar link de redefinicao'}
            </button>

            <p className="text-center">
              <Link href="/client/login" className="text-sm font-medium text-blue-600 hover:underline">
                Voltar para o login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
