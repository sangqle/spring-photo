import { useState, useEffect } from 'react';
import axios from 'axios';
import { Photo } from '../types/photo';

const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = async () => {
    try {
      const response = await axios.get('/api/photos');
      setPhotos(response.data);
    } catch (err) {
      setError('Failed to fetch photos');
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