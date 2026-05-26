import { PrismaServiceRepository } from '../../../infrastructure/repositories/PrismaServiceRepository';
import { PrismaChecklistRepository } from '../../../infrastructure/repositories/PrismaChecklistRepository';
import {
  NotFoundError,
  BusinessRuleError,
} from '../../../domain/errors/DomainError';
import {
  ServiceStatus,
  isValidTransition,
} from '../../../domain/entities/Service';

const serviceRepo = new PrismaServiceRepository();
const checklistRepo = new PrismaChecklistRepository();

export async function changeStatusUseCase(
  serviceId: string,
  newStatus: ServiceStatus,
  changedBy: string,
) {
  const service = await serviceRepo.findById(serviceId);
  if (!service) throw new NotFoundError('Atendimento');

  if (!isValidTransition(service.status as ServiceStatus, newStatus)) {
    throw new BusinessRuleError(
      `Transição inválida: ${service.status} → ${newStatus}`,
    );
  }

  // Para avançar para EM_TRANSITO_PARA_ESTETICA, precisa de checklist de busca com odômetro
  if (newStatus === 'EM_TRANSITO_PARA_ESTETICA') {
    const pickupChecklist = await checklistRepo.findByServiceIdAndType(serviceId, 'PICKUP');
    if (!pickupChecklist) {
      throw new BusinessRuleError(
        'É necessário preencher o checklist de busca antes de iniciar o trânsito.',
      );
    }
    if (!pickupChecklist.odometer) {
      throw new BusinessRuleError(
        'A quilometragem (odômetro) é obrigatória no checklist de busca.',
      );
    }
  }

  // Para avançar para RECEBIDO_NA_ESTETICA, precisa de fotos de entrada
  if (newStatus === 'RECEBIDO_NA_ESTETICA') {
    const entryCount = await serviceRepo.countMedia(serviceId, 'ENTRY');
    if (entryCount === 0) {
      throw new BusinessRuleError(
        'É necessário ao menos 1 foto de entrada para receber o veículo na estética.',
      );
    }
  }

  // Para avançar para PRONTO_PARA_DEVOLUCAO, precisa de fotos de saída
  if (newStatus === 'PRONTO_PARA_DEVOLUCAO') {
    const exitCount = await serviceRepo.countMedia(serviceId, 'EXIT');
    if (exitCount === 0) {
      throw new BusinessRuleError(
        'É necessário ao menos 1 foto de saída para marcar como pronto para devolução.',
      );
    }
  }

  // Para avançar para ENTREGUE_CONCLUIDO, precisa de checklist de entrega
  if (newStatus === 'ENTREGUE_CONCLUIDO') {
    const deliveryChecklist = await checklistRepo.findByServiceIdAndType(serviceId, 'DELIVERY');
    if (!deliveryChecklist) {
      throw new BusinessRuleError(
        'É necessário preencher o checklist de entrega antes de concluir o atendimento.',
      );
    }
  }

  const extra = newStatus === 'ENTREGUE_CONCLUIDO' ? { deliveredAt: new Date() } : undefined;
  await serviceRepo.updateStatus(serviceId, newStatus, changedBy, extra);

  // Travar checklist de busca ao receber na estética
  if (newStatus === 'RECEBIDO_NA_ESTETICA') {
    const { prisma } = await import('../../../infrastructure/database/prisma');
    await prisma.checklist.updateMany({
      where: { serviceId, type: 'PICKUP' },
      data: { isLocked: true },
    });
  }

  return serviceRepo.findById(serviceId);
}
