import { FastifyRequest, FastifyReply } from 'fastify';

export async function customerAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    if (request.user.role !== 'customer' || !request.user.customerId) {
      return reply.status(403).send({ success: false, error: 'Acesso restrito a clientes.' });
    }
    request.customerId = request.user.customerId;
  } catch {
    reply.status(401).send({ success: false, error: 'Token inválido ou expirado.' });
  }
}
