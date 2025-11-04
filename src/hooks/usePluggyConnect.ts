import { useState, useCallback } from 'react';
import { pluggyApi } from '../services/api';
import type { ConnectToken, PluggySuccessData, PluggyErrorData } from '../types/pluggy';

export const usePluggyConnect = (userId?: string) => {
  const [connectToken, setConnectToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call your Vercel backend to get a Connect Token
      const data: ConnectToken = await pluggyApi.getConnectToken();
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
      // Store item in localStorage (or send to your backend if you have endpoints)
      await pluggyApi.storeItem(data.item.id, userId);
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