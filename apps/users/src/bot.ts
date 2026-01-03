import TelegramBot from 'node-telegram-bot-api';
import env from './env';
const isProduction = env.BOT_ENV === 'production';
const config = isProduction
	? {
			webHook: {
				port: 443,
				key: '/etc/ssl/certs/tg/key.pem',
				cert: '/etc/ssl/certs/tg/cert.pem',
			},
		}
	: { polling: true };

const bot = new TelegramBot(env.BOT_TOKEN, config);
if (isProduction) {
	bot.setWebHook(`${env.PUBLIC_URL}/bot${env.BOT_TOKEN}`);
}
export default bot;
