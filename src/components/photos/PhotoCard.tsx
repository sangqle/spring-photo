'use client';

import Image from 'next/image';
import React from 'react';
import { PortfolioItem } from '../../types/portfolio';

interface PhotoCardProps {
  photo: PortfolioItem;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo }) => {
  const caption = photo.caption ?? 'Untitled photo';

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-800 bg-card">
      <div className="relative aspect-4/3 w-full bg-card-darker">
        <Image
          src={photo.photoUrl}
          alt={caption}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-semibold text-white">{caption}</h3>
        <p className="text-sm text-gray-400">Added on {new Date(photo.createdAt).toLocaleDateString()}</p>
      </div>
    </article>
  );
};

export default PhotoCard;