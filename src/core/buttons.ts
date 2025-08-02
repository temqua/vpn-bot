import type { InlineKeyboardButton, ReplyKeyboardMarkup, SendBasicOptions } from 'node-telegram-bot-api';
import { CmdCode, CommandScope, UserRequest, VPNKeyCommand, VPNProtocol, VPNUserCommand } from './enums';
import type { CommandDetailCompressed } from './global.handler';
import type { UsersContext } from '../entities/users/users.handler';

export const userButtons: InlineKeyboardButton[][] = [
	[
		{
			text: 'Create',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.Create,
				},
			}),
		},
		{
			text: 'All Users',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.List,
				},
			}),
		},
		{
			text: 'Delete',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.Delete,
				},
			}),
		},
	],
	[
		{
			text: 'Pay',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.Pay,
				},
			}),
		},
		{
			text: 'Unpaid',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.ShowUnpaid,
				},
			}),
		},
	],
	[
		{
			text: 'Export Users',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.Export,
				},
			}),
		},
		{
			text: 'Export Payments',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.ExportPayments,
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
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.FindByUsername,
				},
			}),
		},
		{
			text: 'Contact',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.GetByTelegramId,
				},
			}),
		},
		{
			text: 'First name',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.FindByFirstName,
				},
			}),
		},
	],
];

export const getProtocolButtons = (operation: VPNKeyCommand) => {
	return Object.entries(VPNProtocol)
		.filter(
			([_, protocol]) =>
				!(
					([VPNKeyCommand.GetFile, VPNKeyCommand.Export].includes(operation) &&
						[VPNProtocol.Outline, VPNProtocol.XUI].includes(protocol)) ||
					(operation === VPNKeyCommand.Export && ![VPNProtocol.IKEv2, VPNProtocol.OpenVPN].includes(protocol))
				),
		)
		.map(
			([label, protocol]) =>
				({
					text: label,
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Keys,
						[CmdCode.Context]: {
							cmd: operation,
							pr: protocol,
						},
					}),
				}) as InlineKeyboardButton,
		);
};

export const keyButtons: InlineKeyboardButton[][] = [
	[
		{
			text: 'Create',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Keys,
				[CmdCode.Context]: {
					cmd: VPNKeyCommand.Expand,
					subo: VPNKeyCommand.Create,
				},
			}),
		},
		{
			text: 'Show',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Keys,
				[CmdCode.Context]: {
					cmd: VPNKeyCommand.Expand,
					subo: VPNKeyCommand.List,
				},
			}),
		},
		{
			text: 'Delete',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Keys,
				[CmdCode.Context]: {
					cmd: VPNKeyCommand.Expand,
					subo: VPNKeyCommand.Delete,
				},
			}),
		},
	],
	[
		{
			text: 'Get File',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Keys,
				[CmdCode.Context]: {
					cmd: VPNKeyCommand.Expand,
					subo: VPNKeyCommand.GetFile,
				},
			}),
		},
		{
			text: 'Export',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Keys,
				[CmdCode.Context]: {
					cmd: VPNKeyCommand.Expand,
					subo: VPNKeyCommand.Export,
				},
			}),
		},
	],
];

export const showKeysButtons = [getProtocolButtons(VPNKeyCommand.List)];

export const createButtons = [getProtocolButtons(VPNKeyCommand.Create)];

export const deleteButtons = [getProtocolButtons(VPNKeyCommand.Delete)];

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
		[CmdCode.Scope]: CommandScope.Users,
		[CmdCode.Context]: {
			[CmdCode.Command]: VPNUserCommand.Create,
			skip: 1,
		},
		[CmdCode.Processing]: 1,
	} as CommandDetailCompressed),
};

