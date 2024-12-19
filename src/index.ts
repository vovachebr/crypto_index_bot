import { CronJob } from 'cron';
import startTelegramBot from './telegramBot';
import { rebalanceAction } from './bybit';
import { JSONFilePreset } from 'lowdb/node';
import { LowDB } from './types/coinmarketcapTypes';
import defaultDbData from './utils/defaultData';

new CronJob('0 10 1 * *', async () => {
  // каждое первое число в 10:00
  const db = await JSONFilePreset<LowDB>('db.json', defaultDbData);
  db.data.users.forEach(user => rebalanceAction(user));
}).start();

startTelegramBot();
