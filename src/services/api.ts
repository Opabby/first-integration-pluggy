import axios from 'axios';
import type { ConnectToken, Item, Account, Transaction, Identity } from '../types/pluggy';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const PLUGGY_API_URL = 'https://api.pluggy.ai';

const backendApi = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const pluggyApiClient = axios.create({
  baseURL: PLUGGY_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentConnectToken: string | null = null;

export const setConnectToken = (token: string) => {
  currentConnectToken = token;
};

export const getConnectToken = () => currentConnectToken;

pluggyApiClient.interceptors.request.use((config) => {
  if (currentConnectToken) {
    config.headers['X-API-KEY'] = currentConnectToken;
  }
  return config;
});

export const pluggyApi = {
  getConnectToken: async (itemId?: string, options?: Record<string, unknown>): Promise<ConnectToken> => {
    const response = await backendApi.post('/api/token', { itemId, options });
    
    if (response.data.accessToken) {
      setConnectToken(response.data.accessToken);
    }
    
    return {
      accessToken: response.data.accessToken,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  },

  storeItem: async (itemId: string, userId?: string): Promise<void> => {
    const items = JSON.parse(localStorage.getItem('pluggy_items') || '[]');
    items.push({ itemId, userId, createdAt: new Date().toISOString() });
    localStorage.setItem('pluggy_items', JSON.stringify(items));
  },

  getStoredItems: (): Array<{ itemId: string; userId?: string; createdAt: string }> => {
    return JSON.parse(localStorage.getItem('pluggy_items') || '[]');
  },

  getItem: async (itemId: string): Promise<Item> => {
    const response = await pluggyApiClient.get(`/items/${itemId}`);
    return response.data;
  },

  getItems: async (): Promise<Item[]> => {
    const storedItems = pluggyApi.getStoredItems();
    const itemPromises = storedItems.map(({ itemId }) => pluggyApi.getItem(itemId));
    
    try {
      return await Promise.all(itemPromises);
    } catch (error) {
      console.error('Error fetching items:', error);
      return [];
    }
  },

  getAccounts: async (itemId: string): Promise<Account[]> => {
    const response = await pluggyApiClient.get('/accounts', {
      params: { itemId },
    });
    return response.data.results || [];
  },

  getTransactions: async (
    accountId: string,
    from?: string,
    to?: string
  ): Promise<Transaction[]> => {
    const response = await pluggyApiClient.get('/transactions', {
      params: { accountId, from, to },
    });
    return response.data.results || [];
  },

  getIdentity: async (itemId: string): Promise<Identity> => {
    const response = await pluggyApiClient.get('/identity', {
      params: { itemId },
    });
    return response.data;
  },

  updateItem: async (itemId: string, parameters?: Record<string, unknown>): Promise<Item> => {
    const response = await pluggyApiClient.patch(`/items/${itemId}`, { parameters });
    return response.data;
  },

  deleteItem: async (itemId: string): Promise<void> => {
    await pluggyApiClient.delete(`/items/${itemId}`);

    const items = pluggyApi.getStoredItems();
    const filtered = items.filter(item => item.itemId !== itemId);
    localStorage.setItem('pluggy_items', JSON.stringify(filtered));
  },
};

export default pluggyApiClient;