export const acceptButton: InlineKeyboardButton = {
	text: 'Accept',
	callback_data: JSON.stringify({
		[CmdCode.Scope]: CommandScope.Users,
		[CmdCode.Context]: {
			[CmdCode.Command]: VPNUserCommand.Pay,
			accept: 1,
		},
		[CmdCode.Processing]: 1,
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
	'bank',
	'active',
	'free',
	'payerId',
];

const createUserOperationsInlineKeyboard = (id: number) => {
	return updateProps.map(prop => [
		{
			text: `${prop}`,
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					[CmdCode.Command]: VPNUserCommand.Update,
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

export const getFrequestPaymentAmountsKeyboard = (amounts: number[]): SendBasicOptions => {
	const keyboard: InlineKeyboardButton[] = amounts.map(amount => ({
		text: amount.toString(),
		callback_data: JSON.stringify({
			[CmdCode.Scope]: CommandScope.Users,
			[CmdCode.Context]: {
				[CmdCode.Command]: VPNUserCommand.Pay,
				a: amount.toString(),
			} as UsersContext,
			p: 1,
		} as CommandDetailCompressed),
	}));
	return {
		reply_markup: {
			inline_keyboard: [keyboard],
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
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.Pay,
							accept: 1,
						},
						[CmdCode.Processing]: 1,
					} as CommandDetailCompressed),
				},
				{
					text: 'No',
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							cmd: VPNUserCommand.Pay,
							accept: 0,
						},
						[CmdCode.Processing]: 1,
					} as CommandDetailCompressed),
				},
			],
		],
	},
};

export const getUserMenu = (userId: number) => {
	return [
		[
			{
				text: 'Update',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Users,
					[CmdCode.Context]: {
						[CmdCode.Command]: VPNUserCommand.Expand,
						id: userId,
						[CmdCode.SubOperation]: VPNUserCommand.Update,
					},
				}),
			},
			{
				text: 'Payments',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Users,
					[CmdCode.Context]: {
						[CmdCode.Command]: VPNUserCommand.ShowPayments,
						id: userId,
					},
				}),
			},
			{
				text: 'Pay',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Users,
					[CmdCode.Context]: {
						[CmdCode.Command]: VPNUserCommand.Pay,
						id: userId,
					},
				}),
			},
		],
	];
};

export const getOutlineOperations = (id: string): SendBasicOptions => {
	return {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: 'Set Data Limit',
						callback_data: JSON.stringify({
							[CmdCode.Scope]: CommandScope.Keys,
							[CmdCode.Context]: {
								[CmdCode.Command]: VPNKeyCommand.SetDataLimit,
								[CmdCode.Protocol]: VPNProtocol.Outline,
								id,
							},
						}),
					},
					{
						text: 'Remove Data Limit',
						callback_data: JSON.stringify({
							[CmdCode.Scope]: CommandScope.Keys,
							[CmdCode.Context]: {
								[CmdCode.Command]: VPNKeyCommand.RemoveDataLimit,
								[CmdCode.Protocol]: VPNProtocol.Outline,
								id,
							},
						}),
					},
				],
				[
					{
						text: 'Rename',
						callback_data: JSON.stringify({
							[CmdCode.Scope]: CommandScope.Keys,
							[CmdCode.Context]: {
								[CmdCode.Command]: VPNKeyCommand.Rename,
								[CmdCode.Protocol]: VPNProtocol.Outline,
								id,
							},
						}),
					},
					{
						text: 'Delete',
						callback_data: JSON.stringify({
							[CmdCode.Scope]: CommandScope.Keys,
							[CmdCode.Context]: {
								[CmdCode.Command]: VPNKeyCommand.Delete,
								[CmdCode.Protocol]: VPNProtocol.Outline,
								id,
							},
							[CmdCode.Processing]: 1,
						}),
					},
				],
			],
		},
	};
};

export function createShowAllKeyboard(protocol: VPNProtocol, operation = VPNKeyCommand.List): SendBasicOptions {
	return {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: 'Show all',
						callback_data: JSON.stringify({
							[CmdCode.Scope]: CommandScope.Keys,
							[CmdCode.Context]: {
								[CmdCode.Command]: operation,
								[CmdCode.Protocol]: protocol,
								accept: 1,
							},
							[CmdCode.Processing]: 1,
						}),
					},
				],
			],
		},
	};
}

export const outlineListKeyboard = createShowAllKeyboard(VPNProtocol.Outline);
export const outlineDeleteKeyboard = createShowAllKeyboard(VPNProtocol.Outline, VPNKeyCommand.Delete);

export const xuiListKeyboard = createShowAllKeyboard(VPNProtocol.XUI);
export const xuiDeleteKeyboard = createShowAllKeyboard(VPNProtocol.XUI, VPNKeyCommand.Delete);
export const payersKeyboard = {
	reply_markup: {
		inline_keyboard: [
			[
				{
					text: 'Show all',
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.Update,
							prop: 'payerId',
							accept: 1,
						},
						[CmdCode.Processing]: 1,
					}),
				},
			],
		],
	},
};
