import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { CmdCode, CommandScope, ServerCommand } from '../../enums';

export const serversButtons: InlineKeyboardButton[][] = [
	[
		{
			text: 'Show All',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Servers,
				[CmdCode.Context]: {
					[CmdCode.Command]: ServerCommand.List,
				},
			}),
		},
		{
			text: 'Create',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Servers,
				[CmdCode.Context]: {
					[CmdCode.Command]: ServerCommand.Create,
				},
			}),
		},
		{
			text: 'Delete',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Servers,
				[CmdCode.Context]: {
					[CmdCode.Command]: ServerCommand.Delete,
				},
			}),
		},
	],
];

export function getServerKeyboard(id: number) {
	return [
		[
			{
				text: 'Users',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Servers,
					[CmdCode.Context]: {
						[CmdCode.Command]: ServerCommand.ListUsers,
						id,
					},
				}),
			},
			{
				text: 'Keys',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Servers,
					[CmdCode.Context]: {
						[CmdCode.Command]: ServerCommand.ListKeys,
						id,
					},
				}),
			},
		],
		[
			{
				text: 'Create Key',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Servers,
					[CmdCode.Context]: {
						[CmdCode.Command]: ServerCommand.CreateKey,
						id,
					},
				}),
			},
			{
				text: 'Delete Key',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Servers,
					[CmdCode.Context]: {
						[CmdCode.Command]: ServerCommand.DeleteKey,
						id,
					},
				}),
			},
		],
		[
			{
				text: 'Export Key',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Servers,
					[CmdCode.Context]: {
						[CmdCode.Command]: ServerCommand.Export,
						id,
					},
				}),
			},
			{
				text: 'Get File',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Servers,
					[CmdCode.Context]: {
						[CmdCode.Command]: ServerCommand.GetKeyFile,
						id,
					},
				}),
			},
		],
		[
			{
				text: 'New URL',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Servers,
					[CmdCode.Context]: {
						[CmdCode.Command]: ServerCommand.UpdateUrl,
						prop: 'url',
						id,
					},
				}),
			},
			{
				text: 'New Name',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Servers,
					[CmdCode.Context]: {
						[CmdCode.Command]: ServerCommand.UpdateName,
						prop: 'name',
						id,
					},
				}),
			},
			{
				text: 'Delete',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Servers,
					[CmdCode.Context]: {
						[CmdCode.Command]: ServerCommand.Delete,
						id,
					},
					[CmdCode.Processing]: 1,
				}),
			},
		],
	];
}
