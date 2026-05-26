const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export async function getPublicService(uuid: string) {
  const res = await fetch(`${API_URL}/public/service/${uuid}`, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Atendimento não encontrado');
  return data;
}

export async function confirmReceipt(uuid: string) {
  const res = await fetch(`${API_URL}/public/service/${uuid}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Erro ao confirmar recebimento');
  return data;
}
