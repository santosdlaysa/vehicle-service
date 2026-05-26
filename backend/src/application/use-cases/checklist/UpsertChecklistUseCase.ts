import { PrismaChecklistRepository } from '../../../infrastructure/repositories/PrismaChecklistRepository';
import { PrismaServiceRepository } from '../../../infrastructure/repositories/PrismaServiceRepository';
import { NotFoundError, BusinessRuleError } from '../../../domain/errors/DomainError';

const checklistRepo = new PrismaChecklistRepository();
const serviceRepo = new PrismaServiceRepository();

export async function upsertChecklistUseCase(
  serviceId: string,
  data: {
    scratches?: boolean;
    dents?: boolean;
    mirrorsOk?: boolean;
    lightsOk?: boolean;
    tiresOk?: boolean;
    glassOk?: boolean;
    internalObjects?: string;
    fuelLevel?: string;
    notes?: string;
  },
) {
  const service = await serviceRepo.findById(serviceId);
  if (!service) throw new NotFoundError('Atendimento');

  const existing = await checklistRepo.findByServiceId(serviceId);
  if (existing?.isLocked) {
    throw new BusinessRuleError(
      'O checklist não pode ser editado após o link ter sido compartilhado com o cliente.',
    );
  }

  return checklistRepo.upsert(serviceId, data);
}
