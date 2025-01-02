import { VPNCommand, VPNProtocol } from './core/enums';

export const inlineButtons = [
	[
		{
			text: 'Create IKEv2 User',
			callback_data: JSON.stringify({
				command: VPNCommand.Create,
				protocol: VPNProtocol.IKE2,
			}),
		},
		{
			text: 'Show IKEv2 Users',
			callback_data: JSON.stringify({
				command: VPNCommand.List,
				protocol: VPNProtocol.IKE2,
			}),
		},
		{
			text: 'Delete IKEv2 User',
			callback_data: JSON.stringify({
				command: VPNCommand.Delete,
				protocol: VPNProtocol.IKE2,
			}),
		},
	],
	[
		{
			text: 'Create WG User',
			callback_data: JSON.stringify({
				command: VPNCommand.Create,
				protocol: VPNProtocol.WG,
			}),
		},
		{
			text: 'Show WG Users',
			callback_data: JSON.stringify({
				command: VPNCommand.List,
				protocol: VPNProtocol.WG,
			}),
		},
		{
			text: 'Delete WG User',
			callback_data: JSON.stringify({
				command: VPNCommand.Delete,
				protocol: VPNProtocol.WG,
			}),
		},
	],
	[
		{
			text: 'Create Outline User',
			callback_data: JSON.stringify({
				command: VPNCommand.Create,
				protocol: VPNProtocol.Outline,
			}),
		},
		{
			text: 'Show Outline Users',
			callback_data: JSON.stringify({
				command: VPNCommand.List,
				protocol: VPNProtocol.Outline,
			}),
		},
		{
			text: 'Delete Outline User',
			callback_data: JSON.stringify({
				command: VPNCommand.Delete,
				protocol: VPNProtocol.Outline,
			}),
		},
	],
];

export const showButtons = [
	[
		{
			text: 'IKEv2 Users',
			callback_data: JSON.stringify({
				command: VPNCommand.List,
				protocol: VPNProtocol.IKE2,
			}),
		},
		{
			text: 'WG Users',
			callback_data: JSON.stringify({
				command: VPNCommand.List,
				protocol: VPNProtocol.WG,
			}),
		},
		{
			text: 'Outline Users',
			callback_data: JSON.stringify({
				command: VPNCommand.List,
				protocol: VPNProtocol.Outline,
			}),
		},
	],
];
