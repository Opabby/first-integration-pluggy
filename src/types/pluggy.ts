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
  account_id: string;
  item_id: string;
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

export interface Address {
  fullAddress?: string;
  primaryAddress?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  type?: string;
  [key: string]: unknown;
}

export interface PhoneNumber {
  type?: string;
  value?: string;
  [key: string]: unknown;
}

export interface Email {
  type?: string;
  value?: string;
  [key: string]: unknown;
}

export interface Relation {
  type?: string;
  name?: string;
  document?: string;
  [key: string]: unknown;
}

export interface IdentityRecord {
  identity_id: string;
  item_id: string;
  full_name?: string;
  company_name?: string;
  document?: string;
  document_type?: string;
  tax_number?: string;
  job_title?: string;
  birth_date?: string;
  investor_profile?: string;
  establishment_code?: string;
  establishment_name?: string;
  addresses?: Address[] | null;
  phone_numbers?: PhoneNumber[] | null;
  emails?: Email[] | null;
  relations?: Relation[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface DeleteItemResponse {
  success: boolean;
  message: string;
  itemId: string;
  warnings?: string[];
}

export interface TransactionRecord {
  account_id: string;
  transaction_id: string;
  date: string;
  description: string;
  description_raw?: string;
  amount: number;
  amount_in_account_currency?: number;
  balance?: number;
  currency_code?: string;
  category?: string;
  category_id?: string;
  provider_code?: string;
  provider_id?: string;
  status?: 'POSTED' | 'PENDING';
  type: 'CREDIT' | 'DEBIT';
  operation_type?: string;
  operation_category?: string;
  payment_data?: Record<string, unknown> | null;
  credit_card_metadata?: Record<string, unknown> | null;
  merchant?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}