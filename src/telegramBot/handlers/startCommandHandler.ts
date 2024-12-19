import { JSONFilePreset } from 'lowdb/node';
import { bot } from '..';
import { LowDB } from '../../types/coinmarketcapTypes';
import defaultDbData from '../../utils/defaultData';
import TelegramBot from 'node-telegram-bot-api';
import { sendUserStats } from '../helpers';

export default async function startCommandHandler(
  message: TelegramBot.Message,
) {
  const db = await JSONFilePreset<LowDB>('db.json', defaultDbData);
  db.read();
  const foundUser = db.data.users.find(
    ({ chatId }) => chatId === message.chat.id,
  );

  if (!foundUser) {
    db.data.users.push({
      chatId: message.chat.id,
      name: message.from?.first_name,
      lastName: message.from?.last_name,
      login: message.from?.username,
      strategy: 'capitalization',
      countCoins: 20,
      apiKey: null,
      apiSecret: null,
    });
    db.write();
    bot.sendMessage(
      message.chat.id,
      'Вы успешно зарегистрированы. Добавьте ключи и можно пользоваться',
    );
  } else if (!foundUser.apiKey || !foundUser.apiSecret) {
    let messageText = 'Добавьте ключи и можно пользоваться.';
    messageText += '\nApi key: ' + (foundUser.apiKey ? '✅' : '❌');
    messageText += '\nApi secret: ' + (foundUser.apiSecret ? '✅' : '❌');
    bot.sendMessage(message.chat.id, messageText);
  } else {
    sendUserStats(message, foundUser);
  }
}
