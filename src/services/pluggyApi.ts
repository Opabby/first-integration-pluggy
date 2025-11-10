import axios, { AxiosError } from "axios";
import type { Item, Account, Transaction } from "pluggy-js";
import type {
  AccountRecord,
  IdentityRecord,
  DeleteItemResponse,
  TransactionRecord
} from "../types/pluggy";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const backendApi = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
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
    const response = await backendApi.get("/api/items", {
      params: { itemId },
    });
    return response.data;
  },

  getAccounts: async (itemId: string): Promise<Account[]> => {
    const response = await backendApi.get("/api/accounts", {
      params: { itemId },
    });
    return response.data.results || response.data;
  },

  getAccountsFromDb: async (itemId: string): Promise<AccountRecord[]> => {
    const response = await backendApi.get("/api/accounts", {
      params: { itemId, fromDb: 'true' },
    });
    return response.data;
  },

  getIdentityFromDb: async (itemId: string): Promise<IdentityRecord | null> => {
    try {
      const response = await backendApi.get('/api/identity', {
        params: { itemId, fromDb: 'true' },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  saveItem: async (itemData: PluggyItemRecord): Promise<PluggyItemRecord> => {
    const response = await backendApi.post("/api/items", itemData);
    return response.data;
  },

  getItems: async (userId?: string): Promise<PluggyItemRecord[]> => {
    const response = await backendApi.get("/api/items", {
      params: { userId },
    });
    return response.data;
  },

  deleteItem: async (itemId: string): Promise<DeleteItemResponse> => {
    const response = await backendApi.delete("/api/items", {
      params: { itemId },
    });
    return response.data;
  },

  getTransactions: async (
    accountId: string,
    from?: string,
    to?: string,
    page?: number,
    pageSize?: number
  ): Promise<Transaction[]> => {
    const response = await backendApi.get("/api/transactions", {
      params: { accountId, from, to, page, pageSize },
    });
    return response.data.results || response.data;
  },

  getTransactionsFromDb: async (
    accountId: string,
    limit?: number,
    offset?: number
  ): Promise<TransactionRecord[]> => {
    console.log('pluggyApi.getTransactionsFromDb called with:', { accountId, limit, offset });
    const response = await backendApi.get("/api/transactions", {
      params: { accountId, fromDb: 'true', limit, offset },
    });
    console.log('getTransactionsFromDb response:', response);
    console.log('getTransactionsFromDb response.data:', response.data);
    return response.data;
  },

  saveTransactions: async (transactions: TransactionRecord[]): Promise<TransactionRecord[]> => {
    const response = await backendApi.post("/api/transactions", {
      transactions,
    });
    return response.data;
  },

  deleteTransaction: async (transactionId: string): Promise<void> => {
    await backendApi.delete("/api/transactions", {
      params: { transactionId },
    });
  },
};
