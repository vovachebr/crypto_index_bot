import TelegramBot from 'node-telegram-bot-api';
import getUserWithValidation, { sendUserStats } from '../helpers';

export default async function balanceCommandHandler(
  message: TelegramBot.Message,
) {
  const user = await getUserWithValidation(message);
  if (!user || !user.apiKey || !user.apiSecret) {
    return;
  }

  sendUserStats(message, user);
}
