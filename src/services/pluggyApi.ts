import axios, { AxiosError } from 'axios';
import type { Item, Account, Transaction } from 'pluggy-js';
import type { AccountRecord, IdentityRecord } from '../types/pluggy';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const backendApi = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PluggyItemRecord {
  item_id: string;
  user_id?: string;
  connector_id?: string;
  connector_name?: string;
  connector_image_url?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  last_updated_at?: string;
}

export const pluggyApi = {
  getItem: async (itemId: string): Promise<Item> => {
    const response = await backendApi.get('/api/items', {
      params: { itemId },
    });
    return response.data;
  },

  getAccounts: async (itemId: string): Promise<Account[]> => {
    const response = await backendApi.get('/api/accounts', {
      params: { itemId },
    });
    return response.data.results || response.data;
  },

  getAccountsFromDb: async (itemId: string): Promise<AccountRecord[]> => {
    const response = await backendApi.get('/api/accounts/get', {
      params: { itemId },
    });
    return response.data;
  },

  getIdentityFromDb: async (itemId: string): Promise<IdentityRecord | null> => {
    try {
      const response = await backendApi.get('/api/identity/get', {
        params: { itemId },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getTransactions: async (
    accountId: string,
    from?: string,
    to?: string
  ): Promise<Transaction[]> => {
    const response = await backendApi.get('/api/transactions', {
      params: { accountId, from, to },
    });
    return response.data.results || response.data;
  },

  saveItem: async (itemData: PluggyItemRecord): Promise<PluggyItemRecord> => {
    const response = await backendApi.post('/api/items/save', itemData);
    return response.data;
  },

  getItems: async (userId?: string): Promise<PluggyItemRecord[]> => {
    const response = await backendApi.get('/api/items/get', {
      params: { userId },
    });
    return response.data;
  },
};