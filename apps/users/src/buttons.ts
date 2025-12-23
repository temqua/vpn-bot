import type { InlineKeyboardButton, ReplyKeyboardMarkup, SendBasicOptions } from 'node-telegram-bot-api';
import { CmdCode, CommandScope, PaymentCommand, UserRequest, VPNUserCommand } from './enums';
import type { CommandDetailCompressed } from './global.handler';
import { UsersContext } from './entities/users/users.types';
import { User } from '@prisma/client';

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
	'subLink',
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
			[CmdCode.Processing]: 1,
		} as CommandDetailCompressed),
	}));
	return {
		reply_markup: {
			inline_keyboard: [keyboard],
		},
	};
};

export function getYesNoKeyboard(command = VPNUserCommand.Pay, scope = CommandScope.Users): SendBasicOptions {
	return {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: 'Yes',
						callback_data: JSON.stringify({
							[CmdCode.Scope]: scope,
							[CmdCode.Context]: {
								[CmdCode.Command]: command,
								accept: 1,
							},
							[CmdCode.Processing]: 1,
						} as CommandDetailCompressed),
					},
					{
						text: 'No',
						callback_data: JSON.stringify({
							[CmdCode.Scope]: scope,
							[CmdCode.Context]: {
								cmd: command,
								accept: 0,
							},
							[CmdCode.Processing]: 1,
						} as CommandDetailCompressed),
					},
				],
			],
		},
	};
}

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
							prop: 'payerId',
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
							prop: 'payerId',
							id: null,
						},
						[CmdCode.Processing]: 1,
					}),
				},
			],
		],
	},
};

export const replySetNullPropKeyboard = (prop: keyof User, userId: string): SendBasicOptions => {
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

export const getUserKeyboard = (userId: number): SendBasicOptions => {
	return {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: '💸 История платежей',
						callback_data: JSON.stringify({
							[CmdCode.Scope]: CommandScope.Users,
							[CmdCode.Context]: {
								[CmdCode.Command]: VPNUserCommand.ShowPayments,
								id: userId,
							},
						}),
					},
				],
				[
					{
						text: '🔄 Подписка',
						callback_data: JSON.stringify({
							[CmdCode.Scope]: CommandScope.Users,
							[CmdCode.Context]: {
								[CmdCode.Command]: VPNUserCommand.ShowSubLink,
								id: userId,
							},
						}),
					},
				],
				[
					{
						text: '📖 Гайд',
						callback_data: JSON.stringify({
							[CmdCode.Scope]: CommandScope.Users,
							[CmdCode.Context]: {
								[CmdCode.Command]: VPNUserCommand.ShowSubLinkGuide,
							},
						}),
					},
				],
			],
		},
	};
};

export const deleteSubscriptionButton: SendBasicOptions = {
	reply_markup: {
		inline_keyboard: [
			[
				{
					text: 'Удалить подписку',
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.DeleteSubscription,
						},
					}),
				},
			],
		],
	},
};

export const createSubscriptionButton: SendBasicOptions = {
	reply_markup: {
		inline_keyboard: [
			[
				{
					text: 'Создать подписку',
					callback_data: JSON.stringify({
						[CmdCode.Scope]: CommandScope.Users,
						[CmdCode.Context]: {
							[CmdCode.Command]: VPNUserCommand.CreateSubscription,
						},
					}),
				},
			],
		],
	},
};
