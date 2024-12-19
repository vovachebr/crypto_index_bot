import TelegramBot from 'node-telegram-bot-api';
import getUserWithValidation from '../helpers';
import { rebalanceAction } from '../../bybit';
import { bot } from '..';

export default async function rebalanceCommandHandler(
  message: TelegramBot.Message,
) {
  const user = await getUserWithValidation(message);
  if (!user || !user.apiKey || !user.apiSecret) {
    return;
  }

  const response = await rebalanceAction(user);
  if (response) {
    const messageToSend = response
      .map(
        ({ key, value, message }) =>
          `${key}: <b>${Math.abs(value).toFixed(4)} USDT</b> ${value > 0 ? 'куплено' : 'продано'} (<i>${message}</i>)`,
      )
      .join('\n');
    bot.sendMessage(message.chat.id, messageToSend, { parse_mode: 'HTML' });
  }
}
