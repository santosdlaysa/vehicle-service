import { prisma } from '../database/prisma';
import { ServiceStatus } from '../../domain/entities/Service';

export class PrismaServiceRepository {
  async findAll(
    filters?: { status?: ServiceStatus; search?: string; customerId?: string },
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.search) {
      where.OR = [
        { customerName: { contains: filters.search, mode: 'insensitive' } },
        { vehiclePlate: { contains: filters.search, mode: 'insensitive' } },
        { customerPhone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await prisma.$transaction([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true, email: true, phone: true } },
          _count: { select: { media: true } },
        },
      }),
      prisma.service.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.service.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        checklists: { orderBy: { type: 'asc' } },
        media: { orderBy: { createdAt: 'asc' } },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
          include: { changedByUser: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async create(data: {
    customerName: string;
    customerPhone: string;
    vehicleModel: string;
    vehiclePlate: string;
    vehicleColor: string;
    pickupAddress?: string;
    deliveryAddress?: string;
    driverName?: string;
    createdBy: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const service = await tx.service.create({ data });
      await tx.statusHistory.create({
        data: {
          serviceId: service.id,
          oldStatus: null,
          newStatus: 'AGUARDANDO_COLETA',
          changedBy: data.createdBy,
        },
      });
      return service;
    });
  }

  async createClientRequest(data: {
    customerName: string;
    customerPhone: string;
    vehicleModel: string;
    vehiclePlate: string;
    vehicleColor: string;
    customerId: string;
    description?: string;
    preferredDate?: Date;
    pickupAddress?: string;
    deliveryAddress?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: {
          ...data,
          status: 'AGUARDANDO_COLETA',
        },
      });
      await tx.statusHistory.create({
        data: {
          serviceId: service.id,
          oldStatus: null,
          newStatus: 'AGUARDANDO_COLETA',
        },
      });
      return service;
    });
  }

  async update(
    id: string,
    data: Partial<{
      customerName: string;
      customerPhone: string;
      vehicleModel: string;
      vehiclePlate: string;
      vehicleColor: string;
      pickupAddress: string;
      deliveryAddress: string;
      driverName: string;
    }>,
  ) {
    return prisma.service.update({ where: { id }, data });
  }

  async updateStatus(
    id: string,
    newStatus: ServiceStatus,
    changedBy: string,
    extra?: { deliveredAt?: Date; linkSharedAt?: Date },
  ) {
    const service = await prisma.service.findUniqueOrThrow({ where: { id } });

    return prisma.$transaction([
      prisma.service.update({
        where: { id },
        data: { status: newStatus, ...extra },
      }),
      prisma.statusHistory.create({
        data: {
          serviceId: id,
          oldStatus: service.status,
          newStatus,
          changedBy,
        },
      }),
    ]);
  }

  async shareLink(id: string) {
    return prisma.$transaction([
      prisma.service.update({
        where: { id },
        data: { linkSharedAt: new Date() },
      }),
      prisma.checklist.updateMany({
        where: { serviceId: id },
        data: { isLocked: true },
      }),
    ]);
  }

  async confirmReceipt(id: string) {
    return prisma.service.update({
      where: { id },
      data: { receiptConfirmedAt: new Date() },
    });
  }

  async countMedia(serviceId: string, type: 'ENTRY' | 'EXIT') {
    return prisma.serviceMedia.count({ where: { serviceId, type } });
  }
}
