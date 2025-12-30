import type { Message } from 'node-telegram-bot-api';
import bot from '../bot';
import { serversButtons } from '../entities/servers/servers.buttons';
import { CmdCode, CommandScope, ServerCommand } from '../enums';
import { globalHandler } from '../global.handler';
import { isAdmin } from '../utils';
import TelegramBot from 'node-telegram-bot-api';

export const serversCommandsList = {
	menu: {
		regexp: /\/server$/,
		docs: '/server — show servers menu',
	},
	all: {
		regexp: /\/servers$/,
		docs: '/servers — show servers list',
	},
	create: {
		regexp: /\/server create$/,
		docs: '/server create — create new server',
	},
	delete: {
		regexp: /\/server delete$/,
		docs: '/server delete — delete server',
	},
};

export const serversHelpMessage = Object.values(serversCommandsList)
	.map(c => c.docs)
	.join('\n');

bot.onText(serversCommandsList.menu.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: serversButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Select operation', inlineKeyboard);
});

bot.onText(serversCommandsList.all.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}

	globalHandler.execute(
		{
			scope: CommandScope.Servers,
			context: {
				[CmdCode.Command]: ServerCommand.List,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(serversCommandsList.create.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Servers,
			context: {
				[CmdCode.Command]: ServerCommand.Create,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(serversCommandsList.delete.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Servers,
			context: {
				[CmdCode.Command]: ServerCommand.Delete,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});
