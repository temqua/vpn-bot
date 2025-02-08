import type TelegramBot from 'node-telegram-bot-api';
import type { Message } from 'node-telegram-bot-api';
import { isAdmin } from '../core';
import bot from '../core/bot';
import { getUserContactKeyboard } from '../core/buttons';
import { UserRequest, VPNProtocol } from '../core/enums';
import { globalHandler, type CommandDetailCompressed, type CommandDetails } from '../core/globalHandler';
import logger from '../core/logger';
import { logsService } from '../core/logs';

const keysHelpMessage = Object.values(VPNProtocol)
	.filter(p => p !== VPNProtocol.Outline)
	.reduce((acc, curr) => {
		const current = `
/key create ${curr}
/key create ${curr} <username>
/key delete ${curr}
/key delete ${curr} <username> 
/key file ${curr} <username>
/keys ${curr}
	`;
		return acc + current;
	}, '');

const startMessage = `
/keys
/key
/key create
${keysHelpMessage}
/key create outline
/key delete outline
/keys outline
/user
/user create
/user delete
/user pay
/users
/users sync
`;

bot.onText(/\/start/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	logger.success('Ready');
	await bot.sendMessage(msg.chat.id, '✅ Ready');
	await bot.sendMessage(msg.chat.id, startMessage);
});

bot.on('message', async (msg: Message, metadata: TelegramBot.Metadata) => {
	logger.log(`${msg.from.id} (${msg.from.first_name}) — ${msg.text}`);
	if (!isAdmin(msg)) {
		await bot.sendMessage(msg.chat.id, 'Forbidden');
		return;
	}

	if (globalHandler.hasActiveCommand()) {
		globalHandler.handleNewMessage(msg);
		return;
	}
	if (msg.user_shared) {
		await bot.sendMessage(msg.chat.id, `User id: ${msg.user_shared.user_id}`);
		globalHandler.handleNewMessage(msg);
	}
});

bot.onText(/\/ping$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	logger.success('PONG');
	await bot.sendMessage(msg.chat.id, '✅ PONG');
});

bot.onText(/\/wg$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await logsService.wg(msg);
});

bot.onText(/\/lookup/, async (msg: Message) => {
	await bot.sendMessage(msg.chat.id, 'Share user:', {
		reply_markup: getUserContactKeyboard(UserRequest.Lookup),
	});
});

bot.on('poll', p => {
	globalHandler.handlePoll(p);
});

bot.on('callback_query', async query => {
	const callbackDataString = query.data;
	const parsed: CommandDetailCompressed = JSON.parse(callbackDataString);
	const data: CommandDetails = {
		scope: parsed.s,
		context: parsed.c,
		processing: Boolean(parsed.p),
	};
	globalHandler.execute(data, query.message);
});
