import { JSONFilePreset } from 'lowdb/node';
import { LowDB } from '../../types/coinmarketcapTypes';
import defaultDbData from '../../utils/defaultData';
import TelegramBot from 'node-telegram-bot-api';
import { bot } from '..';

export default async function setWalletBalanceCommandHandler(
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

  try{
    if (!message.text) {
      throw new Error('Message text is undefined');
    }
    const walletBalanceArray = message.text.slice(message.text.indexOf('\n') + 1).split('\n');
    const walletBalance = walletBalanceArray.reduce((acc: Record<string, number>, coinData) => {
      const [coin, value] = coinData.split(':');
      if(!coin || !value || !Number(value.trim())) {
        throw new Error(`Неверный формат данных: ${coinData}`);
      }
      return {
        ...acc,
        [coin.trim()]: Number(value.trim()),
      };
    }, {});

    console.log(walletBalance);
    const db = await JSONFilePreset<LowDB>('db.json', defaultDbData);
    db.read();
    db.update(({ users }) =>
      users.forEach(userItem => {
        if (userItem.chatId === foundUser.chatId) {
          userItem.personalWalletData = walletBalance;
        }
      }),
    );

    bot.sendMessage(message.chat.id, `Баланс личного кошелька успешно установлен. Вы можете его проверить с помощью /walletBalance`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      bot.sendMessage(message.chat.id, error.message);
    }
  }


}
