import Image from 'next/image';
import Link from 'next/link';
import React, { type CSSProperties, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import FeedItemActions from './FeedItemActions';
import { Photo } from '../../types/photo';

interface FeedItemProps {
  photo: Photo;
}

const FeedItem: React.FC<FeedItemProps> = ({ photo }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const rawCreatedAt = photo.createdAt ?? photo.uploadedAt;
  const createdAtCandidate = rawCreatedAt ? new Date(rawCreatedAt) : new Date();
  const createdAt = Number.isNaN(createdAtCandidate.getTime()) ? new Date() : createdAtCandidate;
  const photographerName = photo.displayName ?? photo.username ?? photo.userId ?? 'Unknown photographer';
  const username = photo.username ?? photo.userId ?? 'unknown';
  const avatarUrl = photo.avatarUrl;

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

  const handleToggleComments = () => {
    setShowComments((current) => !current);
  };

  return (
    <article className="w-full overflow-hidden rounded-3xl border border-gray-800 bg-card shadow-xl shadow-black/20">
      <header className="flex items-start justify-between gap-4 px-6 pt-6">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <Link href={`/${username}`} className="shrink-0">
              <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-gray-700 transition-all hover:ring-gray-500">
                <Image
                  src={avatarUrl}
                  alt={photographerName}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            </Link>
          ) : (
            <Link href={`/${username}`} className="shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 ring-2 ring-gray-700 transition-all hover:ring-gray-500">
                <span className="text-sm font-semibold text-white">
                  {photographerName.charAt(0).toUpperCase()}
                </span>
              </div>
            </Link>
          )}
          <div className="flex flex-col">
            <Link 
              href={`/${username}`}
              className="text-sm font-semibold text-white hover:text-gray-300 transition-colors"
            >
              {photographerName}
            </Link>
            <time className="text-xs text-gray-500" dateTime={createdAt.toISOString()}>
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </time>
          </div>
        </div>
      </header>

      <div className="space-y-3 px-6 pt-4">
        <h3 className="text-xl font-semibold tracking-tight text-white">{displayTitle}</h3>
        {displayDescription ? (
          <div className="text-base leading-relaxed text-gray-200">
            <p className={showFullDescription ? '' : 'line-clamp-4'}>
              {displayDescription}
            </p>
            {displayDescription.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-1 text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
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

      <FeedItemActions
        photoId={photo.id}
        initialIsLiked={photo.isLiked}
        initialLikeCount={photo.likeCount ?? photo.likesCount}
        commentCount={photo.commentCount ?? photo.commentsCount ?? 0}
        viewCount={photo.viewCount ?? 0}
        showComments={showComments}
        onToggleComments={handleToggleComments}
      />

      {/* Comments Section */}
      {showComments && (
        <div className="border-b border-gray-800 px-6 py-4">
          <div className="space-y-4">
            <div className="text-sm text-gray-400">
              Comments coming soon...
            </div>
            {/* TODO: Add comment list and input */}
            {/* <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-gray-600 focus:outline-none"
              />
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Post
              </button>
            </div> */}
          </div>
        </div>
      )}
    </article>
  );
};

export default FeedItem;