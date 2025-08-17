import type { Message } from 'node-telegram-bot-api';
import bot from '../bot';
import { OutlineApiService } from '../entities/keys/outline/outline.api-service';
import { OutlineService } from '../entities/keys/outline/outline.service';
import { globalHandler, type CommandDetailCompressed, type CommandDetails } from '../global.handler';
import logger from '../logger';
import { logsService } from '../logs';
import { isAdmin } from '../utils';
import { keyHelpMessage } from './keys.commands';

const mainCommandsList = {
	metrics: {
		regexp: /\/metrics$/,
		docs: '/metrics — show outline server metrics',
	},
	ping: {
		regexp: /\/ping$/,
		docs: '/ping — test if bot working',
	},
	wg: {
		regexp: /\/wg$/,
		docs: '/wg — show server output for wg command',
	},
	wgCommand: {
		regexp: /\/wg\s+(.*)/,
		docs: '/wg <text> — execute server command wg with params and see output',
	},
};

const mainHelpMessage = Object.values(mainCommandsList)
	.map(c => c.docs)
	.join('\n');

bot.onText(/\/start/, async (msg: Message) => {
	logger.success('Ready');
	if (!isAdmin(msg)) {
		return;
	}
	await bot.sendMessage(msg.chat.id, '✅ Ready');
	await bot.sendMessage(msg.chat.id, mainHelpMessage);
	await bot.sendMessage(msg.chat.id, keyHelpMessage);
});

bot.on('message', async (msg: Message) => {
	logger.log(
		`${msg?.from?.id ?? 'unknown user id'} (${msg?.from?.first_name ?? 'unknown user first name'}) — ${msg.text}`,
	);

	if (msg.text && ['cancel', 'Cancel'].includes(msg.text)) {
		await bot.sendMessage(msg.chat.id, 'Отправлена команда отмены всех других команд');
		globalHandler.finishCommand();
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

bot.on('callback_query', async query => {
	if (typeof query === 'undefined') {
		logger.error('query is undefined');
		return;
	}
	if (typeof query.data === 'undefined') {
		logger.error('query.data is undefined');
		return;
	}
	if (typeof query.message === 'undefined') {
		logger.error('query.message is undefined');
		return;
	}
	const callbackDataString = query.data;
	const parsed: CommandDetailCompressed = JSON.parse(callbackDataString);
	const data: CommandDetails = {
		scope: parsed.s,
		context: parsed.c,
		processing: Boolean(parsed.p),
	};
	globalHandler.execute(data, query.message);
});

bot.onText(mainCommandsList.ping.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	logger.success('PONG');
	await bot.sendMessage(msg.chat.id, '✅ PONG');
});

bot.onText(mainCommandsList.wg.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await logsService.wg(msg, '');
});

bot.onText(mainCommandsList.wgCommand.regexp, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	await logsService.wg(msg, ` ${match[1]}`);
});

bot.onText(mainCommandsList.metrics.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const outlineService = new OutlineService(new OutlineApiService());
	outlineService.getMetrics(msg);
});
