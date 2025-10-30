import React from 'react';
import { useRouter } from 'next/router';
import { usePortfolio } from '@/hooks/usePortfolio';
import PortfolioHeader from '@/components/portfolio/PortfolioHeader';
import PortfolioGallery from '@/components/portfolio/PortfolioGallery';

const UserPortfolioPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { portfolio, isLoading, error } = usePortfolio(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading portfolio</div>;

  return (
    <div>
      <PortfolioHeader userId={userId} />
      <PortfolioGallery photos={portfolio.photos} />
    </div>
  );
};

export default UserPortfolioPage;