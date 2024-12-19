import { JSONFilePreset } from 'lowdb/node';
import TelegramBot from 'node-telegram-bot-api';
import { bot } from '..';
import { LowDB } from '../../types/coinmarketcapTypes';
import defaultDbData from '../../utils/defaultData';
import getUserWithValidation from '../helpers';

export default async function setCoinsCountCommandHandler(
  message: TelegramBot.Message,
) {
  const user = await getUserWithValidation(message, false);
  if (!user) {
    return;
  }

  const [, coinsCount] = (message.text || '').split(' ');
  if (!coinsCount) {
    bot.sendMessage(message.chat.id, `Введите количество монет`);
    return;
  }

  if (Number(coinsCount) > 50 || Number(coinsCount) < 1) {
    bot.sendMessage(message.chat.id, `Значение должно быть от 1 до 50`);
    return;
  }

  const db = await JSONFilePreset<LowDB>('db.json', defaultDbData);
  db.read();

  db.update(({ users }) =>
    users.forEach(userItem => {
      if (userItem.chatId === user.chatId) {
        userItem.countCoins = Number(coinsCount);
      }
    }),
  );

  bot.sendMessage(
    message.chat.id,
    `Количество отслеживаемых монет изменено: ${coinsCount}`,
  );
}
