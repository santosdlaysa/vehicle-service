import { PrismaCustomerRepository } from '../../../infrastructure/repositories/PrismaCustomerRepository';
import { UnauthorizedError } from '../../../domain/errors/DomainError';

const customerRepo = new PrismaCustomerRepository();

export async function customerLoginUseCase(email: string, password: string) {
  const customer = await customerRepo.findByEmail(email);
  if (!customer) throw new UnauthorizedError('Credenciais inválidas');

  const valid = await customerRepo.verifyPassword(password, customer.passwordHash);
  if (!valid) throw new UnauthorizedError('Credenciais inválidas');

  return { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone };
}
