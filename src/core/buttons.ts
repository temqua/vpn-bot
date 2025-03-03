import type { InlineKeyboardButton, ReplyKeyboardMarkup, SendBasicOptions } from 'node-telegram-bot-api';
import { CommandScope, UserRequest, VPNKeyCommand, VPNProtocol, VPNUserCommand } from './enums';
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
			text: 'Create',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.Create,
				},
			}),
		},
		{
			text: 'All Users',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.List,
				},
			}),
		},
		{
			text: 'Delete',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.Delete,
				},
			}),
		},
	],
	[
		{
			text: 'Sync',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.Sync,
				},
			}),
		},
		{
			text: 'Pay',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.Pay,
				},
			}),
		},
	],
];

export const findUserButtons: InlineKeyboardButton[][] = [
	[
		{
			text: 'Username',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.FindByUsername,
				},
			}),
		},
		{
			text: 'Contact',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.GetByTelegramId,
				},
			}),
		},
		{
			text: 'First name',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.FindByFirstName,
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

export const showKeysButtons = [listKeysButtonParams];

export const createButtons = [createKeyButtonsParams];

export function getUserContactKeyboard(requestId: UserRequest, text = 'Share user contact'): ReplyKeyboardMarkup {
	return {
		keyboard: [
			[
				{
					text,
					request_user: {
						request_id: requestId,
					},
				},
			],
		],
		one_time_keyboard: true, // The keyboard will hide after one use
		resize_keyboard: true, // Fit the keyboard to the screen size
	};
}

export function getUserCreateKeyboard(): ReplyKeyboardMarkup {
	return {
		keyboard: [
			[
				{
					text: 'Share new user',
					request_user: {
						request_id: UserRequest.Create,
					},
				},
				{
					text: 'Skip',
				},
			],
		],
	};
}

export const skipButton: InlineKeyboardButton = {
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

export const acceptButton: InlineKeyboardButton = {
	text: 'Accept',
	callback_data: JSON.stringify({
		s: CommandScope.Users,
		c: {
			cmd: VPNUserCommand.Pay,
			accept: 1,
		},
		p: 1,
	} as CommandDetailCompressed),
};

export const skipKeyboard: SendBasicOptions = {
	reply_markup: {
		inline_keyboard: [[skipButton]],
	},
};

export const acceptKeyboard: SendBasicOptions = {
	reply_markup: {
		inline_keyboard: [[acceptButton]],
	},
};

export const updateProps = [
	'username',
	'telegramId',
	'telegramLink',
	'firstName',
	'lastName',
	'price',
	'devices',
	'protocols',
	'payerId',
];

const createUserOperationsInlineKeyboard = (id: number) => {
	return updateProps.map(prop => [
		{
			text: `${prop}`,
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					cmd: VPNUserCommand.Update,
					prop,
					id,
				},
			}),
		} as InlineKeyboardButton,
	]);
};

export const createUserOperationsKeyboard = (id: number): SendBasicOptions => {
	return {
		reply_markup: {
			inline_keyboard: createUserOperationsInlineKeyboard(id),
		},
	};
};

export const yesNoKeyboard: SendBasicOptions = {
	reply_markup: {
		inline_keyboard: [
			[
				{
					text: 'Yes',
					callback_data: JSON.stringify({
						s: CommandScope.Users,
						c: {
							cmd: VPNUserCommand.Pay,
							accept: 1,
						},
						p: 1,
					} as CommandDetailCompressed),
				},
				{
					text: 'No',
					callback_data: JSON.stringify({
						s: CommandScope.Users,
						c: {
							cmd: VPNUserCommand.Pay,
							accept: 0,
						},
						p: 1,
					} as CommandDetailCompressed),
				},
			],
		],
	},
};
