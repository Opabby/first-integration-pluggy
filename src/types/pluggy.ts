import type { 
  Item, 
  Account, 
  Transaction, 
  Connector 
} from 'pluggy-js';

export type { Item, Account, Transaction, Connector };

export interface ConnectToken {
  accessToken: string;
  expiresAt: string;
}

export interface PluggyConnectOptions {
  connectToken: string;
  includeSandbox?: boolean;
  connectorTypes?: Array<'PERSONAL_BANK' | 'BUSINESS_BANK' | 'INVESTMENT'>;
  countries?: string[];
  products?: Array<'ACCOUNTS' | 'CREDIT_CARDS' | 'TRANSACTIONS' | 'INVESTMENTS'>;
}

export interface PluggySuccessData {
  item: Item;
}

export interface PluggyErrorData {
  message: string;
  data?: {
    item?: Item;
  };
}