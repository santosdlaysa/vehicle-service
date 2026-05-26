import { prisma } from '../database/prisma';

type ChecklistType = 'PICKUP' | 'DELIVERY';

const includePhotos = { photos: { orderBy: { createdAt: 'asc' as const } } };

export class PrismaChecklistRepository {
  async findByServiceId(serviceId: string) {
    return prisma.checklist.findMany({
      where: { serviceId },
      orderBy: { type: 'asc' },
      include: includePhotos,
    });
  }

  async findByServiceIdAndType(serviceId: string, type: ChecklistType) {
    return prisma.checklist.findUnique({
      where: { serviceId_type: { serviceId, type } },
      include: includePhotos,
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
      notes?: string;
    },
  ) {
    return prisma.checklist.upsert({
      where: { serviceId_type: { serviceId, type } },
      create: { serviceId, type, ...data },
      update: data,
      include: includePhotos,
    });
  }

  async addPhoto(checklistId: string, url: string, label?: string) {
    return prisma.checklistPhoto.create({
      data: { checklistId, url, label },
    });
  }

  async deletePhoto(photoId: string) {
    return prisma.checklistPhoto.delete({
      where: { id: photoId },
    });
  }

  async findPhotoById(photoId: string) {
    return prisma.checklistPhoto.findUnique({
      where: { id: photoId },
    });
  }
}
