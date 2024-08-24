import type TelegramBot from 'node-telegram-bot-api';
import type { Message } from 'node-telegram-bot-api';
import bot from './services/bot';
import logger from './services/logger';
import { ADMIN_USER_ID } from './env';

const availableCommands = [
	/\/start/,
	/\/user\s+create\s+(.*)/,
	/\/user\s+delete\s+(.*)/,
	/\/user\s+delete\s+(.*)/,
	/\/user\s+file\s+(.*)/,
];

const isAdmin = (msg: Message): boolean => {
	return msg.from.id === ADMIN_USER_ID;
};

bot.onText(/\/start/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	logger.success('Ready');
	bot.sendMessage(msg.chat.id, '✅ Ready');
});

bot.on('message', async (msg: Message, metadata: TelegramBot.Metadata) => {
	logger.log(`${msg.from.id} (${msg.from.first_name}) — ${msg.text}`);
    if (msg.from.id !== ADMIN_USER_ID) {
		await bot.sendMessage(msg.chat.id, 'Forbidden');
        return;
	}
	const match = availableCommands.filter(regexp => regexp.test(msg.text));
	if (!match.length) {
		bot.sendMessage(msg.chat.id, 'Wrong command');
	}
});

bot.onText(/\/user\s+create\s+(.*)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	const vpnUsername = match[1];
	await bot.sendMessage(msg.chat.id, `You trying to create user ${vpnUsername}`);
});

bot.onText(/\/user\s+delete\s+(.*)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	logger.log(`/user delete ${match[1]}`);
	const vpnUsername = match[1];
	await bot.sendMessage(msg.chat.id, `You trying to delete user ${vpnUsername}`);
});

bot.onText(/\/user\s+file\s+(.*)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	logger.log(`/user file ${match[1]}`);
	const vpnUsername = match[1];
	await bot.sendMessage(msg.chat.id, `You trying to get file for user ${vpnUsername}`);
});
