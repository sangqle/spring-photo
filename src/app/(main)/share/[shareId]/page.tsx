import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const SharePage = () => {
  const router = useRouter();
  const { shareId } = router.query;
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (shareId) {
      const fetchPhoto = async () => {
        try {
          const response = await axios.get(`/api/share/${shareId}`);
          setPhoto(response.data);
        } catch (err) {
          setError('Failed to load photo');
        } finally {
          setLoading(false);
        }
      };

      fetchPhoto();
    }
  }, [shareId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Shared Photo</h1>
      {photo ? (
        <img src={photo.url} alt={photo.title} />
      ) : (
        <p>No photo found.</p>
      )}
    </div>
  );
};

export default SharePage;