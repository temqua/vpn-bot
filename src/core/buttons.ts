import { CommandScope, VPNKeyCommand, VPNProtocol, VPNUserCommand } from './enums';

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
	};
});

const listKeysButtonParams = Object.entries(VPNProtocol).map(([label, protocol]) => ({
	text: `${label} Users`,
	callback_data: JSON.stringify({
		s: CommandScope.Keys,
		c: {
			cmd: VPNKeyCommand.List,
			pr: protocol,
		},
	}),
}));

export const userButtons = [
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
	],
];

export const keyButtons = [
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
