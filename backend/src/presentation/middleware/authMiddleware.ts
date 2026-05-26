import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    if (request.user.role === 'customer' || !request.user.userId) {
      return reply.status(403).send({ success: false, error: 'Acesso restrito a administradores.' });
    }
    request.userId = request.user.userId;
  } catch {
    reply.status(401).send({ success: false, error: 'Token inválido ou expirado.' });
  }
}
