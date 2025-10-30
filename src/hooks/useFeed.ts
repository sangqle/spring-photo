'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Photo } from '../types/photo';

const useFeed = () => {
  const [feedItems, setFeedItems] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedItems = async () => {
      try {
        const response = await axios.get('/api/photos/public');
        const data = response.data as
          | Photo[]
          | { data?: Photo[]; content?: Photo[]; error?: string };

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.content)
              ? data.content
              : null;

        if (Array.isArray(items)) {
          setFeedItems(items);
          setError(null);
        } else if (!Array.isArray(data) && data?.error) {
          setError(data.error ?? 'Failed to load feed items');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load feed items';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedItems();
  }, []);

  return { feedItems, loading, error };
};

export default useFeed;