import { FastifyInstance } from 'fastify';
import { customerLoginUseCase } from '../../application/use-cases/auth/CustomerLoginUseCase';
import { customerRegisterUseCase } from '../../application/use-cases/auth/CustomerRegisterUseCase';
import { requestPasswordResetUseCase } from '../../application/use-cases/auth/RequestPasswordResetUseCase';
import { resetPasswordUseCase } from '../../application/use-cases/auth/ResetPasswordUseCase';
import { PrismaCustomerRepository } from '../../infrastructure/repositories/PrismaCustomerRepository';
import { customerAuthMiddleware } from '../middleware/customerAuthMiddleware';

const customerRepo = new PrismaCustomerRepository();

export async function customerAuthRoutes(app: FastifyInstance) {
  app.post(
    '/customer/auth/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'email', 'phone', 'password'],
          properties: {
            name: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', minLength: 8 },
            password: { type: 'string', minLength: 6 },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as { name: string; email: string; phone: string; password: string };
      const customer = await customerRegisterUseCase(body);
      const token = app.jwt.sign({ customerId: customer.id, role: 'customer' });
      return reply.status(201).send({ success: true, token, customer });
    },
  );

  app.post(
    '/customer/auth/login',
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
      const customer = await customerLoginUseCase(email, password);
      const token = app.jwt.sign({ customerId: customer.id, role: 'customer' });
      return reply.send({ success: true, token, customer });
    },
  );

  // Solicitar redefinição de senha
  app.post(
    '/customer/auth/forgot-password',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body as { email: string };
      try {
        const { token } = await requestPasswordResetUseCase(email);
        const resetLink = `${process.env.FRONTEND_URL}/client/reset-password?token=${token}`;
        // Log do link para o administrador poder enviar manualmente
        console.log(`[RESET PASSWORD] Link para ${email}: ${resetLink}`);
        return reply.send({
          success: true,
          message: 'Se o e-mail estiver cadastrado, um link de redefinição será enviado.',
          // Em desenvolvimento, retorna o link. Em produção, remover este campo.
          ...(process.env.NODE_ENV !== 'production' && { resetLink }),
        });
      } catch {
        // Não revelar se o email existe ou não
        return reply.send({
          success: true,
          message: 'Se o e-mail estiver cadastrado, um link de redefinição será enviado.',
        });
      }
    },
  );

  // Redefinir senha com token
  app.post(
    '/customer/auth/reset-password',
    {
      schema: {
        body: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: { type: 'string', minLength: 1 },
            password: { type: 'string', minLength: 6 },
          },
        },
      },
    },
    async (request, reply) => {
      const { token, password } = request.body as { token: string; password: string };
      await resetPasswordUseCase(token, password);
      return reply.send({ success: true, message: 'Senha redefinida com sucesso.' });
    },
  );

  app.get(
    '/customer/auth/me',
    { preHandler: customerAuthMiddleware },
    async (request, reply) => {
      const customer = await customerRepo.findById(request.customerId!);
      if (!customer) return reply.status(404).send({ success: false, error: 'Cliente não encontrado' });
      return reply.send({
        success: true,
        customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone },
      });
    },
  );
}
