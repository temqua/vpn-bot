import { CommandScope, VPNKeyCommand, VPNProtocol, VPNUserCommand } from './enums';

const createKeyButtonsParams = Object.entries(VPNProtocol).map(([label, protocol]) => {
	return {
		text: label,
		callback_data: JSON.stringify({
			s: CommandScope.Keys,
			c: {
				command: VPNKeyCommand.Create,
				protocol,
			},
		}),
	};
});

const listKeysButtonParams = Object.entries(VPNProtocol).map(([label, protocol]) => ({
	text: `${label} Users`,
	callback_data: JSON.stringify({
		s: CommandScope.Keys,
		c: {
			command: VPNKeyCommand.List,
			protocol,
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
					command: VPNUserCommand.Create,
				},
			}),
		},
		{
			text: 'Show Users',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					command: VPNUserCommand.List,
				},
			}),
		},
		{
			text: 'Delete User',
			callback_data: JSON.stringify({
				s: CommandScope.Users,
				c: {
					command: VPNUserCommand.Delete,
				},
			}),
		},
	],
];

export const keyButtons = Object.entries(VPNProtocol).map(([protocolLabel, protocol]) =>
	Object.entries(VPNKeyCommand)
		.filter(([l, c]) => {
			return !(protocol === VPNProtocol.Outline && c === VPNKeyCommand.GetFile);
		})
		.map(([commandLabel, command]) => {
			return {
				text: `${commandLabel} ${protocolLabel}`,
				callback_data: JSON.stringify({
					s: CommandScope.Keys,
					c: {
						command,
						protocol,
					},
				}),
			};
		}),
);
export const inlineButtons = [...keyButtons, ...userButtons];

export const showButtons = [listKeysButtonParams];

export const createButtons = [createKeyButtonsParams];
