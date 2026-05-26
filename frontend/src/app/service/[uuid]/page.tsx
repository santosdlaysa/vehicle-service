import { getPublicService } from '@/lib/publicApi';
import { PublicServiceData } from '@/types';
import { ClientServiceView } from './ClientServiceView';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: { uuid: string };
}

export default async function ServicePage({ params }: Props) {
  let data: PublicServiceData;

  try {
    const res = await getPublicService(params.uuid);
    data = res as PublicServiceData;
  } catch {
    notFound();
  }

  return <ClientServiceView initialData={data} uuid={params.uuid} />;
}
