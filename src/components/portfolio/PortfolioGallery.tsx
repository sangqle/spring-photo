import React from 'react';
import PhotoCard from '../photos/PhotoCard';
import { PortfolioItem } from '../../types/portfolio';

interface PortfolioGalleryProps {
  photos: PortfolioItem[];
}

const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ photos = [] }) => {
  if (!Array.isArray(photos) || photos.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-card p-10 text-center text-gray-400">
        No photos in this portfolio yet.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
};

export default PortfolioGallery;