import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadMediaUseCase } from '../../application/use-cases/media/UploadMediaUseCase';
import { PrismaMediaRepository } from '../../infrastructure/repositories/PrismaMediaRepository';
import { SupabaseStorageService } from '../../infrastructure/services/SupabaseStorageService';
import { NotFoundError, BusinessRuleError } from '../../domain/errors/DomainError';

const mediaRepo = new PrismaMediaRepository();
const storageService = new SupabaseStorageService();

export async function mediaRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.post('/services/:id/media', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await request.file();

    if (!data) throw new BusinessRuleError('Nenhum arquivo enviado.');

    const type = (request.query as Record<string, string>).type as 'ENTRY' | 'EXIT';
    if (!['ENTRY', 'EXIT'].includes(type)) {
      throw new BusinessRuleError('Parâmetro "type" deve ser ENTRY ou EXIT.');
    }

    const buffer = await data.toBuffer();
    const media = await uploadMediaUseCase(id, request.userId, type, buffer, data.mimetype);
    return reply.status(201).send({ success: true, media });
  });

  app.get('/services/:id/media', async (request, reply) => {
    const { id } = request.params as { id: string };
    const media = await mediaRepo.findByServiceId(id);
    return reply.send({ success: true, media });
  });

  app.delete('/services/:id/media/:mediaId', async (request, reply) => {
    const { mediaId } = request.params as { id: string; mediaId: string };
    const media = await mediaRepo.findById(mediaId);
    if (!media) throw new NotFoundError('Mídia');

    await storageService.delete(media.url);
    await mediaRepo.delete(mediaId);
    return reply.send({ success: true, message: 'Mídia removida com sucesso.' });
  });
}
