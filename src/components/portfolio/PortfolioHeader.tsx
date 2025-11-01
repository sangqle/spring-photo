'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';

interface PortfolioHeaderProps {
    displayName?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string | null;
    shareUrl?: string;
    isOwner?: boolean;
}

const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
    displayName,
    username,
    bio,
    avatarUrl,
    shareUrl,
    isOwner = false,
}) => {
    const [copied, setCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [computedUrl, setComputedUrl] = useState('');

    const title = displayName ? `${displayName}'s Portfolio` : 'Portfolio';
    const subtitle = username ? `@${username}` : undefined;
    const description = bio ?? 'Showcase the shots you are most proud of and build your story.';

    useEffect(() => {
        if (shareUrl) {
            setComputedUrl(shareUrl);
            return;
        }

        if (typeof window !== 'undefined') {
            setComputedUrl(window.location.href);
        }
    }, [shareUrl]);

    useEffect(() => {
        if (!copied) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setCopied(false);
        }, 2200);

        return () => window.clearTimeout(timeout);
    }, [copied]);

    const avatarFallback = useMemo(() => {
        if (avatarUrl) {
            return null;
        }
        const source = displayName ?? username ?? '?';
        return source.charAt(0).toUpperCase();
    }, [avatarUrl, displayName, username]);

    const handleCopyLink = async () => {
        if (!computedUrl) {
            return;
        }

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(computedUrl);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = computedUrl;
                textArea.style.position = 'fixed';
                textArea.style.top = '-9999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };

    const handleShare = async () => {
        if (!computedUrl) {
            await handleCopyLink();
            return;
        }

        try {
            setIsSharing(true);

            if (navigator.share) {
                await navigator.share({
                    url: computedUrl,
                    title,
                    text: description,
                });
                return;
            }

            await handleCopyLink();
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <header className="rounded-3xl border border-white/10 bg-card/60 px-6 py-8 shadow-lg shadow-black/10 sm:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                    <span className="relative flex h-16 w-16 overflow-hidden rounded-2xl bg-blue-500/20 text-xl font-semibold text-white sm:h-20 sm:w-20">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName ?? username ?? 'Portfolio avatar'} className="h-full w-full object-cover" />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center">
                                {avatarFallback}
                            </span>
                        )}
                    </span>
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
                            {subtitle ? (
                                <p className="text-sm font-semibold uppercase tracking-wide text-blue-200/80">{subtitle}</p>
                            ) : null}
                        </div>
                        <p className="max-w-2xl text-base text-gray-300">{description}</p>
                        {isOwner ? (
                            <p className="text-xs uppercase tracking-wide text-gray-500">This is your public portfolio link.</p>
                        ) : null}
                    </div>
                </div>

                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 text-sm font-semibold text-gray-200 transition hover:border-white/30 hover:bg-white/10"
                    >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default PortfolioHeader;