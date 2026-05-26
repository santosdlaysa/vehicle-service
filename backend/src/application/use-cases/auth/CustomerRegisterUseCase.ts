import { PrismaCustomerRepository } from '../../../infrastructure/repositories/PrismaCustomerRepository';
import { BusinessRuleError } from '../../../domain/errors/DomainError';

const customerRepo = new PrismaCustomerRepository();

export async function customerRegisterUseCase(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  const existing = await customerRepo.findByEmail(data.email);
  if (existing) throw new BusinessRuleError('E-mail já cadastrado');

  const customer = await customerRepo.create(data);
  return { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone };
}
