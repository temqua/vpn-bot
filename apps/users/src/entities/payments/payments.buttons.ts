import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { CmdCode, CommandScope, PaymentCommand } from '../../enums';

export const paymentButtons: InlineKeyboardButton[][] = [
	[
		{
			text: 'Find by ID',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Payments,
				[CmdCode.Context]: {
					[CmdCode.Command]: PaymentCommand.GetById,
				},
			}),
		},
		{
			text: 'Find by Date',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Payments,
				[CmdCode.Context]: {
					[CmdCode.Command]: PaymentCommand.FindByDate,
				},
			}),
		},
		{
			text: 'Find by Date Range',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Payments,
				[CmdCode.Context]: {
					[CmdCode.Command]: PaymentCommand.FindByDateRange,
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
					[CmdCode.Command]: PaymentCommand.List,
				},
			}),
		},
		{
			text: 'Show Sum',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Payments,
				[CmdCode.Context]: {
					[CmdCode.Command]: PaymentCommand.Sum,
				},
			}),
		},
		{
			text: 'Delete',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Payments,
				[CmdCode.Context]: {
					[CmdCode.Command]: PaymentCommand.Delete,
				},
			}),
		},
	],
];
