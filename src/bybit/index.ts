import { RestClientV5 } from 'bybit-api';

import { getCoinmarketcapStats } from '../coinmarketcap';
import { UserDBRecord } from '../types/coinmarketcapTypes';
import { bot } from '../telegramBot';
import calculateBybitStatsByPercentage from '../utils/calculateBybitStatsByPercentage';
import calculateDiffPercentage from '../utils/calculateDiffPercentage';
import calculateDiffValues from '../utils/calculateDiffValues';
import calculateFullUserBalanceData from '../utils/calculateFullUserBalanceData';
import calculateMarketStatsByPercentage from '../utils/calculateMarketStatsByPercentage';
import getCoinsPricesInUserWallet from '../utils/getCoinsPricesInUserWallet';
import getUserWalletBalanceInUSDT from '../utils/getUserWalletBalanceInUSDT';

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

  const { apiKey, apiSecret } = user;

  const marketStats = await getCoinmarketcapStats(user.countCoins);

  const userWalletBalanceInCoinsData = user.personalWalletData || {};

  const coinsPrices = await getCoinsPricesInUserWallet(apiKey, apiSecret, Object.keys(userWalletBalanceInCoinsData)); // возвращает цены монет в кошельке пользователя
  const userWalletBalanceInUSDT = getUserWalletBalanceInUSDT(coinsPrices, userWalletBalanceInCoinsData); // вычисляет баланс кошелька пользователя в USDT

  let userStockBalance;
  try {
    userStockBalance = await getUserAccountBalance(apiKey, apiSecret);
  } catch (error: unknown) {
    bot.sendMessage(user.chatId, (error as Error).message);
    return;
  }

  const fullUserBalanceData = calculateFullUserBalanceData(userWalletBalanceInUSDT, userStockBalance); // общий баланс пользователя (кошелёк + биржа)

  const totalBalance = Object.values(fullUserBalanceData || {}).reduce(
    (acc, balance) => acc + balance,
    0,
  );
  

  let messageLog = "<b>Получаю данные о балансе:</b> \n";
  messageLog += "(к) - кошелёк, (б) - биржа\n";
  messageLog += Object.entries(fullUserBalanceData).sort((left, right) => right[1] - left[1]).map(([coin, balance], index) => `${index + 1}) <i>${coin}</i>: ${(userWalletBalanceInUSDT[coin] || 0).toFixed(2)}(к) + ${(userStockBalance[coin] || 0).toFixed(2)}(б) => ${balance.toFixed(2)}USDT`).join('\n');
  messageLog += `\n\nОбщий баланс: <b>${totalBalance.toFixed(2)}</b> USDT`;
  bot.sendMessage(user.chatId, messageLog, { parse_mode: 'HTML' });

  const marketStatsPercentage = calculateMarketStatsByPercentage(
    marketStats,
    user.strategy,
  );

  const userStatsPercentageBalance = calculateBybitStatsByPercentage(fullUserBalanceData);
  const calculatedDiffPercentage = calculateDiffPercentage(
    marketStatsPercentage,
    userStatsPercentageBalance,
  );

  const sortedDiffs = Object.entries(calculatedDiffPercentage)
    .sort((left, right) => left[1] - right[1])
    .filter(([key]) => key !== 'USDT');


  const userStockCoins = Object.keys(userStockBalance);
  const calculatedDiffValues = calculateDiffValues(sortedDiffs, totalBalance)
    .filter(({ key }) => userStockCoins.includes(key))
    .map(({key, value}) => value < 0 && Math.abs(value) > userStockBalance[key] ? { key, value: -userStockBalance[key] } : {key, value});

  messageLog = "<b>Вычислены действия:</b> \n";
  messageLog += calculatedDiffValues.sort((left, right) => right.value - left.value).map(({key, value}, index) => `${index + 1}) <i>${key}</i>: ${Math.abs(value).toFixed(2)}USDT (${value > 0 ? "покупка" : "продажа"})`).join('\n');
  bot.sendMessage(user.chatId, messageLog, { parse_mode: 'HTML' });

  const response = await Promise.all(
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

  const messageToSend = response
    .map(
      ({ key, value, message }) =>
        `${key}: <b>${Math.abs(value).toFixed(4)} USDT</b> ${value > 0 ? 'куплено' : 'продано'} (<i>${message}</i>)`,
    )
    .join('\n');
  bot.sendMessage(user.chatId, messageToSend, { parse_mode: 'HTML' });
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
