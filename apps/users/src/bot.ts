import TelegramBot from 'node-telegram-bot-api';
import env from './env';
const isProduction = env.BOT_ENV === 'production';
const config = isProduction ? { webHook: { port: 8089, host: '127.0.0.1' } } : { polling: true };

const bot = new TelegramBot(env.BOT_TOKEN, config);
if (isProduction) {
	bot.setWebHook('https://telegram.tesseractnpv.com/webhook');
}
export default bot;
