import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/authMiddleware';
import { PrismaServiceRepository } from '../../infrastructure/repositories/PrismaServiceRepository';
import { createServiceUseCase } from '../../application/use-cases/service/CreateServiceUseCase';
import { changeStatusUseCase } from '../../application/use-cases/service/ChangeStatusUseCase';
import { NotFoundError } from '../../domain/errors/DomainError';
import { ServiceStatus, STATUS_ORDER } from '../../domain/entities/Service';

const serviceRepo = new PrismaServiceRepository();

export async function serviceRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/services', async (request, reply) => {
    const { status, search, page, limit } = request.query as Record<string, string>;
    const result = await serviceRepo.findAll(
      { status: status as ServiceStatus, search },
      Number(page) || 1,
      Number(limit) || 20,
    );
    return reply.send({ success: true, ...result });
  });

  app.post(
    '/services',
    {
      schema: {
        body: {
          type: 'object',
          required: ['customerName', 'customerPhone', 'vehicleModel', 'vehiclePlate', 'vehicleColor'],
          properties: {
            customerName: { type: 'string', minLength: 2 },
            customerPhone: { type: 'string', minLength: 8 },
            vehicleModel: { type: 'string', minLength: 2 },
            vehiclePlate: { type: 'string', minLength: 5 },
            vehicleColor: { type: 'string', minLength: 2 },
            pickupAddress: { type: 'string' },
            deliveryAddress: { type: 'string' },
            driverName: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        customerName: string;
        customerPhone: string;
        vehicleModel: string;
        vehiclePlate: string;
        vehicleColor: string;
        pickupAddress?: string;
        deliveryAddress?: string;
        driverName?: string;
      };
      const service = await createServiceUseCase({ ...body, createdBy: request.userId });
      return reply.status(201).send({ success: true, service });
    },
  );

  app.get('/services/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const service = await serviceRepo.findById(id);
    if (!service) throw new NotFoundError('Atendimento');
    return reply.send({ success: true, service });
  });

  app.patch(
    '/services/:id',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            customerName: { type: 'string' },
            customerPhone: { type: 'string' },
            vehicleModel: { type: 'string' },
            vehiclePlate: { type: 'string' },
            vehicleColor: { type: 'string' },
            pickupAddress: { type: 'string' },
            deliveryAddress: { type: 'string' },
            driverName: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, string>;
      const service = await serviceRepo.update(id, body);
      return reply.send({ success: true, service });
    },
  );

  app.patch(
    '/services/:id/status',
    {
      schema: {
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: STATUS_ORDER },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: ServiceStatus };
      const service = await changeStatusUseCase(id, status, request.userId);
      return reply.send({ success: true, service });
    },
  );

  app.post('/services/:id/share', async (request, reply) => {
    const { id } = request.params as { id: string };
    const service = await serviceRepo.findById(id);
    if (!service) throw new NotFoundError('Atendimento');
    await serviceRepo.shareLink(id);
    return reply.send({
      success: true,
      message: 'Link compartilhado e checklists bloqueados.',
      link: `${process.env.FRONTEND_URL}/service/${id}`,
    });
  });

  app.get('/services/:id/history', async (request, reply) => {
    const { id } = request.params as { id: string };
    const service = await serviceRepo.findById(id);
    if (!service) throw new NotFoundError('Atendimento');
    return reply.send({ success: true, history: service.statusHistory });
  });
}
