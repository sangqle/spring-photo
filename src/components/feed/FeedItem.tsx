import Image from 'next/image';
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Photo } from '../../types/photo';

interface FeedItemProps {
  photo: Photo;
}

const FeedItem: React.FC<FeedItemProps> = ({ photo }) => {
  const rawCreatedAt = photo.createdAt ?? photo.uploadedAt;
  const createdAtCandidate = rawCreatedAt ? new Date(rawCreatedAt) : new Date();
  const createdAt = Number.isNaN(createdAtCandidate.getTime()) ? new Date() : createdAtCandidate;
  const photographerName = photo.username ?? photo.userId ?? 'Unknown photographer';

  const imageSrc = photo.url?.trim();
  const hasImage = Boolean(imageSrc);

  const width = photo.metadata?.width ?? null;
  const height = photo.metadata?.height ?? null;
  const rawAspectRatio = width && height ? width / height : photo.metadata?.aspectRatio ?? null;
  const aspectRatio = rawAspectRatio && Number.isFinite(rawAspectRatio) && rawAspectRatio > 0 ? rawAspectRatio : null;

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-800 bg-card">
      <div className="relative w-full flex-1 bg-card-darker" style={aspectRatio ? ({ aspectRatio } as React.CSSProperties) : undefined}>
        {hasImage ? (
          <Image
            src={imageSrc as string}
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