import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository';
import { UnauthorizedError } from '../../../domain/errors/DomainError';

const userRepo = new PrismaUserRepository();

export async function loginUseCase(email: string, password: string) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new UnauthorizedError('Credenciais inválidas');

  const valid = await userRepo.verifyPassword(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Credenciais inválidas');

  return { id: user.id, name: user.name, email: user.email };
}
