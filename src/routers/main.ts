import type TelegramBot from 'node-telegram-bot-api';
import type { Message } from 'node-telegram-bot-api';
import { isAdmin } from '../core';
import { actions } from '../core/actions';
import { VPNProtocol } from '../core/enums';
import logger from '../core/logger';
import bot from '../services/bot';
import { logsService } from '../services/logs';
import { paymentsService } from '../services/payments';
const availableCommands = [
	/\/start/,
	/\/ping/,
	/\/user/,
	/\/user\s+create/,
	/\/user\s+create\s+wg\s+(.*)/,
	/\/user\s+create\s+ikev2\s+(.*)/,
	/\/user\s+create\s+outline\s+(.*)/,
	/\/user\s+delete\s+wg\s+(.*)/,
	/\/user\s+delete\s+ikev2\s+(.*)/,
	/\/user\s+delete\s+outline\s+(.*)/,
	/\/user\s+file\s+wg\s+(.*)/,
	/\/user\s+file\s+ikev2\s+(.*)/,
	/\/users/,
	/\/users\s+ikev2/,
	/\/users\s+wg/,
	/\/users\s+outline/,
	/\/wg/,
];

const userHelpMessage = [VPNProtocol.IKE2, VPNProtocol.WG, VPNProtocol.Outline].reduce((acc, curr) => {
	const current = `
/user create ${curr} <username>
/user delete ${curr} <username> ${curr !== VPNProtocol.Outline ? '\n/user file ' + curr + ' <username>' : ''}
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

	if (actions.hasAction()) {
		actions.handleMessage(msg);
		return;
	}
	if (msg.user_shared) {
		await bot.sendMessage(msg.chat.id, 'User ID: ' + msg.user_shared.user_id);
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

bot.on('callback_query', async query => {
	const data = query.data;
	actions.execute(JSON.parse(data), query.message);
});
