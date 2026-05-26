import { PrismaServiceRepository } from '../../../infrastructure/repositories/PrismaServiceRepository';
import { PrismaCustomerRepository } from '../../../infrastructure/repositories/PrismaCustomerRepository';
import { NotFoundError } from '../../../domain/errors/DomainError';

const serviceRepo = new PrismaServiceRepository();
const customerRepo = new PrismaCustomerRepository();

export async function createClientServiceRequestUseCase(data: {
  customerId: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  description?: string;
  preferredDate?: string;
}) {
  const customer = await customerRepo.findById(data.customerId);
  if (!customer) throw new NotFoundError('Cliente');

  return serviceRepo.createClientRequest({
    customerName: customer.name,
    customerPhone: customer.phone,
    vehicleModel: data.vehicleModel,
    vehiclePlate: data.vehiclePlate,
    vehicleColor: data.vehicleColor,
    customerId: data.customerId,
    description: data.description,
    preferredDate: data.preferredDate ? new Date(data.preferredDate) : undefined,
  });
}
