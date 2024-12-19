import { config } from 'dotenv';
import fetch from 'node-fetch';
import {
  CryptoCurrencyListItem,
  ListingResponseType,
} from '../types/coinmarketcapTypes';

config();

const { COINMARKETCAP_HOST, COINMARKETCAP_API_KEY } = process.env;

if (!COINMARKETCAP_API_KEY) {
  throw new Error('COINMARKETCAP_API_KEY is not defined');
}

export type CoinsDataType = Record<string, { price: number; size: number }>;

export async function getCoinmarketcapStats(
  coinsCount: number,
): Promise<CoinsDataType> {
  const searchParams = new URLSearchParams({
    start: '1',
    limit: String(coinsCount),
    sortBy: 'market_cap',
    sortType: 'desc',
    convert: 'USD',
  });

  try {
    const response = await fetch(
      `${COINMARKETCAP_HOST}/data-api/v3/cryptocurrency/listing?${searchParams.toString()}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': String(COINMARKETCAP_API_KEY),
        },
      },
    );
    const data: ListingResponseType = await response.json();

    const result = data.data.cryptoCurrencyList.reduce(
      (
        acc: Record<string, { price: number; size: number }>,
        value: CryptoCurrencyListItem,
      ) => {
        acc[value.symbol] = {
          price: value.quotes[0].price, // USD
          size: value.quotes[0].marketCapByTotalSupply, // USD
        };
        return acc;
      },
      {},
    );

    return result;
  } catch (error) {
    console.log(error);
    return {error: error.message};
  }
}
