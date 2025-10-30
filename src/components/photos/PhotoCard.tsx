'use client';

import Image from 'next/image';
import React from 'react';
import { Photo } from '../../types/photo';

interface PhotoCardProps {
  photo: Photo;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo }) => {
  const caption = photo.description ?? photo.title ?? 'Untitled photo';
  const imageSrc = photo.url?.trim();
  const createdAt = photo.createdAt ? new Date(photo.createdAt) : new Date();
  const createdAtLabel = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-800 bg-card">
      <div className="relative aspect-4/3 w-full bg-card-darker">
        {imageSrc ? (
          <Image
            src={imageSrc as string}
            alt={caption}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-card-darker">
            <span className="rounded-full border border-gray-700 px-3 py-1 text-xs uppercase tracking-wide text-gray-400">
              No Image
            </span>
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-semibold text-white">{caption}</h3>
        <p className="text-sm text-gray-400">
          Added on {createdAtLabel.toLocaleDateString()}
        </p>
      </div>
    </article>
  );
};

export default PhotoCard;