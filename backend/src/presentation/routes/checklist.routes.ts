import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/authMiddleware';
import { upsertChecklistUseCase } from '../../application/use-cases/checklist/UpsertChecklistUseCase';
import { PrismaChecklistRepository } from '../../infrastructure/repositories/PrismaChecklistRepository';
import { NotFoundError } from '../../domain/errors/DomainError';

const checklistRepo = new PrismaChecklistRepository();

export async function checklistRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/services/:id/checklist', async (request, reply) => {
    const { id } = request.params as { id: string };
    const checklist = await checklistRepo.findByServiceId(id);
    if (!checklist) throw new NotFoundError('Checklist');
    return reply.send({ success: true, checklist });
  });

  app.put(
    '/services/:id/checklist',
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
            notes: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as Parameters<typeof upsertChecklistUseCase>[1];
      const checklist = await upsertChecklistUseCase(id, body);
      return reply.send({ success: true, checklist });
    },
  );
}
