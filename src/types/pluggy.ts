// Import official types from pluggy-js
import type { 
  Item, 
  Account, 
  Transaction, 
  Connector 
} from 'pluggy-js';

// Re-export the official types
export type { Item, Account, Transaction, Connector };

// Keep only your custom types that aren't in pluggy-js
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

// These will now use the official Item type from pluggy-js
export interface PluggySuccessData {
  item: Item;
}

export interface PluggyErrorData {
  message: string;
  data?: {
    item?: Item;
  };
}