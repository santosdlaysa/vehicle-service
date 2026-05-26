import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { DomainError } from '../../domain/errors/DomainError';

export function errorHandler(
  error: FastifyError | DomainError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof DomainError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.message,
    });
  }

  const statusCode = (error as FastifyError).statusCode ?? 500;

  if (statusCode === 400) {
    return reply.status(400).send({ success: false, error: error.message });
  }

  request.log.error(error);
  return reply.status(500).send({ success: false, error: 'Erro interno do servidor.' });
}
