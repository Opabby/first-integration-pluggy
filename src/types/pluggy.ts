export interface ConnectToken {
  accessToken: string;
  expiresAt: string;
}

export interface Item {
  id: string;
  connector: {
    id: number;
    name: string;
    institutionUrl: string;
    imageUrl: string;
    primaryColor: string;
  };
  status: 'UPDATED' | 'UPDATING' | 'LOGIN_ERROR' | 'OUTDATED' | 'WAITING_USER_INPUT';
  executionStatus: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'ERROR' | 'UPDATING' | 'CREATED';
  createdAt: string;
  updatedAt: string;
  lastUpdatedAt: string | null;
  webhookUrl: string | null;
  error?: {
    code: string;
    message: string;
  };
}

export interface Account {
  id: string;
  type: 'BANK' | 'CREDIT';
  subtype: 'CHECKING_ACCOUNT' | 'SAVINGS_ACCOUNT' | 'CREDIT_CARD';
  number: string;
  name: string;
  balance: number;
  currencyCode: string;
  creditData?: {
    level: string;
    brand: string;
    balanceCloseDate: string;
    balanceDueDate: string;
    availableCreditLimit: number;
    balanceForeignCurrency: number;
    minimumPayment: number;
    creditLimit: number;
  };
  itemId: string;
}

export interface Transaction {
  id: string;
  description: string;
  descriptionRaw: string;
  currencyCode: string;
  amount: number;
  date: string;
  balance: number;
  category: string;
  accountId: string;
  providerCode?: string;
  status?: 'PENDING' | 'POSTED';
  paymentData?: {
    payer?: {
      name: string;
      branchNumber: string;
      accountNumber: string;
      documentNumber: { type: string; value: string };
    };
    receiver?: {
      name: string;
      branchNumber: string;
      accountNumber: string;
      documentNumber: { type: string; value: string };
    };
    paymentMethod?: string;
    reason?: string;
  };
}

export interface Identity {
  id: string;
  fullName: string;
  taxNumber: string;
  documentNumber: string;
  documentType: string;
  birthDate: string;
  emails: Array<{ value: string; type: string }>;
  phoneNumbers: Array<{ value: string; type: string }>;
  addresses: Array<{
    fullAddress: string;
    primaryAddress: boolean;
    street: string;
    city: string;
    postalCode: string;
    state: string;
    country: string;
  }>;
  relations: Array<{ name: string; type: string }>;
  itemId: string;
}

export interface PluggyConnectOptions {
  connectToken: string;
  includeSandbox?: boolean;
  connectorTypes?: Array<'PERSONAL_BANK' | 'BUSINESS_BANK' | 'INVESTMENT'>;
  countries?: string[];
  products?: Array<'ACCOUNTS' | 'CREDIT_CARDS' | 'TRANSACTIONS' | 'INVESTMENTS' | 'IDENTITY'>;
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