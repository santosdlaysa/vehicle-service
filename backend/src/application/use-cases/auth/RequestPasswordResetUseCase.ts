import crypto from 'crypto';
import { PrismaCustomerRepository } from '../../../infrastructure/repositories/PrismaCustomerRepository';
import { NotFoundError } from '../../../domain/errors/DomainError';

const customerRepo = new PrismaCustomerRepository();

export async function requestPasswordResetUseCase(email: string) {
  const customer = await customerRepo.findByEmail(email);
  if (!customer) throw new NotFoundError('Cliente');

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await customerRepo.setResetToken(email, token, expiresAt);

  return { token, customerName: customer.name };
}
