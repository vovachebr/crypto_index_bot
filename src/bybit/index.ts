import { RestClientV5 } from 'bybit-api';
import {
  calculateBybitStatsByPercentage,
  calculateDiffPercentage,
  calculateDiffValues,
  calculateMarketStatsByPercentage,
} from '../utils';
import { getCoinmarketcapStats } from '../coinmarketcap';
import { UserDBRecord } from '../types/coinmarketcapTypes';
import { bot } from '../telegramBot';

export async function getUserAccountBalance(
  apiKey: string,
  apiSecret: string,
): Promise<Record<string, number>> {
  const client = new RestClientV5({
    key: apiKey,
    secret: apiSecret,
    recv_window: 20000,
  });

  const response = await client.getWalletBalance({ accountType: 'UNIFIED' });
  return response.result.list[0].coin.reduce(
    (acc: Record<string, number>, coinData) => ({
      ...acc,
      [coinData.coin]: Number(coinData.usdValue),
    }),
    {},
  );
}

export async function rebalanceAction(
  user: UserDBRecord,
): Promise<{ key: string; value: number; message: string }[] | undefined> {
  if (!user.apiKey || !user.apiSecret) {
    return;
  }

  const marketStats = await getCoinmarketcapStats(user.countCoins);
  const marketStatsPercentage = calculateMarketStatsByPercentage(
    marketStats,
    user.strategy,
  );

  let userBalanceData;
  try {
    userBalanceData = await getUserAccountBalance(user.apiKey, user.apiSecret);
  } catch (error: any) {
    bot.sendMessage(user.chatId, String(error?.message));
    return;
  }

  const userStatsPercentageBalance =
    calculateBybitStatsByPercentage(userBalanceData);
  const calculatedDiffPercentage = calculateDiffPercentage(
    marketStatsPercentage,
    userStatsPercentageBalance,
  );
  const sortedDiffs = Object.entries(calculatedDiffPercentage)
    .sort((left, right) => left[1] - right[1])
    .filter(([key]) => key !== 'USDT');

  const totalBalance = Object.values(userBalanceData || {}).reduce(
    (acc, balance) => acc + balance,
    0,
  );
  const calculatedDiffValues = calculateDiffValues(sortedDiffs, totalBalance);

  return await Promise.all(
    calculatedDiffValues.map(async ({ key, value }) => {
      const result = await sendRequestToMakeOrder(
        new RestClientV5({
          key: String(user.apiKey),
          secret: String(user.apiSecret),
          recv_window: 20000,
        }),
        key + 'USDT',
        value,
      );

      return {
        key,
        value,
        message: result.retMsg,
      };
    }),
  );
}

export async function sendRequestToMakeOrder(
  client: RestClientV5,
  key: string,
  value: number,
) {
  return client.submitOrder({
    category: 'spot',
    symbol: key,
    side: value > 0 ? 'Buy' : 'Sell',
    orderType: 'Market',
    qty: Math.abs(value).toFixed(2),
    marketUnit: 'quoteCoin',
  });
}
