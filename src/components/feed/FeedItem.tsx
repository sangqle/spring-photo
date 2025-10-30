import Image from 'next/image';
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Photo } from '../../types/photo';

interface FeedItemProps {
  photo: Photo;
}

const FeedItem: React.FC<FeedItemProps> = ({ photo }) => {
  const createdAt = photo.createdAt ? new Date(photo.createdAt) : new Date();
  const photographerName = photo.userId ?? 'Unknown photographer';

  const imageSrc = photo.url?.trim();
  const hasImage = Boolean(imageSrc);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-800 bg-card">
      <div className="relative aspect-4/3 w-full bg-card-darker">
        {hasImage ? (
          <Image
            src={imageSrc}
            alt={photo.description ?? photo.title ?? 'Photo'}
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
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{photographerName}</span>
          <time dateTime={createdAt.toISOString()}>
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </time>
        </div>

        <h3 className="text-lg font-semibold text-white">
          {photo.title ?? 'Untitled photo'}
        </h3>

        {photo.description ? (
          <p className="text-sm text-gray-300">
            {photo.description}
          </p>
        ) : null}
      </div>
    </article>
  );
};

export default FeedItem;