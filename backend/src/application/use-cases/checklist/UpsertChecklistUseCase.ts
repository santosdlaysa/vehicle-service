import { PrismaChecklistRepository } from '../../../infrastructure/repositories/PrismaChecklistRepository';
import { PrismaServiceRepository } from '../../../infrastructure/repositories/PrismaServiceRepository';
import { NotFoundError, BusinessRuleError } from '../../../domain/errors/DomainError';

const checklistRepo = new PrismaChecklistRepository();
const serviceRepo = new PrismaServiceRepository();

type ChecklistType = 'PICKUP' | 'DELIVERY';

export async function upsertChecklistUseCase(
  serviceId: string,
  type: ChecklistType,
  data: {
    scratches?: boolean;
    dents?: boolean;
    mirrorsOk?: boolean;
    lightsOk?: boolean;
    tiresOk?: boolean;
    glassOk?: boolean;
    internalObjects?: string;
    fuelLevel?: string;
    odometer?: number;
    odometerPhotoUrl?: string;
    notes?: string;
  },
) {
  const service = await serviceRepo.findById(serviceId);
  if (!service) throw new NotFoundError('Atendimento');

  if (service.status === 'ENTREGUE_CONCLUIDO') {
    throw new BusinessRuleError(
      'O checklist não pode ser editado após o atendimento ter sido concluído.',
    );
  }

  // Checklist de PICKUP só pode ser editado antes de RECEBIDO_NA_ESTETICA
  if (type === 'PICKUP') {
    const pickupStatuses = ['AGUARDANDO_COLETA', 'EM_TRANSITO_PARA_ESTETICA'];
    if (!pickupStatuses.includes(service.status)) {
      const existing = await checklistRepo.findByServiceIdAndType(serviceId, 'PICKUP');
      if (existing?.isLocked) {
        throw new BusinessRuleError(
          'O checklist de busca não pode ser editado após o veículo ter sido recebido na estética.',
        );
      }
    }
  }

  // Checklist de DELIVERY só pode ser criado a partir de PRONTO_PARA_DEVOLUCAO
  if (type === 'DELIVERY') {
    const deliveryStatuses = ['PRONTO_PARA_DEVOLUCAO', 'EM_TRANSITO_PARA_ENTREGA'];
    if (!deliveryStatuses.includes(service.status)) {
      throw new BusinessRuleError(
        'O checklist de entrega só pode ser preenchido quando o veículo estiver pronto para devolução ou em trânsito para entrega.',
      );
    }
  }

  // RN-005: Odômetro obrigatório no checklist de busca (PICKUP)
  if (type === 'PICKUP' && data.odometer === undefined) {
    const existing = await checklistRepo.findByServiceIdAndType(serviceId, 'PICKUP');
    if (!existing) {
      throw new BusinessRuleError(
        'A quilometragem (odômetro) é obrigatória no checklist de busca.',
      );
    }
  }

  return checklistRepo.upsert(serviceId, type, data);
}
