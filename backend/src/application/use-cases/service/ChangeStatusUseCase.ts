import { PrismaServiceRepository } from '../../../infrastructure/repositories/PrismaServiceRepository';
import {
  NotFoundError,
  BusinessRuleError,
} from '../../../domain/errors/DomainError';
import {
  ServiceStatus,
  isValidTransition,
} from '../../../domain/entities/Service';

const serviceRepo = new PrismaServiceRepository();

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

  if (newStatus === 'IN_PROGRESS') {
    const entryCount = await serviceRepo.countMedia(serviceId, 'ENTRY');
    if (entryCount === 0) {
      throw new BusinessRuleError(
        'É necessário ao menos 1 foto de entrada para iniciar o serviço.',
      );
    }
  }

  if (newStatus === 'READY') {
    const exitCount = await serviceRepo.countMedia(serviceId, 'EXIT');
    if (exitCount === 0) {
      throw new BusinessRuleError(
        'É necessário ao menos 1 foto de saída para marcar como pronto para entrega.',
      );
    }
  }

  const extra = newStatus === 'DELIVERED' ? { deliveredAt: new Date() } : undefined;
  await serviceRepo.updateStatus(serviceId, newStatus, changedBy, extra);

  return serviceRepo.findById(serviceId);
}
