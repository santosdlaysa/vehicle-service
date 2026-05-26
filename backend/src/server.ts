import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';

import { authRoutes } from './presentation/routes/auth.routes';
import { serviceRoutes } from './presentation/routes/service.routes';
import { checklistRoutes } from './presentation/routes/checklist.routes';
import { mediaRoutes } from './presentation/routes/media.routes';
import { publicRoutes } from './presentation/routes/public.routes';
import { customerAuthRoutes } from './presentation/routes/customer-auth.routes';
import { customerServiceRoutes } from './presentation/routes/customer-service.routes';
import { errorHandler } from './presentation/middleware/errorHandler';

const app = Fastify({ logger: true });

async function bootstrap() {
  await app.register(helmet, { global: true });

  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET!,
    sign: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
  });

  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  });

  await app.register(rateLimit, {
    global: false,
  });

  // Public routes — rate limited
  await app.register(publicRoutes, {
    prefix: '/api',
  });

  // Admin routes — JWT protected (handled per route)
  await app.register(authRoutes, { prefix: '/api' });
  await app.register(serviceRoutes, { prefix: '/api' });
  await app.register(checklistRoutes, { prefix: '/api' });
  await app.register(mediaRoutes, { prefix: '/api' });

  // Customer routes — JWT protected (customer role)
  await app.register(customerAuthRoutes, { prefix: '/api' });
  await app.register(customerServiceRoutes, { prefix: '/api' });

  app.setErrorHandler(errorHandler);

  app.get('/health', async () => ({ status: 'ok' }));

  const port = Number(process.env.PORT) || 3001;
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
