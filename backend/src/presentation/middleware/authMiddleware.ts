import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    request.userId = request.user.userId;
  } catch {
    reply.status(401).send({ success: false, error: 'Token inválido ou expirado.' });
  }
}
