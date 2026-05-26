import { PrismaServiceRepository } from '../../../infrastructure/repositories/PrismaServiceRepository';
import { ServiceStatus } from '../../../domain/entities/Service';

const serviceRepo = new PrismaServiceRepository();

export async function getCustomerServicesUseCase(
  customerId: string,
  filters?: { status?: ServiceStatus },
  page = 1,
  limit = 20,
) {
  return serviceRepo.findAll({ ...filters, customerId }, page, limit);
}
