import {
	InlineKeyboardButton,
	InlineKeyboardMarkup,
	ReplyKeyboardMarkup,
	SendBasicOptions,
} from 'node-telegram-bot-api';
import { dict } from '../../dict';
import { CmdCode, CommandScope, UpdatePropsMap, UserRequest, VPNUserCommand } from '../../enums';
import { CommandDetailCompressed } from '../../global.handler';
import { updatePropsMap } from './users.consts';

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
				text: 'Delete',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Users,
					[CmdCode.Context]: {
						[CmdCode.Command]: VPNUserCommand.Delete,
						id: userId,
					},
					[CmdCode.Processing]: 1,
				}),
			},
		],
		[
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
		[
			{
				text: 'Create Key',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Users,
					[CmdCode.Context]: {
						[CmdCode.Command]: VPNUserCommand.CreateKey,
						id: userId,
					},
				}),
			},
			{
				text: 'Assign Key',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Users,
					[CmdCode.Context]: {
						[CmdCode.Command]: VPNUserCommand.AssignKey,
						id: userId,
					},
				}),
			},
			{
				text: 'Keys',
				callback_data: JSON.stringify({
					[CmdCode.Scope]: CommandScope.Users,
					[CmdCode.Context]: {
						[CmdCode.Command]: VPNUserCommand.Keys,
						id: userId,
					},
				}),
			},
		],
	];
};

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
			text: 'Trial',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.ShowTrial,
				},
			}),
		},
	],
	[
		{
			text: 'Unpaid',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.ShowUnpaid,
				},
			}),
		},
		{
			text: 'Notify Unpaid',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.NotifyUnpaid,
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
		{
			text: 'Export Expenses',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					cmd: VPNUserCommand.ExportExpenses,
				},
			}),
		},
	],
];

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

const createUserOperationsInlineKeyboard = (id: number) => {
	const result = Array.from(updatePropsMap.keys()).map(prop => [
		{
			text: `${prop}`,
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Users,
				[CmdCode.Context]: {
					[CmdCode.Command]: VPNUserCommand.Update,
					propId: updatePropsMap.get(prop),
					id,
				},
			}),
		} as InlineKeyboardButton,
	]);
	return result;
};

export const createUserOperationsKeyboard = (id: number): SendBasicOptions => {
	return {
		reply_markup: {
			inline_keyboard: createUserOperationsInlineKeyboard(id),
		},
	};
};

export const replySetNullPropKeyboard = (prop: UpdatePropsMap, userId: string): SendBasicOptions => {
	return {
		reply_markup: {
			inline_keyboard: [
				[
					{
						callback_data: JSON.stringify({
							[CmdCode.Scope]: CommandScope.Users,
							[CmdCode.Context]: {
								[CmdCode.Command]: VPNUserCommand.UpdateNull,
								prop,
								id: userId,
							},
							[CmdCode.Processing]: 1,
						}),
						text: 'Set null',
					},
				],
			],
		},
	};
};

export const deleteSubscriptionButton = (lang: string): InlineKeyboardMarkup => {
	return {
		inline_keyboard: [
			[
				{
					text: dict.deleteSub[lang],
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.DeleteSubscription,
						},
					}),
				},
				{
					text: dict.mainMenu[lang],
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.ShowMenu,
						},
					}),
				},
			],
		],
	};
};

export const createSubscriptionButton = (lang: string): InlineKeyboardMarkup => {
	return {
		inline_keyboard: [
			[
				{
					text: dict.createSub[lang],
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.CreateSubscription,
						},
					}),
				},
				{
					text: dict.mainMenu[lang],
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.ShowMenu,
						},
					}),
				},
			],
		],
	};
};

export const createBackToMenuButton = (lang: string): InlineKeyboardMarkup => {
	return {
		inline_keyboard: [
			[
				{
					text: dict.mainMenu[lang],
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.ShowMenu,
						},
					}),
				},
			],
		],
	};
};

export const getUserKeyboard = (lang = 'ru'): InlineKeyboardMarkup => {
	return {
		inline_keyboard: [
			[
				{
					text: dict.paymentsHistory[lang],
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.ShowPayments,
						},
					}),
				},
			],
			[
				{
					text: dict.keys[lang],
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.ShowSubLink,
						},
					}),
				},
			],
			[
				{
					text: dict.guide[lang],
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.ShowSubLinkGuide,
						},
					}),
				},
			],
			[
				{
					text: dict.prices[lang],
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.ShowPlans,
						},
					}),
				},
			],
		],
	};
};

export const payersKeyboard: SendBasicOptions = {
	reply_markup: {
		inline_keyboard: [
			[
				{
					text: 'Show all',
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.Update,
							propId: UpdatePropsMap.payerId,
							accept: 1,
						},
						[CmdCode.Processing]: 1,
					}),
				},
				{
					text: 'Set null',
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.Update,
							propId: UpdatePropsMap.payerId,
							id: null,
						},
						[CmdCode.Processing]: 1,
					}),
				},
			],
		],
	},
};

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
