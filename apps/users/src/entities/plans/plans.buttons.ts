import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { CmdCode, CommandScope, PlanCommand } from '../../enums';

export const plansButtons: InlineKeyboardButton[][] = [
	[
		{
			text: 'Show All',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Plans,
				[CmdCode.Context]: {
					cmd: PlanCommand.List,
				},
			}),
		},
		{
			text: 'Create',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Plans,
				[CmdCode.Context]: {
					cmd: PlanCommand.Create,
				},
			}),
		},
		{
			text: 'Delete',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Plans,
				[CmdCode.Context]: {
					cmd: PlanCommand.Delete,
				},
			}),
		},
	],
];
