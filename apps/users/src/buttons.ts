import type { InlineKeyboardButton, ReplyKeyboardMarkup, SendBasicOptions } from 'node-telegram-bot-api';
import { UsersContext } from './entities/users/users.types';
import { CmdCode, CommandScope, UserRequest, VPNUserCommand } from './enums';
import type { CommandDetailCompressed } from './global.handler';

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
