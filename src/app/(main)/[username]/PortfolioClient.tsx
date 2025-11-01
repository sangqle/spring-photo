'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PortfolioGallery from '@/components/portfolio/PortfolioGallery';
import PortfolioHeader from '@/components/portfolio/PortfolioHeader';
import usePhotos from '@/hooks/usePhotos';

const DEFAULT_BIO = 'Showcase the shots you are most proud of and build your story.';

export interface PortfolioOwnerInfo {
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

interface PortfolioClientProps {
  username: string;
  owner: PortfolioOwnerInfo;
  isOwner: boolean;
}

const PortfolioClient: React.FC<PortfolioClientProps> = ({ username, owner, isOwner }) => {
  const { photos, loading, error, loadMore, hasMore, loadingMore } = usePhotos({ pageSize: 20, username });
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setShareUrl(window.location.href);
  }, [username]);

  const ownerDetails = useMemo(() => {
    const computedDisplayName = owner.displayName ?? owner.username ?? username;
    const normalizedBio = owner.bio && owner.bio.trim().length > 0 ? owner.bio.trim() : DEFAULT_BIO;
    const normalizedAvatar = owner.avatarUrl ?? null;

    return {
      displayName: computedDisplayName,
      bio: normalizedBio,
      avatarUrl: normalizedAvatar,
    };
  }, [owner.avatarUrl, owner.bio, owner.displayName, owner.username, username]);

  const { displayName, bio, avatarUrl } = ownerDetails;

  return (
    <div className="space-y-8 pb-8 sm:px-12 sm:pb-20 lg:px-16 lg:pb-16">
      <PortfolioHeader
        displayName={displayName}
        username={owner.username ?? username}
        bio={bio}
        avatarUrl={avatarUrl}
        shareUrl={shareUrl}
        isOwner={isOwner}
      />
      {loading ? (
        <div className="rounded-2xl border border-gray-800 bg-card p-10 text-center text-gray-300">
          Loading portfolio …
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-10 text-center text-red-400">
          {error}
        </div>
      ) : (
        <PortfolioGallery
          photos={photos}
          onLoadMore={loadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
        />
      )}
    </div>
  );
};

export default PortfolioClient;
