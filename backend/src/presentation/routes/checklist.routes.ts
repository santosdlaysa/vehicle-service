import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/authMiddleware';
import { upsertChecklistUseCase } from '../../application/use-cases/checklist/UpsertChecklistUseCase';
import { PrismaChecklistRepository } from '../../infrastructure/repositories/PrismaChecklistRepository';
import { PrismaServiceRepository } from '../../infrastructure/repositories/PrismaServiceRepository';
import { NotFoundError } from '../../domain/errors/DomainError';

const checklistRepo = new PrismaChecklistRepository();
const serviceRepo = new PrismaServiceRepository();

export async function checklistRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  // Buscar todos os checklists de um serviço
  app.get('/services/:id/checklists', async (request, reply) => {
    const { id } = request.params as { id: string };
    const service = await serviceRepo.findById(id);
    if (!service) throw new NotFoundError('Atendimento');
    const checklists = await checklistRepo.findByServiceId(id);
    const pickup = checklists.find(c => c.type === 'PICKUP') ?? null;
    const delivery = checklists.find(c => c.type === 'DELIVERY') ?? null;
    return reply.send({
      success: true,
      pickup,
      delivery,
      serviceClosed: service.status === 'ENTREGUE_CONCLUIDO',
    });
  });

  // Buscar checklist específico por tipo
  app.get('/services/:id/checklists/:type', async (request, reply) => {
    const { id, type } = request.params as { id: string; type: string };
    const checklistType = type.toUpperCase() as 'PICKUP' | 'DELIVERY';
    if (!['PICKUP', 'DELIVERY'].includes(checklistType)) {
      return reply.status(400).send({ success: false, message: 'Tipo inválido. Use PICKUP ou DELIVERY.' });
    }
    const checklist = await checklistRepo.findByServiceIdAndType(id, checklistType);
    const service = await serviceRepo.findById(id);
    return reply.send({
      success: true,
      checklist,
      serviceClosed: service?.status === 'ENTREGUE_CONCLUIDO',
    });
  });

  // Criar/atualizar checklist por tipo
  app.put(
    '/services/:id/checklists/:type',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            scratches: { type: 'boolean' },
            dents: { type: 'boolean' },
            mirrorsOk: { type: 'boolean' },
            lightsOk: { type: 'boolean' },
            tiresOk: { type: 'boolean' },
            glassOk: { type: 'boolean' },
            internalObjects: { type: 'string' },
            fuelLevel: { type: 'string', enum: ['E', '1/4', '1/2', '3/4', 'F'] },
            odometer: { type: 'number' },
            odometerPhotoUrl: { type: 'string' },
            notes: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { id, type } = request.params as { id: string; type: string };
      const checklistType = type.toUpperCase() as 'PICKUP' | 'DELIVERY';
      if (!['PICKUP', 'DELIVERY'].includes(checklistType)) {
        return reply.status(400).send({ success: false, message: 'Tipo inválido. Use PICKUP ou DELIVERY.' });
      }
      const body = request.body as Parameters<typeof upsertChecklistUseCase>[2];
      const checklist = await upsertChecklistUseCase(id, checklistType, body);
      return reply.send({ success: true, checklist });
    },
  );
}
