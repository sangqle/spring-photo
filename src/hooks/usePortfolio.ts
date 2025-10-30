import { useState, useEffect } from 'react';
import { fetchPortfolio, updatePortfolio } from '../lib/api-client';
import { Portfolio } from '../types/portfolio';

const usePortfolio = (userId: string) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const data = await fetchPortfolio(userId);
        setPortfolio(data);
      } catch (err) {
        setError('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [userId]);

  const savePortfolio = async (updatedPortfolio: Portfolio) => {
    try {
      await updatePortfolio(userId, updatedPortfolio);
      setPortfolio(updatedPortfolio);
    } catch (err) {
      setError('Failed to save portfolio');
    }
  };

  return { portfolio, loading, error, savePortfolio };
};

export default usePortfolio;