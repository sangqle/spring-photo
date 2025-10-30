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
        const response = await axios.get<Photo[]>('/api/feed');
        setFeedItems(response.data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load feed items';
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