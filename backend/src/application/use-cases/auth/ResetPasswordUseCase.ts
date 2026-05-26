import { PrismaCustomerRepository } from '../../../infrastructure/repositories/PrismaCustomerRepository';
import { NotFoundError, BusinessRuleError } from '../../../domain/errors/DomainError';

const customerRepo = new PrismaCustomerRepository();

export async function resetPasswordUseCase(token: string, newPassword: string) {
  const customer = await customerRepo.findByResetToken(token);
  if (!customer) throw new NotFoundError('Token de redefinição');

  if (customer.resetTokenExpiresAt && customer.resetTokenExpiresAt < new Date()) {
    throw new BusinessRuleError('Este link de redefinição expirou. Solicite um novo.');
  }

  await customerRepo.resetPassword(token, newPassword);
}
