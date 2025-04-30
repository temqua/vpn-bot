import type { Message } from 'node-telegram-bot-api';
import { isAdmin } from '../core';
import bot from '../core/bot';
import { findUserButtons, userButtons } from '../core/buttons';
import { CommandScope, VPNUserCommand } from '../core/enums';
import { globalHandler } from '../core/global.handler';
import { usersService } from '../entities/users/users.service';
import env from '../env';
import ms from 'ms';

bot.onText(/\/user$/, async (msg: Message) => {
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

bot.onText(/\/users$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				cmd: VPNUserCommand.List,
			},
		},
		msg,
	);
});

bot.onText(/\/users\s+unpaid$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				cmd: VPNUserCommand.ShowUnpaid,
			},
		},
		msg,
	);
});

bot.onText(/\/user\s+create$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				cmd: VPNUserCommand.Create,
			},
		},
		msg,
	);
});

bot.onText(/\/user\s+delete$/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				cmd: VPNUserCommand.Delete,
			},
		},
		msg,
	);
});

bot.onText(/\/users\s+sync/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	await usersService.export(msg);
});

bot.onText(/\/user\s+pay/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				cmd: VPNUserCommand.Pay,
			},
		},
		msg,
	);
});

bot.onText(/\/user\s+unpaid/, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				cmd: VPNUserCommand.ShowUnpaid,
			},
		},
		msg,
	);
});

setInterval(() => {
	globalHandler.execute(
		{
			scope: CommandScope.Users,
			context: {
				cmd: VPNUserCommand.ShowUnpaid,
			},
		},
		{
			chat: {
				id: env.ADMIN_USER_ID,
			},
		} as Message,
	);
}, ms('1d'));
