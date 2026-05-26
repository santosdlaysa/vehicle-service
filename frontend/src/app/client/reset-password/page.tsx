'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { customerApi } from '@/lib/customerApi';
import { Car, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl text-center space-y-4">
          <p className="text-gray-700 font-medium">Link invalido ou expirado.</p>
          <Link href="/client/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas nao conferem');
      return;
    }

    setLoading(true);
    try {
      await customerApi.post('/customer/auth/reset-password', { token, password });
      setSuccess(true);
      toast.success('Senha redefinida com sucesso!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao redefinir senha');
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
          <p className="text-sm text-gray-400 mt-1">Nova Senha</p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Senha redefinida!</h2>
            <p className="text-sm text-gray-500">
              Sua senha foi alterada com sucesso. Voce ja pode fazer login.
            </p>
            <button
              onClick={() => router.replace('/client/login')}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Ir para o login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-8 shadow-xl">
            <p className="text-sm text-gray-500">
              Crie uma nova senha para sua conta.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Minimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Repita a senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
