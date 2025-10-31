'use client';

import Image from 'next/image';
import React, { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Photo } from '../../types/photo';

interface PhotoCardProps {
  photo: Photo;
  width?: number;
  height?: number;
  showOverlay?: boolean;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, width, height, showOverlay = true }) => {
  const title = photo.title?.trim() || photo.description?.trim() || 'Untitled photo';
  const imageSrc = photo.url?.trim();
  const createdAt = photo.createdAt ?? photo.uploadedAt;
  const createdAtDate = createdAt ? new Date(createdAt) : new Date();
  const safeCreatedAt = Number.isNaN(createdAtDate.getTime()) ? new Date() : createdAtDate;
  const photographer = photo.username?.trim() || photo.userId?.trim() || '';

  const inlineStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!width || !height) {
      return undefined;
    }

    return {
      width: `${width}px`,
      height: `${height}px`,
    };
  }, [width, height]);

  return (
    <article
      className={`group relative overflow-hidden rounded-xl bg-card shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lg ${width && height ? 'shrink-0' : 'w-full'}`}
      style={inlineStyle}
    >
      <div className="relative h-full w-full bg-card-darker">
        {imageSrc ? (
          <Image
            src={imageSrc as string}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-card-darker">
            <span className="rounded-full border border-gray-700 px-3 py-1 text-xs uppercase tracking-wide text-gray-400">
              No Image
            </span>
          </div>
        )}

        {showOverlay ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <h3 className="line-clamp-2 text-base font-semibold text-white" title={title}>
              {title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-gray-300">
              {photographer ? <span className="font-medium">{photographer}</span> : null}
              <span>{formatDistanceToNow(safeCreatedAt, { addSuffix: true })}</span>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default PhotoCard;