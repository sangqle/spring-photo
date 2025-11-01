import { redirect } from 'next/navigation';

interface PageProps {
  params: {
    userId: string;
  };
}

const LegacyPortfolioRoute = ({ params }: PageProps) => {
  const target = params.userId ? `/${params.userId}` : '/';
  redirect(target);
};

export default LegacyPortfolioRoute;