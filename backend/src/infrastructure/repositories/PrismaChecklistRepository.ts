import { prisma } from '../database/prisma';

type ChecklistType = 'PICKUP' | 'DELIVERY';

export class PrismaChecklistRepository {
  async findByServiceId(serviceId: string) {
    return prisma.checklist.findMany({
      where: { serviceId },
      orderBy: { type: 'asc' },
    });
  }

  async findByServiceIdAndType(serviceId: string, type: ChecklistType) {
    return prisma.checklist.findUnique({
      where: { serviceId_type: { serviceId, type } },
    });
  }

  async upsert(
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
    return prisma.checklist.upsert({
      where: { serviceId_type: { serviceId, type } },
      create: { serviceId, type, ...data },
      update: data,
    });
  }
}
