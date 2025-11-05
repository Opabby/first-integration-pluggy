import axios from 'axios';
import type { Item, Account, Transaction } from 'pluggy-js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const backendApi = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
};