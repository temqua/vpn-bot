import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { CmdCode, CommandScope, ServerCommand } from '../../enums';

export const serversButtons: InlineKeyboardButton[][] = [
	[
		{
			text: 'Show All',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Servers,
				[CmdCode.Context]: {
					cmd: ServerCommand.List,
				},
			}),
		},
		{
			text: 'Create',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Servers,
				[CmdCode.Context]: {
					cmd: ServerCommand.Create,
				},
			}),
		},
		{
			text: 'Delete',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Servers,
				[CmdCode.Context]: {
					cmd: ServerCommand.Delete,
				},
			}),
		},
	],
];
