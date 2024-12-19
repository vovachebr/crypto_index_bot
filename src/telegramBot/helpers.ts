import { JSONFilePreset } from 'lowdb/node';
import TelegramBot from 'node-telegram-bot-api';
import { bot } from '.';
import { LowDB, UserDBRecord } from '../types/coinmarketcapTypes';
import defaultDbData from '../utils/defaultData';
import { getUserAccountBalance } from '../bybit';
import { getCoinmarketcapStats } from '../coinmarketcap';
import calculateMarketStatsByPercentage from '../utils/calculateMarketStatsByPercentage';

export default async function getUserWithValidation(
  message: TelegramBot.Message,
  checkKeys = true,
) {
  const db = await JSONFilePreset<LowDB>('db.json', defaultDbData);
  const foundUser = db.data.users.find(
    ({ chatId }) => chatId === message.chat.id,
  );
  if (!foundUser) {
    bot.sendMessage(message.chat.id, 'Пользователь не найден');
    return;
  }

  if (checkKeys && (!foundUser.apiKey || !foundUser.apiSecret)) {
    let messageText = 'Добавьте ключи и можно пользоваться.';
    messageText += '\nApi key: ' + (foundUser.apiKey ? '✅' : '❌');
    messageText += '\nApi secret: ' + (foundUser.apiSecret ? '✅' : '❌');
    bot.sendMessage(message.chat.id, messageText);
    return;
  }

  return foundUser;
}

export async function sendUserStats(
  message: TelegramBot.Message,
  user: UserDBRecord,
) {
  if (!user || !user.apiKey || !user.apiSecret) {
    return;
  }

  try {
    const userBalance = await getUserAccountBalance(
      user.apiKey,
      user.apiSecret,
    );

    const totalBalance = Object.values(userBalance || {}).reduce(
      (acc, balance) => acc + balance,
      0,
    );

    const coinsStats = await getCoinmarketcapStats(user.countCoins);
    const coinsStatsPercents = calculateMarketStatsByPercentage(
      coinsStats,
      user.strategy,
    );

    let responseText = `Общий баланс: <b>${totalBalance.toFixed(3)}</b> USDT \n\n`;
    responseText += Object.entries(userBalance)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([key, value], index) =>
          `${index + 1}) <i>${key}</i>: <b>${value.toFixed(3)}</b> USDT (${((value / totalBalance) * 100).toFixed(2)}% => ${coinsStatsPercents[key] || 0}%)`,
      )
      .join('\n');

    bot.sendMessage(message.chat.id, responseText, { parse_mode: 'HTML' });
  } catch (error: unknown) {
    bot.sendMessage(message.chat.id, (error as Error).message);
  }
}
