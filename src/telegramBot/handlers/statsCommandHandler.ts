import TelegramBot from 'node-telegram-bot-api';
import getUserWithValidation from '../helpers';
import { getCoinmarketcapStats } from '../../coinmarketcap';
import { bot } from '..';
import calculateMarketStatsByPercentage from '../../utils/calculateMarketStatsByPercentage';

export default async function statsCommandHandler(
  message: TelegramBot.Message,
) {
  const user = await getUserWithValidation(message);
  if (!user || !user.apiKey || !user.apiSecret) {
    return;
  }

  const coinsStats = await getCoinmarketcapStats(user.countCoins);
  const coinsStatsPercentage = calculateMarketStatsByPercentage(
    coinsStats,
    user.strategy,
  );

  const textToSend = Object.entries(coinsStatsPercentage)
    .map(([coin, percentage]) => `<i>${coin}</i>: <b>${percentage}%</b>`)
    .join('\n');
  bot.sendMessage(message.chat.id, textToSend, { parse_mode: 'HTML' });
}
