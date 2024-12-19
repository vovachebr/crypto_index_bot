import { JSONFilePreset } from 'lowdb/node';
import TelegramBot from 'node-telegram-bot-api';
import { bot } from '..';
import { LowDB } from '../../types/coinmarketcapTypes';
import defaultDbData from '../../utils/defaultData';
import getUserWithValidation from '../helpers';

export default async function setApiSecretCommandHandler(
  message: TelegramBot.Message,
) {
  const user = await getUserWithValidation(message, false);
  if (!user) {
    return;
  }

  const [, apiSecret] = (message.text || '').split(' ');
  if (!apiSecret) {
    bot.sendMessage(message.chat.id, `Токен отсутствует`);
    return;
  }

  const db = await JSONFilePreset<LowDB>('db.json', defaultDbData);
  db.read();
  db.update(({ users }) =>
    users.forEach(userItem => {
      if (userItem.chatId === user.chatId) {
        userItem.apiSecret = apiSecret;
      }
    }),
  );

  bot.sendMessage(message.chat.id, `ApiSecret обновлён.`);
}
