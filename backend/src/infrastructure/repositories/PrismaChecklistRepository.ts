import { prisma } from '../database/prisma';

export class PrismaChecklistRepository {
  async findByServiceId(serviceId: string) {
    return prisma.checklist.findUnique({ where: { serviceId } });
  }

  async upsert(
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
    return prisma.checklist.upsert({
      where: { serviceId },
      create: { serviceId, ...data },
      update: data,
    });
  }
}
