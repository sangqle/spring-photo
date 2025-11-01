import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import UploadClient from './UploadClient';

const CALLBACK_URL = encodeURIComponent('/upload');

const UploadPage = async () => {
  const session = await auth();

  if (!session) {
    redirect(`/login?callbackUrl=${CALLBACK_URL}`);
  }

  return <UploadClient />;
};

export default UploadPage;