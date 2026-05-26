import { prisma } from '../../../infrastructure/database/prisma';
import { NotFoundError } from '../../../domain/errors/DomainError';
import { isLinkExpired } from '../../../domain/entities/Service';

export async function getPublicServiceUseCase(uuid: string) {
  const service = await prisma.service.findUnique({
    where: { id: uuid },
    include: {
      checklist: true,
      media: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!service) throw new NotFoundError('Atendimento');

  const expired = isLinkExpired({
    ...service,
    status: service.status as import('../../../domain/entities/Service').ServiceStatus,
  });

  return {
    service: {
      id: service.id,
      customerName: service.customerName,
      vehicleModel: service.vehicleModel,
      vehiclePlate: service.vehiclePlate,
      vehicleColor: service.vehicleColor,
      status: service.status,
      isExpired: expired,
      linkSharedAt: service.linkSharedAt,
      deliveredAt: service.deliveredAt,
      receiptConfirmedAt: service.receiptConfirmedAt,
      createdAt: service.createdAt,
    },
    checklist: service.checklist?.isLocked ? service.checklist : null,
    media: {
      entry: service.media.filter((m) => m.type === 'ENTRY').map((m) => ({ id: m.id, url: m.url, createdAt: m.createdAt })),
      exit: service.media.filter((m) => m.type === 'EXIT').map((m) => ({ id: m.id, url: m.url, createdAt: m.createdAt })),
    },
  };
}
