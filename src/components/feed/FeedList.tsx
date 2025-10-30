import React from 'react';
import FeedItem from './FeedItem';
import { Photo } from '../../types/photo';

interface FeedListProps {
  items: Photo[];
}

const FeedList: React.FC<FeedListProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-card p-8 text-center text-gray-400">
        No photos in the feed yet. Be the first to share!
      </div>
    );
  }

  return (
  <div className="grid gap-6 sm:auto-rows-[minmax(220px,auto)] sm:grid-cols-2 xl:auto-rows-[minmax(260px,auto)] xl:grid-cols-3">
      {items.map((photo) => (
        <FeedItem key={photo.id} photo={photo} />
      ))}
    </div>
  );
};

export default FeedList;