export class DomainError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string) {
    super(`${resource} não encontrado(a)`, 404);
    this.name = 'NotFoundError';
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message, 422);
    this.name = 'BusinessRuleError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Não autorizado') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class GoneError extends DomainError {
  constructor(message: string) {
    super(message, 410);
    this.name = 'GoneError';
  }
}
