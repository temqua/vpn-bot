import TelegramBot from 'node-telegram-bot-api';
import env from './env';
export default new TelegramBot(env.BOT_TOKEN, { polling: true });
