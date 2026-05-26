import { prisma } from '../../../infrastructure/database/prisma';
import { NotFoundError, BusinessRuleError, GoneError } from '../../../domain/errors/DomainError';
import { isLinkExpired } from '../../../domain/entities/Service';

export async function confirmReceiptUseCase(uuid: string) {
  const service = await prisma.service.findUnique({ where: { id: uuid } });
  if (!service) throw new NotFoundError('Atendimento');

  if (service.status !== 'ENTREGUE_CONCLUIDO') {
    throw new BusinessRuleError('O veículo ainda não foi entregue.');
  }

  if (isLinkExpired({ ...service, status: service.status as import('../../../domain/entities/Service').ServiceStatus })) {
    throw new GoneError('Este link expirou. Entre em contato com a empresa.');
  }

  if (service.receiptConfirmedAt) {
    throw new BusinessRuleError('O recebimento já foi confirmado anteriormente.');
  }

  return prisma.service.update({
    where: { id: uuid },
    data: { receiptConfirmedAt: new Date() },
  });
}
