export type ServiceStatus =
  | 'AGUARDANDO_COLETA'
  | 'EM_TRANSITO_PARA_ESTETICA'
  | 'RECEBIDO_NA_ESTETICA'
  | 'EM_LAVAGEM_SERVICO'
  | 'PRONTO_PARA_DEVOLUCAO'
  | 'EM_TRANSITO_PARA_ENTREGA'
  | 'ENTREGUE_CONCLUIDO';

export const STATUS_ORDER: ServiceStatus[] = [
  'AGUARDANDO_COLETA',
  'EM_TRANSITO_PARA_ESTETICA',
  'RECEBIDO_NA_ESTETICA',
  'EM_LAVAGEM_SERVICO',
  'PRONTO_PARA_DEVOLUCAO',
  'EM_TRANSITO_PARA_ENTREGA',
  'ENTREGUE_CONCLUIDO',
];

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  AGUARDANDO_COLETA: 'Aguardando Coleta',
  EM_TRANSITO_PARA_ESTETICA: 'Em Trânsito para Estética',
  RECEBIDO_NA_ESTETICA: 'Recebido na Estética',
  EM_LAVAGEM_SERVICO: 'Em Lavagem/Serviço',
  PRONTO_PARA_DEVOLUCAO: 'Pronto para Devolução',
  EM_TRANSITO_PARA_ENTREGA: 'Em Trânsito para Entrega',
  ENTREGUE_CONCLUIDO: 'Entregue/Concluído',
};

export interface Service {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  status: ServiceStatus;
  description: string | null;
  preferredDate: Date | null;
  pickupAddress: string | null;
  deliveryAddress: string | null;
  driverName: string | null;
  linkSharedAt: Date | null;
  deliveredAt: Date | null;
  receiptConfirmedAt: Date | null;
  createdBy: string | null;
  customerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function isValidTransition(from: ServiceStatus, to: ServiceStatus): boolean {
  const fromIdx = STATUS_ORDER.indexOf(from);
  const toIdx = STATUS_ORDER.indexOf(to);
  return toIdx === fromIdx + 1;
}

export function isLinkExpired(service: Service): boolean {
  if (service.status !== 'ENTREGUE_CONCLUIDO' || !service.deliveredAt) return false;
  const fortyEightHours = 48 * 60 * 60 * 1000;
  return Date.now() - service.deliveredAt.getTime() > fortyEightHours;
}
