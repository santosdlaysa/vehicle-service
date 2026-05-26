export type ServiceStatus =
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'READY'
  | 'DELIVERED'
  | 'CLOSED';

export const STATUS_ORDER: ServiceStatus[] = [
  'RECEIVED',
  'IN_PROGRESS',
  'FINISHED',
  'READY',
  'DELIVERED',
  'CLOSED',
];

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  RECEIVED: 'Recebido',
  IN_PROGRESS: 'Em serviço',
  FINISHED: 'Finalizado',
  READY: 'Pronto para entrega',
  DELIVERED: 'Entregue',
  CLOSED: 'Encerrado',
};

export interface Service {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  status: ServiceStatus;
  linkSharedAt: Date | null;
  deliveredAt: Date | null;
  receiptConfirmedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export function isValidTransition(from: ServiceStatus, to: ServiceStatus): boolean {
  const fromIdx = STATUS_ORDER.indexOf(from);
  const toIdx = STATUS_ORDER.indexOf(to);
  return toIdx === fromIdx + 1;
}

export function isLinkExpired(service: Service): boolean {
  if (service.status !== 'DELIVERED' || !service.deliveredAt) return false;
  const fortyEightHours = 48 * 60 * 60 * 1000;
  return Date.now() - service.deliveredAt.getTime() > fortyEightHours;
}
