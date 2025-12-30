import type { Message } from 'node-telegram-bot-api';
import bot from '../bot';
import { plansButtons } from '../entities/plans/plans.buttons';
import { CmdCode, CommandScope, PlanCommand } from '../enums';
import { globalHandler } from '../global.handler';
import { isAdmin } from '../utils';
import TelegramBot from 'node-telegram-bot-api';

export const plansCommandsList = {
	menu: {
		regexp: /\/plan$/,
		docs: '/plan — show plans menu',
	},
	all: {
		regexp: /\/plans$/,
		docs: '/plans — show users plans',
	},
	create: {
		regexp: /\/plan create$/,
		docs: '/plan create — create new plan',
	},
	delete: {
		regexp: /\/plan delete$/,
		docs: '/plan delete — delete plan',
	},
};

export const plansHelpMessage = Object.values(plansCommandsList)
	.map(c => c.docs)
	.join('\n');

bot.onText(plansCommandsList.menu.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	const inlineKeyboard = {
		reply_markup: {
			inline_keyboard: plansButtons,
		},
	};
	await bot.sendMessage(msg.chat.id, 'Select operation', inlineKeyboard);
});

bot.onText(plansCommandsList.all.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}

	globalHandler.execute(
		{
			scope: CommandScope.Plans,
			context: {
				cmd: PlanCommand.List,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(plansCommandsList.create.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Plans,
			context: {
				cmd: PlanCommand.Create,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});

bot.onText(plansCommandsList.delete.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Plans,
			context: {
				[CmdCode.Command]: PlanCommand.Delete,
			},
		},
		{
			message: msg,
		} as TelegramBot.CallbackQuery,
	);
});
