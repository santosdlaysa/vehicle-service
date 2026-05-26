import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/authMiddleware';
import { upsertChecklistUseCase } from '../../application/use-cases/checklist/UpsertChecklistUseCase';
import { PrismaChecklistRepository } from '../../infrastructure/repositories/PrismaChecklistRepository';
import { PrismaServiceRepository } from '../../infrastructure/repositories/PrismaServiceRepository';
import { SupabaseStorageService } from '../../infrastructure/services/SupabaseStorageService';
import { NotFoundError, BusinessRuleError } from '../../domain/errors/DomainError';

const checklistRepo = new PrismaChecklistRepository();
const serviceRepo = new PrismaServiceRepository();
const storageService = new SupabaseStorageService();

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
          additionalProperties: false,
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

  // Upload de foto no checklist
  app.post('/services/:id/checklists/:type/photos', async (request, reply) => {
    const { id, type } = request.params as { id: string; type: string };
    const checklistType = type.toUpperCase() as 'PICKUP' | 'DELIVERY';
    if (!['PICKUP', 'DELIVERY'].includes(checklistType)) {
      return reply.status(400).send({ success: false, message: 'Tipo inválido. Use PICKUP ou DELIVERY.' });
    }

    const service = await serviceRepo.findById(id);
    if (!service) throw new NotFoundError('Atendimento');
    if (service.status === 'ENTREGUE_CONCLUIDO') {
      throw new BusinessRuleError('Não é possível adicionar fotos após o atendimento ter sido concluído.');
    }

    // Garante que o checklist existe (cria vazio se necessário)
    let checklist = await checklistRepo.findByServiceIdAndType(id, checklistType);
    if (!checklist) {
      checklist = await checklistRepo.upsert(id, checklistType, {});
    }

    const file = await request.file();
    if (!file) throw new BusinessRuleError('Nenhum arquivo enviado.');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BusinessRuleError('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.');
    }

    const buffer = await file.toBuffer();
    if (buffer.length > 10 * 1024 * 1024) {
      throw new BusinessRuleError('Arquivo muito grande. Máximo permitido: 10 MB.');
    }

    const label = (request.query as Record<string, string>).label || undefined;
    const url = await storageService.upload(buffer, file.mimetype, id, `checklist-${checklistType}`);
    const photo = await checklistRepo.addPhoto(checklist.id, url, label);

    return reply.status(201).send({ success: true, photo });
  });

  // Deletar foto do checklist
  app.delete('/services/:id/checklists/:type/photos/:photoId', async (request, reply) => {
    const { id, photoId } = request.params as { id: string; type: string; photoId: string };

    const service = await serviceRepo.findById(id);
    if (!service) throw new NotFoundError('Atendimento');
    if (service.status === 'ENTREGUE_CONCLUIDO') {
      throw new BusinessRuleError('Não é possível remover fotos após o atendimento ter sido concluído.');
    }

    const photo = await checklistRepo.findPhotoById(photoId);
    if (!photo) throw new NotFoundError('Foto');

    await storageService.delete(photo.url);
    await checklistRepo.deletePhoto(photoId);

    return reply.send({ success: true, message: 'Foto removida com sucesso.' });
  });
}
