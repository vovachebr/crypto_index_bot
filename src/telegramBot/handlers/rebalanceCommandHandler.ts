import TelegramBot from 'node-telegram-bot-api';
import getUserWithValidation from '../helpers';
import { rebalanceAction } from '../../bybit';

export default async function rebalanceCommandHandler(
  message: TelegramBot.Message,
) {
  const user = await getUserWithValidation(message);
  if (!user || !user.apiKey || !user.apiSecret) {
    return;
  }

  rebalanceAction(user);
}
