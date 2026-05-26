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

  async setResetToken(email: string, token: string, expiresAt: Date) {
    return prisma.customer.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiresAt: expiresAt },
    });
  }

  async findByResetToken(token: string) {
    return prisma.customer.findUnique({ where: { resetToken: token } });
  }

  async resetPassword(token: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    return prisma.customer.update({
      where: { resetToken: token },
      data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
    });
  }
}
