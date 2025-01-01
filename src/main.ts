import type TelegramBot from 'node-telegram-bot-api';
import type { Message } from 'node-telegram-bot-api';
import { VPNCommand, VPNProtocol } from './core/enums';
import { ADMIN_USER_ID } from './env';
import bot from './services/bot';
import logger from './services/logger';
import { logsService } from './services/logs';
import { userService } from './services/user';
import { actions } from './services/actions';

const availableCommands = [
	/\/start/,
	/\/ping/,
	/\/vnstat(.*)/,
	/\/wg/,
	/\/user/,
	/\/user\s+create\s+wg\s+(.*)/,
	/\/user\s+create\s+ikev2\s+(.*)/,
	/\/user\s+create\s+outline\s+(.*)/,
	/\/user\s+delete\s+wg\s+(.*)/,
	/\/user\s+delete\s+ikev2\s+(.*)/,
	/\/user\s+delete\s+outline\s+(.*)/,
	/\/user\s+file\s+wg\s+(.*)/,
	/\/user\s+file\s+ikev2\s+(.*)/,
	/\/users\s+ikev2\s/,
	/\/users\s+wg/,
	/\/users\s+outline/,
];

const userHelpMessage = [VPNProtocol.IKE2, VPNProtocol.WG, VPNProtocol.Outline].reduce((acc, curr) => {
	const current = `
/user create ${curr} <username>
/user delete ${curr} <username> ${curr !== VPNProtocol.Outline ? '\n/user file ' + curr + ' <username>' : ''}
/users ${curr}
	`;
	return acc + current;
}, '');

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
	actions.handleMessage(msg);
	if (!actions.hasAction()) {
		const match = availableCommands.filter(regexp => regexp.test(msg.text));
		if (!match.length) {
			bot.sendMessage(msg.chat.id, 'Wrong command');
		}
	}
});

bot.onText(/\/user$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: 'Create IKEv2 User',
						callback_data: JSON.stringify({
							command: VPNCommand.Create,
							protocol: VPNProtocol.IKE2,
						}),
					},
					{
						text: 'Show IKEv2 Users',
						callback_data: JSON.stringify({
							command: VPNCommand.List,
							protocol: VPNProtocol.IKE2,
						}),
					},
					{
						text: 'Delete IKEv2 User',
						callback_data: JSON.stringify({
							command: VPNCommand.Delete,
							protocol: VPNProtocol.IKE2,
						}),
					},
				],
				[
					{
						text: 'Create WG User',
						callback_data: JSON.stringify({
							command: VPNCommand.Create,
							protocol: VPNProtocol.WG,
						}),
					},
					{
						text: 'Show WG Users',
						callback_data: JSON.stringify({
							command: VPNCommand.List,
							protocol: VPNProtocol.WG,
						}),
					},
					{
						text: 'Delete WG User',
						callback_data: JSON.stringify({
							command: VPNCommand.Delete,
							protocol: VPNProtocol.WG,
						}),
					},
				],
				[
					{
						text: 'Create Outline User',
						callback_data: JSON.stringify({
							command: VPNCommand.Create,
							protocol: VPNProtocol.Outline,
						}),
					},
					{
						text: 'Show Outline Users',
						callback_data: JSON.stringify({
							command: VPNCommand.List,
							protocol: VPNProtocol.Outline,
						}),
					},
					{
						text: 'Delete Outline User',
						callback_data: JSON.stringify({
							command: VPNCommand.Delete,
							protocol: VPNProtocol.Outline,
						}),
					},
				],
			],
		},
	};

	await bot.sendMessage(msg.chat.id, 'Select command:', inlineKeyboard);
	await bot.sendMessage(msg.chat.id, userHelpMessage);
});

bot.onText(/\/user\s+(create|delete|file)$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await bot.sendMessage(msg.chat.id, 'Wrong command');
});

bot.onText(/\/user\s+create\s+wg\s+(.*)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	const username = match[1];
	await userService.create(msg, username, VPNProtocol.WG);
});

bot.onText(/\/user\s+create\s+ikev2\s+(.*)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	const username = match[1];
	await userService.create(msg, username, VPNProtocol.IKE2);
});

bot.onText(/\/user\s+create\s+outline\s+(.*)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	const username = match[1];
	await userService.create(msg, username, VPNProtocol.Outline);
});

bot.onText(/\/user\s+create\s+(ikev2|wg|outline)$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await bot.sendMessage(msg.chat.id, 'Wrong command');
});

bot.onText(/\/user\s+delete\s+wg\s+(.*)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	const username = match[1];
	await userService.delete(msg, username, VPNProtocol.WG);
});

bot.onText(/\/user\s+delete\s+ikev2\s+(.*)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	const username = match[1];
	await userService.delete(msg, username, VPNProtocol.IKE2);
});

bot.onText(/\/user\s+delete\s+outline\s+(.*)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	const username = match[1];
	await userService.delete(msg, username, VPNProtocol.Outline);
});

bot.onText(/\/user\s+file\s+wg\s+(.*)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	const username = match[1];
	await userService.getFile(msg, username, VPNProtocol.WG);
});

bot.onText(/\/user\s+file\s+ikev2\s+(.*)/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	const username = match[1];
	await userService.getFile(msg, username, VPNProtocol.IKE2);
});

bot.onText(/\/users\s+ikev2/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	await userService.getAll(msg, VPNProtocol.IKE2);
});
bot.onText(/\/users\s+wg/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	await userService.getAll(msg, VPNProtocol.WG);
});

bot.onText(/\/users\s+outline/, async (msg: Message, match: RegExpMatchArray) => {
	if (!isAdmin(msg)) {
		return;
	}
	await userService.getAll(msg, VPNProtocol.Outline);
});

bot.onText(/\/users\s+(?!ikev2|wg)(.*)/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await bot.sendMessage(msg.chat.id, 'Wrong command');
});

bot.onText(/\/ping$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	logger.success('PONG');
	await bot.sendMessage(msg.chat.id, '✅ PONG');
});

bot.onText(/\/wg/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await logsService.wg(msg);
});

bot.on('callback_query', async query => {
	const data = query.data;
	actions.execute(JSON.parse(data), query.message);
});
