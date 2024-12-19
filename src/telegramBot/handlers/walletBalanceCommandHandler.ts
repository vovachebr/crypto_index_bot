import { JSONFilePreset } from 'lowdb/node';
import TelegramBot from 'node-telegram-bot-api';
import { LowDB } from '../../types/coinmarketcapTypes';
import defaultDbData from '../../utils/defaultData';
import { bot } from '..';

export default async function walletBalanceCommandHandler(
  message: TelegramBot.Message,
) {
  const db = await JSONFilePreset<LowDB>('db.json', defaultDbData);
  db.read();
  const foundUser = db.data.users.find(
    ({ chatId }) => chatId === message.chat.id,
  );

  if (!foundUser) {
    return;
  }

  const balance = Object.entries(foundUser.personalWalletData || {}).map(([coin, value]) => `${coin}: ${value}`).join('\n');
  bot.sendMessage(message.chat.id, `Баланс кошелька вне биржи: \n${balance}`);
}
