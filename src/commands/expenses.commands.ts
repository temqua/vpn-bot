import { ExpenseCategory } from '@prisma/client';
import type { Message } from 'node-telegram-bot-api';
import { isAdmin } from '../core';
import bot from '../core/bot';
import { CmdCode, CommandScope, ExpenseCommand } from '../core/enums';
import { globalHandler } from '../core/global.handler';

export const expenseCommandsList = {
	all: {
		regexp: /\/expenses$/,
		docs: '/expenses — show expenses list',
	},
	sum: {
		regexp: /\/expenses\s+sum$/,
		docs: '/expenses sum — show sum of expenses',
	},
	nalogSum: {
		regexp: /\/expenses\s+nalog\s+sum$/,
		docs: '/expenses nalog sum — show sum of nalog expenses',
	},
	serversSum: {
		regexp: /\/expenses\s+servers\s+sum$/,
		docs: '/expenses servers sum — show sum of server expenses',
	},
	create: {
		regexp: /\/expense$/,
		docs: '/expense — create expense',
	},
	createNalog: {
		regexp: /\/expense\s+nalog/,
		docs: '/expense nalog — create nalog expense',
	},
	createServer: {
		regexp: /\/expense\s+servers/,
		docs: '/expense servers — create servers expense',
	},
};

export const expenseHelpMessage = Object.values(expenseCommandsList)
	.map(c => c.docs)
	.join('\n');

bot.onText(expenseCommandsList.all.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}

	globalHandler.execute(
		{
			scope: CommandScope.Expenses,
			context: {
				[CmdCode.Command]: ExpenseCommand.List,
			},
		},
		msg,
	);
});

bot.onText(expenseCommandsList.sum.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Expenses,
			context: {
				[CmdCode.Command]: ExpenseCommand.Sum,
			},
		},
		msg,
	);
});

bot.onText(expenseCommandsList.nalogSum.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Expenses,
			context: {
				[CmdCode.Command]: ExpenseCommand.Sum,
				category: ExpenseCategory.Nalog,
			},
		},
		msg,
	);
});

bot.onText(expenseCommandsList.serversSum.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Expenses,
			context: {
				[CmdCode.Command]: ExpenseCommand.Sum,
				category: ExpenseCategory.Servers,
			},
		},
		msg,
	);
});

bot.onText(expenseCommandsList.create.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Expenses,
			context: {
				[CmdCode.Command]: ExpenseCommand.Create,
			},
		},
		msg,
	);
});

bot.onText(expenseCommandsList.createNalog.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Expenses,
			context: {
				category: ExpenseCategory.Nalog,
				[CmdCode.Command]: ExpenseCommand.Create,
			},
		},
		msg,
	);
});

bot.onText(expenseCommandsList.createServer.regexp, async (msg: Message) => {
	if (!isAdmin(msg)) {
		return;
	}
	globalHandler.execute(
		{
			scope: CommandScope.Expenses,
			context: {
				category: ExpenseCategory.Servers,
				[CmdCode.Command]: ExpenseCommand.Create,
			},
		},
		msg,
	);
});
