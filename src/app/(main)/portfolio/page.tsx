import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const PortfolioPage = async () => {
  const session = await auth();
  const rawUsername = session?.user?.name ?? session?.user?.email;

  if (!rawUsername) {
    redirect('/login?callbackUrl=%2F');
  }

  const username = encodeURIComponent(rawUsername.toString());
  redirect(`/${username}`);
};

export default PortfolioPage;