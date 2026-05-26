import { FastifyInstance } from 'fastify';
import { loginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { authMiddleware } from '../middleware/authMiddleware';

const userRepo = new PrismaUserRepository();

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/auth/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as { email: string; password: string };
      const user = await loginUseCase(email, password);
      const token = app.jwt.sign({ userId: user.id });
      return reply.send({ success: true, token, user });
    },
  );

  app.get(
    '/auth/me',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const user = await userRepo.findById(request.userId);
      if (!user) return reply.status(404).send({ success: false, error: 'Usuário não encontrado' });
      return reply.send({
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
      });
    },
  );
}
