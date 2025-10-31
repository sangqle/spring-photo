'use client';

import React from 'react';
import PortfolioGallery from '../../../components/portfolio/PortfolioGallery';
import PortfolioHeader from '../../../components/portfolio/PortfolioHeader';
import usePhotos from '../../../hooks/usePhotos';

const PortfolioPage = () => {
  const {
    photos,
    loading,
    error,
    loadMore,
    hasMore,
    loadingMore,
  } = usePhotos({ pageSize: 20 });

  return (
    <div className="space-y-8 px-8 sm:px-12 lg:px-20">
      <PortfolioHeader />

      {loading ? (
        <div className="rounded-2xl border border-gray-800 bg-card p-10 text-center text-gray-300">
          Loading your photos...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-10 text-center text-red-400">
          {error}
        </div>
      ) : (
        <PortfolioGallery
          photos={photos}
          onLoadMore={loadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
        />
      )}
    </div>
  );
};

export default PortfolioPage;