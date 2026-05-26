import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@empresa.com',
      passwordHash,
    },
  });

  console.log('Seed executado com sucesso!');
  console.log('Usuário criado:', { email: admin.email, senha: 'admin123' });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
