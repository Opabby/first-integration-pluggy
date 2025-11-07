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

export interface BankData {
  transferNumber?: string;
  closingBalance?: number;
  [key: string]: unknown;
}

export interface CreditData {
  level?: string;
  brand?: string;
  balanceCloseDate?: string;
  balanceDueDate?: string;
  availableCreditLimit?: number;
  balanceForeignCurrency?: number;
  minimumPayment?: number;
  creditLimit?: number;
  [key: string]: unknown;
}

export interface DisaggregatedCreditLimits {
  purchases?: number;
  cash?: number;
  installments?: number;
  [key: string]: unknown;
}

export interface AccountRecord {
  id?: string;
  item_id: string;
  account_id: string;
  type: 'BANK' | 'CREDIT' | 'PAYMENT_ACCOUNT';
  subtype?: string;
  number?: string;
  name: string;
  marketing_name?: string;
  balance?: number;
  currency_code?: string;
  owner?: string;
  tax_number?: string;
  bank_data?: BankData | null;
  credit_data?: CreditData | null;
  disaggregated_credit_limits?: DisaggregatedCreditLimits | null;
  created_at?: string;
  updated_at?: string;
}