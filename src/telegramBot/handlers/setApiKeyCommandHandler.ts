import { JSONFilePreset } from 'lowdb/node';
import TelegramBot from 'node-telegram-bot-api';
import { bot } from '..';
import { LowDB } from '../../types/coinmarketcapTypes';
import { defaultDbData } from '../../utils';
import getUserWithValidation from '../helpers';

export default async function setApiKeyCommandHandler(
  message: TelegramBot.Message,
) {
  const user = await getUserWithValidation(message, false);
  if (!user) {
    return;
  }

  const [, apiKey] = (message.text || '').split(' ');
  if (!apiKey) {
    bot.sendMessage(message.chat.id, `Токен отсутствует`);
    return;
  }

  const db = await JSONFilePreset<LowDB>('db.json', defaultDbData);
  db.read();
  db.update(({ users }) =>
    users.forEach(userItem => {
      if (userItem.chatId === user.chatId) {
        userItem.apiKey = apiKey;
      }
    }),
  );

  bot.sendMessage(message.chat.id, `ApiKey обновлён.`);
}