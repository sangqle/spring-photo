import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Photo } from '../types/photo';

interface UsePhotosOptions {
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

const usePhotos = ({ pageSize = DEFAULT_PAGE_SIZE }: UsePhotosOptions = {}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(-1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const parsedPageSize = useMemo(() => Math.max(Math.floor(pageSize) || DEFAULT_PAGE_SIZE, 1), [pageSize]);

  const fetchPage = useCallback(async (targetPage: number) => {
    const isFirstPage = targetPage === 0;
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await axios.get('/api/photos/my-photos', {
        params: {
          page: targetPage,
          size: parsedPageSize,
        },
      });
      const data = response.data;

      const normalized = normalizePhotosResponse(data, targetPage, parsedPageSize);
      const items = normalized.items;

      setPage(normalized.pageIndex);
      setTotalPages(normalized.totalPages);
      setTotalCount(normalized.totalElements);

      const computedHasMore = determineHasMore(normalized, parsedPageSize);
      setHasMore(computedHasMore);

      if (items.length) {
        setPhotos((previous) => {
          if (isFirstPage) {
            return items;
          }

          if (!previous.length) {
            return items;
          }

          const existingIds = new Set(previous.map((photo) => photo.id));
          const merged = [...previous];

          for (const item of items) {
            if (!existingIds.has(item.id)) {
              merged.push(item);
              existingIds.add(item.id);
            }
          }

          return merged;
        });

        setError(null);
      } else if (data?.error) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to fetch photos');
        if (isFirstPage) {
          setPhotos([]);
        }
      } else {
        if (isFirstPage) {
          setPhotos([]);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch photos';
      setError(message);
      if (targetPage === 0) {
        setPhotos([]);
      }
      if (targetPage > 0) {
        setHasMore(false);
      }
    } finally {
      if (isFirstPage) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [parsedPageSize]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    if (totalPages !== null && page >= totalPages - 1) {
      setHasMore(false);
      return;
    }

    const nextPage = page >= 0 ? page + 1 : 0;
    fetchPage(nextPage).catch(() => {
      // errors handled inside fetchPage
    });
  }, [fetchPage, hasMore, loading, loadingMore, page, totalPages]);

  useEffect(() => {
    fetchPage(0).catch(() => {
      // errors handled inside fetchPage
    });
  }, [fetchPage]);

  return {
    photos,
    loading,
    error,
    loadMore,
    hasMore,
    loadingMore,
    total: totalCount,
  };
};

export default usePhotos;

interface NormalizedPhotosResponse {
  items: Photo[];
  pageIndex: number;
  totalPages: number | null;
  totalElements: number | null;
  isLast: boolean | null;
}

const normalizePhotosResponse = (
  raw: unknown,
  fallbackPage: number,
  expectedSize: number,
): NormalizedPhotosResponse => {
  const base: NormalizedPhotosResponse = {
    items: [],
    pageIndex: fallbackPage,
    totalPages: null,
    totalElements: null,
    isLast: null,
  };

  if (Array.isArray(raw)) {
    base.items = raw as Photo[];
    if (base.items.length < expectedSize) {
      base.isLast = true;
    }
    return base;
  }

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      base.items = record.data as Photo[];
    } else if (Array.isArray(record.content)) {
      base.items = record.content as Photo[];
    }

    const pageValue = record.page ?? record.currentPage;
    if (typeof pageValue === 'number') {
      base.pageIndex = pageValue;
    } else if (typeof pageValue === 'string') {
      const parsed = parseInt(pageValue, 10);
      if (!Number.isNaN(parsed)) {
        base.pageIndex = parsed;
      }
    }

    if (typeof record.totalPages === 'number') {
      base.totalPages = record.totalPages;
    } else if (typeof record.totalPages === 'string') {
      const parsed = parseInt(record.totalPages, 10);
      if (!Number.isNaN(parsed)) {
        base.totalPages = parsed;
      }
    }

    if (typeof record.totalElements === 'number') {
      base.totalElements = record.totalElements;
    } else if (typeof record.totalElements === 'string') {
      const parsed = parseInt(record.totalElements, 10);
      if (!Number.isNaN(parsed)) {
        base.totalElements = parsed;
      }
    }

    if (typeof record.last === 'boolean') {
      base.isLast = record.last;
    } else if (typeof record.last === 'string') {
      base.isLast = record.last.toLowerCase() === 'true';
    } else if (typeof record.empty === 'boolean' && record.empty) {
      base.isLast = true;
    } else if (typeof record.empty === 'string' && record.empty.toLowerCase() === 'true') {
      base.isLast = true;
    }

    if (base.isLast === null && base.totalPages !== null) {
      base.isLast = base.pageIndex >= base.totalPages - 1;
    }
  }

  return base;
};

const determineHasMore = (response: NormalizedPhotosResponse, expectedSize: number): boolean => {
  if (response.isLast !== null) {
    return !response.isLast;
  }

  if (response.totalPages !== null) {
    return response.pageIndex < response.totalPages - 1;
  }

  return response.items.length >= expectedSize;
};