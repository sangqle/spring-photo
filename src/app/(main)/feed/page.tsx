'use client';

import React from 'react';
import useFeed from '../../../hooks/useFeed';
import FeedList from '../../../components/feed/FeedList';

const FeedPage: React.FC = () => {
  const { feedItems, loading, error } = useFeed();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-300">
        Loading feed...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-red-400">
        Error loading feed: {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-8 py-12 sm:px-12 lg:px-20">
      <header className="space-y-3 text-center">
        <h1 className="text-4xl font-bold text-white">Community Feed</h1>
        <p className="text-gray-400">
          Discover the latest work shared by photographers across the community.
        </p>
      </header>

      <FeedList items={feedItems} />
    </div>
  );
};

export default FeedPage;