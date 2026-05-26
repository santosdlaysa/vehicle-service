import { prisma } from '../database/prisma';
import bcrypt from 'bcryptjs';

export class PrismaUserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: { name: string; email: string; password: string }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash },
    });
  }

  async verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}
