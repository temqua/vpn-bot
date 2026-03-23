import TelegramBot from 'node-telegram-bot-api';
import env from './env';
import logger from './logger';
const isProduction = env.BOT_ENV === 'production';
const config = isProduction
	? {
			webHook: {
				port: env.HOOK_PORT,
			},
		}
	: { polling: true };

const bot = new TelegramBot(env.BOT_TOKEN, config);
if (isProduction) {
	bot.setWebHook(`${env.PUBLIC_URL}/bot${env.BOT_TOKEN}`);
}
logger.success('Succesfully initialized bot');
export default bot;
