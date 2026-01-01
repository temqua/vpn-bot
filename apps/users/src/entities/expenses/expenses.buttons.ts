import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { CmdCode, CommandScope, ExpenseCommand } from '../../enums';
import { ExpenseCategory } from '@prisma/client';

export const expensesButtons: InlineKeyboardButton[][] = [
	[
		{
			text: 'Show All',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Expenses,
				[CmdCode.Context]: {
					[CmdCode.Command]: ExpenseCommand.List,
				},
			}),
		},
		{
			text: 'Show Sum',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Expenses,
				[CmdCode.Context]: {
					[CmdCode.Command]: ExpenseCommand.Sum,
				},
			}),
		},
	],
	[
		{
			text: 'Show Nalog Sum',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Expenses,
				[CmdCode.Context]: {
					[CmdCode.Command]: ExpenseCommand.Sum,
					category: ExpenseCategory.Nalog,
				},
			}),
		},
		{
			text: 'Show Servers Sum',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Expenses,
				[CmdCode.Context]: {
					[CmdCode.Command]: ExpenseCommand.Sum,
					category: ExpenseCategory.Servers,
				},
			}),
		},
	],
	[
		{
			text: 'Create',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Expenses,
				[CmdCode.Context]: {
					[CmdCode.Command]: ExpenseCommand.Create,
				},
			}),
		},
		{
			text: 'Delete',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Expenses,
				[CmdCode.Context]: {
					[CmdCode.Command]: ExpenseCommand.Delete,
				},
			}),
		},
	],
];
