import { prisma } from '../database/prisma';
import bcrypt from 'bcryptjs';

export class PrismaCustomerRepository {
  async findByEmail(email: string) {
    return prisma.customer.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.customer.findUnique({ where: { id } });
  }

  async create(data: { name: string; email: string; phone: string; password: string }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return prisma.customer.create({
      data: { name: data.name, email: data.email, phone: data.phone, passwordHash },
    });
  }

  async verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}
