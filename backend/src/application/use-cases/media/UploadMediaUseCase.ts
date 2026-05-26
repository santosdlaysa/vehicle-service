import { PrismaMediaRepository } from '../../../infrastructure/repositories/PrismaMediaRepository';
import { PrismaServiceRepository } from '../../../infrastructure/repositories/PrismaServiceRepository';
import { SupabaseStorageService } from '../../../infrastructure/services/SupabaseStorageService';
import { NotFoundError } from '../../../domain/errors/DomainError';

const mediaRepo = new PrismaMediaRepository();
const serviceRepo = new PrismaServiceRepository();
const storageService = new SupabaseStorageService();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadMediaUseCase(
  serviceId: string,
  uploadedBy: string,
  type: 'ENTRY' | 'EXIT',
  buffer: Buffer,
  mimeType: string,
) {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.');
  }
  if (buffer.length > MAX_SIZE_BYTES) {
    throw new Error('Arquivo muito grande. Máximo permitido: 10 MB.');
  }

  const service = await serviceRepo.findById(serviceId);
  if (!service) throw new NotFoundError('Atendimento');

  const url = await storageService.upload(buffer, mimeType, serviceId, type);
  return mediaRepo.create({ serviceId, url, type, uploadedBy });
}
