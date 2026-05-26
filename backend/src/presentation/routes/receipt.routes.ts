import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/authMiddleware';
import { prisma } from '../../infrastructure/database/prisma';
import { SupabaseStorageService } from '../../infrastructure/services/SupabaseStorageService';
import { NotFoundError, BusinessRuleError } from '../../domain/errors/DomainError';

const storageService = new SupabaseStorageService();

export async function receiptRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  // Upload comprovante
  app.post('/services/:id/receipts', async (request, reply) => {
    const { id } = request.params as { id: string };

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundError('Atendimento');

    const file = await request.file();
    if (!file) throw new BusinessRuleError('Nenhum arquivo enviado.');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BusinessRuleError('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou PDF.');
    }

    const buffer = await file.toBuffer();
    if (buffer.length > 10 * 1024 * 1024) {
      throw new BusinessRuleError('Arquivo muito grande. Máximo permitido: 10 MB.');
    }

    const url = await storageService.uploadRaw(buffer, file.mimetype, id, 'receipts');
    const receipt = await prisma.paymentReceipt.create({
      data: {
        serviceId: id,
        url,
        fileName: file.filename || 'comprovante',
        uploadedBy: request.userId,
      },
    });

    return reply.status(201).send({ success: true, receipt });
  });

  // Listar comprovantes
  app.get('/services/:id/receipts', async (request, reply) => {
    const { id } = request.params as { id: string };
    const receipts = await prisma.paymentReceipt.findMany({
      where: { serviceId: id },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send({ success: true, receipts });
  });

  // Deletar comprovante
  app.delete('/services/:id/receipts/:receiptId', async (request, reply) => {
    const { receiptId } = request.params as { id: string; receiptId: string };
    const receipt = await prisma.paymentReceipt.findUnique({ where: { id: receiptId } });
    if (!receipt) throw new NotFoundError('Comprovante');

    await storageService.delete(receipt.url);
    await prisma.paymentReceipt.delete({ where: { id: receiptId } });

    return reply.send({ success: true, message: 'Comprovante removido.' });
  });
}
