'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ServiceMedia } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Upload, Trash2, Camera } from 'lucide-react';
import Image from 'next/image';

export default function MediaPage() {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<ServiceMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeType, setActiveType] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchMedia() {
    const res = await api.get<{ media: ServiceMedia[] }>(`/services/${id}/media`);
    setMedia(res.media);
  }

  useEffect(() => { fetchMedia(); }, [id]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      await api.upload(`/services/${id}/media?type=${activeType}`, formData);
      toast.success('Foto enviada com sucesso!');
      fetchMedia();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro no upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(mediaId: string) {
    if (!confirm('Remover esta foto?')) return;
    try {
      await api.delete(`/services/${id}/media/${mediaId}`);
      toast.success('Foto removida.');
      fetchMedia();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover foto');
    }
  }

  const entryMedia = media.filter((m) => m.type === 'ENTRY');
  const exitMedia = media.filter((m) => m.type === 'EXIT');

  return (
    <div className="p-8">
      <Link href={`/admin/services/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} />
        Voltar ao atendimento
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fotos do Atendimento</h1>

      <div className="mb-6 flex gap-3">
        {(['ENTRY', 'EXIT'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeType === type
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {type === 'ENTRY' ? 'Entrada' : 'Saída'}
            <span className="ml-2 text-xs opacity-75">
              ({type === 'ENTRY' ? entryMedia.length : exitMedia.length})
            </span>
          </button>
        ))}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="ml-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <>
              <Upload size={16} className="animate-bounce" />
              Enviando...
            </>
          ) : (
            <>
              <Camera size={16} />
              Adicionar foto ({activeType === 'ENTRY' ? 'entrada' : 'saída'})
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {(activeType === 'ENTRY' ? entryMedia : exitMedia).map((m) => (
          <div key={m.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            <Image src={m.url} alt="Foto do veículo" fill className="object-cover" />
            <button
              onClick={() => handleDelete(m.id)}
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {(activeType === 'ENTRY' ? entryMedia : exitMedia).length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
            <Camera size={40} className="mb-3 opacity-40" />
            <p className="text-sm">Nenhuma foto de {activeType === 'ENTRY' ? 'entrada' : 'saída'} ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
