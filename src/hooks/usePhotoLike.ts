'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { API_BASE_URL } from '@/lib/config';

interface UsePhotoLikeOptions {
  photoId: string;
  initialIsLiked?: boolean;
  initialLikeCount?: number;
}

type SessionUser = {
  accessToken?: string | null;
};

const formatBearerToken = (value: string) => (value.startsWith('Bearer ') ? value : `Bearer ${value}`);

const buildApiUrl = (photoId: string, useProxy: boolean) =>
  useProxy
    ? `/api/likes/photos/${encodeURIComponent(photoId)}`
    : `${API_BASE_URL}/api/likes/photos/${encodeURIComponent(photoId)}`;

const extractIsLiked = (payload: unknown): boolean | null => {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.hasLiked === 'boolean') {
      return record.hasLiked;
    }
    if (typeof record.isLiked === 'boolean') {
      return record.isLiked;
    }
    if (typeof record.liked === 'boolean') {
      return record.liked;
    }
    if (typeof record.action === 'string') {
      if (record.action === 'liked') {
        return true;
      }
      if (record.action === 'unliked') {
        return false;
      }
    }
  }
  return null;
};

const extractLikeCount = (payload: unknown): number | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const candidates = [record.totalLikes, record.likeCount, record.count, record.total];

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }
    if (typeof candidate === 'string') {
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
};

const resolveUploadAuthToken = () => {
  if (process.env.NEXT_PUBLIC_UPLOAD_BEARER_TOKEN) {
    return formatBearerToken(process.env.NEXT_PUBLIC_UPLOAD_BEARER_TOKEN);
  }
  if (process.env.NEXT_PUBLIC_API_BEARER_TOKEN) {
    return formatBearerToken(process.env.NEXT_PUBLIC_API_BEARER_TOKEN);
  }
  if (typeof window === 'undefined') {
    return undefined;
  }
  const storageKeys = ['uploadAuthToken', 'authToken', 'token'];
  try {
    const storages: Storage[] = [];
    if (window.localStorage) {
      storages.push(window.localStorage);
    }
    if (window.sessionStorage) {
      storages.push(window.sessionStorage);
    }
    for (const storage of storages) {
      for (const key of storageKeys) {
        const candidate = storage.getItem(key);
        if (candidate) {
          return formatBearerToken(candidate);
        }
      }
    }
  } catch {
    // no-op; storage might be unavailable
  }
  if (typeof document !== 'undefined') {
    const cookieEntry = document.cookie
      ?.split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => ['uploadAuthToken', 'authToken', 'token'].some((key) => cookie.startsWith(`${key}=`)));
    if (cookieEntry) {
      const [, rawValue] = cookieEntry.split('=');
      if (rawValue) {
        return formatBearerToken(decodeURIComponent(rawValue));
      }
    }
  }
  return undefined;
};

const usePhotoLike = ({ photoId, initialIsLiked = false, initialLikeCount }: UsePhotoLikeOptions) => {
  const { data: session } = useSession();
  const sessionAccessToken = (session?.user as SessionUser | undefined)?.accessToken ?? null;
  const hasInitialLikeCountRef = useRef(
    typeof initialLikeCount === 'number' && !Number.isNaN(initialLikeCount)
  );
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number | null>(
    hasInitialLikeCountRef.current ? initialLikeCount ?? null : null
  );
  const [isPending, setIsPending] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);

  const syncFromPayload = useCallback((payload: unknown) => {
    const totalLikesNumber = extractLikeCount(payload);

    if (totalLikesNumber !== null) {
      setLikeCount(totalLikesNumber);
      hasInitialLikeCountRef.current = true;
    }

    const resolvedIsLiked = extractIsLiked(payload);

    if (resolvedIsLiked !== null) {
      setIsLiked(resolvedIsLiked);
    }
  }, []);

  const toggleLike = useCallback(async () => {
    if (!photoId) {
      return;
    }

    const hasInitialLikeCount = hasInitialLikeCountRef.current;
    const previousLiked = isLiked;
    const previousLikeCount = likeCount;
    const nextLiked = !previousLiked;

    setIsLiked(nextLiked);
    setLikeCount((current) => {
      if (nextLiked) {
        return current === null ? 1 : current + 1;
      }
      if (current === null) {
        return null;
      }
      const nextCount = Math.max(current - 1, 0);
      return !hasInitialLikeCount && nextCount === 0 ? null : nextCount;
    });
    setIsPending(true);

    const preferProxy = Boolean(sessionAccessToken);
    const fallbackToken = preferProxy ? null : resolveUploadAuthToken();

    if (!preferProxy && !fallbackToken) {
      console.error('Missing authentication token for like request.');
      setIsLiked(previousLiked);
      setLikeCount(previousLikeCount);
      setIsPending(false);
      return;
    }

    const requestInit: RequestInit = {
      method: 'POST',
      credentials: 'include',
    };

    if (!preferProxy && fallbackToken) {
      requestInit.headers = {
        Authorization: fallbackToken,
      };
    }

    const targetUrl = buildApiUrl(photoId, preferProxy);

    try {
      const response = await fetch(targetUrl, requestInit);
      if (!response.ok) {
        throw new Error('Failed to update like status.');
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        try {
          const payload = await response.json();
          syncFromPayload(payload);
        } catch {
          // ignore parse errors from empty responses
        }
      }
    } catch (error) {
      setIsLiked(previousLiked);
      setLikeCount(previousLikeCount);
      console.error('Failed to update like status.', error);
    } finally {
      setIsPending(false);
    }
  }, [photoId, isLiked, likeCount, sessionAccessToken, syncFromPayload]);

  useEffect(() => {
    if (!photoId) {
      return;
    }

    const controller = new AbortController();
    let isCancelled = false;

    const hydrateLikeState = async () => {
      setIsHydrating(true);

      const preferProxy = Boolean(sessionAccessToken);
      const fallbackToken = preferProxy ? null : resolveUploadAuthToken();

      const requestInit: RequestInit = {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      };

      if (!preferProxy && fallbackToken) {
        requestInit.headers = {
          Authorization: fallbackToken,
        };
      }

      const targetUrl = buildApiUrl(photoId, preferProxy);

      try {
        const response = await fetch(targetUrl, requestInit);

        if (!response.ok) {
          throw new Error('Failed to fetch like state.');
        }

        const payload = await response.json();
        if (isCancelled) {
          return;
        }

        syncFromPayload(payload);
      } catch (error) {
        if (!isCancelled) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }
          console.error('Failed to fetch like state.', error);
        }
      } finally {
        if (!isCancelled) {
          setIsHydrating(false);
        }
      }
    };

    void hydrateLikeState();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [photoId, sessionAccessToken, syncFromPayload]);

  return { isLiked, likeCount, toggleLike, isPending, isHydrating };
};

export default usePhotoLike;
