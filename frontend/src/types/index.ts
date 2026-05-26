export type ServiceStatus =
  | 'AGUARDANDO_COLETA'
  | 'EM_TRANSITO_PARA_ESTETICA'
  | 'RECEBIDO_NA_ESTETICA'
  | 'EM_LAVAGEM_SERVICO'
  | 'PRONTO_PARA_DEVOLUCAO'
  | 'EM_TRANSITO_PARA_ENTREGA'
  | 'ENTREGUE_CONCLUIDO';

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  AGUARDANDO_COLETA: 'Aguardando Coleta',
  EM_TRANSITO_PARA_ESTETICA: 'Em Trânsito para Estética',
  RECEBIDO_NA_ESTETICA: 'Recebido na Estética',
  EM_LAVAGEM_SERVICO: 'Em Lavagem/Serviço',
  PRONTO_PARA_DEVOLUCAO: 'Pronto para Devolução',
  EM_TRANSITO_PARA_ENTREGA: 'Em Trânsito para Entrega',
  ENTREGUE_CONCLUIDO: 'Entregue/Concluído',
};

export const STATUS_ORDER: ServiceStatus[] = [
  'AGUARDANDO_COLETA',
  'EM_TRANSITO_PARA_ESTETICA',
  'RECEBIDO_NA_ESTETICA',
  'EM_LAVAGEM_SERVICO',
  'PRONTO_PARA_DEVOLUCAO',
  'EM_TRANSITO_PARA_ENTREGA',
  'ENTREGUE_CONCLUIDO',
];

export type ChecklistType = 'PICKUP' | 'DELIVERY';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Service {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  status: ServiceStatus;
  description: string | null;
  preferredDate: string | null;
  pickupAddress: string | null;
  deliveryAddress: string | null;
  driverName: string | null;
  linkSharedAt: string | null;
  deliveredAt: string | null;
  receiptConfirmedAt: string | null;
  createdBy: string | null;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; name: string } | null;
  customer?: { id: string; name: string; email: string; phone: string } | null;
  checklists?: Checklist[];
  media?: ServiceMedia[];
  statusHistory?: StatusHistory[];
}

export interface ChecklistPhoto {
  id: string;
  checklistId: string;
  url: string;
  label: string | null;
  createdAt: string;
}

export interface Checklist {
  id: string;
  serviceId: string;
  type: ChecklistType;
  scratches: boolean;
  dents: boolean;
  mirrorsOk: boolean;
  lightsOk: boolean;
  tiresOk: boolean;
  glassOk: boolean;
  internalObjects: string | null;
  fuelLevel: string;
  odometer: number | null;
  notes: string | null;
  isLocked: boolean;
  photos: ChecklistPhoto[];
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
  changedBy: string | null;
  changedAt: string;
  changedByUser?: { id: string; name: string };
}

export interface PaymentReceipt {
  id: string;
  serviceId: string;
  url: string;
  fileName: string;
  uploadedBy: string;
  createdAt: string;
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
  checklists: {
    pickup: Checklist | null;
    delivery: Checklist | null;
  };
  media: {
    entry: { id: string; url: string; createdAt: string }[];
    exit: { id: string; url: string; createdAt: string }[];
  };
}
