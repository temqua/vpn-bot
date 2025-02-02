import type { InlineKeyboardButton, ReplyKeyboardMarkup, SendBasicOptions } from 'node-telegram-bot-api';
import { CommandScope, VPNKeyCommand, VPNProtocol, VPNUserCommand } from './enums';
import type { CommandDetailCompressed } from './globalHandler';

const createKeyButtonsParams = Object.entries(VPNProtocol).map(([label, protocol]) => {
	return {
		text: label,
		callback_data: JSON.stringify({
			s: CommandScope.Keys,
			c: {
				cmd: VPNKeyCommand.Create,
				pr: protocol,
			},
		}),
	} as InlineKeyboardButton;
});

const listKeysButtonParams = Object.entries(VPNProtocol).map(
	([label, protocol]) =>
		({
			text: `${label} Users`,
			callback_data: JSON.stringify({
				s: CommandScope.Keys,
				c: {
					cmd: VPNKeyCommand.List,
					pr: protocol,
				},
			}),
		}) as InlineKeyboardButton,
);

export const userButtons: InlineKeyboardButton[][] = [
	[
		{
			text: 'Create User',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.Create,
				},
			}),
		},
		{
			text: 'Show Users',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.List,
				},
			}),
		},
		{
			text: 'Delete User',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.Delete,
				},
			}),
		},
		{
			text: 'Sync',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.Sync,
				},
			}),
		},
	],
];

export const keyButtons: InlineKeyboardButton[][] = [
	...Object.entries(VPNProtocol).map(([protocolLabel, protocol]) => {
		return [
			{
				text: `Create ${protocolLabel}`,
				callback_data: JSON.stringify({
					s: CommandScope.Keys,
					c: {
						cmd: VPNKeyCommand.Create,
						pr: protocol,
					},
				}),
			},
			{
				text: `Show ${protocolLabel}`,
				callback_data: JSON.stringify({
					s: CommandScope.Keys,
					c: {
						cmd: VPNKeyCommand.List,
						pr: protocol,
					},
				}),
			},
			{
				text: `Delete ${protocolLabel}`,
				callback_data: JSON.stringify({
					s: CommandScope.Keys,
					c: {
						cmd: VPNKeyCommand.Delete,
						pr: protocol,
					},
				}),
			},
		];
	}),
	[
		{
			text: 'Get File IKEv2',
			callback_data: JSON.stringify({
				s: CommandScope.Keys,
				c: {
					cmd: VPNKeyCommand.GetFile,
					pr: VPNProtocol.IKEv2,
				},
			}),
		},
		{
			text: 'Get File WireGuard',
			callback_data: JSON.stringify({
				s: CommandScope.Keys,
				c: {
					cmd: VPNKeyCommand.GetFile,
					pr: VPNProtocol.WG,
				},
			}),
		},
	],
];

export const inlineButtons = [...keyButtons, ...userButtons];

export const showButtons = [listKeysButtonParams];

export const createButtons = [createKeyButtonsParams];
export const chooseUserReply: ReplyKeyboardMarkup = {
	keyboard: [
		[
			{
				text: 'Share user contact',
				request_user: {
					request_id: 1,
				},
			},
		],
	],
	one_time_keyboard: true, // The keyboard will hide after one use
	resize_keyboard: true, // Fit the keyboard to the screen size
};

const skipButton: InlineKeyboardButton = {
	text: 'Skip',
	callback_data: JSON.stringify({
		s: CommandScope.Users,
		c: {
			cmd: VPNUserCommand.Create,
			skip: 1,
		},
		p: 1,
	} as CommandDetailCompressed),
};

export const skipKeyboard: SendBasicOptions = {
	reply_markup: {
		inline_keyboard: [[skipButton]],
	},
};

const createUserOperationsInlineKeyboard = (id: number) => {
	return ['username', 'telegramId', 'telegramLink', 'firstName', 'lastName', 'devices', 'protocols']
		.map(prop => [
			{
				text: `Set ${prop}`,
				callback_data: JSON.stringify({
					s: CommandScope.Users,
					c: {
						cmd: VPNUserCommand.Update,
						prop,
						id,
					},
				}),
			} as InlineKeyboardButton,
		])
		.concat([
			[
				{
					text: 'Pay',
					callback_data: JSON.stringify({
						s: CommandScope.Users,
						c: {
							cmd: VPNUserCommand.Pay,
							id,
						},
					}),
				} as InlineKeyboardButton,
			],
		]);
};

export const createUserOperationsKeyboard = (id: number): SendBasicOptions => {
	return {
		reply_markup: {
			inline_keyboard: createUserOperationsInlineKeyboard(id),
		},
	};
};
