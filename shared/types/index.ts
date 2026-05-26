export type ServiceStatus =
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'READY'
  | 'DELIVERED';

export const STATUS_ORDER: ServiceStatus[] = [
  'RECEIVED',
  'IN_PROGRESS',
  'FINISHED',
  'READY',
  'DELIVERED',
];

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  RECEIVED: 'Recebido',
  IN_PROGRESS: 'Em serviço',
  FINISHED: 'Finalizado',
  READY: 'Pronto para entrega',
  DELIVERED: 'Entregue',
};
