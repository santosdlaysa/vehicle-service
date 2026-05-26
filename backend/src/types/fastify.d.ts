import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId?: string; customerId?: string; role: 'admin' | 'customer' };
    user: { userId?: string; customerId?: string; role: 'admin' | 'customer' };
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    customerId?: string;
  }
}
