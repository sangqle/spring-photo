import { useState, useEffect } from 'react';
import axios from 'axios';
import { Photo } from '../types/photo';

const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = async () => {
    try {
      const response = await axios.get('/api/photos/my-photos');
      const data = response.data;

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.content)
            ? data.content
            : null;

      if (Array.isArray(items)) {
        setPhotos(items);
        setError(null);
      } else if (data?.error) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to fetch photos');
      } else {
        setPhotos([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch photos';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  return { photos, loading, error };
};

export default usePhotos;