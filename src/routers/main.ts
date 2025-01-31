import type TelegramBot from 'node-telegram-bot-api';
import type { Message } from 'node-telegram-bot-api';
import { isAdmin } from '../core';
import { VPNProtocol } from '../core/enums';
import { globalHandler, type CommandDetails } from '../core/globalHandler';
import logger from '../core/logger';
import bot from '../core/bot';
import { logsService } from '../core/logs';

const userHelpMessage = Object.values(VPNProtocol)
	.filter(p => p !== VPNProtocol.Outline)
	.reduce((acc, curr) => {
		const current = `
/user create ${curr} <username>
/user delete ${curr} <username> 
/user file ${curr} <username>
/users ${curr}
	`;
		return acc + current;
	}, '');

bot.onText(/\/start/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	logger.success('Ready');
	const helpMessage = `
/users
/user create
${userHelpMessage}
`;
	await bot.sendMessage(msg.chat.id, '✅ Ready');
	await bot.sendMessage(msg.chat.id, helpMessage);
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
		globalHandler.handleNewMessage(msg);
	}
	// const match = availableCommands.filter(regexp => regexp.test(msg.text));
	// if (!match.length) {
	// 	await bot.sendMessage(msg.chat.id, 'Wrong command');
	// }
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

bot.onText(/\/poll-device$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await bot.sendPoll(msg.chat.id, 'Desktop OS', ['Windows', 'Linux', 'macOS'], {
		allows_multiple_answers: true,
	});
});

bot.onText(/\/poll-protocol$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await bot.sendPoll(msg.chat.id, 'VPN Protocol', ['IKEv2', 'WireGuard', 'Outline'], {
		allows_multiple_answers: true,
	});
});

bot.on('poll', p => {
	console.dir(p);
});

bot.on('callback_query', async query => {
	const callbackDataString = query.data;
	const parsed = JSON.parse(callbackDataString);
	const data: CommandDetails = {
		scope: parsed.s,
		context: parsed.c,
		processing: Boolean(parsed.p),
	};
	globalHandler.execute(data, query.message);
});
