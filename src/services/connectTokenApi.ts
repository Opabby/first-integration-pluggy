import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const connectTokenApi = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ConnectTokenResponse {
  accessToken: string;
}

export const getConnectToken = async (
  itemId?: string,
  options?: Record<string, unknown>
): Promise<ConnectTokenResponse> => {
  const response = await connectTokenApi.post('/api/token', { itemId, options });
  return response.data;
};