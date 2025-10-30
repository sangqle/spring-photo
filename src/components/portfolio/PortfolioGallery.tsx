'use client';

import React, { useMemo, useRef } from 'react';
import PhotoCard from '../photos/PhotoCard';
import { Photo } from '../../types/photo';
import useJustifiedLayout from '../../hooks/useJustifiedLayout';

interface PortfolioGalleryProps {
  photos: Photo[];
}

const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ photos = [] }) => {
  if (!Array.isArray(photos) || photos.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-card p-10 text-center text-gray-400">
        No photos in this portfolio yet.
      </div>
    );
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  const photoById = useMemo(() => new Map(photos.map((photo) => [photo.id, photo])), [photos]);

  const layout = useJustifiedLayout({
    photos,
    gap: 24,
    targetRowHeight: 320,
    containerRef,
    rowHeightTolerance: [0.75, 1.35],
    justifyLastRow: true,
    maxScaleUp: 1.6,
  });

  const hasLayout = layout.items.length > 0 && layout.containerHeight > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {hasLayout ? (
        <div
          className="relative w-full"
          style={{ height: layout.containerHeight }}
        >
          {layout.items.map((item) => {
            const photo = photoById.get(item.id);
            if (!photo) {
              return null;
            }

            return (
              <div
                key={item.id}
                className="absolute"
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                }}
              >
                <PhotoCard
                  photo={photo}
                  width={item.width}
                  height={item.height}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-6 sm:auto-rows-[minmax(220px,auto)] sm:grid-cols-2 lg:auto-rows-[minmax(260px,auto)] lg:grid-cols-3">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioGallery;