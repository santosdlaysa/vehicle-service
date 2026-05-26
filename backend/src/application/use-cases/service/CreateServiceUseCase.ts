import { PrismaServiceRepository } from '../../../infrastructure/repositories/PrismaServiceRepository';

const serviceRepo = new PrismaServiceRepository();

export async function createServiceUseCase(data: {
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  driverName?: string;
  createdBy: string;
}) {
  return serviceRepo.create(data);
}
