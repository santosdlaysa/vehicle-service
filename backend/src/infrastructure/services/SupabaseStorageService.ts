import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { enabled: false } as never },
);

const BUCKET = process.env.SUPABASE_BUCKET ?? 'service-media';

export class SupabaseStorageService {
  async upload(
    buffer: Buffer,
    mimeType: string,
    serviceId: string,
    type: string,
  ): Promise<string> {
    const compressed = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const fileName = `${serviceId}/${type}/${uuid()}.jpg`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, compressed, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) throw new Error(`Falha no upload: ${error.message}`);

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async uploadRaw(
    buffer: Buffer,
    mimeType: string,
    serviceId: string,
    type: string,
  ): Promise<string> {
    // Para imagens, comprimir. Para outros tipos (PDF), manter original.
    let finalBuffer = buffer;
    let contentType = mimeType;
    let ext = mimeType.split('/')[1] || 'bin';

    if (mimeType.startsWith('image/')) {
      finalBuffer = await sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      contentType = 'image/jpeg';
      ext = 'jpg';
    } else if (mimeType === 'application/pdf') {
      ext = 'pdf';
    }

    const fileName = `${serviceId}/${type}/${uuid()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, finalBuffer, {
        contentType,
        upsert: false,
      });

    if (error) throw new Error(`Falha no upload: ${error.message}`);

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async delete(filePath: string): Promise<void> {
    const path = filePath.split(`${BUCKET}/`)[1];
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }
  }
}
