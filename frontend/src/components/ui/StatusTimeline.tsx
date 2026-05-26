import { ServiceStatus, STATUS_LABELS, STATUS_ORDER } from '@/types';
import { CheckCircle, Circle, Loader } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  currentStatus: ServiceStatus;
}

export function StatusTimeline({ currentStatus }: Props) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const isTerminal = currentStatus === 'ENTREGUE_CONCLUIDO';

  return (
    <div className="flex flex-col gap-0">
      {STATUS_ORDER.map((status, idx) => {
        const done = idx < currentIdx || (isTerminal && idx === currentIdx);
        const active = idx === currentIdx && !isTerminal;

        return (
          <div key={status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  done && 'bg-green-500 text-white',
                  active && 'bg-blue-600 text-white',
                  !done && !active && 'bg-gray-200 text-gray-400',
                )}
              >
                {done ? (
                  <CheckCircle size={16} />
                ) : active ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Circle size={16} />
                )}
              </div>
              {idx < STATUS_ORDER.length - 1 && (
                <div className={clsx('w-0.5 h-8', done ? 'bg-green-500' : 'bg-gray-200')} />
              )}
            </div>
            <div className="pt-1">
              <p
                className={clsx(
                  'text-sm font-medium',
                  active ? 'text-blue-700' : done ? 'text-green-700' : 'text-gray-400',
                )}
              >
                {STATUS_LABELS[status]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
