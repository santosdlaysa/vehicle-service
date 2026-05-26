import { FastifyInstance } from 'fastify';
import { getPublicServiceUseCase } from '../../application/use-cases/service/GetPublicServiceUseCase';
import { confirmReceiptUseCase } from '../../application/use-cases/receipt/ConfirmReceiptUseCase';
import { BusinessRuleError } from '../../domain/errors/DomainError';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function publicRoutes(app: FastifyInstance) {
  app.get('/public/service/:uuid', async (request, reply) => {
    const { uuid } = request.params as { uuid: string };
    if (!UUID_REGEX.test(uuid)) {
      return reply.status(404).send({ success: false, error: 'Atendimento não encontrado.' });
    }
    const data = await getPublicServiceUseCase(uuid);
    return reply.send({ success: true, ...data });
  });

  app.post('/public/service/:uuid/confirm', async (request, reply) => {
    const { uuid } = request.params as { uuid: string };
    if (!UUID_REGEX.test(uuid)) {
      return reply.status(404).send({ success: false, error: 'Atendimento não encontrado.' });
    }
    if (!uuid) throw new BusinessRuleError('UUID inválido.');
    await confirmReceiptUseCase(uuid);
    return reply.send({ success: true, message: 'Recebimento confirmado com sucesso.' });
  });
}
