import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import PortfolioClient from './PortfolioClient';

const CALLBACK_URL = encodeURIComponent('/portfolio');

const PortfolioPage = async () => {
  const session = await auth();

  if (!session) {
    redirect(`/login?callbackUrl=${CALLBACK_URL}`);
  }

  return <PortfolioClient />;
};

export default PortfolioPage;