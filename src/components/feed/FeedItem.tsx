import Image from 'next/image';
import React, { type CSSProperties } from 'react';
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

  const displayTitle = photo.title?.trim() || 'Untitled photo';
  const displayDescription = photo.description?.trim();
  const imageWrapperStyle: CSSProperties = aspectRatio
    ? { aspectRatio: aspectRatio.toString() }
    : { aspectRatio: '4 / 3' };

  return (
    <article className="w-full overflow-hidden rounded-3xl border border-gray-800 bg-card shadow-xl shadow-black/20">
      <header className="flex items-start justify-between gap-4 px-6 pt-6">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">{photographerName}</span>
          <time className="text-xs text-gray-500" dateTime={createdAt.toISOString()}>
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </time>
        </div>
      </header>

      <div className="space-y-3 px-6 pt-4">
        <h3 className="text-xl font-semibold tracking-tight text-white">{displayTitle}</h3>
        {displayDescription ? (
          <p className="text-base leading-relaxed text-gray-200">
            {displayDescription}
          </p>
        ) : null}
      </div>

      <div className="relative mt-5 w-full overflow-hidden bg-black" style={imageWrapperStyle}>
        {hasImage ? (
          <Image
            src={imageSrc as string}
            alt={displayDescription ?? displayTitle}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <span className="rounded-full border border-gray-700 px-3 py-1 text-xs uppercase tracking-wide text-gray-400">
              No Image
            </span>
          </div>
        )}
      </div>

      <footer className="px-6 pb-6 pt-4 text-sm text-gray-500">
        <span>{photo.metadata?.cameraModel ?? photo.metadata?.cameraMake ?? 'Shared photo'}</span>
      </footer>
    </article>
  );
};

export default FeedItem;