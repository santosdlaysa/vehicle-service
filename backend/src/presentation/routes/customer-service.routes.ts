import { FastifyInstance } from 'fastify';
import { customerAuthMiddleware } from '../middleware/customerAuthMiddleware';
import { createClientServiceRequestUseCase } from '../../application/use-cases/service/CreateClientServiceRequestUseCase';
import { getCustomerServicesUseCase } from '../../application/use-cases/service/GetCustomerServicesUseCase';
import { PrismaServiceRepository } from '../../infrastructure/repositories/PrismaServiceRepository';
import { NotFoundError } from '../../domain/errors/DomainError';
import { ServiceStatus } from '../../domain/entities/Service';

const serviceRepo = new PrismaServiceRepository();

export async function customerServiceRoutes(app: FastifyInstance) {
  app.addHook('preHandler', customerAuthMiddleware);

  app.post(
    '/customer/services',
    {
      schema: {
        body: {
          type: 'object',
          required: ['vehicleModel', 'vehiclePlate', 'vehicleColor', 'description'],
          properties: {
            vehicleModel: { type: 'string', minLength: 2 },
            vehiclePlate: { type: 'string', minLength: 5 },
            vehicleColor: { type: 'string', minLength: 2 },
            description: { type: 'string', minLength: 5 },
            preferredDate: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        vehicleModel: string;
        vehiclePlate: string;
        vehicleColor: string;
        description: string;
        preferredDate?: string;
      };
      const service = await createClientServiceRequestUseCase({
        ...body,
        customerId: request.customerId!,
      });
      return reply.status(201).send({ success: true, service });
    },
  );

  app.get('/customer/services', async (request, reply) => {
    const { status, page, limit } = request.query as Record<string, string>;
    const result = await getCustomerServicesUseCase(
      request.customerId!,
      { status: status as ServiceStatus },
      Number(page) || 1,
      Number(limit) || 20,
    );
    return reply.send({ success: true, ...result });
  });

  app.get('/customer/services/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const service = await serviceRepo.findById(id);
    if (!service || service.customerId !== request.customerId) {
      throw new NotFoundError('Atendimento');
    }
    return reply.send({ success: true, service });
  });
}
