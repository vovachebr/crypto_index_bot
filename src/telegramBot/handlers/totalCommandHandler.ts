import TelegramBot from 'node-telegram-bot-api';
import getUserWithValidation from '../helpers';
import { JSONFilePreset } from 'lowdb/node';
import { LowDB } from '../../types/coinmarketcapTypes';
import defaultDbData from '../../utils/defaultData';
import { getUserAccountBalance } from '../../bybit';
import { bot } from '..';

const ownerChatId = 397942043;

export default async function toggleStrategyCommandHandler(
  message: TelegramBot.Message,
) {
  const user = await getUserWithValidation(message);
  if (!user || user.chatId !== ownerChatId) {
    return;
  }

  const strategyTextName = {
    average: 'Равномерное распределение',
    capitalization: 'Рыночное распределение',
  };

  const db = await JSONFilePreset<LowDB>('db.json', defaultDbData);
  db.read();
  db.data.users.forEach(async user => {
    let userText = `Пользователь: ${user.name} ${user.lastName} (${user.login})\n`;
    userText += `Стратегия: <b>${strategyTextName[user.strategy]}</b>\n`;
    userText += `Кол-во монет: <b>${user.countCoins}</b>\n`;
    try {
      const userBalance = await getUserAccountBalance(
        String(user.apiKey),
        String(user.apiSecret),
      );

      const totalBalance = Object.values(userBalance || {}).reduce(
        (acc, balance) => acc + balance,
        0,
      );

      const responseText = `Баланс: <b>${totalBalance.toFixed(3)}</b> USDT \n\n`;
      userText +=
        responseText +
        Object.entries(userBalance)
          .map(
            ([key, value], index) =>
              `${index + 1}) <i>${key}</i>: <b>${value.toFixed(3)}</b> USDT`,
          )
          .join('\n');
    } catch (error: any) {
      userText += error?.message;
    }

    bot.sendMessage(message.chat.id, userText, { parse_mode: 'HTML' });
  });
}
