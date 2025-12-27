import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { CmdCode, CommandScope, PaymentCommand } from '../../enums';

export const paymentButtons: InlineKeyboardButton[][] = [
	[
		{
			text: 'Find by ID',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Payments,
				[CmdCode.Context]: {
					cmd: PaymentCommand.GetById,
				},
			}),
		},
		{
			text: 'Find by Date',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Payments,
				[CmdCode.Context]: {
					cmd: PaymentCommand.FindByDate,
				},
			}),
		},
		{
			text: 'Find by Date Range',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Payments,
				[CmdCode.Context]: {
					cmd: PaymentCommand.FindByDateRange,
				},
			}),
		},
	],
	[
		{
			text: 'Show All',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Payments,
				[CmdCode.Context]: {
					cmd: PaymentCommand.List,
				},
			}),
		},
		{
			text: 'Show Sum',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Payments,
				[CmdCode.Context]: {
					cmd: PaymentCommand.Sum,
				},
			}),
		},
		{
			text: 'Delete',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Payments,
				[CmdCode.Context]: {
					cmd: PaymentCommand.Delete,
				},
			}),
		},
	],
];
