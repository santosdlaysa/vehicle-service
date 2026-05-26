import { prisma } from '../database/prisma';

export class PrismaMediaRepository {
  async create(data: {
    serviceId: string;
    url: string;
    type: 'ENTRY' | 'EXIT';
    uploadedBy: string;
  }) {
    return prisma.serviceMedia.create({ data });
  }

  async findByServiceId(serviceId: string) {
    return prisma.serviceMedia.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.serviceMedia.findUnique({ where: { id } });
  }

  async delete(id: string) {
    return prisma.serviceMedia.delete({ where: { id } });
  }
}
