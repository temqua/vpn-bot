import ms from 'ms';
import type { Message } from 'node-telegram-bot-api';
import bot from '../bot';
import { findUserButtons, userButtons } from '../entities/users/users.buttons';
import { usersService } from '../entities/users/users.service';
import { CmdCode, CommandScope, VPNUserCommand } from '../enums';
import env from '../env';
import { globalHandler } from '../global.handler';
import { isAdmin } from '../utils';
import TelegramBot from 'node-telegram-bot-api';

export const userCommandsList = {
	user: {
		regexp: /\/user$/,
		docs: '/user — show user commands',
	},
	users: {
		regexp: /\/users$/,
		docs: '/users — show users',
	},
	unpaid: {
		regexp: /\/users*\s+unpaid$/,
		docs: '/user(s) unpaid — show users with expired vpn subscription',
	},
	trial: {
		regexp: /\/users*\s+trial$/,
		docs: '/user(s) trial — show users with trial mode (created less than 20 days ago)',
	},
	create: {
		regexp: /\/user\s+create$/,
		docs: '/user create — show commands for creating user',
	},
	delete: {
		regexp: /\/user\s+delete$/,
		docs: '/user delete — show commands for deleting user',
	},
	sync: {
		regexp: /\/users*\s+sync/,
		docs: '/user(s) sync — sync users',
	},
	pay: {
		regexp: /\/user\s+pay/,
		docs: '/user pay — user payment command',
	},
	findUser: {
		regexp: /@(.*)/,
		docs: '@<id/username> — get user by id/username',
	},
};

export const userHelpMessage = Object.values(userCommandsList)
	.map(c => c.docs)
	.join('\n');

bot.onText(userCommandsList.findUser.regexp, async (msg: Message, match: RegExpMatchArray | null) => {
	if (!isAdmin(msg)) {
		return;
	}
	if (globalHandler.hasActiveCommand()) {
		return;
	}
	const data = match[1];
	const command = isNaN(Number(data)) ? VPNUserCommand.FindByUsername : VPNUserCommand.FindById;
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				[CmdCode.Command]: command,
				id: match[1],
			},
			processing: true,
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(userCommandsList.user.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const findUsersKeyboard = {
		reply_markup: {
			inline_keyboard: findUserButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Find user by', findUsersKeyboard);
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: userButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Select command:', inlineKeyboard);
});

bot.onText(userCommandsList.users.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				[CmdCode.Command]: VPNUserCommand.List,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(userCommandsList.unpaid.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				[CmdCode.Command]: VPNUserCommand.ShowUnpaid,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(userCommandsList.create.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				[CmdCode.Command]: VPNUserCommand.Create,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(userCommandsList.delete.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				[CmdCode.Command]: VPNUserCommand.Delete,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(userCommandsList.sync.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await usersService.export(msg);
});

bot.onText(userCommandsList.pay.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				[CmdCode.Command]: VPNUserCommand.Pay,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(userCommandsList.trial.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				[CmdCode.Command]: VPNUserCommand.ShowTrial,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});
