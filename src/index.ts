import { CronJob } from 'cron';
import startTelegramBot, { bot } from './telegramBot';
import { rebalanceAction } from './bybit';
import { JSONFilePreset } from 'lowdb/node';
import { LowDB } from './types/coinmarketcapTypes';
import { defaultDbData } from './utils';

new CronJob('0 10 1 * *', async () => {
  // каждое первое число в 10:00
  const db = await JSONFilePreset<LowDB>('db.json', defaultDbData);
  db.data.users.forEach(async user => {
    const response = await rebalanceAction(user);
    if (response) {
      const messageToSend = response
        .map(
          ({ key, value, message }) =>
            `${key}: <b>${Math.abs(value).toFixed(4)} USDT</b> ${value > 0 ? 'куплено' : 'продано'} (<i>${message}</i>)`,
        )
        .join('\n');
      bot.sendMessage(user.chatId, messageToSend, { parse_mode: 'HTML' });
    }
  });
}).start();

startTelegramBot();
