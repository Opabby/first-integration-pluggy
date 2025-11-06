import { useState, useCallback } from 'react';
import { getConnectToken } from '../services/connectTokenApi';
import { pluggyApi, type PluggyItemRecord } from '../services/pluggyApi';
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
      const data = await getConnectToken();
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
      const itemData: PluggyItemRecord = {
        item_id: data.item.id,
        user_id: userId,
        connector_id: data.item.connector.id.toString(),
        connector_name: data.item.connector.name,
        connector_image_url: data.item.connector.imageUrl,
        status: data.item.status,
        created_at: data.item.createdAt.toISOString(),
        updated_at: (data.item.updatedAt || data.item.createdAt).toISOString(),
        last_updated_at: data.item.lastUpdatedAt?.toISOString(),
      };

      // Save to Supabase via backend API
      const savedItem = await pluggyApi.saveItem(itemData);
      console.log('Item saved via backend:', savedItem);
      
      return data.item;
    } catch (err) {
      console.error('Failed to save item via backend:', err);
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