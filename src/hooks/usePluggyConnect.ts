import { useState, useCallback } from 'react';
import { getConnectToken } from '../services/connectTokenApi';  // ✅ Changed
import type { Item } from 'pluggy-js';

interface PluggySuccessData {
  item: Item;
}

interface PluggyErrorData {
  message: string;
  data?: {
    item?: Item;
  };
}

export const usePluggyConnect = (userId?: string) => {
  const [connectToken, setConnectToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getConnectToken();  // ✅ Use getConnectToken directly
      setConnectToken(data.accessToken);
      return data.accessToken;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get connect token';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSuccess = useCallback(async (data: PluggySuccessData) => {
    console.log('Connection successful!', data.item);
    
    try {
      // Store item in localStorage
      const items = JSON.parse(localStorage.getItem('pluggy_items') || '[]');
      items.push({ itemId: data.item.id, userId, createdAt: new Date().toISOString() });
      localStorage.setItem('pluggy_items', JSON.stringify(items));
      
      return data.item;
    } catch (err) {
      console.error('Failed to store item:', err);
      throw err;
    }
  }, [userId]);

  const handleError = useCallback((data: PluggyErrorData) => {
    console.error('Connection error:', data.message);
    
    if (data.data?.item) {
      console.log('Partial item created:', data.data.item.id);
    }
    
    setError(data.message);
  }, []);

  const resetToken = useCallback(() => {
    setConnectToken('');
    setError(null);
  }, []);

  return {
    connectToken,
    isLoading,
    error,
    fetchConnectToken,
    handleSuccess,
    handleError,
    resetToken,
  };
};