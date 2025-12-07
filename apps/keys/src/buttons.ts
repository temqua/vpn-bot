import type { InlineKeyboardButton, ReplyKeyboardMarkup, SendBasicOptions } from 'node-telegram-bot-api';
import { CmdCode, CommandScope, UserRequest, VPNKeyCommand, VPNProtocol } from './enums';

export const getProtocolButtons = (operation: VPNKeyCommand) => {
	return Object.entries(VPNProtocol)
		.filter(([_, protocol]) => {
			const hasDisabledOperations =
				[VPNKeyCommand.GetFile, VPNKeyCommand.Export].includes(operation) &&
				[VPNProtocol.Outline, VPNProtocol.XUI].includes(protocol);
			const hasExportUnsupportedProtocols =
				operation === VPNKeyCommand.Export && ![VPNProtocol.IKEv2, VPNProtocol.OpenVPN].includes(protocol);
			const hasGetFileUnsupportedProtocols = operation === VPNKeyCommand.GetQR && protocol !== VPNProtocol.WG;
			return !hasDisabledOperations && !hasExportUnsupportedProtocols && !hasGetFileUnsupportedProtocols;
		})
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
			text: 'Get QR Code',
			callback_data: JSON.stringify({
				[CmdCode.Scope]: CommandScope.Keys,
				[CmdCode.Context]: {
					cmd: VPNKeyCommand.Expand,
					subo: VPNKeyCommand.GetQR,
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
