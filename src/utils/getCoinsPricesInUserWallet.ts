import { RestClientV5 } from "bybit-api";

export default async function getCoinsPricesInUserWallet(apiKey: string, apiSecret: string, coins: string[]): Promise<Record<string, number>> {
  const client = new RestClientV5({
    key: apiKey,
    secret: apiSecret,
    recv_window: 20000,
  });

  return (await Promise.all(coins.map(async (coin) => {
    const response = await client.getTickers({
      category: 'spot',
      symbol: coin + 'USDT',
    });
  
    if (response.result && response.result.list && response.result.list.length > 0) {
      return { 
        price: parseFloat(response.result.list[0].lastPrice),
        coin,
      };
    } else {
      return { price: null, coin };
    }
  }))).reduce((acc, { price, coin }) => ({...acc, [coin]: price}), {});
}