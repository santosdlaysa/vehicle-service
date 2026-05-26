export type ServiceStatus =
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'READY'
  | 'DELIVERED';

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  RECEIVED: 'Recebido',
  IN_PROGRESS: 'Em serviço',
  FINISHED: 'Finalizado',
  READY: 'Pronto para entrega',
  DELIVERED: 'Entregue',
};

export const STATUS_ORDER: ServiceStatus[] = [
  'RECEIVED',
  'IN_PROGRESS',
  'FINISHED',
  'READY',
  'DELIVERED',
];

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Service {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  status: ServiceStatus;
  linkSharedAt: string | null;
  deliveredAt: string | null;
  receiptConfirmedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; name: string };
  checklist?: Checklist | null;
  media?: ServiceMedia[];
  statusHistory?: StatusHistory[];
}

export interface Checklist {
  id: string;
  serviceId: string;
  scratches: boolean;
  dents: boolean;
  mirrorsOk: boolean;
  lightsOk: boolean;
  tiresOk: boolean;
  glassOk: boolean;
  internalObjects: string | null;
  fuelLevel: string;
  notes: string | null;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceMedia {
  id: string;
  serviceId: string;
  url: string;
  type: 'ENTRY' | 'EXIT';
  uploadedBy: string;
  createdAt: string;
}

export interface StatusHistory {
  id: string;
  serviceId: string;
  oldStatus: ServiceStatus | null;
  newStatus: ServiceStatus;
  changedBy: string;
  changedAt: string;
  changedByUser?: { id: string; name: string };
}

export interface PublicServiceData {
  service: {
    id: string;
    customerName: string;
    vehicleModel: string;
    vehiclePlate: string;
    vehicleColor: string;
    status: ServiceStatus;
    isExpired: boolean;
    linkSharedAt: string | null;
    deliveredAt: string | null;
    receiptConfirmedAt: string | null;
    createdAt: string;
  };
  checklist: Checklist | null;
  media: {
    entry: { id: string; url: string; createdAt: string }[];
    exit: { id: string; url: string; createdAt: string }[];
  };
}
