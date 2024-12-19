import TelegramBot from 'node-telegram-bot-api';
import getUserWithValidation from '../helpers';
import { JSONFilePreset } from 'lowdb/node';
import { bot } from '..';
import { LowDB } from '../../types/coinmarketcapTypes';
import defaultDbData from '../../utils/defaultData';

export default async function toggleStrategyCommandHandler(
  message: TelegramBot.Message,
) {
  const user = await getUserWithValidation(message, false);
  if (!user) {
    return;
  }

  const db = await JSONFilePreset<LowDB>('db.json', defaultDbData);
  db.read();
  const newStrategy =
    user.strategy === 'capitalization' ? 'average' : 'capitalization';
  db.update(({ users }) =>
    users.forEach(userItem => {
      if (userItem.chatId === user.chatId) {
        userItem.strategy = newStrategy;
      }
    }),
  );

  const strategyTextName = {
    average: 'Равномерное распределение',
    capitalization: 'Рыночное распределение',
  };
  const responseText = `Стратегия изменена на <b>"${strategyTextName[newStrategy]}"</b>. Выполните ребалансировку для перераспределения баланса (/rebalance).`;
  bot.sendMessage(message.chat.id, responseText, { parse_mode: 'HTML' });
}
