import { ServiceStatus, STATUS_LABELS } from '@/types';
import clsx from 'clsx';

const STATUS_COLORS: Record<ServiceStatus, string> = {
  AGUARDANDO_COLETA: 'bg-orange-100 text-orange-800',
  EM_TRANSITO_PARA_ESTETICA: 'bg-yellow-100 text-yellow-800',
  RECEBIDO_NA_ESTETICA: 'bg-blue-100 text-blue-800',
  EM_LAVAGEM_SERVICO: 'bg-indigo-100 text-indigo-800',
  PRONTO_PARA_DEVOLUCAO: 'bg-green-100 text-green-800',
  EM_TRANSITO_PARA_ENTREGA: 'bg-purple-100 text-purple-800',
  ENTREGUE_CONCLUIDO: 'bg-emerald-100 text-emerald-800',
};

export function StatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        STATUS_COLORS[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
