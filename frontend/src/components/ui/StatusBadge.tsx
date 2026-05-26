import { ServiceStatus, STATUS_LABELS } from '@/types';
import clsx from 'clsx';

const STATUS_COLORS: Record<ServiceStatus, string> = {
  RECEIVED: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  FINISHED: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
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
