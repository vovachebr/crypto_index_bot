import TelegramBot from 'node-telegram-bot-api';

import { config } from 'dotenv';
import startCommandHandler from './handlers/startCommandHandler';
import balanceCommandHandler from './handlers/balanceCommandHandler';
import statsCommandHandler from './handlers/statsCommandHandler';
import rebalanceCommandHandler from './handlers/rebalanceCommandHandler';
import setWalletBalanceCommandHandler from './handlers/setWalletBalanceCommandHandler';
import walletBalanceCommandHandler from './handlers/walletBalanceCommandHandler';
import setCoinsCountCommandHandler from './handlers/setCoinsCountCommandHandler';
import setApiKeyCommandHandler from './handlers/setApiKeyCommandHandler';
import setApiSecretCommandHandler from './handlers/setApiSecretCommandHandler';
import toggleStrategyCommandHandler from './handlers/toggleStrategyCommandHandler';
import totalCommandHandler from './handlers/totalCommandHandler';

config();

const { TELEGRAM_BOT_TOKEN } = process.env;

export const bot = new TelegramBot(String(TELEGRAM_BOT_TOKEN), {
  polling: true,
});

export default function startTelegramBot() {
  bot.onText(/\/start/, startCommandHandler);
  bot.onText(/\/balance/, balanceCommandHandler);
  bot.onText(/\/stats/, statsCommandHandler);
  bot.onText(/\/rebalance/, rebalanceCommandHandler);
  bot.onText(/\/set_wallet_balance/, setWalletBalanceCommandHandler);
  bot.onText(/\/wallet_balance/, walletBalanceCommandHandler);
  bot.onText(/\/set_coins_count/, setCoinsCountCommandHandler);
  bot.onText(/\/set_api_key/, setApiKeyCommandHandler);
  bot.onText(/\/set_api_secret/, setApiSecretCommandHandler);
  bot.onText(/\/toggle_strategy/, toggleStrategyCommandHandler);
  bot.onText(/\/total/, totalCommandHandler);
}
