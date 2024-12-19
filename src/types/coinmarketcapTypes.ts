export type ListingResponseType = {
  data: {
    cryptoCurrencyList: CryptoCurrencyListItem[];
  };
};

export type CryptoCurrencyListItem = {
  symbol: string;
  quotes: {
    price: number;
    marketCapByTotalSupply: number;
  }[];
};

export type LowDB = {
  users: UserDBRecord[];
};

export type UserDBRecord = {
  chatId: number;
  name?: string;
  lastName?: string;
  login?: string;
  strategy: 'capitalization' | 'average';
  countCoins: number;
  apiKey: string | null;
  apiSecret: string | null;
  personalWalletData?: Record<string, number>;
};
